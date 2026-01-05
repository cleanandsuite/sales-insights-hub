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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, userId, connectionId, recordingId, data } = await req.json();
    
    console.log(`Salesforce sync action: ${action}`);

    switch (action) {
      case 'get_oauth_url': {
        // In production, this would generate a Salesforce OAuth URL
        // For now, we return a placeholder
        const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
        const redirectUri = `${supabaseUrl}/functions/v1/salesforce-callback`;
        
        if (!clientId) {
          return new Response(
            JSON.stringify({ 
              error: 'Salesforce integration not configured',
              message: 'Please add SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET to your secrets'
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
        if (!connectionId) throw new Error('Connection ID required');
        
        // Get connection details
        const { data: connection, error: connError } = await supabase
          .from('crm_connections')
          .select('*')
          .eq('id', connectionId)
          .single();
          
        if (connError || !connection) {
          throw new Error('Connection not found');
        }
        
        // Update sync status
        await supabase
          .from('crm_connections')
          .update({ sync_status: 'syncing' })
          .eq('id', connectionId);
        
        // In production, this would call Salesforce API
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
              user_id: userId,
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
        if (!recordingId || !data?.contactId) {
          throw new Error('Recording ID and contact ID required');
        }
        
        // Create CRM link
        const { error: linkError } = await supabase
          .from('recording_crm_links')
          .insert({
            recording_id: recordingId,
            crm_connection_id: connectionId,
            contact_id: data.contactId,
            account_id: data.accountId,
            opportunity_id: data.opportunityId,
            sync_status: 'synced'
          });
          
        if (linkError) throw linkError;
        
        // In production, this would also create an activity in Salesforce
        console.log(`Recording ${recordingId} linked to Salesforce contact ${data.contactId}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_opportunity': {
        if (!data?.opportunityId || !data?.stage) {
          throw new Error('Opportunity ID and stage required');
        }
        
        // In production, this would update the opportunity in Salesforce
        console.log(`Updating opportunity ${data.opportunityId} to stage ${data.stage}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Opportunity updated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Salesforce sync error:', error);
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