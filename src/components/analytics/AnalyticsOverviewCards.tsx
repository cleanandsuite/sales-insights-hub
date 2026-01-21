import { Card, CardContent } from '@/components/ui/card';
import { Phone, TrendingUp, TrendingDown, Trophy, Clock, MessageSquare, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsDataV2 } from '@/hooks/useAnalyticsV2';

interface AnalyticsOverviewCardsProps {
  data: AnalyticsDataV2;
}

export function AnalyticsOverviewCards({ data }: AnalyticsOverviewCardsProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'from-emerald-500/10 to-emerald-500/5';
    if (score >= 50) return 'from-amber-500/10 to-amber-500/5';
    return 'from-rose-500/10 to-rose-500/5';
  };

  const cards = [
    {
      title: 'Total Calls',
      value: data.totalCalls.value.toString(),
      change: data.totalCalls.change,
      isPositive: data.totalCalls.isPositive,
      icon: Phone,
      iconColor: 'text-primary',
      bgGradient: 'from-primary/10 to-primary/5',
      borderColor: 'border-l-primary'
    },
    {
      title: 'Avg Score',
      value: `${data.avgScore.value}`,
      change: data.avgScore.change,
      isPositive: data.avgScore.isPositive,
      icon: Target,
      iconColor: getScoreColor(data.avgScore.value),
      bgGradient: getScoreBg(data.avgScore.value),
      borderColor: data.avgScore.value >= 75 ? 'border-l-emerald-500' : data.avgScore.value >= 50 ? 'border-l-amber-500' : 'border-l-rose-500'
    },
    {
      title: 'Win Rate',
      value: `${data.winRate.value}%`,
      change: data.winRate.change,
      isPositive: data.winRate.isPositive,
      icon: Trophy,
      iconColor: 'text-amber-500',
      bgGradient: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-l-amber-500'
    },
    {
      title: 'Avg Duration',
      value: formatDuration(data.avgDuration.value),
      change: data.avgDuration.change,
      isPositive: data.avgDuration.isPositive,
      icon: Clock,
      iconColor: 'text-accent',
      bgGradient: 'from-accent/10 to-accent/5',
      borderColor: 'border-l-accent'
    },
    {
      title: 'Talk Ratio',
      value: `${data.talkRatio.you}%`,
      subtitle: data.talkRatio.isOptimal ? 'Optimal' : 'Adjust needed',
      icon: MessageSquare,
      iconColor: data.talkRatio.isOptimal ? 'text-emerald-500' : 'text-amber-500',
      bgGradient: data.talkRatio.isOptimal ? 'from-emerald-500/10 to-emerald-500/5' : 'from-amber-500/10 to-amber-500/5',
      borderColor: data.talkRatio.isOptimal ? 'border-l-emerald-500' : 'border-l-amber-500'
    },
    {
      title: 'Avg Questions',
      value: data.avgQuestions.value.toString(),
      subtitle: 'per call',
      icon: MessageSquare,
      iconColor: 'text-violet-500',
      bgGradient: 'from-violet-500/10 to-violet-500/5',
      borderColor: 'border-l-violet-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className={cn(
            "relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
            card.borderColor
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", card.bgGradient)} />
          <CardContent className="relative p-4">
            <div className="flex items-start justify-between mb-2">
              <card.icon className={cn("h-5 w-5", card.iconColor)} />
              {card.change !== undefined && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                  card.isPositive 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-rose-500/10 text-rose-600"
                )}>
                  {card.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(card.change)}%</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle || card.title}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
