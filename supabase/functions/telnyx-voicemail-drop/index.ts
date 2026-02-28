import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
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

    const body = await req.json();
    const { call_control_id, audio_url } = body;

    if (!call_control_id) {
      return new Response(
        JSON.stringify({ error: 'call_control_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const TELNYX_API_KEY = Deno.env.get('Telnyx_API');
    if (!TELNYX_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Telnyx API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default system voicemail message (TTS via Telnyx)
    const playUrl = audio_url || null;

    if (playUrl) {
      // Play pre-recorded audio
      const playResponse = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/playback_start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: playUrl,
          overlay: false,
        }),
      });

      if (!playResponse.ok) {
        const errText = await playResponse.text();
        console.error('[VM-DROP] Play error:', errText);
        // Fall through to speak
      } else {
        // Wait a moment then hangup (audio plays async)
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    } else {
      // Use TTS to speak a default message
      const speakResponse = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/speak`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: "Hi, this is a quick message to follow up on our conversation. Please give me a call back at your earliest convenience. Thank you and have a great day.",
          voice: 'male',
          language: 'en-US',
        }),
      });

      if (!speakResponse.ok) {
        const errText = await speakResponse.text();
        console.error('[VM-DROP] Speak error:', errText);
      } else {
        // Wait for TTS to finish (~8s)
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
    }

    // Hang up after message
    const hangupResponse = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/hangup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!hangupResponse.ok) {
      console.error('[VM-DROP] Hangup error:', await hangupResponse.text());
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[VM-DROP] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
