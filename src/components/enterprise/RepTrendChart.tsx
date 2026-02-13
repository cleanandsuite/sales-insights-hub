import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface RepTrendData {
  period: string;
  overall: number;
  closing: number;
  discovery: number;
  calls: number;
}

interface RepOption {
  id: string;
  name: string;
}

interface RepTrendChartProps {
  teamId: string;
}

export function RepTrendChart({ teamId }: RepTrendChartProps) {
  const [reps, setReps] = useState<RepOption[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [trendData, setTrendData] = useState<RepTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<{ change: number; trend: 'up' | 'down' | 'stable' } | null>(null);

  useEffect(() => {
    fetchReps();
  }, [teamId]);

  useEffect(() => {
    if (selectedRep) {
      fetchTrendData();
    }
  }, [selectedRep, timeframe]);

  const fetchReps = async () => {
    try {
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members) return;

      const userIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const repOptions = (profiles || []).map(p => ({
        id: p.user_id,
        name: p.full_name || 'Unknown'
      }));

      setReps(repOptions);
      if (repOptions.length > 0) {
        setSelectedRep(repOptions[0].id);
      }
    } catch (error) {
      console.error('Error fetching reps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    if (!selectedRep) return;

    try {
      const periodCount = timeframe === 'weekly' ? 8 : 6;
      const periodDays = timeframe === 'weekly' ? 7 : 30;
      const data: RepTrendData[] = [];

      for (let i = periodCount - 1; i >= 0; i--) {
        const endDate = new Date(Date.now() - i * periodDays * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

        // Get recordings for this period
        const { data: recordings } = await supabase
          .from('call_recordings')
          .select('id')
          .eq('user_id', selectedRep)
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString());

        const recordingIds = (recordings || []).map(r => r.id);
        
        let overall = 0, closing = 0, discovery = 0;
        
        if (recordingIds.length > 0) {
          const { data: scores } = await supabase
            .from('call_scores')
            .select('overall_score, closing_score, discovery_score')
            .in('recording_id', recordingIds);

          if (scores && scores.length > 0) {
            overall = scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length;
            closing = scores.reduce((sum, s) => sum + (s.closing_score || 0), 0) / scores.length;
            discovery = scores.reduce((sum, s) => sum + (s.discovery_score || 0), 0) / scores.length;
          }
        }

        const periodLabel = timeframe === 'weekly' 
          ? `W${periodCount - i}` 
          : endDate.toLocaleDateString('en-US', { month: 'short' });

        data.push({
          period: periodLabel,
          overall: Math.round(overall),
          closing: Math.round(closing),
          discovery: Math.round(discovery),
          calls: recordingIds.length
        });
      }

      setTrendData(data);

      // Calculate comparison
      if (data.length >= 2) {
        const current = data[data.length - 1].overall;
        const previous = data[data.length - 2].overall;
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        
        setComparison({
          change: Math.round(change),
          trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
        });
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const getTrendIcon = () => {
    if (!comparison) return null;
    switch (comparison.trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = () => {
    if (!comparison) return null;
    const color = comparison.trend === 'up' 
      ? 'bg-success/10 text-success border-success/20' 
      : comparison.trend === 'down' 
      ? 'bg-destructive/10 text-destructive border-destructive/20'
      : 'bg-muted text-muted-foreground';
    
    return (
      <Badge variant="outline" className={`gap-1 ${color}`}>
        {getTrendIcon()}
        {comparison.change > 0 ? '+' : ''}{comparison.change}% vs prev
      </Badge>
    );
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              {timeframe === 'weekly' ? 'Week-over-week' : 'Month-over-month'} score comparison
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getTrendBadge()}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Select value={selectedRep} onValueChange={setSelectedRep}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select rep" />
            </SelectTrigger>
            <SelectContent>
              {reps.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={(v: 'weekly' | 'monthly') => setTimeframe(v)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {trendData.length === 0 || trendData.every(d => d.overall === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No performance data available for this period</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  name="Overall Score"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="closing" 
                  name="Closing"
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="discovery" 
                  name="Discovery"
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--warning))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Call Volume Summary */}
        {trendData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total calls in period:</span>
              <span className="font-medium text-foreground">
                {trendData.reduce((sum, d) => sum + d.calls, 0)} calls
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
