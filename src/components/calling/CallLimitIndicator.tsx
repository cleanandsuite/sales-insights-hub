import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Phone, AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallLimitIndicatorProps {
  callsToday: number;
  dailyLimit: number;
  warmupDay: number;
  enforced: boolean;
  className?: string;
}

export function CallLimitIndicator({
  callsToday,
  dailyLimit,
  warmupDay,
  enforced,
  className,
}: CallLimitIndicatorProps) {
  const percentage = Math.min((callsToday / dailyLimit) * 100, 100);
  const remaining = Math.max(dailyLimit - callsToday, 0);
  const isNearLimit = percentage >= 80;
  const isAtLimit = callsToday >= dailyLimit;

  // Warmup phase info
  const isWarmingUp = warmupDay <= 30;
  const getWarmupPhase = () => {
    if (warmupDay <= 7) return { phase: 1, name: 'Initial', nextDay: 8 };
    if (warmupDay <= 14) return { phase: 2, name: 'Building', nextDay: 15 };
    if (warmupDay <= 30) return { phase: 3, name: 'Established', nextDay: 31 };
    return { phase: 4, name: 'Mature', nextDay: null };
  };

  const warmupPhase = getWarmupPhase();

  return (
    <TooltipProvider>
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Daily Calls</span>
          </div>
          <div className="flex items-center gap-2">
            {isAtLimit && enforced && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className={cn(
              'font-medium',
              isAtLimit ? 'text-destructive' : isNearLimit ? 'text-yellow-600' : ''
            )}>
              {callsToday}/{dailyLimit}
            </span>
          </div>
        </div>

        <Progress
          value={percentage}
          className={cn(
            'h-2',
            isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-yellow-500' : ''
          )}
        />

        <div className="flex items-center justify-between">
          {isWarmingUp && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs cursor-help">
                  <Flame className="h-3 w-3 text-orange-500" />
                  Day {warmupDay} - {warmupPhase.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm font-medium mb-1">Number Warmup</p>
                <p className="text-xs text-muted-foreground">
                  New numbers need to build reputation. Your limit will increase as your number matures.
                  {warmupPhase.nextDay && ` Next phase starts on day ${warmupPhase.nextDay}.`}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            {remaining} {remaining === 1 ? 'call' : 'calls'} remaining
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
