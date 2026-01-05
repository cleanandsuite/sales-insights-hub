import { Phone, Mail, Calendar, MapPin, Building, Briefcase, TrendingUp, Clock, MessageSquare, ChevronDown, ChevronUp, Play, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface Lead {
  id: string;
  contact_name: string;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  ai_confidence: number | null;
  priority_score: number | null;
  lead_status: string;
  primary_pain_point: string | null;
  budget_info: string | null;
  timeline: string | null;
  next_action: string | null;
  next_action_due: string | null;
  is_hot_lead: boolean | null;
  urgency_level: string | null;
  created_at: string;
  call_duration_seconds: number | null;
  engagement_score: number | null;
  key_quotes: any[];
  agreed_next_steps: string[] | null;
}

interface LeadCardProps {
  lead: Lead;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onViewSummary: (lead: Lead) => void;
  onSchedule: (lead: Lead) => void;
}

export function LeadCard({ lead, onCall, onEmail, onViewSummary, onSchedule }: LeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getUrgencyBadge = (urgency: string | null) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-gradient rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="p-5 border-b border-border/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
              {lead.contact_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{lead.contact_name}</h3>
                {lead.is_hot_lead && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30">🔥 Hot</Badge>
                )}
              </div>
              {lead.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building className="h-3 w-3" />
                  {lead.company}
                </p>
              )}
              {lead.title && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {lead.title}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getConfidenceColor(lead.ai_confidence)}`}>
              {lead.ai_confidence ? `${lead.ai_confidence}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">AI Confidence</p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {getUrgencyBadge(lead.urgency_level)}
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(lead.call_duration_seconds)}
          </Badge>
          {lead.priority_score && (
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Priority: {lead.priority_score.toFixed(1)}/10
            </Badge>
          )}
        </div>

        {lead.primary_pain_point && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Primary Pain Point</p>
            <p className="text-sm text-foreground">"{lead.primary_pain_point}"</p>
          </div>
        )}

        {lead.next_action && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Next:</span>
            <span className="text-foreground font-medium">{lead.next_action}</span>
            {lead.next_action_due && (
              <span className="text-muted-foreground">
                (Due: {new Date(lead.next_action_due).toLocaleDateString()})
              </span>
            )}
          </div>
        )}

        {/* Expandable Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {isExpanded && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{lead.phone}</span>
                </div>
              )}
              {lead.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{lead.location}</span>
                </div>
              )}
            </div>

            {lead.budget_info && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Budget</p>
                <p className="text-sm text-foreground">{lead.budget_info}</p>
              </div>
            )}

            {lead.timeline && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                <p className="text-sm text-foreground">{lead.timeline}</p>
              </div>
            )}

            {lead.agreed_next_steps && lead.agreed_next_steps.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Agreed Next Steps</p>
                <ul className="space-y-1">
                  {lead.agreed_next_steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lead.key_quotes && lead.key_quotes.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Key Quotes</p>
                <div className="space-y-2">
                  {lead.key_quotes.slice(0, 2).map((quote: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-secondary/20 text-sm italic text-foreground/80">
                      "{typeof quote === 'string' ? quote : quote.text}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border/30 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onCall(lead)} className="gap-2">
          <Phone className="h-4 w-4" />
          Call Now
        </Button>
        <Button size="sm" variant="outline" onClick={() => onViewSummary(lead)} className="gap-2">
          <FileText className="h-4 w-4" />
          Call Summary
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEmail(lead)} className="gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSchedule(lead)} className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule
        </Button>
      </div>
    </div>
  );
}
