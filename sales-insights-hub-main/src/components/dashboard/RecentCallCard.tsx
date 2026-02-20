import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Phone, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentCallCardProps {
  contactName: string;
  company: string;
  score: number;
  summary: string;
  timestamp: Date;
  buyingSignals?: string[];
  onViewSummary?: () => void;
  onViewLead?: () => void;
  onCall?: () => void;
  onSchedule?: () => void;
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success bg-success/10 border-success/20';
  if (score >= 60) return 'text-warning bg-warning/10 border-warning/20';
  return 'text-destructive bg-destructive/10 border-destructive/20';
};

const getScoreDot = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-destructive';
};

export function RecentCallCard({
  contactName,
  company,
  score,
  summary,
  timestamp,
  buyingSignals = [],
  onViewSummary,
  onViewLead,
  onCall,
  onSchedule,
  className,
}: RecentCallCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border/50 bg-card/50 p-4',
        'transition-all duration-300 ease-out',
        'hover:bg-muted/50 hover:border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Score Dot */}
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full shrink-0',
              getScoreDot(score)
            )}
          />
          <div className="min-w-0">
            <h4 className="font-medium text-foreground truncate">{company}</h4>
            <p className="text-sm text-muted-foreground truncate">{contactName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Score Badge */}
          <Badge
            variant="outline"
            className={cn('font-semibold', getScoreColor(score))}
          >
            {score}/100
          </Badge>
          {/* Timestamp */}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        "{summary}"
      </p>

      {/* Buying Signals */}
      {buyingSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {buyingSignals.map((signal, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              {signal}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/30">
        {onViewSummary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewSummary}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Summary
          </Button>
        )}
        {onViewLead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewLead}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            View Lead
          </Button>
        )}
        {onSchedule && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSchedule}
            className="h-8 text-xs text-muted-foreground hover:text-foreground ml-auto"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Schedule
          </Button>
        )}
        {onCall && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCall}
            className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            Call
          </Button>
        )}
      </div>
    </div>
  );
}
