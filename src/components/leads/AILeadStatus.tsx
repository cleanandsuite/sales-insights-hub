import { Activity, TrendingUp, Percent, Clock, Flame, Phone, Users, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AILeadStatusProps {
  isActive: boolean;
  todaysLeads: number;
  weeklyLeads: number;
  conversionRate: number;
  pendingFollowups: number;
  hotLeads: number;
  recentCalls: number;
  onToggleAI: () => void;
}

export function AILeadStatus({
  isActive,
  todaysLeads,
  weeklyLeads,
  conversionRate,
  pendingFollowups,
  hotLeads,
  recentCalls,
  onToggleAI,
}: AILeadStatusProps) {
  const stats = [
    { label: "Today's Leads", value: todaysLeads, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
    { label: 'This Week', value: weeklyLeads, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Conversion', value: `${conversionRate}%`, icon: Percent, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Follow-ups', value: pendingFollowups, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Hot Leads', value: hotLeads, icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Recent Calls', value: recentCalls, icon: Phone, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="card-gradient rounded-xl border border-border/50 p-5">
      {/* Top row: AI status + toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-sm font-semibold text-foreground">AI Lead Generation</span>
          <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-success/20 text-success border-success/30 text-xs' : 'text-xs'}>
            {isActive ? 'ACTIVE' : 'PAUSED'}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleAI} className="gap-1.5 h-8">
          {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isActive ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className={`h-8 w-8 rounded-md ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground leading-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
