import { cn } from '@/lib/utils';
import { HealthStatus } from '@/types/deals';
import { AlertTriangle, Eye, CheckCircle, TrendingUp } from 'lucide-react';

interface PipelineSummaryBarProps {
  atRiskCount: number;
  atRiskValue: number;
  monitorCount: number;
  monitorValue: number;
  onTrackCount: number;
  onTrackValue: number;
  totalValue: number;
  activeFilter: HealthStatus | 'all';
  onFilterChange: (filter: HealthStatus | 'all') => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export function PipelineSummaryBar({
  atRiskCount,
  atRiskValue,
  monitorCount,
  monitorValue,
  onTrackCount,
  onTrackValue,
  totalValue,
  activeFilter,
  onFilterChange,
}: PipelineSummaryBarProps) {
  const segments = [
    {
      id: 'at_risk' as const,
      label: 'At Risk',
      count: atRiskCount,
      value: atRiskValue,
      icon: AlertTriangle,
      bgClass: 'bg-destructive/10 hover:bg-destructive/20',
      activeBgClass: 'bg-destructive/20 ring-2 ring-destructive/50',
      textClass: 'text-destructive',
      iconClass: 'text-destructive',
    },
    {
      id: 'monitor' as const,
      label: 'Monitor',
      count: monitorCount,
      value: monitorValue,
      icon: Eye,
      bgClass: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      activeBgClass: 'bg-yellow-500/20 ring-2 ring-yellow-500/50',
      textClass: 'text-yellow-600 dark:text-yellow-500',
      iconClass: 'text-yellow-600 dark:text-yellow-500',
    },
    {
      id: 'on_track' as const,
      label: 'On Track',
      count: onTrackCount,
      value: onTrackValue,
      icon: CheckCircle,
      bgClass: 'bg-green-500/10 hover:bg-green-500/20',
      activeBgClass: 'bg-green-500/20 ring-2 ring-green-500/50',
      textClass: 'text-green-600 dark:text-green-500',
      iconClass: 'text-green-600 dark:text-green-500',
    },
  ];

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-3">
        {segments.map((segment) => {
          const Icon = segment.icon;
          const isActive = activeFilter === segment.id;

          return (
            <button
              key={segment.id}
              onClick={() => onFilterChange(isActive ? 'all' : segment.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer',
                isActive ? segment.activeBgClass : segment.bgClass
              )}
            >
              <Icon className={cn('h-5 w-5', segment.iconClass)} />
              <div className="text-left">
                <div className={cn('text-lg font-bold', segment.textClass)}>
                  {segment.count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {segment.label} ({formatCurrency(segment.value)})
                </div>
              </div>
            </button>
          );
        })}

        <div className="h-12 w-px bg-border mx-2 hidden sm:block" />

        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Pipeline
            </div>
          </div>
        </div>

        {activeFilter !== 'all' && (
          <button
            onClick={() => onFilterChange('all')}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
