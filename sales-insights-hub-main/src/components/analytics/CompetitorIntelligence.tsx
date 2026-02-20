import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompetitorMention {
  competitor: string;
  count: number;
  winRate: number;
}

interface CompetitorIntelligenceProps {
  competitors: CompetitorMention[];
}

export function CompetitorIntelligence({ competitors }: CompetitorIntelligenceProps) {
  const hasData = competitors.length > 0;
  const maxMentions = Math.max(...competitors.map(c => c.count), 1);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-primary/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-5 w-5 text-violet-500" />
          Competitive Intelligence
        </CardTitle>
        <p className="text-xs text-muted-foreground">Competitors mentioned in your calls</p>
      </CardHeader>
      <CardContent className="relative">
        {hasData ? (
          <div className="space-y-3">
            {competitors.map((competitor, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-card border border-border transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {competitor.competitor}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {competitor.count} mention{competitor.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    competitor.winRate >= 50 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {competitor.winRate >= 50 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {competitor.winRate}% win rate
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <Progress 
                      value={(competitor.count / maxMentions) * 100} 
                      className="h-1.5 flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {Math.round((competitor.count / maxMentions) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Summary */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total competitor mentions</span>
                <span className="font-semibold text-foreground">
                  {competitors.reduce((acc, c) => acc + c.count, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Overall competitive win rate</span>
                <span className={cn(
                  "font-semibold",
                  competitors.reduce((acc, c) => acc + c.winRate, 0) / competitors.length >= 50
                    ? "text-emerald-600"
                    : "text-rose-600"
                )}>
                  {Math.round(competitors.reduce((acc, c) => acc + c.winRate, 0) / competitors.length)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No competitor mentions detected yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              AI will automatically track competitors mentioned in your calls.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
