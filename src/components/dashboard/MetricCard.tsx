import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  progress?: {
    current: number;
    goal: number;
    label: string;
  };
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  highlight?: string;
  highlightColor?: 'warning' | 'success' | 'danger';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  progress,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  highlight,
  highlightColor = 'warning',
  action,
  className,
}: MetricCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (progress) {
      const percentage = Math.min((progress.current / progress.goal) * 100, 100);
      const timer = setTimeout(() => setAnimatedProgress(percentage), 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const highlightColors = {
    warning: 'text-warning',
    success: 'text-success',
    danger: 'text-destructive',
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-border/50 bg-card p-4 sm:p-6',
        'transition-all duration-300 ease-out',
        'hover:border-primary/30 hover:bg-muted/50 hover:-translate-y-0.5',
        'hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      {/* Label */}
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </p>

      {/* Hero Value */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-bold text-foreground animate-count-up">
            {value}
          </p>

          {/* Progress Bar */}
          {progress && (
            <div className="space-y-1.5 pt-2">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out"
                  style={{ width: `${animatedProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {progress.label}
              </p>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && !progress && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}

          {/* Highlight */}
          {highlight && (
            <p className={cn('text-sm font-medium', highlightColors[highlightColor])}>
              {highlight}
            </p>
          )}

          {/* Trend */}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium pt-1',
                trend.direction === 'up' && 'text-success',
                trend.direction === 'down' && 'text-destructive',
                trend.direction === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
              <span>
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground font-normal">vs last period</span>
            </div>
          )}

          {/* Action */}
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm text-primary hover:text-primary/80 font-medium pt-2 transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'rounded-xl p-3 bg-muted/50 border border-border/50',
              'group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300',
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
