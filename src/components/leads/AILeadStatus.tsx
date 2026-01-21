import { Activity, Pause, Play, TrendingUp, Clock, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AILeadStatusProps {
  isActive: boolean;
  todaysLeads: number;
  weeklyLeads: number;
  conversionRate: number;
  avgResponseTime: string;
  onToggleAI: () => void;
}

export function AILeadStatus({
  isActive,
  todaysLeads,
  weeklyLeads,
  conversionRate,
  avgResponseTime,
  onToggleAI,
}: AILeadStatusProps) {
  return (
    <div className="card-gradient rounded-xl border border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          <h2 className="text-lg font-semibold text-foreground">AI Lead Generation Status</h2>
          <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-success/20 text-success border-success/30' : ''}>
            {isActive ? 'ACTIVE' : 'PAUSED'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {isActive ? 'AI monitoring conversations in real-time' : 'AI monitoring paused'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Activity className="h-4 w-4" />
            Today's Leads
          </div>
          <p className="text-2xl font-bold text-foreground">{todaysLeads}</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="h-4 w-4" />
            This Week
          </div>
          <p className="text-2xl font-bold text-foreground">{weeklyLeads}</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Percent className="h-4 w-4" />
            Conversion Rate
          </div>
          <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="h-4 w-4" />
            Avg Response
          </div>
          <p className="text-2xl font-bold text-foreground">{avgResponseTime}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onToggleAI} className="gap-2">
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isActive ? 'Pause AI' : 'Resume AI'}
        </Button>
      </div>
    </div>
  );
}
