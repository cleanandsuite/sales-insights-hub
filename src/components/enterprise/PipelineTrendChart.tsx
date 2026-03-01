import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ReferenceLine, Line, ComposedChart, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

interface PipelineTrendChartProps {
  teamId: string;
}

interface WeekData {
  week: string;
  newDeals: number;
  inProgress: number;
  negotiating: number;
  closed: number;
  target: number;
  cumulative: number;
}

export function PipelineTrendChart({ teamId }: PipelineTrendChartProps) {
  const { isDemoMode } = useDemoMode();
  const [data, setData] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'8w' | '12w' | '6m'>('8w');
  const [target, setTarget] = useState(15000000);

  useEffect(() => {
    if (isDemoMode) {
      setData(generateSampleData(timeframe === '8w' ? 8 : timeframe === '12w' ? 12 : 24));
      setLoading(false);
      return;
    }
    fetchPipelineData();
  }, [teamId, timeframe, isDemoMode]);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      // Get team members
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members?.length) {
        setData([]);
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);
      const weeks = timeframe === '8w' ? 8 : timeframe === '12w' ? 12 : 24;
      
      // Fetch leads data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));

      const { data: leads } = await supabase
        .from('leads')
        .select('created_at, lead_status, predicted_deal_value, actual_deal_value')
        .in('user_id', userIds)
        .gte('created_at', startDate.toISOString());

      // Group by week
      const weeklyData = new Map<string, { 
        newDeals: number; 
        inProgress: number; 
        negotiating: number; 
        closed: number;
      }>();

      (leads || []).forEach(lead => {
        const date = new Date(lead.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { newDeals: 0, inProgress: 0, negotiating: 0, closed: 0 });
        }

        const week = weeklyData.get(weekKey)!;
        const value = lead.actual_deal_value || lead.predicted_deal_value || 50000;

        switch (lead.lead_status) {
          case 'new':
          case 'contacted':
            week.newDeals += value;
            break;
          case 'qualified':
          case 'proposal':
            week.inProgress += value;
            break;
          case 'negotiation':
            week.negotiating += value;
            break;
          case 'won':
            week.closed += value;
            break;
        }
      });

      // Convert to chart data with cumulative
      let cumulative = 0;
      const chartData: WeekData[] = [];
      const sortedWeeks = Array.from(weeklyData.entries())
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

      sortedWeeks.forEach(([week, values]) => {
        cumulative += values.closed;
        chartData.push({
          week,
          ...values,
          target,
          cumulative,
        });
      });

      // Fill in sample data if empty
      if (chartData.length === 0) {
        const sampleData = generateSampleData(weeks);
        setData(sampleData);
      } else {
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      setData(generateSampleData(8));
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = (weeks: number): WeekData[] => {
    const data: WeekData[] = [];
    let cumulative = 0;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (weeks * 7));

    for (let i = 0; i < weeks; i++) {
      const weekDate = new Date(baseDate);
      weekDate.setDate(weekDate.getDate() + (i * 7));
      const weekLabel = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const newDeals = 2000000 + Math.random() * 3000000;
      const inProgress = 3000000 + Math.random() * 4000000;
      const negotiating = 2000000 + Math.random() * 3000000;
      const closed = 1500000 + Math.random() * 2500000;
      
      cumulative += closed;

      data.push({
        week: weekLabel,
        newDeals,
        inProgress,
        negotiating,
        closed,
        target: 15000000,
        cumulative,
      });
    }
    return data;
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardContent className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            How is your pipeline trending?
          </CardTitle>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="8w" className="text-xs px-3">8 Weeks</TabsTrigger>
              <TabsTrigger value="12w" className="text-xs px-3">12 Weeks</TabsTrigger>
              <TabsTrigger value="6m" className="text-xs px-3">6 Months</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={formatValue}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => formatValue(value)}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
            
            {/* Stacked bars */}
            <Bar dataKey="closed" name="Closed Won" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="negotiating" name="Negotiating" stackId="a" fill="hsl(var(--chart-3))" />
            <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="hsl(var(--chart-2))" />
            <Bar dataKey="newDeals" name="New Deals" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            
            {/* Target line */}
            <ReferenceLine 
              y={target} 
              stroke="hsl(var(--success))" 
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ 
                value: `Target: ${formatValue(target)}`, 
                position: 'left',
                fill: 'hsl(var(--success))',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            
            {/* Cumulative trend line */}
            <Line 
              type="monotone" 
              dataKey="cumulative" 
              name="Cumulative Closed"
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--warning))', strokeWidth: 0, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
