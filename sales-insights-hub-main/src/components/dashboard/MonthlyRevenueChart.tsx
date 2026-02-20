import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, Area } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface MonthlyData {
  month: string;
  revenue: number;
  target?: number;
}

interface MonthlyRevenueChartProps {
  data: MonthlyData[];
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          FYTD Revenue by Month
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
              {data.some(d => d.target) && (
                <>
                  <Area
                    type="monotone"
                    dataKey="target"
                    fill="url(#areaGradient)"
                    stroke="none"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="Target"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
