import { Phone, Mail, Calendar, MapPin, Building, Briefcase, TrendingUp, Clock, ChevronDown, ChevronUp, FileText, Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AIIntelligenceBar } from './AIIntelligenceBar';
import { BANTScoreVisualization } from './BANTScoreVisualization';
import { AIActionSuggestion } from './AIActionSuggestion';
import { AIRiskTimeline } from './AIRiskTimeline';
import { SmartCRMActions } from './SmartCRMActions';

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
  key_quotes: any;
  agreed_next_steps: string[] | null;
  // New AI fields
  bant_budget?: number;
  bant_authority?: number;
  bant_need?: number;
  bant_timeline?: number;
  sentiment_trend?: any;
  objection_patterns?: string[] | null;
  next_best_actions?: any;
  risk_level?: string;
  deal_velocity_days?: number | null;
  predicted_close_date?: string | null;
  predicted_deal_value?: number | null;
  ai_assisted?: boolean;
}

interface LeadCardProps {
  lead: Lead;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onViewSummary: (lead: Lead) => void;
  onSchedule: (lead: Lead) => void;
  onLeadUpdated?: (lead: Lead) => void;
}

export function LeadCard({ lead, onCall, onEmail, onViewSummary, onSchedule, onLeadUpdated }: LeadCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [appliedActions, setAppliedActions] = useState<number[]>([]);

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getUrgencyBadge = (urgency: string | null) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Medium</Badge>;
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

  const handleRunAIScore = async () => {
    if (!user?.id) return;
    
    setIsScoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lead-score', {
        body: {
          lead_id: lead.id,
          user_id: user.id,
          deal_context: {
            budget_info: lead.budget_info,
            timeline: lead.timeline,
            primary_pain_point: lead.primary_pain_point
          }
        }
      });

      if (error) throw error;

      toast.success('AI analysis complete!');
      if (onLeadUpdated) {
        // Fetch updated lead
        const { data: updatedLead } = await supabase
          .from('leads')
          .select('*')
          .eq('id', lead.id)
          .single();
        if (updatedLead) onLeadUpdated(updatedLead);
      }
    } catch (error) {
      console.error('AI scoring error:', error);
      toast.error('Failed to run AI analysis');
    } finally {
      setIsScoring(false);
    }
  };

  const handleApplyAction = async (action: any, index: number) => {
    setAppliedActions(prev => [...prev, index]);
    
    // Track that the action was applied
    if (user?.id) {
      await supabase.from('ai_coaching_metrics').update({
        was_applied: true,
        applied_at: new Date().toISOString()
      }).eq('lead_id', lead.id).eq('suggestion_text', action.action);
    }
    
    toast.success(`Action applied: ${action.action}`);
  };

  const bantScores = {
    budget: lead.bant_budget ?? 0,
    authority: lead.bant_authority ?? 0,
    need: lead.bant_need ?? 0,
    timeline: lead.bant_timeline ?? 0
  };

  const hasAIData = lead.ai_assisted || (lead.bant_budget !== undefined && lead.bant_budget > 0);

  return (
    <div className="card-gradient rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base sm:text-lg flex-shrink-0">
              {lead.contact_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{lead.contact_name}</h3>
                {lead.is_hot_lead && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">🔥 Hot</Badge>
                )}
                {lead.ai_assisted && (
                  <Badge variant="outline" className="gap-1 text-primary border-primary/30 text-xs">
                    <Brain className="h-3 w-3" />
                    AI
                  </Badge>
                )}
              </div>
              {lead.company && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <Building className="h-3 w-3 flex-shrink-0" />
                  {lead.company}
                </p>
              )}
              {lead.title && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  {lead.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:block sm:text-right gap-3 mt-1 sm:mt-0">
            <div className="flex items-center sm:block gap-2">
              <div className={`text-xl sm:text-2xl font-bold ${getConfidenceColor(lead.ai_confidence)}`}>
                {lead.ai_confidence ? `${lead.ai_confidence}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">AI Confidence</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunAIScore}
              disabled={isScoring}
              className="text-xs px-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isScoring ? 'animate-spin' : ''}`} />
              {isScoring ? 'Scoring...' : 'Re-score'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Section */}
      {hasAIData && (
        <div className="p-4 border-b border-border/30 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AIIntelligenceBar
              aiConfidence={lead.ai_confidence}
              sentimentTrend={lead.sentiment_trend || []}
              objectionPatterns={lead.objection_patterns || []}
              riskLevel={lead.risk_level || 'medium'}
            />
            <BANTScoreVisualization scores={bantScores} />
          </div>
          
          <AIRiskTimeline
            riskLevel={lead.risk_level || 'medium'}
            predictedCloseDate={lead.predicted_close_date || null}
            predictedDealValue={lead.predicted_deal_value || null}
            dealVelocityDays={lead.deal_velocity_days || null}
          />
        </div>
      )}

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

        {/* AI Next Best Actions */}
        {lead.next_best_actions && lead.next_best_actions.length > 0 && (
          <AIActionSuggestion
            actions={lead.next_best_actions}
            onApplyAction={handleApplyAction}
            appliedActions={appliedActions}
          />
        )}

        {lead.next_action && !hasAIData && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
      <div className="p-4 border-t border-border/30">
        <SmartCRMActions
          leadId={lead.id}
          leadName={lead.contact_name}
          leadEmail={lead.email}
          onCall={() => onCall(lead)}
          onEmail={() => onEmail(lead)}
          onSchedule={() => onSchedule(lead)}
          aiSuggestions={{
            emailTemplates: [
              { label: 'Follow-up on pain point', description: 'Reference their specific challenge' },
              { label: 'Case study share', description: 'Send relevant success story' }
            ],
            callTimes: [
              { label: 'Tomorrow 10:30 AM', description: 'Based on their typical response times' },
              { label: 'Thursday 2:15 PM', description: 'High engagement window' }
            ],
            proposalTweaks: lead.objection_patterns && lead.objection_patterns.length > 0 ? [
              { label: 'Address objections', description: `Counter: ${lead.objection_patterns[0]}` }
            ] : undefined
          }}
        />
      </div>
    </div>
  );
}
