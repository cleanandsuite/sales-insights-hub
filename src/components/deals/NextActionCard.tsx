import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Zap, Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface NextActionCardProps {
  action: string;
  dueDate: Date | null;
  onComplete?: () => void;
  onReschedule?: () => void;
  compact?: boolean;
}

export function NextActionCard({ action, dueDate, onComplete, onReschedule, compact = false }: NextActionCardProps) {
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const isDueTomorrow = dueDate && isTomorrow(dueDate);

  const getDueDateLabel = () => {
    if (!dueDate) return null;
    if (isOverdue) return `Overdue by ${Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days`;
    if (isDueToday) return 'Due today';
    if (isDueTomorrow) return 'Due tomorrow';
    return `Due ${format(dueDate, 'MMM d')}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Zap className="h-4 w-4 text-primary" />
        <span className="truncate">{action}</span>
        {dueDate && (
          <span
            className={cn(
              'text-xs shrink-0',
              isOverdue ? 'text-destructive' : isDueToday ? 'text-yellow-600' : 'text-muted-foreground'
            )}
          >
            {getDueDateLabel()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 transition-all',
        isOverdue
          ? 'bg-destructive/5 border-destructive/30'
          : 'bg-primary/5 border-primary/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'rounded-full p-2',
            isOverdue ? 'bg-destructive/10' : 'bg-primary/10'
          )}
        >
          <Zap className={cn('h-5 w-5', isOverdue ? 'text-destructive' : 'text-primary')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Next Best Action
            </span>
            {dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                  isOverdue
                    ? 'bg-destructive/10 text-destructive'
                    : isDueToday
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Clock className="h-3 w-3" />
                {getDueDateLabel()}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground">{action}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {onComplete && (
          <Button size="sm" className="flex-1" onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete
          </Button>
        )}
        {onReschedule && (
          <Button size="sm" variant="outline" className="flex-1" onClick={onReschedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Reschedule
          </Button>
        )}
      </div>
    </div>
  );
}
