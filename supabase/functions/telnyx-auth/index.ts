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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getClaims(token);
    
    if (error || !data?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = data.claims.sub as string;

    let body: any = {};
    try {
      if (req.method === 'POST') {
        body = await req.json();
      }
    } catch {
      // No body or invalid JSON
    }

    const action = body.action;

    // ── Query per-user phone line first ──
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: phoneLine } = await serviceSupabase
      .from('user_phone_lines')
      .select('sip_username, sip_password, phone_number, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    // Get caller ID action
    if (action === 'get_caller_id') {
      const callerId = phoneLine?.phone_number || Deno.env.get('TELNYX_CALLER_ID');
      
      if (!callerId) {
        return new Response(
          JSON.stringify({ error: 'Caller ID not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ caller_id: callerId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return per-user credentials if available, otherwise fall back to global
    const sipUsername = phoneLine?.sip_username || Deno.env.get('TELNYX_SIP_USERNAME');
    const sipPassword = phoneLine?.sip_password || Deno.env.get('TELNYX_SIP_PASSWORD');
    const callerId = phoneLine?.phone_number || Deno.env.get('TELNYX_CALLER_ID');

    if (!sipUsername || !sipPassword) {
      console.error('[TELNYX-AUTH] Missing SIP credentials');
      return new Response(
        JSON.stringify({ error: 'Telnyx credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        login: sipUsername,
        password: sipPassword,
        caller_id: callerId,
        realm: 'sip.telnyx.com',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[TELNYX-AUTH] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
