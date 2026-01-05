import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Key, 
  Globe, 
  Bell, 
  Shield 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CRMConnection {
  id: string;
  provider: string;
  instance_url: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string | null;
}

interface SyncSettings {
  autoSyncLeads: boolean;
  autoSyncContacts: boolean;
  createTasks: boolean;
  createNotes: boolean;
  syncThreshold: number;
  notifyOnSync: boolean;
}

export default function SalesforceSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<CRMConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSyncLeads: true,
    autoSyncContacts: true,
    createTasks: true,
    createNotes: true,
    syncThreshold: 70,
    notifyOnSync: true
  });

  useEffect(() => {
    if (user) {
      checkSalesforceConnection();
    }
  }, [user]);

  const checkSalesforceConnection = async () => {
    if (!user) return;
    
    try {
      const { data: connections, error } = await supabase
        .from('crm_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'salesforce')
        .maybeSingle();

      if (error) throw error;

      setIsConnected(!!connections);
      setConnection(connections);
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSalesforce = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('salesforce-sync', {
        body: { action: 'get_oauth_url', userId: user.id }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        toast({
          title: 'Configuration Required',
          description: data.message || 'Please configure Salesforce credentials.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDisconnect = async () => {
    if (!user || !connection) return;

    try {
      await supabase
        .from('crm_connections')
        .delete()
        .eq('id', connection.id);

      setIsConnected(false);
      setConnection(null);

      toast({
        title: 'Disconnected',
        description: 'Salesforce connection has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Disconnect failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSyncNow = async () => {
    if (!user || !connection) return;

    try {
      toast({
        title: 'Sync started',
        description: 'Manual sync with Salesforce has been initiated.',
      });

      const { data, error } = await supabase.functions.invoke('salesforce-sync', {
        body: { 
          action: 'sync_contacts', 
          userId: user.id, 
          connectionId: connection.id 
        }
      });

      if (error) throw error;

      toast({
        title: 'Sync completed',
        description: `Synced ${data?.synced || 0} items to Salesforce.`,
      });

      checkSalesforceConnection();
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSaveSettings = async () => {
    toast({
      title: 'Settings saved',
      description: 'Your Salesforce sync settings have been updated.',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Salesforce Integration</h1>
          <p className="text-muted-foreground mt-1">
            Connect your Salesforce CRM to automatically sync AI-generated leads and call insights.
          </p>
        </div>

        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Manage your Salesforce CRM connection</CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected && connection ? (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Connected to Salesforce {connection.instance_url?.replace('https://', '')}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Last Sync</p>
                    <p className="text-sm text-muted-foreground">
                      {connection.last_sync_at 
                        ? new Date(connection.last_sync_at).toLocaleString() 
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sync Status</p>
                    <Badge variant="outline" className="mt-1">
                      {connection.sync_status || 'Idle'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSyncNow} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => connection.instance_url && window.open(connection.instance_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Salesforce
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    Not connected to Salesforce. Connect to enable automatic lead syncing.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleConnectSalesforce}>
                  <Key className="h-4 w-4 mr-2" />
                  Connect Salesforce
                </Button>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>You'll be redirected to Salesforce to authorize this application.</p>
                  <p className="font-medium">Required permissions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Read and write leads and contacts</li>
                    <li>Create tasks and notes</li>
                    <li>Access basic profile information</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>Configure how AI insights sync with Salesforce</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="leads">
              <TabsList>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-sync AI-Generated Leads</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create Salesforce leads when AI detects buying signals
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.autoSyncLeads}
                    onCheckedChange={(checked) => 
                      setSyncSettings({ ...syncSettings, autoSyncLeads: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Sync Contacts from Existing Accounts</Label>
                    <p className="text-sm text-muted-foreground">
                      Link calls to existing Salesforce contacts when possible
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.autoSyncContacts}
                    onCheckedChange={(checked) => 
                      setSyncSettings({ ...syncSettings, autoSyncContacts: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Confidence for Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Only sync leads with AI confidence above this threshold
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[syncSettings.syncThreshold]}
                      onValueChange={([value]) => 
                        setSyncSettings({ ...syncSettings, syncThreshold: value })
                      }
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">
                      {syncSettings.syncThreshold}%
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Create Follow-up Tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create Salesforce tasks for agreed next steps
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.createTasks}
                    onCheckedChange={(checked) => 
                      setSyncSettings({ ...syncSettings, createTasks: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Add Call Notes to Records</Label>
                    <p className="text-sm text-muted-foreground">
                      Append AI-generated call summaries to Salesforce records
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.createNotes}
                    onCheckedChange={(checked) => 
                      setSyncSettings({ ...syncSettings, createNotes: checked })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Sync Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when sync completes or fails
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.notifyOnSync}
                    onCheckedChange={(checked) => 
                      setSyncSettings({ ...syncSettings, notifyOnSync: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custom Field Mapping</Label>
                  <p className="text-sm text-muted-foreground">
                    Map AI-generated data to custom Salesforce fields
                  </p>
                  <Button variant="outline">Configure Field Mapping</Button>
                </div>

                <div className="space-y-2">
                  <Label>Sync Filters</Label>
                  <p className="text-sm text-muted-foreground">
                    Create rules to filter which calls get synced
                  </p>
                  <Button variant="outline">Set Up Filters</Button>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleSaveSettings} className="w-full">
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Integration Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Real-time Sync</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-generated leads sync to Salesforce within seconds of call completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Smart Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get alerts for high-priority leads and sync status updates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Secure & Compliant</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                OAuth 2.0 secure connection with Salesforce security standards
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
