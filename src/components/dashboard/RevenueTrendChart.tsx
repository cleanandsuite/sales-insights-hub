import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueTrendChartProps {
  data: { month: string; revenue: number; target: number }[];
  goal?: number;
  className?: string;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="font-medium text-foreground mb-1">{label}</p>
        <p className="text-sm text-primary">
          Revenue: <span className="font-semibold">{formatCurrency(payload[0].value)}</span>
        </p>
        {payload[0].payload.target && (
          <p className="text-sm text-muted-foreground">
            Target: {formatCurrency(payload[0].payload.target)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function RevenueTrendChart({
  data,
  goal = 100000,
  className,
}: RevenueTrendChartProps) {
  const [period, setPeriod] = useState('6m');
  const [showGoal, setShowGoal] = useState(true);

  const ytdTotal = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgMonthly = Math.round(ytdTotal / data.length);
  const bestMonth = data.reduce((best, d) => (d.revenue > best.revenue ? d : best), data[0]);

  return (
    <Card className={cn('border-border/50 bg-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Revenue Trend
              </CardTitle>
              <p className="text-sm text-muted-foreground">Monthly performance vs goal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 h-9 text-sm bg-muted/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 Mo</SelectItem>
                <SelectItem value="6m">Last 6 Mo</SelectItem>
                <SelectItem value="ytd">YTD</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id="show-goal"
                checked={showGoal}
                onCheckedChange={setShowGoal}
                className="data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor="show-goal"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Goal Line
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={formatCurrency}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {showGoal && (
                <ReferenceLine
                  y={goal}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="8 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Goal',
                    position: 'right',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 11,
                  }}
                />
              )}
              <Bar
                dataKey="revenue"
                radius={[6, 6, 0, 0]}
                className="animate-bar-grow origin-bottom"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.revenue >= entry.target
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--secondary))'
                    }
                    style={{
                      filter:
                        entry.revenue >= entry.target
                          ? 'drop-shadow(0 4px 12px hsl(var(--primary) / 0.3))'
                          : undefined,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-border/50 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground">YTD: </span>
            <span className="font-semibold text-foreground">{formatCurrency(ytdTotal)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg: </span>
            <span className="font-semibold text-foreground">{formatCurrency(avgMonthly)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Best: </span>
            <span className="font-semibold text-primary">
              {bestMonth.month} ({formatCurrency(bestMonth.revenue)})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
