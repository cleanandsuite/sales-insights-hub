import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  MessageSquare, Phone, ArrowUp, ArrowDown, 
  Target, Zap, AlertTriangle, CheckCircle2, Clock,
  BarChart3, PieChart, Activity
} from 'lucide-react';

// Mock data
const metrics = [
  { label: 'Revenue', value: '$127,450', change: '+12.5%', up: true, icon: DollarSign },
  { label: 'Active Deals', value: '24', change: '+3', up: true, icon: Target },
  { label: 'Win Rate', value: '34%', change: '+2.1%', up: true, icon: TrendingUp },
  { label: 'Calls This Week', value: '156', change: '-12', up: false, icon: Phone },
];

const recentCalls = [
  { id: 1, rep: 'Sarah Chen', prospect: 'Acme Corp', outcome: 'Won', score: 92, duration: '28:45' },
  { id: 2, rep: 'Mike Johnson', prospect: 'TechStart Inc', outcome: 'Qualified', score: 78, duration: '22:10' },
  { id: 3, rep: 'Emily Davis', prospect: 'GlobalTech', outcome: 'Lost', score: 45, duration: '15:30' },
  { id: 4, rep: 'James Wilson', prospect: 'InnovateCo', outcome: 'Won', score: 88, duration: '31:22' },
];

const aiInsights = [
  { type: 'opportunity', text: 'Acme Corp showing strong buying signals - schedule demo ASAP', time: '2m ago' },
  { type: 'warning', text: 'TechStart Inc - competitor mentioned. Address objection in next call', time: '15m ago' },
  { type: 'success', text: 'GlobalTech deal lost but saved $50K budget for Q2', time: '1h ago' },
];

const signals = [
  { label: 'Budget Authority', value: 85, color: 'bg-emerald-500' },
  { label: 'Timeline Fit', value: 72, color: 'bg-blue-500' },
  { label: 'Need Clarity', value: 45, color: 'bg-amber-500' },
  { label: 'Decision Maker', value: 90, color: 'bg-emerald-500' },
];

export function DashboardOverview() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Real-time sales intelligence</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-slate-900' : ''}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-slate-100">
                  <metric.icon className="h-5 w-5 text-slate-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${metric.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metric.up ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {metric.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-sm text-slate-500">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Calls */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Calls</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600">
                      {call.rep.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{call.prospect}</p>
                      <p className="text-sm text-slate-500">{call.rep} • {call.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={call.outcome === 'Won' ? 'bg-emerald-100 text-emerald-700' : call.outcome === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                      {call.outcome}
                    </Badge>
                    <p className="text-sm font-medium text-slate-600 mt-1">{call.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">AI Insights</h2>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-start gap-2">
                    {insight.type === 'opportunity' && <Target className="h-4 w-4 text-emerald-500 mt-0.5" />}
                    {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                    {insight.type === 'success' && <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{insight.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{insight.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buyer Signals */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-slate-900">Live Buyer Signals - Acme Corp</h2>
            <Badge variant="outline" className="ml-auto">Live</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {signals.map((signal) => (
              <div key={signal.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{signal.label}</span>
                  <span className="font-medium text-slate-900">{signal.value}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${signal.color} rounded-full transition-all`} style={{ width: `${signal.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
