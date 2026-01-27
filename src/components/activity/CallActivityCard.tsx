import { CallActivity } from '@/types/deals';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Minus,
  ExternalLink,
  User,
  Building2,
  Zap,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface CallActivityCardProps {
  activity: CallActivity;
  onViewAnalysis?: (id: string) => void;
  onLinkToDeal?: (id: string) => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const outcomeConfig = {
  positive: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-500',
    bg: 'bg-green-500/10',
    label: 'Positive',
  },
  neutral: {
    icon: Minus,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    label: 'Neutral',
  },
  negative: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    label: 'Needs Follow-up',
  },
};

export function CallActivityCard({ activity, onViewAnalysis, onLinkToDeal }: CallActivityCardProps) {
  const outcomeStyle = outcomeConfig[activity.outcome];
  const OutcomeIcon = outcomeStyle.icon;

  return (
    <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">Call with {activity.contactName}</span>
              <span className="text-muted-foreground">@</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {activity.company}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(activity.duration)}
              </span>
              <span>•</span>
              <Badge
                variant="secondary"
                className={cn(
                  activity.score >= 80
                    ? 'bg-green-500/10 text-green-600'
                    : activity.score >= 60
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                Score: {activity.score}/100
              </Badge>
              {activity.dealName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    {activity.dealName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(activity.date, { addSuffix: true })}
          </div>
          <div className={cn('flex items-center gap-1 text-xs mt-1', outcomeStyle.color)}>
            <OutcomeIcon className="h-3.5 w-3.5" />
            {outcomeStyle.label}
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{activity.summary}</p>

      {/* Signals & Objections */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {activity.buyingSignals.map((signal, i) => (
          <Badge key={i} variant="secondary" className="bg-primary/10 text-primary">
            🟢 {signal}
          </Badge>
        ))}
        {activity.objections.map((objection, i) => (
          <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive">
            ⚠️ {objection.text}
          </Badge>
        ))}
        {activity.competitorMentions.length > 0 && (
          <Badge variant="outline" className="border-orange-500/30 text-orange-600">
            ⚔️ {activity.competitorMentions.join(', ')}
          </Badge>
        )}
      </div>

      {/* Next Steps */}
      {activity.nextSteps && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Next:</span>
          <span>{activity.nextSteps}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        {onViewAnalysis && (
          <Button variant="outline" size="sm" onClick={() => onViewAnalysis(activity.id)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Analysis
          </Button>
        )}
        {!activity.dealId && onLinkToDeal && (
          <Button variant="ghost" size="sm" onClick={() => onLinkToDeal(activity.id)}>
            <Zap className="h-4 w-4 mr-2" />
            Link to Deal
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          {activity.userName}
        </div>
      </div>
    </div>
  );
}
