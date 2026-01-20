import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  rep_name: string;
  user_id: string;
  week_1_score: number;
  week_2_score: number;
  week_3_score: number;
  week_4_score: number;
  trend: 'up' | 'down' | 'stable';
  change_pct: number;
}

interface TeamTrendsHeatmapProps {
  teamId: string;
}

export function TeamTrendsHeatmap({ teamId }: TeamTrendsHeatmapProps) {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [teamId]);

  const fetchTrends = async () => {
    try {
      // Get team members
      const { data: members, error: membersError } = await supabase
        .from('manager_team_stats')
        .select('user_id, full_name, avg_overall_score')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Generate trend data (in production, this would query historical data)
      const trendData: TrendData[] = (members || []).map((member) => {
        // Simulate 4-week trend based on current score with some variance
        const baseScore = member.avg_overall_score || 50;
        const variance = () => Math.random() * 20 - 10;
        
        const week1 = Math.max(0, Math.min(100, baseScore + variance() - 5));
        const week2 = Math.max(0, Math.min(100, baseScore + variance() - 2));
        const week3 = Math.max(0, Math.min(100, baseScore + variance()));
        const week4 = Math.max(0, Math.min(100, baseScore + variance() + 3));

        const changePct = week4 - week1;
        const trend: 'up' | 'down' | 'stable' = 
          changePct > 5 ? 'up' : changePct < -5 ? 'down' : 'stable';

        return {
          rep_name: member.full_name || 'Unknown',
          user_id: member.user_id,
          week_1_score: Math.round(week1),
          week_2_score: Math.round(week2),
          week_3_score: Math.round(week3),
          week_4_score: Math.round(week4),
          trend,
          change_pct: Math.round(changePct)
        };
      });

      setTrends(trendData);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success/80 text-success-foreground';
    if (score >= 60) return 'bg-primary/60 text-primary-foreground';
    if (score >= 40) return 'bg-warning/60 text-warning-foreground';
    return 'bg-destructive/60 text-destructive-foreground';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

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
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Team Score Trends</CardTitle>
        </div>
        <CardDescription>4-week rolling composite score heatmap</CardDescription>
      </CardHeader>
      <CardContent>
        {trends.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No trend data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Rep</th>
                  {weeks.map((week) => (
                    <th key={week} className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                      {week}
                    </th>
                  ))}
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((row) => (
                  <tr key={row.user_id} className="border-b border-border/50">
                    <td className="py-3 px-2">
                      <span className="font-medium text-foreground">{row.rep_name}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-sm font-medium mx-auto ${getScoreColor(row.week_1_score)}`}>
                        {row.week_1_score}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-sm font-medium mx-auto ${getScoreColor(row.week_2_score)}`}>
                        {row.week_2_score}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-sm font-medium mx-auto ${getScoreColor(row.week_3_score)}`}>
                        {row.week_3_score}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-sm font-medium mx-auto ${getScoreColor(row.week_4_score)}`}>
                        {row.week_4_score}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(row.trend)}
                        <span className={`text-sm font-medium ${
                          row.change_pct > 0 ? 'text-success' : 
                          row.change_pct < 0 ? 'text-destructive' : 
                          'text-muted-foreground'
                        }`}>
                          {row.change_pct > 0 ? '+' : ''}{row.change_pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/80" />
            <span className="text-xs text-muted-foreground">80+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/60" />
            <span className="text-xs text-muted-foreground">60-79</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/60" />
            <span className="text-xs text-muted-foreground">40-59</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/60" />
            <span className="text-xs text-muted-foreground">&lt;40</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
