import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Parse request body if present
    let body = {};
    try {
      if (req.method === 'POST') {
        body = await req.json();
      }
    } catch {
      // No body or invalid JSON
    }

    const action = (body as any).action;

    // Get caller ID
    if (action === 'get_caller_id') {
      const callerId = Deno.env.get('TELNYX_CALLER_ID');
      
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

    // Get WebRTC credentials
    const sipUsername = Deno.env.get('TELNYX_SIP_USERNAME');
    const sipPassword = Deno.env.get('TELNYX_SIP_PASSWORD');
    const callerId = Deno.env.get('TELNYX_CALLER_ID');

    if (!sipUsername || !sipPassword) {
      console.error('[TELNYX-AUTH] Missing SIP credentials');
      return new Response(
        JSON.stringify({ error: 'Telnyx credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return credentials for WebRTC client
    // The Telnyx WebRTC SDK uses SIP credentials directly
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
