import { cn } from '@/lib/utils';
import { AlertTriangle, Calendar, CheckCircle2, Phone } from 'lucide-react';

type HealthStatus = 'at_risk' | 'monitor' | 'on_track';

interface DealPriorityCardProps {
  name: string;
  company: string;
  value: number;
  stage: string;
  health: HealthStatus;
  alert?: string;
  nextAction: string;
  onClick?: () => void;
  className?: string;
}

const healthConfig: Record<HealthStatus, { dot: string; glow: string; bg: string }> = {
  at_risk: {
    dot: 'bg-destructive',
    glow: 'shadow-destructive/50 animate-pulse-glow',
    bg: 'hover:border-destructive/30',
  },
  monitor: {
    dot: 'bg-warning',
    glow: '',
    bg: 'hover:border-warning/30',
  },
  on_track: {
    dot: 'bg-success',
    glow: '',
    bg: 'hover:border-success/30',
  },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export function DealPriorityCard({
  name,
  company,
  value,
  stage,
  health,
  alert,
  nextAction,
  onClick,
  className,
}: DealPriorityCardProps) {
  const config = healthConfig[health];

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border border-border/50 bg-card/50 p-4',
        'transition-all duration-300 ease-out cursor-pointer',
        'hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10',
        config.bg,
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Health Indicator */}
          <div
            className={cn(
              'h-3 w-3 rounded-full shrink-0',
              config.dot,
              health === 'at_risk' && config.glow
            )}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {company} • {stage}
            </p>
          </div>
        </div>
        <span className="text-lg font-bold text-primary shrink-0">
          {formatCurrency(value)}
        </span>
      </div>

      {/* Alert Line */}
      {alert && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <span className="text-warning truncate">{alert}</span>
        </div>
      )}

      {/* Next Action */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">→</span>
        <span className="text-foreground truncate">{nextAction}</span>
      </div>
    </div>
  );
}
