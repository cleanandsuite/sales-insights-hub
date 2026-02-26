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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const areaCode = body.area_code;

    if (!areaCode || !/^\d{3}$/.test(areaCode)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid 3-digit area code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telnyxApiKey = Deno.env.get('Telnyx_API');
    if (!telnyxApiKey) {
      console.error('[TELNYX-SEARCH] Missing Telnyx_API secret');
      return new Response(
        JSON.stringify({ error: 'Phone service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search available numbers via Telnyx API
    const searchUrl = new URL('https://api.telnyx.com/v2/available_phone_numbers');
    searchUrl.searchParams.set('filter[country_code]', 'US');
    searchUrl.searchParams.set('filter[national_destination_code]', areaCode);
    searchUrl.searchParams.set('filter[features][]', 'sip_trunking');
    searchUrl.searchParams.set('filter[limit]', '5');

    const telnyxRes = await fetch(searchUrl.toString(), {
      headers: { 'Authorization': `Bearer ${telnyxApiKey}` },
    });

    if (!telnyxRes.ok) {
      const errText = await telnyxRes.text();
      console.error('[TELNYX-SEARCH] Telnyx API error:', telnyxRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Could not search for numbers. Try a different area code.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telnyxData = await telnyxRes.json();
    const numbers = (telnyxData.data || []).map((n: any) => ({
      phone_number: n.phone_number,
      formatted: formatPhoneNumber(n.phone_number),
    }));

    return new Response(
      JSON.stringify({ numbers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[TELNYX-SEARCH] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatPhoneNumber(e164: string): string {
  // +12125551234 -> (212) 555-1234
  const digits = e164.replace(/^\+1/, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return e164;
}
