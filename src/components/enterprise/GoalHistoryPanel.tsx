import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { History, CheckCircle2, XCircle, Target, Users, User } from 'lucide-react';
import { format } from 'date-fns';

interface HistoricalGoal {
  id: string;
  metric: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  status: string;
  type: 'team' | 'rep';
  rep_name?: string;
}

interface GoalHistoryPanelProps {
  teamId: string;
}

const METRIC_LABELS: Record<string, string> = {
  team_win_rate: 'Team Win Rate',
  total_calls: 'Total Calls',
  avg_team_score: 'Avg Team Score',
  coaching_coverage: 'Coaching Coverage',
  win_rate: 'Win Rate',
  calls_per_week: 'Calls/Week',
  avg_score: 'Average Score',
  closing_score: 'Closing Score',
  discovery_score: 'Discovery Score',
};

export function GoalHistoryPanel({ teamId }: GoalHistoryPanelProps) {
  const [goals, setGoals] = useState<HistoricalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'team' | 'rep'>('all');

  useEffect(() => {
    fetchHistoricalGoals();
  }, [teamId]);

  const fetchHistoricalGoals = async () => {
    try {
      // Fetch completed/missed team goals
      const { data: teamGoals } = await supabase
        .from('team_goals')
        .select('*')
        .eq('team_id', teamId)
        .in('status', ['completed', 'missed'])
        .order('period_end', { ascending: false })
        .limit(20);

      // Fetch completed/missed rep goals
      const { data: repGoals } = await supabase
        .from('rep_goals')
        .select('*')
        .eq('team_id', teamId)
        .in('status', ['completed', 'missed'])
        .order('period_end', { ascending: false })
        .limit(20);

      // Get rep names
      const { data: reps } = await supabase
        .from('manager_team_stats')
        .select('user_id, full_name')
        .eq('team_id', teamId);

      const repMap = new Map((reps || []).map(r => [r.user_id, r.full_name]));

      const allGoals: HistoricalGoal[] = [
        ...(teamGoals || []).map(g => ({
          ...g,
          type: 'team' as const,
          current_value: Number(g.current_value) || 0,
          target_value: Number(g.target_value) || 0,
        })),
        ...(repGoals || []).map(g => ({
          ...g,
          type: 'rep' as const,
          rep_name: repMap.get(g.user_id) || 'Unknown',
          current_value: Number(g.current_value) || 0,
          target_value: Number(g.target_value) || 0,
        })),
      ].sort((a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime());

      setGoals(allGoals);
    } catch (error) {
      console.error('Error fetching goal history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter(g => {
    if (view === 'all') return true;
    return g.type === view;
  });

  const stats = {
    total: goals.length,
    achieved: goals.filter(g => g.status === 'completed').length,
    missed: goals.filter(g => g.status === 'missed').length,
    successRate: goals.length > 0 
      ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
      : 0,
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Goal History
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
          <History className="h-5 w-5 text-primary" />
          Goal History
        </CardTitle>
        <p className="text-sm text-muted-foreground">Past completed and missed goals</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Goals</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{stats.achieved}</p>
            <p className="text-xs text-muted-foreground">Achieved</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-destructive">{stats.missed}</p>
            <p className="text-xs text-muted-foreground">Missed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{stats.successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="team" className="gap-1">
              <Users className="h-3 w-3" /> Team
            </TabsTrigger>
            <TabsTrigger value="rep" className="gap-1">
              <User className="h-3 w-3" /> Individual
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No historical goals yet</p>
            <p className="text-sm">Completed goals will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredGoals.map((goal) => {
              const achieved = goal.status === 'completed';
              const progress = goal.target_value > 0 
                ? Math.round((goal.current_value / goal.target_value) * 100)
                : 0;
              
              return (
                <div 
                  key={goal.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    {achieved ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {METRIC_LABELS[goal.metric] || goal.metric}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {goal.type === 'team' ? (
                            <><Users className="h-3 w-3 mr-1" /> Team</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" /> {goal.rep_name}</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(goal.period_start), 'MMM d')} - {format(new Date(goal.period_end), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${achieved ? 'text-primary' : 'text-destructive'}`}>
                      {progress}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goal.current_value.toFixed(1)} / {goal.target_value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
