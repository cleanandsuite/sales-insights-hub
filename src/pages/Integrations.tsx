import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Link2, 
  Settings2, 
  Check, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle,
  Calendar,
  MessageSquare,
  Video,
  Cloud,
  Database,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'calendar' | 'communication';
  icon: React.ElementType;
  connected: boolean;
  description: string;
  stats?: {
    contacts?: number;
    deals?: number;
    activities?: number;
    lastSync?: string;
  };
  connectedBy?: string;
  connectedAt?: string;
}

interface SyncSetting {
  id: string;
  label: string;
  enabled: boolean;
}

const mockIntegrations: Integration[] = [
  { 
    id: 'hubspot', 
    name: 'HubSpot', 
    type: 'crm',
    icon: Cloud, 
    connected: true, 
    description: 'CRM sync and contact management',
    stats: { contacts: 847, deals: 124, activities: 2341, lastSync: '2 min ago' },
    connectedBy: 'john@acme.com',
    connectedAt: 'Jan 15, 2026'
  },
  { 
    id: 'salesforce', 
    name: 'Salesforce', 
    type: 'crm',
    icon: Database, 
    connected: false, 
    description: 'Enterprise CRM integration' 
  },
  { 
    id: 'pipedrive', 
    name: 'Pipedrive', 
    type: 'crm',
    icon: Database, 
    connected: false, 
    description: 'Sales pipeline management' 
  },
  { 
    id: 'close', 
    name: 'Close', 
    type: 'crm',
    icon: Database, 
    connected: false, 
    description: 'Inside sales CRM' 
  },
  { 
    id: 'google-calendar', 
    name: 'Google Calendar', 
    type: 'calendar',
    icon: Calendar, 
    connected: true, 
    description: 'Meeting sync and scheduling',
    stats: { lastSync: '5 min ago' },
    connectedBy: 'john@acme.com',
    connectedAt: 'Jan 10, 2026'
  },
  { 
    id: 'outlook', 
    name: 'Outlook Calendar', 
    type: 'calendar',
    icon: Calendar, 
    connected: false, 
    description: 'Microsoft calendar integration' 
  },
  { 
    id: 'slack', 
    name: 'Slack', 
    type: 'communication',
    icon: MessageSquare, 
    connected: false, 
    description: 'Team notifications and alerts' 
  },
  { 
    id: 'zoom', 
    name: 'Zoom', 
    type: 'communication',
    icon: Video, 
    connected: false, 
    description: 'Video meeting integration' 
  },
];

const defaultPushSettings: SyncSetting[] = [
  { id: 'call-summaries', label: 'Call Summaries', enabled: true },
  { id: 'deal-health', label: 'Deal Health Scores', enabled: true },
  { id: 'buying-signals', label: 'Buying Signals', enabled: true },
  { id: 'followup-tasks', label: 'Follow-up Tasks', enabled: true },
  { id: 'call-recordings', label: 'Call Recordings', enabled: true },
  { id: 'objection-tracking', label: 'Objection Tracking', enabled: false },
];

const defaultPullSettings: SyncSetting[] = [
  { id: 'contacts', label: 'Contacts', enabled: true },
  { id: 'deals', label: 'Deals', enabled: true },
  { id: 'email-activity', label: 'Email Activity', enabled: false },
];

const mockSyncLog = [
  { id: '1', timestamp: '2 min ago', message: 'Call summary synced to HubSpot', status: 'success' },
  { id: '2', timestamp: '15 min ago', message: 'Deal health score updated', status: 'success' },
  { id: '3', timestamp: '1 hour ago', message: '5 contacts synced from HubSpot', status: 'success' },
  { id: '4', timestamp: '3 hours ago', message: 'Rate limit reached (resolved)', status: 'warning' },
  { id: '5', timestamp: '6 hours ago', message: 'Buying signals pushed to 3 deals', status: 'success' },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [apiKey] = useState('sk_live_sellsig_xxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);
  const [pushSettings, setPushSettings] = useState(defaultPushSettings);
  const [pullSettings, setPullSettings] = useState(defaultPullSettings);
  const [syncFrequency, setSyncFrequency] = useState<'realtime' | '15min' | 'hourly' | 'manual'>('realtime');
  const [testing, setTesting] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({ title: "API Key Copied", description: "The API key has been copied to your clipboard." });
  };

  const handleConnect = (integration: Integration) => {
    toast({ 
      title: `Connecting to ${integration.name}...`, 
      description: "You will be redirected to authorize the connection." 
    });
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigOpen(true);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTesting(false);
    toast({ 
      title: "Connection Successful", 
      description: `${selectedIntegration?.name} is properly configured and syncing.` 
    });
  };

  const handleDisconnect = () => {
    if (!selectedIntegration) return;
    setIntegrations(prev => 
      prev.map(i => i.id === selectedIntegration.id ? { ...i, connected: false, stats: undefined } : i)
    );
    setConfigOpen(false);
    toast({ 
      title: "Integration Disconnected", 
      description: `${selectedIntegration.name} has been disconnected.`,
      variant: "destructive"
    });
  };

  const togglePushSetting = (id: string) => {
    setPushSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const togglePullSetting = (id: string) => {
    setPullSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const crmIntegrations = integrations.filter(i => i.type === 'crm');
  const calendarIntegrations = integrations.filter(i => i.type === 'calendar');
  const communicationIntegrations = integrations.filter(i => i.type === 'communication');

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
              <p className="text-muted-foreground">Connect SellSig to your existing tools. We make them smarter.</p>
            </div>
          </div>
        </div>

        {/* CRM Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            CRM Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crmIntegrations.map((integration) => (
              <IntegrationCard 
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onConfigure={() => handleConfigure(integration)}
              />
            ))}
          </div>
        </section>

        {/* Calendar Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Calendar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarIntegrations.map((integration) => (
              <IntegrationCard 
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onConfigure={() => handleConfigure(integration)}
              />
            ))}
          </div>
        </section>

        {/* Communication Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Communication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communicationIntegrations.map((integration) => (
              <IntegrationCard 
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onConfigure={() => handleConfigure(integration)}
              />
            ))}
          </div>
        </section>

        {/* API Access Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            API Access
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Your API Key</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="bg-background border-border font-mono text-sm pr-20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyApiKey}
                    className="border-border hover:bg-muted"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast({ title: "API Key Regenerated", description: "Your new key is ready." })}
                    className="border-border hover:bg-muted"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto">
                View API Documentation
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Configuration Dialog */}
        <Dialog open={configOpen} onOpenChange={setConfigOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                {selectedIntegration && (
                  <>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <selectedIntegration.icon className="h-5 w-5 text-primary" />
                    </div>
                    {selectedIntegration.name} Integration
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Configure how SellSig syncs with your {selectedIntegration?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedIntegration?.connected && (
              <div className="space-y-6">
                {/* Connection Status */}
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                        <div>
                          <p className="font-medium text-foreground">Connected to Acme Corporation</p>
                          <p className="text-sm text-muted-foreground">
                            Connected by {selectedIntegration.connectedBy} on {selectedIntegration.connectedAt}
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedIntegration.stats && (
                      <div className="flex gap-6 mt-4 pt-4 border-t border-border/50">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedIntegration.stats.contacts?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Contacts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedIntegration.stats.deals?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Deals</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedIntegration.stats.activities?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Activities</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Push Settings */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Push TO {selectedIntegration.name}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pushSettings.map(setting => (
                      <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-sm text-foreground">{setting.label}</span>
                        <Switch checked={setting.enabled} onCheckedChange={() => togglePushSetting(setting.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pull Settings */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Pull FROM {selectedIntegration.name}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pullSettings.map(setting => (
                      <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-sm text-foreground">{setting.label}</span>
                        <Switch checked={setting.enabled} onCheckedChange={() => togglePullSetting(setting.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sync Frequency */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Sync Frequency</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {(['realtime', '15min', 'hourly', 'manual'] as const).map(freq => (
                      <button
                        key={freq}
                        onClick={() => setSyncFrequency(freq)}
                        className={cn(
                          "p-3 rounded-lg text-sm font-medium border transition-all",
                          syncFrequency === freq 
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50"
                        )}
                      >
                        {freq === 'realtime' && 'Real-time'}
                        {freq === '15min' && '15 min'}
                        {freq === 'hourly' && 'Hourly'}
                        {freq === 'manual' && 'Manual'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sync Log */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Recent Sync Activity</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {mockSyncLog.map(log => (
                      <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                        {log.status === 'success' ? (
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                        )}
                        <span className="text-sm text-foreground flex-1">{log.message}</span>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Actions */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="border-border"
                  >
                    {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                    onClick={() => {
                      toast({ title: "Settings Saved", description: "Your integration settings have been updated." });
                      setConfigOpen(false);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Disconnecting will stop all syncing. Your data in {selectedIntegration.name} will remain intact.
                  </p>
                  <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                    Disconnect {selectedIntegration.name}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function IntegrationCard({ 
  integration, 
  onConnect, 
  onConfigure 
}: { 
  integration: Integration; 
  onConnect: () => void; 
  onConfigure: () => void;
}) {
  const Icon = integration.icon;
  
  return (
    <Card className={cn(
      "bg-card border-border transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
      integration.connected && "border-success/30"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl border",
              integration.connected 
                ? "bg-success/10 border-success/20" 
                : "bg-muted/30 border-border"
            )}>
              <Icon className={cn("h-6 w-6", integration.connected ? "text-success" : "text-muted-foreground")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{integration.name}</h3>
                {integration.connected ? (
                  <Badge className="bg-success/10 text-success border-success/20 gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
              {integration.connected && integration.stats && (
                <p className="text-xs text-muted-foreground mt-2">
                  {integration.stats.contacts && `Syncing ${integration.stats.contacts.toLocaleString()} contacts · `}
                  Last sync: {integration.stats.lastSync}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {integration.connected ? (
            <Button variant="outline" size="sm" onClick={onConfigure} className="border-border hover:bg-muted">
              <Settings2 className="h-4 w-4 mr-1" />
              Configure
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={onConnect}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90"
            >
              Connect
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
