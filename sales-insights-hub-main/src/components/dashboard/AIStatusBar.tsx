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
        'flex items-center gap-6 px-5 py-3 rounded-xl',
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

      <div className="h-4 w-px bg-border/50" />

      {/* Metrics */}
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Today's Leads:</span>
          <span className="text-sm font-medium text-foreground">{todayLeads}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">This Week:</span>
          <span className="text-sm font-medium text-foreground">{weekLeads}</span>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Conversion:</span>
          <span className="text-sm font-medium text-primary">{conversionRate}%</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Avg Response:</span>
          <span className="text-sm font-medium text-foreground">{avgResponseTime}</span>
        </div>
      </div>
    </div>
  );
}
