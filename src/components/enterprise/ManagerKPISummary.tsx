import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, Phone, AlertTriangle, Star, TrendingUp, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManagerKPISummaryProps {
  className?: string;
}

// Mock KPIs — in production these would be computed from real data
const kpis = [
  {
    label: 'Total Pipeline',
    value: '$4.2M',
    icon: DollarSign,
    trend: '+12%',
    trendPositive: true,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    label: 'Weighted Forecast',
    value: '$1.8M',
    icon: TrendingUp,
    trend: '+8%',
    trendPositive: true,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'Calls This Week',
    value: '142',
    icon: Phone,
    trend: '-3%',
    trendPositive: false,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    label: 'At-Risk Deals',
    value: '7',
    icon: AlertTriangle,
    trend: '+2',
    trendPositive: false,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    label: 'Avg Score',
    value: '72',
    icon: Star,
    trend: '+5pts',
    trendPositive: true,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    label: 'Active Reps',
    value: '12/15',
    icon: Users,
    trend: '80%',
    trendPositive: true,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
  },
];

export function ManagerKPISummary({ className }: ManagerKPISummaryProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5', className)}>
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className="bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-sm hover:bg-card/40 transition-all duration-200 group"
        >
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', kpi.bg)}>
                <kpi.icon className={cn('h-3.5 w-3.5', kpi.color)} />
              </div>
            </div>
            <div className="text-xl font-bold text-foreground">{kpi.value}</div>
            <div className={cn(
              'text-[10px] font-medium mt-1',
              kpi.trendPositive ? 'text-success' : 'text-destructive'
            )}>
              {kpi.trend} vs last week
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
