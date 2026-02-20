import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, TrendingUp, TrendingDown, Minus, Target, AlertCircle
} from 'lucide-react';

interface PredictiveMetric {
  label: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface PredictiveScoreCardProps {
  teamId: string;
}

export function PredictiveScoreCard({ teamId }: PredictiveScoreCardProps) {
  const [metrics, setMetrics] = useState<PredictiveMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallRisk, setOverallRisk] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    calculatePredictions();
  }, [teamId]);

  const calculatePredictions = async () => {
    try {
      // Get historical team data for prediction
      const { data: kpis } = await (supabase.rpc as any)('get_team_kpis', { p_team_id: teamId });
      
      if (!kpis) {
        setLoading(false);
        return;
      }

      // Get recent call trends
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      const userIds = (members || []).map(m => m.user_id);
      
      // Get call scores from last 30 days vs previous 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

      const { data: recentScores } = await supabase
        .from('call_scores')
        .select('overall_score, closing_score, discovery_score, created_at, recording_id')
        .gte('created_at', thirtyDaysAgo);

      const { data: previousScores } = await supabase
        .from('call_scores')
        .select('overall_score, closing_score, discovery_score, created_at')
        .gte('created_at', sixtyDaysAgo)
        .lt('created_at', thirtyDaysAgo);

      // Calculate averages and trends
      const calcAvg = (arr: any[], field: string) => 
        arr.length ? arr.reduce((sum, item) => sum + (item[field] || 0), 0) / arr.length : 0;

      const recentOverall = calcAvg(recentScores || [], 'overall_score');
      const previousOverall = calcAvg(previousScores || [], 'overall_score');
      const recentClosing = calcAvg(recentScores || [], 'closing_score');
      const previousClosing = calcAvg(previousScores || [], 'closing_score');
      const recentDiscovery = calcAvg(recentScores || [], 'discovery_score');
      const previousDiscovery = calcAvg(previousScores || [], 'discovery_score');

      // Calculate velocity (calls per week trend)
      const recentCallCount = (recentScores || []).length;
      const previousCallCount = (previousScores || []).length;
      const callTrend = previousCallCount > 0 
        ? ((recentCallCount - previousCallCount) / previousCallCount) * 100 
        : 0;

      // Generate predictions (simple linear projection)
      const predictTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
        const diff = current - previous;
        if (diff > 5) return 'up';
        if (diff < -5) return 'down';
        return 'stable';
      };

      const predictedMetrics: PredictiveMetric[] = [
        {
          label: 'Win Rate',
          current: kpis.teamWinRate || 0,
          predicted: Math.min(100, Math.max(0, (kpis.teamWinRate || 0) + (recentOverall - previousOverall) * 0.5)),
          trend: predictTrend(recentOverall, previousOverall),
          confidence: Math.min(95, 60 + (recentScores || []).length * 2)
        },
        {
          label: 'Avg Score',
          current: recentOverall,
          predicted: Math.min(100, Math.max(0, recentOverall + (recentOverall - previousOverall) * 0.7)),
          trend: predictTrend(recentOverall, previousOverall),
          confidence: Math.min(92, 55 + (recentScores || []).length * 2)
        },
        {
          label: 'Closing Score',
          current: recentClosing,
          predicted: Math.min(100, Math.max(0, recentClosing + (recentClosing - previousClosing) * 0.6)),
          trend: predictTrend(recentClosing, previousClosing),
          confidence: Math.min(88, 50 + (recentScores || []).length * 2)
        },
        {
          label: 'Discovery Score',
          current: recentDiscovery,
          predicted: Math.min(100, Math.max(0, recentDiscovery + (recentDiscovery - previousDiscovery) * 0.6)),
          trend: predictTrend(recentDiscovery, previousDiscovery),
          confidence: Math.min(88, 50 + (recentScores || []).length * 2)
        },
        {
          label: 'Call Volume',
          current: recentCallCount,
          predicted: Math.max(0, recentCallCount + (callTrend / 100) * recentCallCount * 0.5),
          trend: callTrend > 10 ? 'up' : callTrend < -10 ? 'down' : 'stable',
          confidence: Math.min(85, 45 + recentCallCount * 3)
        }
      ];

      setMetrics(predictedMetrics);

      // Calculate overall risk
      const downTrends = predictedMetrics.filter(m => m.trend === 'down').length;
      const lowConfidence = predictedMetrics.filter(m => m.confidence < 60).length;
      
      if (downTrends >= 3 || (downTrends >= 2 && lowConfidence >= 2)) {
        setOverallRisk('high');
      } else if (downTrends >= 2 || lowConfidence >= 3) {
        setOverallRisk('medium');
      } else {
        setOverallRisk('low');
      }

    } catch (error) {
      console.error('Error calculating predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskBadge = () => {
    switch (overallRisk) {
      case 'high': 
        return <Badge className="bg-destructive text-destructive-foreground gap-1"><AlertCircle className="h-3 w-3" />High Risk</Badge>;
      case 'medium': 
        return <Badge className="bg-warning text-warning-foreground gap-1"><Target className="h-3 w-3" />Medium Risk</Badge>;
      default: 
        return <Badge className="bg-success text-success-foreground gap-1"><TrendingUp className="h-3 w-3" />On Track</Badge>;
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">AI Predictions</CardTitle>
          </div>
          {getRiskBadge()}
        </div>
        <CardDescription>30-day forecast based on team performance trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {metric.label === 'Call Volume' 
                      ? Math.round(metric.current) 
                      : `${Math.round(metric.current)}%`}
                  </span>
                  <span className="text-foreground font-medium">
                    → {metric.label === 'Call Volume' 
                      ? Math.round(metric.predicted) 
                      : `${Math.round(metric.predicted)}%`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={metric.confidence} 
                  className="h-1.5 flex-1"
                />
                <span className="text-xs text-muted-foreground w-12">
                  {Math.round(metric.confidence)}% conf
                </span>
              </div>
            </div>
          ))}
        </div>

        {overallRisk === 'high' && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Multiple metrics trending down. Consider scheduling team coaching.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
