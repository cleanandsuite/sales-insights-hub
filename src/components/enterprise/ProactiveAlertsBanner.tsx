import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, AlertCircle, X, UserX, Clock, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProactiveAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
  action?: { label: string; onClick: () => void };
}

// Mock proactive alerts that a manager would see
const mockAlerts: ProactiveAlert[] = [
  {
    id: 'stalled-deals',
    severity: 'critical',
    icon: AlertCircle,
    title: '3 deals stalled for 7+ days',
    detail: 'TechCorp, GlobalFin, MedStart — no activity since last week',
  },
  {
    id: 'inactive-rep',
    severity: 'warning',
    icon: UserX,
    title: 'Ryan Foster — no calls in 2 days',
    detail: 'Below weekly target (4/15 calls). May need check-in.',
  },
  {
    id: 'coaching-pending',
    severity: 'info',
    icon: Brain,
    title: '5 coaching sessions awaiting review',
    detail: 'AI flagged improvement areas for 3 reps this week.',
  },
];

interface ProactiveAlertsBannerProps {
  className?: string;
}

export function ProactiveAlertsBanner({ className }: ProactiveAlertsBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = mockAlerts.filter(a => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) return null;

  const severityStyles = {
    critical: 'border-destructive/30 bg-destructive/5',
    warning: 'border-warning/30 bg-warning/5',
    info: 'border-primary/20 bg-primary/5',
  };

  const iconStyles = {
    critical: 'text-destructive',
    warning: 'text-warning',
    info: 'text-primary',
  };

  return (
    <div className={cn('flex flex-col sm:flex-row gap-2', className)}>
      {visibleAlerts.map((alert) => (
        <Card
          key={alert.id}
          className={cn(
            'flex-1 border backdrop-blur-xl shadow-sm',
            severityStyles[alert.severity]
          )}
        >
          <CardContent className="flex items-start gap-3 p-3">
            <alert.icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconStyles[alert.severity])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{alert.detail}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissedIds(prev => new Set([...prev, alert.id]))}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
