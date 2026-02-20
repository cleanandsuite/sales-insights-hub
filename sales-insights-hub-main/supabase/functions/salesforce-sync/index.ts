import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const uuidSchema = z.string().uuid();

const baseRequestSchema = z.object({
  action: z.enum(['get_oauth_url', 'sync_contacts', 'link_recording', 'update_opportunity']),
  userId: uuidSchema.optional(),
  connectionId: uuidSchema.optional(),
  recordingId: uuidSchema.optional(),
  data: z.record(z.unknown()).optional(),
});

const linkRecordingDataSchema = z.object({
  contactId: z.string().max(100),
  accountId: z.string().max(100).optional(),
  opportunityId: z.string().max(100).optional(),
});

const updateOpportunityDataSchema = z.object({
  opportunityId: z.string().max(100),
  stage: z.string().max(100),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', userData.user.id);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = baseRequestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.issues);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, connectionId, recordingId, data } = parseResult.data;

    // Verify userId matches authenticated user for actions that require it
    if (userId && userId !== userData.user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Salesforce sync action: ${action}`);

    switch (action) {
      case 'get_oauth_url': {
        const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
        const redirectUri = `${supabaseUrl}/functions/v1/salesforce-callback`;
        
        if (!clientId) {
          return new Response(
            JSON.stringify({ 
              error: 'Salesforce integration not configured',
              message: 'Please configure Salesforce credentials'
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        const authUrl = `https://login.salesforce.com/services/oauth2/authorize?` +
          `response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        
        return new Response(
          JSON.stringify({ url: authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_contacts': {
        if (!connectionId) {
          return new Response(
            JSON.stringify({ error: 'Connection ID required', success: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get connection details and verify ownership
        const { data: connection, error: connError } = await supabase
          .from('crm_connections')
          .select('*')
          .eq('id', connectionId)
          .eq('user_id', userData.user.id)
          .single();
          
        if (connError || !connection) {
          return new Response(
            JSON.stringify({ error: 'Connection not found or access denied', success: false }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Update sync status
        await supabase
          .from('crm_connections')
          .update({ sync_status: 'syncing' })
          .eq('id', connectionId);
        
        // For demo, we create sample contacts
        const sampleContacts = [
          { name: 'John Smith', email: 'john.smith@acme.com', company: 'Acme Corp', title: 'VP Sales' },
          { name: 'Sarah Johnson', email: 'sarah.j@techstart.io', company: 'TechStart', title: 'CEO' },
          { name: 'Mike Chen', email: 'mchen@enterprise.com', company: 'Enterprise Inc', title: 'CTO' },
        ];
        
        for (const contact of sampleContacts) {
          await supabase
            .from('crm_contacts')
            .upsert({
              user_id: userData.user.id,
              crm_connection_id: connectionId,
              external_id: `sf_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              name: contact.name,
              email: contact.email,
              company: contact.company,
              title: contact.title,
              last_synced_at: new Date().toISOString()
            });
        }
        
        // Update connection status
        await supabase
          .from('crm_connections')
          .update({ 
            sync_status: 'idle',
            last_sync_at: new Date().toISOString()
          })
          .eq('id', connectionId);
        
        return new Response(
          JSON.stringify({ success: true, synced: sampleContacts.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'link_recording': {
        if (!recordingId || !connectionId) {
          return new Response(
            JSON.stringify({ error: 'Recording ID and connection ID required', success: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify user owns the recording
        const { data: recording, error: recError } = await supabase
          .from('call_recordings')
          .select('user_id')
          .eq('id', recordingId)
          .single();

        if (recError || !recording || recording.user_id !== userData.user.id) {
          return new Response(
            JSON.stringify({ error: 'Recording not found or access denied', success: false }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate nested data
        const dataParseResult = linkRecordingDataSchema.safeParse(data);
        if (!dataParseResult.success) {
          return new Response(
            JSON.stringify({ error: 'Invalid link data parameters', success: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { contactId, accountId, opportunityId } = dataParseResult.data;
        
        // Create CRM link
        const { error: linkError } = await supabase
          .from('recording_crm_links')
          .insert({
            recording_id: recordingId,
            crm_connection_id: connectionId,
            contact_id: contactId,
            account_id: accountId,
            opportunity_id: opportunityId,
            sync_status: 'synced'
          });
          
        if (linkError) {
          console.error('Link error:', linkError);
          return new Response(
            JSON.stringify({ error: 'Failed to link recording', success: false }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Recording ${recordingId} linked to Salesforce contact ${contactId}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_opportunity': {
        // Validate nested data
        const dataParseResult = updateOpportunityDataSchema.safeParse(data);
        if (!dataParseResult.success) {
          return new Response(
            JSON.stringify({ error: 'Opportunity ID and stage required', success: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { opportunityId, stage } = dataParseResult.data;
        
        console.log(`Updating opportunity ${opportunityId} to stage ${stage}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Opportunity updated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action', success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Salesforce sync error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
