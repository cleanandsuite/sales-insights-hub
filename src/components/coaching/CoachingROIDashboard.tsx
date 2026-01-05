import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CoachingStats {
  totalSessions: number;
  averageScore: number;
  averageWinProbability: number;
  averagePotentialWinProbability: number;
  totalSuggestions: number;
  appliedSuggestions: number;
  recentTrend: 'up' | 'down' | 'stable';
  skillProgress: Record<string, { before: number; after: number }>;
}

export function CoachingROIDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CoachingStats>({
    totalSessions: 0,
    averageScore: 0,
    averageWinProbability: 0,
    averagePotentialWinProbability: 0,
    totalSuggestions: 0,
    appliedSuggestions: 0,
    recentTrend: 'stable',
    skillProgress: {}
  });
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      // Get coaching sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get coaching metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('coaching_metrics')
        .select('*')
        .eq('user_id', user?.id);

      if (metricsError) throw metricsError;

      if (sessions && sessions.length > 0) {
        const avgScore = sessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / sessions.length;
        const avgWinProb = sessions.reduce((acc, s) => acc + (s.win_probability || 0), 0) / sessions.length;
        const avgPotential = sessions.reduce((acc, s) => acc + (s.potential_win_probability || 0), 0) / sessions.length;

        // Calculate trend from last 5 vs previous 5
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (sessions.length >= 5) {
          const recent5 = sessions.slice(0, 5);
          const previous5 = sessions.slice(5, 10);
          if (previous5.length > 0) {
            const recentAvg = recent5.reduce((acc, s) => acc + (s.overall_score || 0), 0) / recent5.length;
            const previousAvg = previous5.reduce((acc, s) => acc + (s.overall_score || 0), 0) / previous5.length;
            if (recentAvg > previousAvg + 5) trend = 'up';
            else if (recentAvg < previousAvg - 5) trend = 'down';
          }
        }

        // Aggregate skill progress from improvement areas
        const skillProgress: Record<string, { before: number; after: number }> = {};
        sessions.forEach(session => {
          const areas = session.improvement_areas as any[] || [];
          areas.forEach(area => {
            if (area.area) {
              if (!skillProgress[area.area]) {
                skillProgress[area.area] = { before: area.current_score || 0, after: area.current_score || 0 };
              } else {
                skillProgress[area.area].after = Math.max(skillProgress[area.area].after, area.current_score || 0);
              }
            }
          });
        });

        setStats({
          totalSessions: sessions.length,
          averageScore: Math.round(avgScore),
          averageWinProbability: Math.round(avgWinProb),
          averagePotentialWinProbability: Math.round(avgPotential),
          totalSuggestions: metrics?.length || 0,
          appliedSuggestions: metrics?.filter(m => m.was_applied).length || 0,
          recentTrend: trend,
          skillProgress
        });

        setRecentSessions(sessions.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load coaching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const improvementPotential = stats.averagePotentialWinProbability - stats.averageWinProbability;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading coaching insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold mb-2">No Coaching Data Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Start analyzing your calls with the AI Deal Coach to see your improvement metrics and ROI tracking here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Call Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageScore}</p>
                  {getTrendIcon(stats.recentTrend)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Win Probability</p>
                <p className="text-2xl font-bold">{stats.averageWinProbability}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Improvement</p>
                <p className="text-2xl font-bold text-green-600">+{improvementPotential}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calls Coached</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coaching Suggestions</CardTitle>
          <CardDescription>Track your progress on implementing AI suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Applied Suggestions</span>
                <span className="font-medium">
                  {stats.appliedSuggestions} / {stats.totalSuggestions}
                </span>
              </div>
              <Progress 
                value={stats.totalSuggestions > 0 ? (stats.appliedSuggestions / stats.totalSuggestions) * 100 : 0} 
                className="h-2"
              />
            </div>
            <Badge variant={stats.appliedSuggestions > stats.totalSuggestions / 2 ? 'default' : 'secondary'}>
              {stats.totalSuggestions > 0 
                ? Math.round((stats.appliedSuggestions / stats.totalSuggestions) * 100)
                : 0}% adoption
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-600">{stats.totalSuggestions}</p>
              <p className="text-xs text-muted-foreground">Total Suggestions</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{stats.appliedSuggestions}</p>
              <p className="text-xs text-muted-foreground">Applied</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{stats.totalSuggestions - stats.appliedSuggestions}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Coaching Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      session.overall_score >= 70 ? 'bg-green-500/20 text-green-600' :
                      session.overall_score >= 50 ? 'bg-amber-500/20 text-amber-600' :
                      'bg-red-500/20 text-red-600'
                    }`}>
                      <span className="font-bold text-sm">{session.overall_score}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.missed_opportunities?.length || 0} opportunities • 
                        {session.deal_risks?.length || 0} risks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">{session.win_probability}%</span>
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      <span className="font-medium text-green-600">{session.potential_win_probability}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Win probability</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
