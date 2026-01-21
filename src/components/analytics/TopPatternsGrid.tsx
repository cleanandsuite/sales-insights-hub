import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPattern {
  pattern: string;
  count: number;
  successRate: number;
}

interface TopPatternsGridProps {
  patterns: TopPattern[];
}

export function TopPatternsGrid({ patterns }: TopPatternsGridProps) {
  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return 'text-emerald-600';
    if (rate >= 60) return 'text-primary';
    return 'text-amber-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 60) return 'bg-primary';
    return 'bg-amber-500';
  };

  const hasPatterns = patterns.length > 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Top Performing Patterns
        </CardTitle>
        <p className="text-xs text-muted-foreground">Winning techniques from your calls</p>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {hasPatterns ? (
          patterns.map((pattern, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-3 rounded-lg bg-card border border-border transition-all hover:shadow-md",
                idx === 0 && "ring-1 ring-emerald-500/30"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      Top
                    </span>
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {pattern.pattern}
                  </p>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  getSuccessColor(pattern.successRate)
                )}>
                  {pattern.successRate}%
                </span>
              </div>
              <div className="space-y-1.5">
                <Progress 
                  value={pattern.successRate} 
                  className="h-2"
                  style={{
                    ['--progress-foreground' as string]: getProgressColor(pattern.successRate)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Used in {pattern.count} call{pattern.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <Lightbulb className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Patterns will appear as you complete more calls with coaching.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
