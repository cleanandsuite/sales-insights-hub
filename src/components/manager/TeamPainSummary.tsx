import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Zap,
  Brain
} from 'lucide-react';

interface PainPoint {
  type: string;
  severity: number;
  predictedWinRateLift: number;
}

interface PainSummary {
  type: string;
  count: number;
  avgSeverity: number;
  totalWinRateLift: number;
}

const PAIN_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  follow_up: { label: 'Follow-up', icon: <Target className="h-4 w-4" />, color: 'bg-blue-500' },
  closing: { label: 'Closing', icon: <Zap className="h-4 w-4" />, color: 'bg-orange-500' },
  prospecting: { label: 'Prospecting', icon: <MessageSquare className="h-4 w-4" />, color: 'bg-purple-500' },
  objection_handling: { label: 'Objection Handling', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-500' },
  turnover: { label: 'Turnover', icon: <TrendingUp className="h-4 w-4" />, color: 'bg-yellow-500' },
  talk_ratio: { label: 'Talk Ratio', icon: <MessageSquare className="h-4 w-4" />, color: 'bg-cyan-500' },
  pricing: { label: 'Pricing', icon: <Target className="h-4 w-4" />, color: 'bg-green-500' },
};

interface TeamPainSummaryProps {
  teamId: string;
}

export function TeamPainSummary({ teamId }: TeamPainSummaryProps) {
  const [painSummary, setPainSummary] = useState<PainSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);

  useEffect(() => {
    fetchTeamPains();
  }, [teamId]);

  const fetchTeamPains = async () => {
    try {
      // Get team member IDs
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members || members.length === 0) {
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);

      // Fetch all recordings with pain analysis for team members
      const { data: recordings } = await supabase
        .from('call_recordings')
        .select('ai_suggestions')
        .in('user_id', userIds)
        .not('ai_suggestions', 'is', null);

      if (!recordings) {
        setLoading(false);
        return;
      }

      // Aggregate pain points
      const painMap = new Map<string, { count: number; totalSeverity: number; totalLift: number }>();
      let callsWithPains = 0;

      recordings.forEach(rec => {
        const suggestions = rec.ai_suggestions as any;
        if (suggestions?.painAnalysis?.pains) {
          callsWithPains++;
          (suggestions.painAnalysis.pains as PainPoint[]).forEach(pain => {
            const existing = painMap.get(pain.type) || { count: 0, totalSeverity: 0, totalLift: 0 };
            painMap.set(pain.type, {
              count: existing.count + 1,
              totalSeverity: existing.totalSeverity + pain.severity,
              totalLift: existing.totalLift + pain.predictedWinRateLift,
            });
          });
        }
      });

      // Convert to summary array
      const summary: PainSummary[] = Array.from(painMap.entries())
        .map(([type, data]) => ({
          type,
          count: data.count,
          avgSeverity: Math.round((data.totalSeverity / data.count) * 10) / 10,
          totalWinRateLift: Math.round(data.totalLift / data.count),
        }))
        .sort((a, b) => b.count - a.count);

      setPainSummary(summary);
      setTotalCalls(callsWithPains);
    } catch (error) {
      console.error('Error fetching team pains:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (painSummary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Team Pain Analysis
          </CardTitle>
          <CardDescription>Aggregated sales pains across team calls</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No pain analysis data available yet. Run AI Pain Detector on individual recordings to see team-wide patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...painSummary.map(p => p.count));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Team Pain Analysis
            </CardTitle>
            <CardDescription>Top coaching opportunities from {totalCalls} analyzed calls</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {painSummary.slice(0, 5).map((pain, index) => {
          const config = PAIN_CONFIG[pain.type] || { label: pain.type, icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-gray-500' };

          return (
            <div key={pain.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-mono">#{index + 1}</span>
                  <div className={`p-1.5 rounded ${config.color} text-white`}>
                    {config.icon}
                  </div>
                  <span className="font-medium text-sm">{config.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {pain.count} occurrences
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Avg severity: {pain.avgSeverity}/10
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    +{pain.totalWinRateLift}% potential lift
                  </Badge>
                </div>
              </div>
              <Progress value={(pain.count / maxCount) * 100} className="h-2" />
            </div>
          );
        })}

        {/* Total potential lift */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Coaching Opportunity</p>
              <p className="text-xs text-muted-foreground">If all top pains addressed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                +{painSummary.reduce((sum, p) => sum + p.totalWinRateLift, 0)}%
              </p>
              <p className="text-xs text-muted-foreground">potential win rate lift</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
