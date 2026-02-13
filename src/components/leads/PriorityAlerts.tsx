import { AlertTriangle, Target, Phone, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  type: 'urgent_followup' | 'high_score' | 'scheduled_today';
  title: string;
  count: number;
  description?: string;
}

interface PriorityAlertsProps {
  alerts: Alert[];
  onAlertClick: (alert: Alert) => void;
}

export function PriorityAlerts({ alerts, onAlertClick }: PriorityAlertsProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'urgent_followup':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'high_score':
        return <Target className="h-4 w-4 text-success" />;
      case 'scheduled_today':
        return <Phone className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'urgent_followup':
        return 'border-warning/30 bg-warning/5 hover:bg-warning/10';
      case 'high_score':
        return 'border-success/30 bg-success/5 hover:bg-success/10';
      case 'scheduled_today':
        return 'border-primary/30 bg-primary/5 hover:bg-primary/10';
      default:
        return 'border-border/30 bg-secondary/20 hover:bg-secondary/30';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="card-gradient rounded-xl border border-border/50 p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Priority Alerts
      </h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => onAlertClick(alert)}
            className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between text-left ${getAlertStyle(alert.type)}`}
          >
            <div className="flex items-center gap-3">
              {getAlertIcon(alert.type)}
              <div>
                <p className="font-medium text-foreground">
                  {alert.count} {alert.title}
                </p>
                {alert.description && (
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                )}
              </div>
            </div>
            <span className="text-2xl font-bold text-foreground">{alert.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
