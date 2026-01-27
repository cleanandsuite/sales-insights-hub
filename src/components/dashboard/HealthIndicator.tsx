import { cn } from '@/lib/utils';

type HealthStatus = 'at_risk' | 'monitor' | 'on_track';

interface HealthIndicatorProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<HealthStatus, { color: string; label: string; glow: string }> = {
  at_risk: {
    color: 'bg-destructive',
    label: 'At Risk',
    glow: 'shadow-destructive/50',
  },
  monitor: {
    color: 'bg-warning',
    label: 'Monitor',
    glow: 'shadow-warning/50',
  },
  on_track: {
    color: 'bg-success',
    label: 'On Track',
    glow: 'shadow-success/50',
  },
};

const sizeConfig = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export function HealthIndicator({
  status,
  size = 'md',
  showLabel = false,
  pulse = false,
  className,
}: HealthIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full',
            sizeConfig[size],
            config.color,
            pulse && status === 'at_risk' && 'animate-pulse-glow',
          )}
        />
        {pulse && status === 'at_risk' && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping',
              config.color,
              'opacity-50'
            )}
          />
        )}
      </div>
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium',
            status === 'at_risk' && 'text-destructive',
            status === 'monitor' && 'text-warning',
            status === 'on_track' && 'text-success'
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
