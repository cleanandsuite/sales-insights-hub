import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const SALESFORCE_CLIENT_ID = Deno.env.get('SALESFORCE_CLIENT_ID');
    const SALESFORCE_CLIENT_SECRET = Deno.env.get('SALESFORCE_CLIENT_SECRET');
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://lovable.dev';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];

    console.log(`Salesforce OAuth action: ${action}`);

    // Handle OAuth initiation
    if (action === 'auth' || url.searchParams.get('action') === 'auth') {
      if (!SALESFORCE_CLIENT_ID) {
        return new Response(
          JSON.stringify({ 
            error: 'Salesforce not configured',
            message: 'SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET must be set'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const userId = url.searchParams.get('state') || url.searchParams.get('userId');
      const redirectUri = `${SUPABASE_URL}/functions/v1/salesforce-oauth?action=callback`;
      
      const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', SALESFORCE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'api refresh_token offline_access');
      authUrl.searchParams.set('state', userId || '');

      console.log(`Redirecting to Salesforce OAuth: ${authUrl.toString()}`);
      
      return Response.redirect(authUrl.toString(), 302);
    }

    // Handle OAuth callback
    if (action === 'callback' || url.searchParams.get('action') === 'callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // userId
      const error = url.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        return Response.redirect(`${SITE_URL}/settings?tab=crm&error=${error}`, 302);
      }

      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: 'Missing code or state parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: 'Salesforce credentials not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const redirectUri = `${SUPABASE_URL}/functions/v1/salesforce-oauth?action=callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          redirect_uri: redirectUri
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokens);
        return Response.redirect(`${SITE_URL}/settings?tab=crm&error=token_exchange_failed`, 302);
      }

      console.log('Token exchange successful, instance:', tokens.instance_url);

      // Store connection in database
      const { error: upsertError } = await supabase.from('crm_connections').upsert({
        user_id: state,
        provider: 'salesforce',
        access_token_encrypted: tokens.access_token,
        refresh_token_encrypted: tokens.refresh_token,
        instance_url: tokens.instance_url,
        token_expires_at: new Date(Date.now() + (tokens.expires_in || 7200) * 1000).toISOString(),
        is_active: true,
        sync_status: 'idle',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' });

      if (upsertError) {
        console.error('Failed to store connection:', upsertError);
        return Response.redirect(`${SITE_URL}/settings?tab=crm&error=storage_failed`, 302);
      }

      console.log('Salesforce connection stored for user:', state);
      return Response.redirect(`${SITE_URL}/settings?tab=crm&success=true`, 302);
    }

    // Handle token refresh
    if (action === 'refresh') {
      const { userId } = await req.json();

      const { data: connection, error: connError } = await supabase
        .from('crm_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'salesforce')
        .single();

      if (connError || !connection) {
        return new Response(
          JSON.stringify({ error: 'Connection not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: 'Salesforce credentials not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: connection.refresh_token_encrypted,
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        // Mark connection as inactive if refresh fails
        await supabase
          .from('crm_connections')
          .update({ is_active: false, sync_status: 'error' })
          .eq('id', connection.id);

        return new Response(
          JSON.stringify({ error: 'Token refresh failed', details: tokens }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update tokens
      await supabase.from('crm_connections').update({
        access_token_encrypted: tokens.access_token,
        token_expires_at: new Date(Date.now() + (tokens.expires_in || 7200) * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', connection.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Salesforce OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
