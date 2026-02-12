import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface CallData {
  date: string;
  calls: number;
  avgScore: number;
}

interface CallsOverTimeChartProps {
  data: CallData[];
}

export const CallsOverTimeChart = memo(function CallsOverTimeChart({ data }: CallsOverTimeChartProps) {
  const hasData = data.length > 0;

  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ name: string; value: number; color: string }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'Avg Score' ? '' : ' calls'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden lg:col-span-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-5 w-5 text-primary" />
          Call Volume & Quality Over Time
        </CardTitle>
        <p className="text-xs text-muted-foreground">Daily call count with average score overlay</p>
      </CardHeader>
      <CardContent className="relative">
        {hasData ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(177, 70%, 41%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(177, 70%, 41%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{ 
                    value: 'Calls', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 }
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{ 
                    value: 'Score', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: 12 }}>{value}</span>
                  )}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="calls" 
                  name="Calls"
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  opacity={0.8}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgScore"
                  name="Avg Score"
                  stroke="hsl(177, 70%, 41%)"
                  fill="url(#colorScore)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No call data yet. Start recording calls to see your activity trends.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
