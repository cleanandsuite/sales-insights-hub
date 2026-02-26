import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await anonSupabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.claims.sub as string;

    const body = await req.json();
    const { area_code, phone_number } = body;

    if (!area_code || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'area_code and phone_number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telnyxApiKey = Deno.env.get('Telnyx_API');
    if (!telnyxApiKey) {
      return new Response(
        JSON.stringify({ error: 'Phone service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for DB writes
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if user already has a line
    const { data: existing } = await serviceSupabase
      .from('user_phone_lines')
      .select('id, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.status === 'active') {
      return new Response(
        JSON.stringify({ error: 'You already have an active phone line' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert row with status 'provisioning'
    const { error: upsertError } = await serviceSupabase
      .from('user_phone_lines')
      .upsert({
        user_id: userId,
        area_code,
        phone_number,
        status: 'provisioning',
        error_message: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[PROVISION] Upsert error:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize provisioning' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return immediately — provisioning happens async
    // We kick off the background work but respond fast
    const response = new Response(
      JSON.stringify({ status: 'provisioning', message: 'Your line is being set up' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    // Background provisioning (EdgeRuntime keeps the promise alive after response)
    (async () => {
      try {
        // Step 1: Order the phone number
        console.log(`[PROVISION] Ordering number ${phone_number} for user ${userId}`);
        const orderRes = await fetch('https://api.telnyx.com/v2/number_orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_numbers: [{ phone_number }],
          }),
        });

        if (!orderRes.ok) {
          const errText = await orderRes.text();
          console.error('[PROVISION] Order failed:', orderRes.status, errText);
          throw new Error(`Number order failed: ${errText}`);
        }

        const orderData = await orderRes.json();
        const phoneId = orderData.data?.phone_numbers?.[0]?.id || null;
        console.log(`[PROVISION] Number ordered. Phone ID: ${phoneId}`);

        // Step 2: Create a Credential Connection for this user
        const sipUsername = `sellsig_${userId.replace(/-/g, '').slice(0, 16)}`;
        const sipPassword = generatePassword(24);

        console.log(`[PROVISION] Creating credential connection for ${sipUsername}`);
        const credRes = await fetch('https://api.telnyx.com/v2/telephony_credentials', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection_id: Deno.env.get('TELNYX_CONNECTION_ID') || undefined,
            name: `sellsig-${userId.slice(0, 8)}`,
            sip_username: sipUsername,
            sip_password: sipPassword,
          }),
        });

        let connectionId = null;
        if (credRes.ok) {
          const credData = await credRes.json();
          connectionId = credData.data?.id || null;
          console.log(`[PROVISION] Credential created. Connection ID: ${connectionId}`);
        } else {
          const errText = await credRes.text();
          console.warn('[PROVISION] Credential creation response:', credRes.status, errText);
          // Continue anyway — some Telnyx setups use a shared connection
        }

        // Step 3: Update DB with active status and credentials
        const { error: updateError } = await serviceSupabase
          .from('user_phone_lines')
          .update({
            phone_number,
            telnyx_phone_id: phoneId,
            telnyx_connection_id: connectionId,
            sip_username: sipUsername,
            sip_password: sipPassword,
            status: 'active',
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[PROVISION] DB update error:', updateError);
        } else {
          console.log(`[PROVISION] ✅ Line active for user ${userId}: ${phone_number}`);
        }
      } catch (err) {
        console.error('[PROVISION] Background error:', err);
        // Mark as failed
        await serviceSupabase
          .from('user_phone_lines')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Provisioning failed',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    })();

    return response;
  } catch (err) {
    console.error('[PROVISION] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePassword(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join('');
}
