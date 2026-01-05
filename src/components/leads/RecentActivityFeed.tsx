import { Phone, FileText, Calendar, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  type: 'new_lead' | 'ai_scored' | 'contact_captured' | 'follow_up' | 'call_completed';
  title: string;
  description: string;
  timestamp: string;
  leadId?: string;
  confidence?: number;
  isUrgent?: boolean;
}

interface RecentActivityFeedProps {
  activities: Activity[];
  onViewLead: (leadId: string) => void;
  onViewSummary: (leadId: string) => void;
  onCallNow: (leadId: string) => void;
  onSchedule: (leadId: string) => void;
  onEmail: (leadId: string) => void;
}

export function RecentActivityFeed({
  activities,
  onViewLead,
  onViewSummary,
  onCallNow,
  onSchedule,
  onEmail
}: RecentActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'new_lead':
        return <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-success" /></div>;
      case 'ai_scored':
        return <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>;
      case 'contact_captured':
        return <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center"><Phone className="h-4 w-4 text-accent" /></div>;
      case 'follow_up':
        return <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center"><Clock className="h-4 w-4 text-warning" /></div>;
      case 'call_completed':
        return <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"><Phone className="h-4 w-4 text-foreground" /></div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"><FileText className="h-4 w-4 text-muted-foreground" /></div>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getActionButtons = (activity: Activity) => {
    if (!activity.leadId) return null;
    
    switch (activity.type) {
      case 'new_lead':
        return (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => onViewSummary(activity.leadId!)} className="text-xs h-7 gap-1">
              <FileText className="h-3 w-3" />
              Summary
            </Button>
            <Button size="sm" variant="outline" onClick={() => onViewLead(activity.leadId!)} className="text-xs h-7 gap-1">
              View Lead
            </Button>
            <Button size="sm" onClick={() => onCallNow(activity.leadId!)} className="text-xs h-7 gap-1">
              <Phone className="h-3 w-3" />
              Call
            </Button>
          </div>
        );
      case 'ai_scored':
        return (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => onViewSummary(activity.leadId!)} className="text-xs h-7 gap-1">
              <FileText className="h-3 w-3" />
              Summary
            </Button>
            <Button size="sm" onClick={() => onSchedule(activity.leadId!)} className="text-xs h-7 gap-1">
              <Calendar className="h-3 w-3" />
              Schedule
            </Button>
          </div>
        );
      case 'contact_captured':
        return (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => onViewSummary(activity.leadId!)} className="text-xs h-7 gap-1">
              <FileText className="h-3 w-3" />
              Summary
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEmail(activity.leadId!)} className="text-xs h-7">
              Email
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="divide-y divide-border/30">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground/70">Activities will appear here as leads are captured</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className={`p-4 hover:bg-secondary/20 transition-colors ${activity.isUrgent ? 'bg-warning/5' : ''}`}>
              <div className="flex gap-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">"{activity.description}"</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      {activity.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {activity.confidence}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  {getActionButtons(activity)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
