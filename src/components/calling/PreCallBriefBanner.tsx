import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Building2, MapPin, User, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CallStatus } from '@/hooks/useTelnyxCall';

export interface LeadContext {
  contact_name: string;
  business?: string | null;
  location?: string | null;
  lead_type?: string | null;
  pain_point?: string | null;
  previous_rep?: string | null;
  notes?: string | null;
  contact_date?: string | null;
  phone_number?: string | null;
}

interface PreCallBriefBannerProps {
  leadContext: LeadContext;
  callStatus: CallStatus;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  hot: 'bg-red-500/15 text-red-700 border-red-200',
  warm: 'bg-orange-500/15 text-orange-700 border-orange-200',
  cold: 'bg-blue-500/15 text-blue-700 border-blue-200',
};

export function PreCallBriefBanner({ leadContext, callStatus, className }: PreCallBriefBannerProps) {
  const [expanded, setExpanded] = useState(true);

  // Auto-collapse when call connects
  useEffect(() => {
    if (callStatus === 'connected') {
      setExpanded(false);
    }
  }, [callStatus]);

  const typeColor = leadContext.lead_type
    ? TYPE_COLORS[leadContext.lead_type.toLowerCase()] || 'bg-muted text-muted-foreground border-border'
    : null;

  return (
    <Card
      className={cn(
        'border border-primary/20 bg-primary/5 overflow-hidden transition-all',
        className
      )}
    >
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-medium text-sm truncate">{leadContext.contact_name}</span>
          {leadContext.business && (
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              — {leadContext.business}
            </span>
          )}
          {leadContext.lead_type && typeColor && (
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', typeColor)}>
              {leadContext.lead_type}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs border-t border-primary/10 pt-2">
          {leadContext.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{leadContext.location}</span>
            </div>
          )}
          {leadContext.business && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{leadContext.business}</span>
            </div>
          )}
          {leadContext.contact_date && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Last: {leadContext.contact_date}</span>
            </div>
          )}
          {leadContext.previous_rep && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Rep: {leadContext.previous_rep}</span>
            </div>
          )}
          {leadContext.pain_point && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <MessageSquare className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Pain: {leadContext.pain_point}</span>
            </div>
          )}
          {leadContext.notes && (
            <div className="flex items-start gap-1.5 text-muted-foreground col-span-full">
              <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{leadContext.notes}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
