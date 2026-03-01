import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Phone, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepPulse {
  userId: string;
  name: string;
  initials: string;
  callsToday: number;
  callsWeek: number;
  lastCallHoursAgo: number | null;
  status: 'active' | 'idle' | 'inactive';
}

interface TeamPulseStripProps {
  teamId?: string;
  className?: string;
}

// Mock data for team pulse when no real team data is available
const mockReps: RepPulse[] = [
  { userId: '1', name: 'Alex Thompson', initials: 'AT', callsToday: 8, callsWeek: 34, lastCallHoursAgo: 1, status: 'active' },
  { userId: '2', name: 'Sarah Chen', initials: 'SC', callsToday: 5, callsWeek: 28, lastCallHoursAgo: 3, status: 'active' },
  { userId: '3', name: 'Marcus Johnson', initials: 'MJ', callsToday: 3, callsWeek: 19, lastCallHoursAgo: 6, status: 'idle' },
  { userId: '4', name: 'Emily Rodriguez', initials: 'ER', callsToday: 0, callsWeek: 12, lastCallHoursAgo: 28, status: 'inactive' },
  { userId: '5', name: 'James Park', initials: 'JP', callsToday: 6, callsWeek: 31, lastCallHoursAgo: 2, status: 'active' },
  { userId: '6', name: 'Diana Wells', initials: 'DW', callsToday: 1, callsWeek: 8, lastCallHoursAgo: 12, status: 'idle' },
  { userId: '7', name: 'Ryan Foster', initials: 'RF', callsToday: 0, callsWeek: 4, lastCallHoursAgo: 48, status: 'inactive' },
  { userId: '8', name: 'Lisa Chang', initials: 'LC', callsToday: 7, callsWeek: 29, lastCallHoursAgo: 0.5, status: 'active' },
];

export function TeamPulseStrip({ teamId, className }: TeamPulseStripProps) {
  const [reps, setReps] = useState<RepPulse[]>(mockReps);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'ring-success bg-success/10';
      case 'idle': return 'ring-warning bg-warning/10';
      case 'inactive': return 'ring-destructive bg-destructive/10';
      default: return 'ring-border bg-muted';
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'idle': return 'bg-warning';
      case 'inactive': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const activeCount = reps.filter(r => r.status === 'active').length;
  const idleCount = reps.filter(r => r.status === 'idle').length;
  const inactiveCount = reps.filter(r => r.status === 'inactive').length;

  return (
    <Card className={cn('bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-xl', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Team Pulse
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">{activeCount} active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">{idleCount} idle</span>
            </span>
            {inactiveCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">{inactiveCount} inactive</span>
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-3">
            {reps.map((rep) => (
              <Tooltip key={rep.userId}>
                <TooltipTrigger asChild>
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="relative">
                      <Avatar className={cn('h-10 w-10 ring-2 transition-all group-hover:scale-110', statusColor(rep.status))}>
                        <AvatarFallback className="text-xs font-semibold bg-transparent text-foreground">
                          {rep.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                        statusDot(rep.status)
                      )} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[56px]">
                      {rep.name.split(' ')[0]}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-semibold">{rep.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {rep.callsToday} today
                    </span>
                    <span>{rep.callsWeek}/week</span>
                  </div>
                  {rep.lastCallHoursAgo !== null && (
                    <p className="mt-1 text-muted-foreground">
                      Last call: {rep.lastCallHoursAgo < 1 ? 'Just now' : `${Math.round(rep.lastCallHoursAgo)}h ago`}
                    </p>
                  )}
                  {rep.status === 'inactive' && (
                    <p className="mt-1 text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Needs attention
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
