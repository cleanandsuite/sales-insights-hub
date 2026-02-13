import { Card, CardContent } from '@/components/ui/card';
import { Users, Phone, Target, TrendingUp } from 'lucide-react';

interface TeamStatsOverviewProps {
  totalMembers: number;
  totalCalls: number;
  totalLeads: number;
  avgScore: number;
}

export function TeamStatsOverview({ totalMembers, totalCalls, totalLeads, avgScore }: TeamStatsOverviewProps) {
  const stats = [
    {
      label: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Calls',
      value: totalCalls,
      icon: Phone,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Active Leads',
      value: totalLeads,
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Avg Score',
      value: avgScore.toFixed(1),
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
