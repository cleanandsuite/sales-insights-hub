import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon,
  Mic,
  Volume2,
  Brain,
  Link2,
  Bell,
  Shield,
  Users,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  CreditCard,
  Mail,
  UserCircle,
  FlaskConical
} from 'lucide-react';

import { PasswordChangeCard } from '@/components/settings/PasswordChangeCard';
import { BillingTab } from '@/components/settings/BillingTab';
import { InvitesTab } from '@/components/settings/InvitesTab';
import { CoachStyleSelector } from '@/components/settings/CoachStyleSelector';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { SalesforceTab } from '@/components/settings/SalesforceTab';
import { ExperimentsTab } from '@/components/settings/ExperimentsTab';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  default_mic_device_id: string | null;
  default_speaker_device_id: string | null;
  audio_quality: string;
  noise_cancellation: boolean;
  suggestion_frequency: string;
  focus_areas: string[];
  auto_analyze: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  daily_summary: boolean;
  auto_redact_pii: boolean;
  retention_days: number | null;
}

interface CRMConnection {
  id: string;
  provider: string;
  instance_url: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdminRole();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [crmConnections, setCrmConnections] = useState<CRMConnection[]>([]);
  
  const [settings, setSettings] = useState<UserSettings>({
    default_mic_device_id: null,
    default_speaker_device_id: null,
    audio_quality: 'balanced',
    noise_cancellation: true,
    suggestion_frequency: 'normal',
    focus_areas: ['rapport', 'objection_handling', 'closing'],
    auto_analyze: true,
    email_notifications: true,
    push_notifications: true,
    daily_summary: false,
    auto_redact_pii: true,
    retention_days: 90
  });

  useEffect(() => {
    fetchSettings();
    fetchAudioDevices();
    fetchCRMConnections();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data as UserSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter(d => d.kind === 'audioinput' || d.kind === 'audiooutput'));
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  };

  const fetchCRMConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crm_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCrmConnections(data || []);
    } catch (error) {
      console.error('Error fetching CRM connections:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: 'Settings saved!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ 
        variant: 'destructive',
        title: 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const connectCRM = async (provider: string) => {
    if (!user) return;

    try {
      // For now, create a demo connection
      const { error } = await supabase
        .from('crm_connections')
        .insert({
          user_id: user.id,
          provider,
          instance_url: `https://${provider}.example.com`,
          is_active: true,
          sync_status: 'idle'
        });

      if (error) throw error;

      toast({ title: `${provider} connected!` });
      fetchCRMConnections();
    } catch (error) {
      console.error('Error connecting CRM:', error);
      toast({ 
        variant: 'destructive',
        title: 'Failed to connect CRM'
      });
    }
  };

  const micDevices = audioDevices.filter(d => d.kind === 'audioinput');
  const speakerDevices = audioDevices.filter(d => d.kind === 'audiooutput');

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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Configure your preferences and integrations</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-muted/50 w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <UserCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="salesforce" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Salesforce</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="invites" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Invites</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="experiments" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none">
                <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Experiments</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio">
            <div className="space-y-6">
              {/* Audio Setup Reminder */}
              {(!settings.default_mic_device_id || !settings.default_speaker_device_id) && (
                <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Configure your audio devices before recording</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select your preferred microphone and speaker for optimal call recording quality.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Audio Devices</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Microphone</Label>
                  <Select
                    value={settings.default_mic_device_id || ''}
                    onValueChange={(value) => setSettings({ ...settings, default_mic_device_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {micDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || 'Microphone'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Speaker</Label>
                  <Select
                    value={settings.default_speaker_device_id || ''}
                    onValueChange={(value) => setSettings({ ...settings, default_speaker_device_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {speakerDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || 'Speaker'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Audio Quality</Label>
                  <Select
                    value={settings.audio_quality}
                    onValueChange={(value) => setSettings({ ...settings, audio_quality: value })}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (best quality, ~5MB/min)</SelectItem>
                      <SelectItem value="balanced">Balanced (~2.5MB/min)</SelectItem>
                      <SelectItem value="data_saver">Data Saver (~1MB/min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Noise Cancellation</Label>
                    <p className="text-sm text-muted-foreground">Reduce background noise during recordings</p>
                  </div>
                  <Switch
                    checked={settings.noise_cancellation}
                    onCheckedChange={(checked) => setSettings({ ...settings, noise_cancellation: checked })}
                  />
                </div>
              </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai">
            <div className="space-y-6">
              {/* Live AI Coaching Section */}
              <div className="card-gradient rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Live AI Coaching</h2>
                <CoachStyleSelector />
              </div>

              {/* General AI Preferences */}
              <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">AI Preferences</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Suggestion Frequency</Label>
                    <Select
                      value={settings.suggestion_frequency}
                      onValueChange={(value) => setSettings({ ...settings, suggestion_frequency: value })}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aggressive">Aggressive (many suggestions)</SelectItem>
                        <SelectItem value="normal">Normal (balanced)</SelectItem>
                        <SelectItem value="minimal">Minimal (only important)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Analyze Recordings</Label>
                      <p className="text-sm text-muted-foreground">Automatically analyze calls after recording</p>
                    </div>
                    <Switch
                      checked={settings.auto_analyze}
                      onCheckedChange={(checked) => setSettings({ ...settings, auto_analyze: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Focus Areas</Label>
                    <div className="flex flex-wrap gap-2">
                      {['rapport', 'discovery', 'presentation', 'objection_handling', 'closing'].map((area) => (
                        <Button
                          key={area}
                          variant={settings.focus_areas.includes(area) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newAreas = settings.focus_areas.includes(area)
                              ? settings.focus_areas.filter(a => a !== area)
                              : [...settings.focus_areas, area];
                            setSettings({ ...settings, focus_areas: newAreas });
                          }}
                        >
                          {area.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CRM Settings */}
          <TabsContent value="crm">
            <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">CRM Integrations</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['salesforce', 'hubspot', 'pipedrive'].map((provider) => {
                  const connection = crmConnections.find(c => c.provider === provider);
                  
                  return (
                    <div
                      key={provider}
                      className={`p-4 rounded-lg border ${
                        connection?.is_active 
                          ? 'border-success bg-success/5' 
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium capitalize text-foreground">{provider}</h3>
                        {connection?.is_active && (
                          <Check className="h-4 w-4 text-success" />
                        )}
                      </div>
                      
                      {connection?.is_active ? (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Last sync: {connection.last_sync_at 
                              ? new Date(connection.last_sync_at).toLocaleString()
                              : 'Never'
                            }
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Sync
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => provider === 'salesforce' 
                            ? window.location.href = '/settings/salesforce'
                            : connectCRM(provider)
                          }
                          className="w-full"
                        >
                          {provider === 'salesforce' ? 'Configure' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Salesforce Advanced Settings Link */}
              <div className="pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/settings/salesforce'}
                  className="gap-2"
                >
                  <Link2 className="h-4 w-4" />
                  Advanced Salesforce Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser notifications for real-time alerts</p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">Get a daily digest of your performance</p>
                  </div>
                  <Switch
                    checked={settings.daily_summary}
                    onCheckedChange={(checked) => setSettings({ ...settings, daily_summary: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              {/* Password Change */}
              <PasswordChangeCard />

              {/* Privacy & Compliance */}
              <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Privacy & Compliance</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Redact PII</Label>
                      <p className="text-sm text-muted-foreground">Automatically detect and redact SSN, credit card numbers, etc.</p>
                    </div>
                    <Switch
                      checked={settings.auto_redact_pii}
                      onCheckedChange={(checked) => setSettings({ ...settings, auto_redact_pii: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Recording Retention</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Automatically delete recordings after {settings.retention_days} days
                    </p>
                    <Slider
                      value={[settings.retention_days || 90]}
                      min={30}
                      max={365}
                      step={30}
                      onValueChange={(value) => setSettings({ ...settings, retention_days: value[0] })}
                      className="w-64"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">GDPR Data Request</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Request a copy of your data or deletion of your account
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">Download My Data</Button>
                          <Button size="sm" variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>


          {/* Billing */}
          <TabsContent value="billing">
            <div className="card-gradient rounded-xl border border-border/50 p-6">
              <BillingTab />
            </div>
          </TabsContent>

          {/* Invites */}
          <TabsContent value="invites">
            <InvitesTab />
          </TabsContent>

          {/* Salesforce */}
          <TabsContent value="salesforce">
            <SalesforceTab />
          </TabsContent>

          {/* Experiments (Admin only) */}
          {isAdmin && (
            <TabsContent value="experiments">
              <ExperimentsTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}