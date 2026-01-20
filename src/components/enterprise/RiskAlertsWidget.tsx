import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertTriangle, AlertCircle, Info, CheckCircle, X, Building2, Phone
} from 'lucide-react';

interface RiskAlert {
  id: string;
  type: 'deal_stall' | 'low_activity' | 'score_drop' | 'coaching_needed';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  lead_name?: string;
  company?: string;
  calls_count?: number;
  ai_confidence?: number;
}

interface RiskAlertsWidgetProps {
  teamId: string;
}

export function RiskAlertsWidget({ teamId }: RiskAlertsWidgetProps) {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateAlerts();
  }, [teamId]);

  const generateAlerts = async () => {
    try {
      // Get team member IDs
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) throw membersError;
      const userIds = (members || []).map(m => m.user_id);

      if (userIds.length === 0) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      // Get leads with risk indicators
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, contact_name, company, ai_confidence, is_hot_lead, recording_id, created_at')
        .in('user_id', userIds)
        .is('outcome', null);

      if (leadsError) throw leadsError;

      const generatedAlerts: RiskAlert[] = [];

      // Analyze each lead for risks
      for (const lead of leads || []) {
        // Low AI confidence
        if (lead.ai_confidence !== null && lead.ai_confidence < 40) {
          generatedAlerts.push({
            id: `${lead.id}-low-confidence`,
            type: 'deal_stall',
            severity: lead.ai_confidence < 20 ? 'critical' : 'warning',
            title: 'Low Deal Confidence',
            description: `AI confidence at ${lead.ai_confidence}%. Review deal strategy.`,
            lead_name: lead.contact_name,
            company: lead.company || undefined,
            ai_confidence: lead.ai_confidence
          });
        }

        // No recording (low engagement)
        if (!lead.recording_id) {
          const daysSinceCreated = Math.floor(
            (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceCreated > 3) {
            generatedAlerts.push({
              id: `${lead.id}-no-call`,
              type: 'low_activity',
              severity: daysSinceCreated > 7 ? 'critical' : 'warning',
              title: 'No Call Recorded',
              description: `${daysSinceCreated} days since lead created with no recorded call.`,
              lead_name: lead.contact_name,
              company: lead.company || undefined
            });
          }
        }

        // Hot lead without recent activity
        if (lead.is_hot_lead && !lead.recording_id) {
          generatedAlerts.push({
            id: `${lead.id}-hot-no-activity`,
            type: 'coaching_needed',
            severity: 'critical',
            title: 'Hot Lead Needs Attention',
            description: 'High-priority lead flagged but no call recorded.',
            lead_name: lead.contact_name,
            company: lead.company || undefined
          });
        }
      }

      // Sort by severity
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setAlerts(generatedAlerts.slice(0, 8));
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    toast.success('Alert dismissed');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
      case 'warning': return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id));

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enterprise">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-foreground">Risk Alerts</CardTitle>
        </div>
        <CardDescription>Deals and leads requiring immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <p className="text-foreground font-medium">No active risks</p>
            <p className="text-sm text-muted-foreground">Your pipeline is looking healthy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  alert.severity === 'critical' 
                    ? 'border-destructive/50 bg-destructive/5' 
                    : alert.severity === 'warning'
                    ? 'border-warning/50 bg-warning/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{alert.title}</span>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  {(alert.lead_name || alert.company) && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {alert.lead_name && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {alert.lead_name}
                        </span>
                      )}
                      {alert.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {alert.company}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
