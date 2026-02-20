import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Phone, Trophy, Target, AlertTriangle, Users
} from 'lucide-react';

interface TeamKPIs {
  teamWinRate: number;
  avgCallsPerRep: number;
  coachingCoveragePct: number;
  avgDiscoveryScore: number;
  avgCloserScore: number;
  forecastRiskPct: number;
  totalReps: number;
}

interface KPICardsProps {
  kpis: TeamKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const kpiData = [
    {
      title: 'Team Win Rate',
      value: `${kpis.teamWinRate}%`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      progress: kpis.teamWinRate,
      subtitle: 'Won deals / Total closed'
    },
    {
      title: 'Calls/Rep/Week',
      value: kpis.avgCallsPerRep.toFixed(1),
      icon: Phone,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      progress: Math.min(kpis.avgCallsPerRep * 10, 100),
      subtitle: 'Average weekly activity'
    },
    {
      title: 'Coaching Coverage',
      value: `${kpis.coachingCoveragePct}%`,
      icon: Trophy,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      progress: kpis.coachingCoveragePct,
      subtitle: 'Coached / Total calls'
    },
    {
      title: 'Avg Discovery Score',
      value: kpis.avgDiscoveryScore.toFixed(0),
      icon: Target,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      progress: kpis.avgDiscoveryScore,
      subtitle: 'Discovery Booker pillar'
    },
    {
      title: 'Avg Closer Score',
      value: kpis.avgCloserScore.toFixed(0),
      icon: Trophy,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      progress: kpis.avgCloserScore,
      subtitle: 'High Stakes Closer pillar'
    },
    {
      title: 'Forecast Risk',
      value: `${kpis.forecastRiskPct}%`,
      icon: AlertTriangle,
      color: kpis.forecastRiskPct > 30 ? 'text-destructive' : 'text-warning',
      bgColor: kpis.forecastRiskPct > 30 ? 'bg-destructive/10' : 'bg-warning/10',
      progress: 100 - kpis.forecastRiskPct,
      subtitle: 'At-risk pipeline %'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title} className="card-enterprise relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium text-muted-foreground">
                {kpi.title}
              </CardDescription>
              <div className={`h-8 w-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <Progress value={kpi.progress} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
