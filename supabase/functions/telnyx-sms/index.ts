import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sendSmsSchema = z.object({
  to: z.string().min(10).max(20),
  body: z.string().min(1).max(1600),
  leadId: z.string().uuid().optional(),
});

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
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.json();
    const parseResult = sendSmsSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parseResult.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to, body, leadId } = parseResult.data;
    const telnyxApiKey = Deno.env.get('Telnyx_API');
    const callerId = Deno.env.get('TELNYX_CALLER_ID');

    if (!telnyxApiKey || !callerId) {
      return new Response(
        JSON.stringify({ error: 'Telnyx not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format destination number
    const formattedTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    // Send SMS via Telnyx
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: callerId,
        to: formattedTo,
        text: body,
        type: 'SMS',
      }),
    });

    const telnyxData = await telnyxResponse.json();

    if (!telnyxResponse.ok) {
      console.error('Telnyx SMS error:', telnyxData);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS', details: telnyxData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to DB using service role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await serviceClient.from('sms_messages').insert({
      user_id: userData.user.id,
      to_number: formattedTo,
      from_number: callerId,
      body,
      direction: 'outbound',
      status: 'sent',
      telnyx_message_id: telnyxData.data?.id || null,
      lead_id: leadId || null,
    });

    return new Response(
      JSON.stringify({ success: true, messageId: telnyxData.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SMS error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
