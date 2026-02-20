import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, Save, Bell } from 'lucide-react';

interface DigestPreferences {
  enabled: boolean;
  frequency: string;
  day_of_week: number;
  include_rep_breakdown: boolean;
  include_goals_progress: boolean;
  include_risk_alerts: boolean;
}

interface EmailDigestSettingsProps {
  teamId: string;
}

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function EmailDigestSettings({ teamId }: EmailDigestSettingsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<DigestPreferences>({
    enabled: true,
    frequency: 'weekly',
    day_of_week: 1,
    include_rep_breakdown: true,
    include_goals_progress: true,
    include_risk_alerts: true,
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, teamId]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('email_digest_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          enabled: data.enabled,
          frequency: data.frequency,
          day_of_week: data.day_of_week || 1,
          include_rep_breakdown: data.include_rep_breakdown,
          include_goals_progress: data.include_goals_progress,
          include_risk_alerts: data.include_risk_alerts,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_digest_preferences')
        .upsert({
          user_id: user.id,
          team_id: teamId,
          ...preferences,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Digest preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePref = <K extends keyof DigestPreferences>(key: K, value: DigestPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Digest
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Digest
        </CardTitle>
        <p className="text-sm text-muted-foreground">Automated performance summaries</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="font-medium">Enable Email Digest</Label>
            <p className="text-sm text-muted-foreground">Receive automated performance reports</p>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(v) => updatePref('enabled', v)}
          />
        </div>

        {preferences.enabled && (
          <>
            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select 
                value={preferences.frequency} 
                onValueChange={(v) => updatePref('frequency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day of Week (for weekly) */}
            {preferences.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Send On</Label>
                <Select 
                  value={preferences.day_of_week.toString()} 
                  onValueChange={(v) => updatePref('day_of_week', parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Content Options */}
            <div className="space-y-4 pt-2 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground">Include in Digest</p>
              
              <div className="flex items-center justify-between">
                <Label className="font-normal">Rep Performance Breakdown</Label>
                <Switch
                  checked={preferences.include_rep_breakdown}
                  onCheckedChange={(v) => updatePref('include_rep_breakdown', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="font-normal">Goals Progress</Label>
                <Switch
                  checked={preferences.include_goals_progress}
                  onCheckedChange={(v) => updatePref('include_goals_progress', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="font-normal">Risk Alerts</Label>
                <Switch
                  checked={preferences.include_risk_alerts}
                  onCheckedChange={(v) => updatePref('include_risk_alerts', v)}
                />
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>

        {preferences.enabled && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Bell className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              You'll receive {preferences.frequency} digests 
              {preferences.frequency === 'weekly' && ` on ${DAYS.find(d => d.value === preferences.day_of_week)?.label}s`}
              . Digests are sent at 9:00 AM in your local timezone.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
