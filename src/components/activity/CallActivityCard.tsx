import { CallActivity } from '@/types/deals';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  FileText,
  Headphones,
  Calendar,
  Link2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface CallActivityCardProps {
  activity: CallActivity;
  onViewAnalysis?: (id: string) => void;
  onLinkToDeal?: (id: string) => void;
  onCallBack?: (id: string) => void;
  onSchedule?: (id: string) => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

const outcomeConfig = {
  positive: {
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    label: 'Engaged',
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

export function CallActivityCard({ 
  activity, 
  onViewAnalysis, 
  onLinkToDeal,
  onCallBack,
  onSchedule 
}: CallActivityCardProps) {
  const outcomeStyle = outcomeConfig[activity.outcome];
  const scoreColor = activity.score >= 80 
    ? 'bg-success' 
    : activity.score >= 60 
    ? 'bg-warning' 
    : 'bg-destructive';

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
      <CardContent className="p-0">
        {/* Main Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 border border-primary/20">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {activity.company}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{activity.contactName}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(activity.date, { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {format(activity.date, 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Call Info Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(activity.duration)}</span>
            </div>
            {activity.dealName && (
              <div className="flex items-center gap-1.5 text-sm">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-foreground">Deal: {activity.dealName}</span>
              </div>
            )}
          </div>

          {/* AI Summary */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 mb-4">
            <p className="text-sm text-foreground leading-relaxed line-clamp-2">
              "{activity.summary}"
            </p>
          </div>

          {/* Score Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Call Score</span>
                <span className={cn(
                  "text-sm font-bold",
                  activity.score >= 80 ? "text-success" :
                  activity.score >= 60 ? "text-warning" :
                  "text-destructive"
                )}>
                  {activity.score}/100
                </span>
              </div>
              <Progress 
                value={activity.score} 
                className={cn("h-2", `[&>div]:${scoreColor}`)}
              />
            </div>
            <div className="text-xs text-muted-foreground border-l border-border pl-4">
              <div>Talk: <span className="text-foreground">42%</span> · <span className="text-foreground">58%</span></div>
              <div className={cn("mt-0.5", outcomeStyle.color)}>
                Energy: {outcomeStyle.label}
              </div>
            </div>
          </div>

          {/* Signals & Objections */}
          {(activity.buyingSignals.length > 0 || activity.objections.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {activity.buyingSignals.map((signal, i) => (
                <Badge 
                  key={i} 
                  className="bg-primary/10 text-primary border-primary/20 gap-1"
                >
                  💰 {signal}
                </Badge>
              ))}
              {activity.objections.map((objection, i) => (
                <Badge 
                  key={i} 
                  className="bg-warning/10 text-warning border-warning/20 gap-1"
                >
                  ⚠️ {objection.text}
                </Badge>
              ))}
              {activity.competitorMentions.length > 0 && (
                <Badge variant="outline" className="border-secondary/30 text-secondary">
                  ⚔️ {activity.competitorMentions.join(', ')}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {onViewAnalysis && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewAnalysis(activity.id)}
                className="border-border hover:bg-muted gap-1.5"
              >
                <FileText className="h-4 w-4" />
                Full Summary
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCallBack?.(activity.id)}
              className="border-border hover:bg-muted gap-1.5"
            >
              <Headphones className="h-4 w-4" />
              Listen
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCallBack?.(activity.id)}
              className="border-border hover:bg-muted gap-1.5"
            >
              <Phone className="h-4 w-4" />
              Call Back
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSchedule?.(activity.id)}
              className="border-border hover:bg-muted gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            {!activity.dealId && onLinkToDeal && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLinkToDeal(activity.id)}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <Link2 className="h-4 w-4" />
                Link to Deal
              </Button>
            )}
          </div>
        </div>

        {/* CRM Sync Status Footer */}
        <div className="px-5 py-3 bg-success/5 border-t border-success/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm text-foreground">Synced to HubSpot as activity</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary h-auto p-0 text-sm">
            View →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
