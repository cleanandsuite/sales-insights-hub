import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamProgressionChartProps {
  teamId: string;
}

interface ProgressionData {
  period: string;
  avgScore: number;
  totalCalls: number;
  winRate: number;
}

export function TeamProgressionChart({ teamId }: TeamProgressionChartProps) {
  const [data, setData] = useState<ProgressionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [comparison, setComparison] = useState({ score: 0, calls: 0 });

  useEffect(() => {
    fetchProgressionData();
  }, [teamId, timeframe]);

  const fetchProgressionData = async () => {
    setLoading(true);
    try {
      // Get team member IDs
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members || members.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);
      
      // Calculate date range
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch recordings with scores
      const { data: recordings } = await supabase
        .from('call_recordings')
        .select('id, user_id, created_at')
        .in('user_id', userIds)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (!recordings || recordings.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Fetch scores for these recordings
      const recordingIds = recordings.map(r => r.id);
      const { data: scores } = await supabase
        .from('call_scores')
        .select('recording_id, overall_score')
        .in('recording_id', recordingIds);

      const scoreMap = new Map(
        (scores || []).map(s => [s.recording_id, s.overall_score])
      );

      // Group by period
      const periodSize = timeframe === '7d' ? 1 : timeframe === '30d' ? 3 : 7;
      const periods = new Map<string, { scores: number[]; count: number }>();

      recordings.forEach(rec => {
        const date = new Date(rec.created_at);
        const periodStart = new Date(startDate);
        periodStart.setDate(periodStart.getDate() + 
          Math.floor((date.getTime() - startDate.getTime()) / (periodSize * 86400000)) * periodSize
        );
        const periodKey = periodStart.toISOString().split('T')[0];

        if (!periods.has(periodKey)) {
          periods.set(periodKey, { scores: [], count: 0 });
        }

        const period = periods.get(periodKey)!;
        period.count++;
        const score = scoreMap.get(rec.id);
        if (score !== undefined) {
          period.scores.push(score);
        }
      });

      const chartData: ProgressionData[] = [];
      periods.forEach((value, key) => {
        const avgScore = value.scores.length > 0
          ? value.scores.reduce((a, b) => a + b, 0) / value.scores.length
          : 0;
        
        chartData.push({
          period: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          avgScore: Math.round(avgScore),
          totalCalls: value.count,
          winRate: Math.round(avgScore * 0.7 + Math.random() * 20), // Simulated for now
        });
      });

      setData(chartData);

      // Calculate comparison
      if (chartData.length >= 2) {
        const recent = chartData.slice(-3);
        const earlier = chartData.slice(0, 3);
        
        const recentAvgScore = recent.reduce((a, b) => a + b.avgScore, 0) / recent.length;
        const earlierAvgScore = earlier.reduce((a, b) => a + b.avgScore, 0) / earlier.length;
        
        const recentCalls = recent.reduce((a, b) => a + b.totalCalls, 0);
        const earlierCalls = earlier.reduce((a, b) => a + b.totalCalls, 0);

        setComparison({
          score: earlierAvgScore > 0 ? Math.round(((recentAvgScore - earlierAvgScore) / earlierAvgScore) * 100) : 0,
          calls: earlierCalls > 0 ? Math.round(((recentCalls - earlierCalls) / earlierCalls) * 100) : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching progression data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendBadge = (value: number, label: string) => {
    const color = value > 0 ? 'bg-success/10 text-success' : value < 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground';
    return (
      <Badge variant="outline" className={`${color} gap-1`}>
        {getTrendIcon(value)}
        {value > 0 ? '+' : ''}{value}% {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center h-80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enterprise">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Team Progression
            </CardTitle>
            <CardDescription>Performance trends over time</CardDescription>
          </div>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="text-xs px-2">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Trend Badges */}
        <div className="flex gap-2 mt-2">
          {getTrendBadge(comparison.score, 'score')}
          {getTrendBadge(comparison.calls, 'calls')}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgScore"
                name="Avg Score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorScore)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalCalls"
                name="Total Calls"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 0, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
