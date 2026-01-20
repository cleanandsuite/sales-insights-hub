import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useScheduleAssistant } from '@/hooks/useScheduleAssistant';

interface ScheduleAnalytics {
  totalCalls: number;
  completedCalls: number;
  noShows: number;
  cancelledCalls: number;
  avgDuration: number;
  peakHours: number[];
  peakDays: string[];
  completionRate: number;
}

export function ScheduleAnalyticsWidget() {
  const { getAnalytics, isLoadingAnalytics } = useScheduleAssistant();
  const [analytics, setAnalytics] = useState<ScheduleAnalytics | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await getAnalytics();
      setAnalytics(data);
    };
    loadAnalytics();
  }, []);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  if (isLoadingAnalytics) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Call Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.totalCalls === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Call Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Schedule your first calls to see analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Call Analytics (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm">Completion Rate</span>
          </div>
          <span className="text-sm font-semibold text-success">
            {analytics.completionRate}%
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-lg font-bold">{analytics.totalCalls}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Duration</span>
            </div>
            <p className="text-lg font-bold">{analytics.avgDuration}m</p>
          </div>
        </div>

        {/* No Shows & Cancelled */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-3.5 w-3.5 text-warning" />
            <span className="text-muted-foreground">No-shows</span>
          </div>
          <span className="font-medium">{analytics.noShows}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-muted-foreground">Cancelled</span>
          </div>
          <span className="font-medium">{analytics.cancelledCalls}</span>
        </div>

        {/* Peak Times */}
        {analytics.peakHours.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Peak Call Times
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analytics.peakHours.map(hour => (
                <span 
                  key={hour}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                >
                  {formatHour(hour)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Peak Days */}
        {analytics.peakDays.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Busiest Days
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analytics.peakDays.map(day => (
                <span 
                  key={day}
                  className="px-2 py-0.5 text-xs rounded-full bg-secondary/50 text-secondary-foreground font-medium"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
