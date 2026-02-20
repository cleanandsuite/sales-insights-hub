import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Mail, AlertTriangle, TrendingDown, Target, Activity } from 'lucide-react';

interface AlertPreferences {
  emailAlerts: boolean;
  pushAlerts: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  alertTypes: {
    lowActivity: boolean;
    scoreDrop: boolean;
    dealStall: boolean;
    coachingNeeded: boolean;
  };
  thresholds: {
    activityDays: number;
    scoreDropPercent: number;
    dealStallDays: number;
  };
}

interface AlertPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export function AlertPreferencesDialog({ open, onOpenChange, teamId }: AlertPreferencesDialogProps) {
  const [preferences, setPreferences] = useState<AlertPreferences>({
    emailAlerts: true,
    pushAlerts: true,
    dailyDigest: false,
    weeklyReport: true,
    alertTypes: {
      lowActivity: true,
      scoreDrop: true,
      dealStall: true,
      coachingNeeded: true
    },
    thresholds: {
      activityDays: 3,
      scoreDropPercent: 15,
      dealStallDays: 7
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, save to database
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Alert preferences saved');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateAlertType = (type: keyof AlertPreferences['alertTypes'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      alertTypes: { ...prev.alertTypes, [type]: value }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alert Preferences
          </DialogTitle>
          <DialogDescription>
            Configure how and when you receive risk alerts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Notification Channels</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email-alerts" className="text-sm">Email Alerts</Label>
              </div>
              <Switch
                id="email-alerts"
                checked={preferences.emailAlerts}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="push-alerts" className="text-sm">Push Notifications</Label>
              </div>
              <Switch
                id="push-alerts"
                checked={preferences.pushAlerts}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushAlerts: checked }))}
              />
            </div>
          </div>

          <Separator />

          {/* Digest Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Summary Reports</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-digest" className="text-sm">Daily Digest</Label>
              <Switch
                id="daily-digest"
                checked={preferences.dailyDigest}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, dailyDigest: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-report" className="text-sm">Weekly Report</Label>
              <Switch
                id="weekly-report"
                checked={preferences.weeklyReport}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklyReport: checked }))}
              />
            </div>
          </div>

          <Separator />

          {/* Alert Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Alert Types</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-warning" />
                <Label htmlFor="low-activity" className="text-sm">Low Activity</Label>
              </div>
              <Switch
                id="low-activity"
                checked={preferences.alertTypes.lowActivity}
                onCheckedChange={(checked) => updateAlertType('lowActivity', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <Label htmlFor="score-drop" className="text-sm">Score Drop</Label>
              </div>
              <Switch
                id="score-drop"
                checked={preferences.alertTypes.scoreDrop}
                onCheckedChange={(checked) => updateAlertType('scoreDrop', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <Label htmlFor="deal-stall" className="text-sm">Deal Stall</Label>
              </div>
              <Switch
                id="deal-stall"
                checked={preferences.alertTypes.dealStall}
                onCheckedChange={(checked) => updateAlertType('dealStall', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <Label htmlFor="coaching-needed" className="text-sm">Coaching Needed</Label>
              </div>
              <Switch
                id="coaching-needed"
                checked={preferences.alertTypes.coachingNeeded}
                onCheckedChange={(checked) => updateAlertType('coachingNeeded', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Thresholds */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Alert Thresholds</h4>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Low activity after</Label>
              <Select 
                value={String(preferences.thresholds.activityDays)}
                onValueChange={(v) => setPreferences(prev => ({
                  ...prev,
                  thresholds: { ...prev.thresholds, activityDays: parseInt(v) }
                }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Score drop threshold</Label>
              <Select 
                value={String(preferences.thresholds.scoreDropPercent)}
                onValueChange={(v) => setPreferences(prev => ({
                  ...prev,
                  thresholds: { ...prev.thresholds, scoreDropPercent: parseInt(v) }
                }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Deal stall after</Label>
              <Select 
                value={String(preferences.thresholds.dealStallDays)}
                onValueChange={(v) => setPreferences(prev => ({
                  ...prev,
                  thresholds: { ...prev.thresholds, dealStallDays: parseInt(v) }
                }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="10">10 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
