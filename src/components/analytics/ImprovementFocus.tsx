import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ChevronRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImprovementArea {
  area: string;
  frequency: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface ImprovementFocusProps {
  areas: ImprovementArea[];
}

export function ImprovementFocus({ areas }: ImprovementFocusProps) {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          border: 'border-l-rose-500',
          bg: 'hover:bg-rose-500/5'
        };
      case 'medium':
        return {
          badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          border: 'border-l-amber-500',
          bg: 'hover:bg-amber-500/5'
        };
      default:
        return {
          badge: 'bg-primary/10 text-primary border-primary/20',
          border: 'border-l-primary',
          bg: 'hover:bg-primary/5'
        };
    }
  };

  const hasAreas = areas.length > 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-amber-500/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-5 w-5 text-rose-500" />
          Areas for Improvement
        </CardTitle>
        <p className="text-xs text-muted-foreground">Focus on these to boost your performance</p>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {hasAreas ? (
          areas.map((area, idx) => {
            const styles = getPriorityStyles(area.priority);
            return (
              <div 
                key={idx}
                className={cn(
                  "p-3 rounded-lg bg-card border border-border border-l-4 transition-all cursor-pointer",
                  styles.border,
                  styles.bg
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      area.priority === 'high' ? "text-rose-500" : 
                      area.priority === 'medium' ? "text-amber-500" : "text-primary"
                    )} />
                    <p className="text-sm font-medium text-foreground">
                      {area.area}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", styles.badge)}>
                    {area.priority}
                  </Badge>
                </div>
                
                <div className="flex items-start gap-2 mt-2 pl-6">
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {area.recommendation}
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground pl-6 mt-2">
                  Identified in {area.frequency} coaching session{area.frequency !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <Target className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Complete coaching sessions to identify improvement areas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
