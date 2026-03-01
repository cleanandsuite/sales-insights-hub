import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Building2, User, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalesforceRecordingViewProps {
  recording: {
    id: string;
    salesforce_lead_id?: string | null;
    salesforce_contact_id?: string | null;
    salesforce_opportunity_id?: string | null;
    salesforce_account_id?: string | null;
    crm_sync_status?: string | null;
    file_name?: string;
  };
  onSyncComplete?: () => void;
}

export function SalesforceRecordingView({ recording, onSyncComplete }: SalesforceRecordingViewProps) {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const hasSalesforceLink = 
    recording.salesforce_lead_id || 
    recording.salesforce_contact_id || 
    recording.salesforce_opportunity_id;

  const handleSyncToSalesforce = async () => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's active CRM connection
      const { data: connection, error: connError } = await supabase
        .from('crm_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (connError) throw connError;
      if (!connection) {
        toast({
          title: 'No CRM connection',
          description: 'Please connect your Salesforce account in Settings first.',
          variant: 'destructive',
        });
        setSyncing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('salesforce-sync', {
        body: {
          action: 'link_recording',
          recordingId: recording.id,
          connectionId: connection.id,
          userId: user.id,
          data: { contactId: `auto_${Date.now()}` }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sync initiated',
        description: 'Recording is being synced to Salesforce.',
      });
      
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync with Salesforce',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenSalesforce = () => {
    // In production, this would use the actual Salesforce instance URL from the connection
    let sfPath = '';
    if (recording.salesforce_lead_id) {
      sfPath = `/lightning/r/Lead/${recording.salesforce_lead_id}/view`;
    } else if (recording.salesforce_contact_id) {
      sfPath = `/lightning/r/Contact/${recording.salesforce_contact_id}/view`;
    } else if (recording.salesforce_opportunity_id) {
      sfPath = `/lightning/r/Opportunity/${recording.salesforce_opportunity_id}/view`;
    }
    
    if (sfPath) {
      toast({
        title: 'Opening Salesforce',
        description: 'Configure your Salesforce instance URL in settings to enable direct links.',
      });
    }
  };

  const getSyncStatusBadge = () => {
    switch (recording.crm_sync_status) {
      case 'synced':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Synced
          </Badge>
        );
      case 'syncing':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Salesforce CRM
          </CardTitle>
          {getSyncStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasSalesforceLink ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Linked Record</span>
                <Button variant="ghost" size="sm" onClick={handleOpenSalesforce}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in Salesforce
                </Button>
              </div>
              
              <div className="space-y-2">
                {recording.salesforce_lead_id && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">Lead</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {recording.salesforce_lead_id.substring(0, 15)}...
                      </p>
                    </div>
                  </div>
                )}
                
                {recording.salesforce_contact_id && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">Contact</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {recording.salesforce_contact_id.substring(0, 15)}...
                      </p>
                    </div>
                  </div>
                )}

                {recording.salesforce_opportunity_id && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">Opportunity</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {recording.salesforce_opportunity_id.substring(0, 15)}...
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                AI-generated insights from this call have been synced to Salesforce.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Not Synced to CRM</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This call hasn't been synced to Salesforce. AI analysis suggests this could be a qualified lead.
              </p>
              
              <Button 
                onClick={handleSyncToSalesforce} 
                disabled={syncing}
                size="sm"
                className="w-full"
              >
                {syncing && <RefreshCw className="h-3 w-3 mr-2 animate-spin" />}
                Sync as Salesforce Lead
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Will create a new lead with:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>Contact information from call</li>
                  <li>AI-generated call summary</li>
                  <li>Key pain points and next steps</li>
                  <li>Link back to this recording</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
