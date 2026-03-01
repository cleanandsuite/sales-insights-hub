import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, Quote, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';

interface CommandBarProps {
  userName: string;
  kpis: { callsToday: number; callsWeek: number; avgScore: number };
  quote: { text: string; author: string };
  onStartCall: () => void;
  className?: string;
}

export function CommandBar({ userName, kpis, quote, onStartCall, className }: CommandBarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Simple streak: if callsWeek >= 3, show a streak
  const hasStreak = kpis.callsWeek >= 3;

  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl',
      'card-premium',
      className
    )}>
      {/* Left: Greeting */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">
          {greeting}, {userName}
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors">
                <Quote className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs italic">"{quote.text}"</p>
              <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Center: AI Status + KPI Pills */}
      <div className="flex items-center gap-2 flex-wrap flex-1 justify-center">
        <div className="flex items-center gap-1.5 mr-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">AI Active</span>
        </div>
        <Badge variant="secondary" className="text-xs font-medium gap-1 px-2.5 py-1 rounded-lg">
          <Phone className="h-3 w-3" />
          {kpis.callsToday} today
        </Badge>
        <Badge variant="secondary" className="text-xs font-medium gap-1 px-2.5 py-1 rounded-lg">
          ⭐ {kpis.avgScore > 0 ? kpis.avgScore : '—'}
          {kpis.avgScore > 0 && (
            <TrendingUp className="h-3 w-3 text-success ml-0.5" />
          )}
        </Badge>
        {hasStreak && (
          <Badge variant="secondary" className="text-xs font-medium gap-1 px-2.5 py-1 rounded-lg text-warning">
            <Flame className="h-3 w-3" />
            {kpis.callsWeek}-day streak
          </Badge>
        )}
      </div>

      {/* Right: Search + Bell + Start Call CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <GlobalSearch />
        <NotificationBell />
        <Button
          onClick={onStartCall}
          className={cn(
            'gap-2 font-bold shadow-lg shrink-0',
            'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
            'hover:shadow-xl hover:shadow-destructive/20',
            'px-5 py-2.5 rounded-xl transition-all duration-200'
          )}
        >
          <Phone className="h-4 w-4" />
          Start Call
        </Button>
      </div>
    </div>
  );
}
