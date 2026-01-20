import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Target, AlertTriangle, Trophy, TrendingUp, ChevronRight, 
  Users, Zap, CheckCircle2
} from 'lucide-react';

interface ManagerWidgetProps {
  teamId: string;
}

interface WidgetData {
  activeGoals: number;
  goalsOnTrack: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  topPerformers: { name: string; score: number; trend: 'up' | 'down' | 'stable' }[];
  teamScore: number;
  teamScoreTrend: number;
}

export function ManagerDashboardWidget({ teamId }: ManagerWidgetProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWidgetData();
  }, [teamId]);

  const fetchWidgetData = async () => {
    try {
      // Fetch active goals
      const teamGoalsRes = await supabase
        .from('team_goals')
        .select('id, target_value, current_value')
        .eq('team_id', teamId)
        .eq('status', 'active');
      
      const repGoalsRes = await supabase
        .from('rep_goals')
        .select('id, target_value, current_value')
        .eq('team_id', teamId)
        .eq('status', 'active');

      const allGoals = [...(teamGoalsRes.data || []), ...(repGoalsRes.data || [])];
      const goalsOnTrack = allGoals.filter((g: any) => {
        const progress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
        return progress >= 75;
      }).length;

      // Fetch unresolved alerts
      const alertsRes = await (supabase as any).from('risk_alerts').select('id, severity').eq('team_id', teamId).eq('acknowledged', false);
      const alerts: { id: string; severity: string }[] = alertsRes.data || [];
      const criticalAlerts = alerts.filter((a) => a.severity === 'high').length;

      // Fetch top performers
      const { data: repStats } = await supabase
        .from('manager_team_stats')
        .select('full_name, avg_overall_score')
        .eq('team_id', teamId)
        .order('avg_overall_score', { ascending: false })
        .limit(3);

      const topPerformers = (repStats || []).map(r => ({
        name: r.full_name?.split(' ')[0] || 'Unknown',
        score: Number(r.avg_overall_score) || 0,
        trend: 'up' as const, // Could be calculated from historical data
      }));

      // Calculate team average
      const teamScore = repStats && repStats.length > 0
        ? repStats.reduce((sum, r) => sum + (Number(r.avg_overall_score) || 0), 0) / repStats.length
        : 0;

      setData({
        activeGoals: allGoals.length,
        goalsOnTrack,
        unresolvedAlerts: alerts?.length || 0,
        criticalAlerts,
        topPerformers,
        teamScore,
        teamScoreTrend: 3.2, // Mock trend - could be calculated
      });
    } catch (error) {
      console.error('Error fetching widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Team Overview
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/revenue-intelligence')}
            className="gap-1 text-xs"
          >
            View Details <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
          <div>
            <p className="text-xs text-muted-foreground">Team Score</p>
            <p className="text-2xl font-bold">{data.teamScore.toFixed(1)}</p>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary gap-1">
            <TrendingUp className="h-3 w-3" />
            +{data.teamScoreTrend}%
          </Badge>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Goals */}
          <div 
            className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => navigate('/revenue-intelligence?tab=goals')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Goals</span>
            </div>
            <p className="font-semibold">{data.goalsOnTrack}/{data.activeGoals} on track</p>
            <Progress 
              value={data.activeGoals > 0 ? (data.goalsOnTrack / data.activeGoals) * 100 : 0} 
              className="h-1.5 mt-2" 
            />
          </div>

          {/* Alerts */}
          <div 
            className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => navigate('/revenue-intelligence?tab=risks')}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${data.criticalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">Alerts</span>
            </div>
            <p className="font-semibold">
              {data.unresolvedAlerts} unresolved
              {data.criticalAlerts > 0 && (
                <span className="text-destructive ml-1">({data.criticalAlerts} critical)</span>
              )}
            </p>
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Top Performers</span>
          </div>
          <div className="space-y-2">
            {data.topPerformers.map((performer, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary w-5">#{index + 1}</span>
                  <span className="text-sm font-medium">{performer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{performer.score.toFixed(1)}</span>
                  {performer.trend === 'up' && <TrendingUp className="h-3 w-3 text-primary" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={() => navigate('/revenue-intelligence')}
        >
          <Zap className="h-4 w-4" />
          Open Revenue Intelligence
        </Button>
      </CardContent>
    </Card>
  );
}
