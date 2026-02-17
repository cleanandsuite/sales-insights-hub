import { cn } from '@/lib/utils';
import { Circle, Zap, Users, TrendingUp, Clock } from 'lucide-react';

interface AIStatusBarProps {
  isActive: boolean;
  todayLeads: number;
  weekLeads: number;
  conversionRate: number;
  avgResponseTime: string;
  className?: string;
}

export function AIStatusBar({
  isActive,
  todayLeads,
  weekLeads,
  conversionRate,
  avgResponseTime,
  className,
}: AIStatusBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 px-3 sm:px-5 py-3 rounded-xl',
        'bg-muted/30 border border-border/30',
        className
      )}
    >
      {/* AI Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Circle
            className={cn(
              'h-3 w-3',
              isActive ? 'fill-success text-success' : 'fill-muted-foreground text-muted-foreground'
            )}
          />
          {isActive && (
            <span className="absolute inset-0 animate-ping rounded-full bg-success/50" />
          )}
        </div>
        <span className="text-sm font-medium text-foreground">
          {isActive ? 'AI Active' : 'AI Paused'}
        </span>
      </div>

      <div className="hidden sm:block h-4 w-px bg-border/50" />

      {/* Metrics - wraps on mobile */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 flex-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">Leads:</span>
          <span className="text-xs sm:text-sm font-medium text-foreground">{todayLeads}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">Week:</span>
          <span className="text-xs sm:text-sm font-medium text-foreground">{weekLeads}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">Conv:</span>
          <span className="text-xs sm:text-sm font-medium text-primary">{conversionRate}%</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">Avg:</span>
          <span className="text-xs sm:text-sm font-medium text-foreground">{avgResponseTime}</span>
        </div>
      </div>
    </div>
  );
}
