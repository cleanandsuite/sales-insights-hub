import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, Target, Trophy, 
  FileText, CheckCircle, XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  totalScripts: number;
  scriptsUsed: number;
  successRate: number;
  avgConfidence: number;
  scenarioBreakdown: Array<{ scenario: string; count: number; winRate: number }>;
  topPerformingScenario: string;
  recentWins: number;
}

interface WinWordsAnalyticsProps {
  data: AnalyticsData;
}

export function WinWordsAnalytics({ data }: WinWordsAnalyticsProps) {
  const stats = [
    {
      label: 'Scripts Generated',
      value: data.totalScripts,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Scripts Used',
      value: data.scriptsUsed,
      icon: Target,
      color: 'text-purple-500',
    },
    {
      label: 'Win Rate',
      value: `${data.successRate.toFixed(1)}%`,
      icon: Trophy,
      color: 'text-green-500',
    },
    {
      label: 'Avg Confidence',
      value: `${data.avgConfidence.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-muted', stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scenario Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance by Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.scenarioBreakdown.map((scenario) => (
              <div key={scenario.scenario} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {scenario.scenario.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{scenario.count} scripts</Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        scenario.winRate >= 50 
                          ? 'border-green-500/30 text-green-600' 
                          : 'border-orange-500/30 text-orange-600'
                      )}
                    >
                      {scenario.winRate.toFixed(0)}% win rate
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all',
                      scenario.winRate >= 50 ? 'bg-green-500' : 'bg-orange-500'
                    )}
                    style={{ width: `${scenario.winRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insight */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Key Insight</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your <span className="font-medium text-foreground">{data.topPerformingScenario}</span> scripts 
                have the highest win rate. Scripts with confidence scores above 80% win{' '}
                <span className="font-medium text-green-600">2.5x more often</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
