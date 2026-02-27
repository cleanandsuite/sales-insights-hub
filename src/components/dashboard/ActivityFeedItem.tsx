import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Star, Clock, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedItemProps {
  id: string;
  name: string;
  summary?: string | null;
  score?: number | null;
  duration?: number | null;
  status?: string | null;
  timestamp: string;
  onView: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ActivityFeedItem({
  name, summary, score, duration, status, timestamp, onView, className, style,
}: ActivityFeedItemProps) {
  const formatDuration = (s: number | null) => {
    if (!s) return null;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const scoreColor = score !== null && score !== undefined
    ? score >= 70 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-destructive'
    : '';

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3.5 rounded-xl border border-border/30',
        'bg-card hover:border-border/60 hover:shadow-sm',
        'transition-all duration-200 cursor-pointer',
        className
      )}
      style={style}
      onClick={onView}
    >
      {/* Icon */}
      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0 mt-0.5">
        <Phone className="h-4 w-4 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">{name}</span>
          {status === 'analyzed' && (
            <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/5 px-1.5 py-0">
              AI Analyzed
            </Badge>
          )}
        </div>
        {summary && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{summary}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(timestamp)}
          </span>
          {formatDuration(duration) && (
            <span>{formatDuration(duration)}</span>
          )}
          {score !== null && score !== undefined && (
            <span className={cn('flex items-center gap-0.5 font-medium', scoreColor)}>
              <Star className="h-3 w-3" />
              {score}
            </span>
          )}
        </div>
      </div>

      {/* Hover action */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => { e.stopPropagation(); onView(); }}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
