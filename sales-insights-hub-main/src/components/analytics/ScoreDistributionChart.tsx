import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface ScoreDistributionChartProps {
  distribution: ScoreDistribution[];
}

export function ScoreDistributionChart({ distribution }: ScoreDistributionChartProps) {
  const getBarColor = (range: string) => {
    switch (range) {
      case '0-20': return 'hsl(0, 84%, 60%)'; // Red
      case '21-40': return 'hsl(25, 95%, 53%)'; // Orange
      case '41-60': return 'hsl(38, 92%, 50%)'; // Amber
      case '61-80': return 'hsl(156, 72%, 40%)'; // Green
      case '81-100': return 'hsl(142, 76%, 36%)'; // Emerald
      default: return 'hsl(var(--primary))';
    }
  };

  const hasData = distribution.some(d => d.count > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScoreDistribution }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">Score Range: {data.range}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} calls ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-5 w-5 text-amber-500" />
          Score Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">How your calls are distributed across score ranges</p>
      </CardHeader>
      <CardContent className="relative">
        {hasData ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="range" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No score data available yet.
              </p>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          {['Poor', 'Below Avg', 'Average', 'Good', 'Excellent'].map((label, idx) => (
            <div key={label} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: getBarColor(['0-20', '21-40', '41-60', '61-80', '81-100'][idx]) }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
