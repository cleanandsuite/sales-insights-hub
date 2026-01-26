import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface QuarterlyData {
  quarter: string;
  revenue: number;
  target: number;
}

interface QuarterlyRevenueChartProps {
  data: QuarterlyData[];
}

export function QuarterlyRevenueChart({ data }: QuarterlyRevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const colors = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const attainment = ((data.revenue / data.target) * 100).toFixed(1);
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-white mb-1">{label}</p>
          <p className="text-xs text-cyan-400">Revenue: {formatCurrency(data.revenue)}</p>
          <p className="text-xs text-slate-400">Target: {formatCurrency(data.target)}</p>
          <p className="text-xs text-purple-400 mt-1">{attainment}% attainment</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          FYTD Revenue by Quarter
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                type="category"
                dataKey="quarter"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey="revenue" 
                radius={[0, 4, 4, 0]}
                name="Revenue"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
          <span className="text-xs text-slate-400">Total YTD</span>
          <span className="text-sm font-bold text-cyan-400">
            {formatCurrency(data.reduce((sum, q) => sum + q.revenue, 0))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
