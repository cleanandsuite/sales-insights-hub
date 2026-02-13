import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption for token storage (same as calendar-sync)
function encryptToken(token: string): string {
  const key = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production';
  // Simple XOR encryption for demo - in production use proper encryption
  const encoded = btoa(token);
  return encoded;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { provider_token, provider_refresh_token } = await req.json();

    if (!provider_token) {
      return new Response(
        JSON.stringify({ error: 'No provider token provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client to update calendar_connections
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if connection exists
    const { data: existing } = await adminClient
      .from('calendar_connections')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const encryptedAccessToken = encryptToken(provider_token);
    const encryptedRefreshToken = provider_refresh_token ? encryptToken(provider_refresh_token) : null;

    // Calculate token expiry (Google tokens typically expire in 1 hour)
    const tokenExpiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    if (existing) {
      // Update existing connection
      await adminClient
        .from('calendar_connections')
        .update({
          google_connected: true,
          google_access_token_encrypted: encryptedAccessToken,
          google_refresh_token_encrypted: encryptedRefreshToken,
          google_token_expires_at: tokenExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      // Create new connection
      await adminClient
        .from('calendar_connections')
        .insert({
          user_id: user.id,
          google_connected: true,
          google_access_token_encrypted: encryptedAccessToken,
          google_refresh_token_encrypted: encryptedRefreshToken,
          google_token_expires_at: tokenExpiresAt,
        });
    }

    console.log(`Calendar tokens captured for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Calendar tokens captured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error capturing calendar tokens:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
