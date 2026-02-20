import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, Award } from 'lucide-react';

interface RepData {
  user_id: string;
  full_name: string;
  avg_overall_score: number;
  avg_closing_score: number;
  avg_discovery_score: number;
  total_calls: number;
  win_rate: number;
}

interface TeamComparisonChartProps {
  teamId: string;
}

type MetricType = 'avg_overall_score' | 'avg_closing_score' | 'avg_discovery_score' | 'total_calls' | 'win_rate';

const METRIC_CONFIG: Record<MetricType, { label: string; color: string; format: (v: number) => string }> = {
  avg_overall_score: { label: 'Overall Score', color: 'hsl(var(--primary))', format: (v) => v.toFixed(1) },
  avg_closing_score: { label: 'Closing Score', color: 'hsl(var(--chart-1))', format: (v) => v.toFixed(1) },
  avg_discovery_score: { label: 'Discovery Score', color: 'hsl(var(--chart-2))', format: (v) => v.toFixed(1) },
  total_calls: { label: 'Total Calls', color: 'hsl(var(--chart-3))', format: (v) => v.toString() },
  win_rate: { label: 'Win Rate', color: 'hsl(var(--chart-4))', format: (v) => `${v.toFixed(0)}%` },
};

export function TeamComparisonChart({ teamId }: TeamComparisonChartProps) {
  const [reps, setReps] = useState<RepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<MetricType>('avg_overall_score');

  useEffect(() => {
    fetchReps();
  }, [teamId]);

  const fetchReps = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setReps((data || []).map(r => ({
        user_id: r.user_id,
        full_name: r.full_name || 'Unknown',
        avg_overall_score: Number(r.avg_overall_score) || 0,
        avg_closing_score: Number(r.avg_closing_score) || 0,
        avg_discovery_score: Number(r.avg_discovery_score) || 0,
        total_calls: Number(r.total_calls) || 0,
        win_rate: Number(r.win_rate) || 0,
      })));
    } catch (error) {
      console.error('Error fetching reps:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedReps = [...reps].sort((a, b) => (b[metric] as number) - (a[metric] as number));
  const topPerformer = sortedReps[0];
  const teamAvg = reps.length > 0 
    ? reps.reduce((sum, r) => sum + (r[metric] as number), 0) / reps.length 
    : 0;

  const chartData = sortedReps.map(rep => ({
    name: rep.full_name.split(' ')[0],
    fullName: rep.full_name,
    value: rep[metric] as number,
    isTop: rep.user_id === topPerformer?.user_id,
  }));

  const config = METRIC_CONFIG[metric];

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Side-by-side rep performance</p>
        </div>
        <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(METRIC_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Award className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Top Performer</p>
              <p className="font-medium text-sm">{topPerformer?.full_name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Team Average</p>
              <p className="font-medium text-sm">{config.format(teamAvg)}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {config.label}: <span className="text-foreground">{config.format(data.value)}</span>
                      </p>
                      {data.isTop && (
                        <Badge variant="outline" className="mt-1 text-primary border-primary/50">
                          <Award className="h-3 w-3 mr-1" /> Top Performer
                        </Badge>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isTop ? 'hsl(var(--chart-4))' : config.color}
                    opacity={entry.isTop ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: config.color, opacity: 0.7 }} />
            <span>Team Members</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
            <span>Top Performer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
