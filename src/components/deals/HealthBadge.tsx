import { cn } from '@/lib/utils';
import { HealthStatus, HealthBreakdown } from '@/types/deals';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Eye, CheckCircle } from 'lucide-react';

interface HealthBadgeProps {
  score: number;
  status: HealthStatus;
  breakdown?: HealthBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const statusConfig = {
  at_risk: {
    label: 'At Risk',
    icon: AlertTriangle,
    bgClass: 'bg-destructive/15',
    textClass: 'text-destructive',
    borderClass: 'border-destructive/30',
  },
  monitor: {
    label: 'Monitor',
    icon: Eye,
    bgClass: 'bg-yellow-500/15',
    textClass: 'text-yellow-600 dark:text-yellow-500',
    borderClass: 'border-yellow-500/30',
  },
  on_track: {
    label: 'On Track',
    icon: CheckCircle,
    bgClass: 'bg-green-500/15',
    textClass: 'text-green-600 dark:text-green-500',
    borderClass: 'border-green-500/30',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizeConfig = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function HealthBadge({ score, status, breakdown, size = 'md', showScore = true }: HealthBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeConfig[size]
      )}
    >
      <Icon className={iconSizeConfig[size]} />
      <span>{config.label}</span>
      {showScore && <span className="opacity-75">({score})</span>}
    </div>
  );

  if (!breakdown) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">Health Score: {score}/100</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Last call: {breakdown.lastCallDays.value} days ago</span>
                <span className={breakdown.lastCallDays.impact < 0 ? 'text-destructive' : 'text-green-500'}>
                  {breakdown.lastCallDays.impact > 0 ? '+' : ''}{breakdown.lastCallDays.impact}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Unresolved objections: {breakdown.unresolvedObjections.count}</span>
                <span className={breakdown.unresolvedObjections.impact < 0 ? 'text-destructive' : 'text-green-500'}>
                  {breakdown.unresolvedObjections.impact > 0 ? '+' : ''}{breakdown.unresolvedObjections.impact}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Buying signals: {breakdown.buyingSignals.count}</span>
                <span className={breakdown.buyingSignals.impact < 0 ? 'text-destructive' : 'text-green-500'}>
                  {breakdown.buyingSignals.impact > 0 ? '+' : ''}{breakdown.buyingSignals.impact}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stage stalled: {breakdown.stageStalledDays.value} days</span>
                <span className={breakdown.stageStalledDays.impact < 0 ? 'text-destructive' : 'text-green-500'}>
                  {breakdown.stageStalledDays.impact > 0 ? '+' : ''}{breakdown.stageStalledDays.impact}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
