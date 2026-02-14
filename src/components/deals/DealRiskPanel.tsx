import { useMemo } from 'react';
import { Deal } from '@/types/deals';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Phone,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';

// Risk signal types
export type RiskSignal = {
  id: string;
  type: 'no_contact' | 'negative_sentiment' | 'deal_stalled' | 'budget_concerns' | 'objections_unresolved';
  label: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact: number;
};

// Risk recommendation
export type RiskRecommendation = {
  id: string;
  action: string;
  priority: 'urgent' | 'high' | 'medium';
  dealId: string;
  dealName: string;
};

// Risk analysis result for a single deal
export interface DealRiskAnalysis {
  deal: Deal;
  riskScore: number;
  signals: RiskSignal[];
  recommendations: RiskRecommendation[];
  daysSinceLastContact: number;
  sentimentTrend: 'down' | 'stable' | 'up';
  stageStalledDays: number;
}

// Configuration for risk detection thresholds
interface RiskThresholds {
  noContactDays: number;
  stageStalledDays: number;
  sentimentWeight: number;
}

const DEFAULT_THRESHOLDS: RiskThresholds = {
  noContactDays: 7,
  stageStalledDays: 14,
  sentimentWeight: 20,
};

// Analyze a single deal for risk
function analyzeDealRisk(deal: Deal, thresholds: RiskThresholds = DEFAULT_THRESHOLDS): DealRiskAnalysis {
  const signals: RiskSignal[] = [];
  const recommendations: RiskRecommendation[] = [];
  
  // Calculate days since last contact
  const daysSinceLastContact = deal.daysSinceLastCall;
  
  // Analyze sentiment trend from recent calls
  const recentCalls = deal.calls.slice(0, 3);
 sentimentScores  const = recentCalls.map(call => {
    if (call.outcome === 'negative') return 0;
    if (call.outcome === 'neutral') return 50;
    return 100;
  });
  
  const avgSentiment = sentimentScores.length > 0
    ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
    : 50;
  
  const sentimentTrend: 'down' | 'stable' | 'up' = recentCalls.length >= 2
    ? (sentimentScores[0] < sentimentScores[sentimentScores.length - 1] ? 'down' : 'up')
    : avgSentiment < 50 ? 'down' : 'stable';
  
  // Calculate stage stalled days
  const stageStalledDays = Math.floor(
    (new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Risk 1: No contact in X days
  if (daysSinceLastContact > thresholds.noContactDays) {
    const severity = daysSinceLastContact > thresholds.noContactDays * 2 ? 'high' : 'medium';
    signals.push({
      id: `no-contact-${deal.id}`,
      type: 'no_contact',
      label: 'No Recent Contact',
      description: `No contact for ${daysSinceLastContact} days (threshold: ${thresholds.noContactDays})`,
      severity,
      impact: severity === 'high' ? 30 : 15,
    });
    
    recommendations.push({
      id: `rec-contact-${deal.id}`,
      action: `Schedule a call with ${deal.contactName}`,
      priority: severity === 'high' ? 'urgent' : 'high',
      dealId: deal.id,
      dealName: deal.name,
    });
  }
  
  // Risk 2: Negative sentiment trend
  if (sentimentTrend === 'down' || (recentCalls.length > 0 && recentCalls[0].outcome === 'negative')) {
    signals.push({
      id: `sentiment-${deal.id}`,
      type: 'negative_sentiment',
      label: 'Negative Sentiment',
      description: recentCalls[0]?.summary || 'Recent calls showing negative outcomes',
      severity: 'high',
      impact: thresholds.sentimentWeight,
    });
    
    recommendations.push({
      id: `rec-sentiment-${deal.id}`,
      action: 'Review call notes and address concerns raised',
      priority: 'urgent',
      dealId: deal.id,
      dealName: deal.name,
    });
  }
  
  // Risk 3: Deal stalled (no stage change)
  if (stageStalledDays > thresholds.stageStalledDays && !['closed_won', 'closed_lost'].includes(deal.stage)) {
    const severity = stageStalledDays > thresholds.stageStalledDays * 2 ? 'high' : 'medium';
    signals.push({
      id: `stalled-${deal.id}`,
      type: 'deal_stalled',
      label: 'Deal Stalled',
      description: `No stage change for ${stageStalledDays} days`,
      severity,
      impact: severity === 'high' ? 25 : 15,
    });
    
    recommendations.push({
      id: `rec-stalled-${deal.id}`,
      action: 'Identify blockers and propose next steps',
      priority: severity === 'high' ? 'urgent' : 'high',
      dealId: deal.id,
      dealName: deal.name,
    });
  }
  
  // Risk 4: Budget concerns mentioned
  const budgetKeywords = ['budget', 'price', 'cost', 'expensive', 'afford', ' ROI ', 'roi', 'payment', 'invoice', 'discount'];
  const hasBudgetConcerns = 
    deal.objections.some(o => !o.resolved && budgetKeywords.some(k => o.text.toLowerCase().includes(k))) ||
    deal.calls.some(c => c.summary && budgetKeywords.some(k => c.summary.toLowerCase().includes(k)));
  
  if (hasBudgetConcerns) {
    signals.push({
      id: `budget-${deal.id}`,
      type: 'budget_concerns',
      label: 'Budget Concerns',
      description: 'Budget or pricing concerns detected in recent interactions',
      severity: 'medium',
      impact: 15,
    });
    
    recommendations.push({
      id: `rec-budget-${deal.id}`,
      action: 'Discuss pricing options or ROI value proposition',
      priority: 'high',
      dealId: deal.id,
      dealName: deal.name,
    });
  }
  
  // Risk 5: Unresolved objections
  const unresolvedObjections = deal.objections.filter(o => !o.resolved);
  if (unresolvedObjections.length >= 2) {
    const severity = unresolvedObjections.length >= 3 ? 'high' : 'medium';
    signals.push({
      id: `objections-${deal.id}`,
      type: 'objections_unresolved',
      label: 'Unresolved Objections',
      description: `${unresolvedObjections.length} unresolved objections`,
      severity,
      impact: severity === 'high' ? 20 : 10,
    });
    
    recommendations.push({
      id: `rec-objections-${deal.id}`,
      action: `Address ${unresolvedObjections.length} unresolved objections`,
      priority: severity === 'high' ? 'urgent' : 'high',
      dealId: deal.id,
      dealName: deal.name,
    });
  }
  
  // Calculate total risk score (capped at 100)
  const totalImpact = signals.reduce((sum, s) => sum + s.impact, 0);
  const riskScore = Math.min(100, totalImpact);
  
  return {
    deal,
    riskScore,
    signals,
    recommendations,
    daysSinceLastContact,
    sentimentTrend,
    stageStalledDays,
  };
}

// Props for DealRiskPanel
interface DealRiskPanelProps {
  deals: Deal[];
  thresholds?: RiskThresholds;
  onDealClick?: (deal: Deal) => void;
  onActionClick?: (recommendation: RiskRecommendation) => void;
  maxDeals?: number;
}

export function DealRiskPanel({
  deals,
  thresholds = DEFAULT_THRESHOLDS,
  onDealClick,
  onActionClick,
  maxDeals = 10,
}: DealRiskPanelProps) {
  // Analyze all deals and filter to at-risk ones
  const riskAnalyses = useMemo(() => {
    return deals
      .map(deal => analyzeDealRisk(deal, thresholds))
      .filter(analysis => analysis.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, maxDeals);
  }, [deals, thresholds, maxDeals]);
  
  // Calculate summary stats
  const summary = useMemo(() => {
    const highRisk = riskAnalyses.filter(a => a.riskScore >= 70).length;
    const mediumRisk = riskAnalyses.filter(a => a.riskScore >= 40 && a.riskScore < 70).length;
    const lowRisk = riskAnalyses.filter(a => a.riskScore < 40).length;
    const totalValue = riskAnalyses.reduce((sum, a) => sum + a.deal.value, 0);
    
    return { highRisk, mediumRisk, lowRisk, totalValue };
  }, [riskAnalyses]);
  
  // Helper to get risk level color
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-yellow-600';
    return 'text-muted-foreground';
  };
  
  // Helper to get severity badge
  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'High', class: 'bg-destructive/10 text-destructive border-destructive/30' },
      medium: { label: 'Medium', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
      low: { label: 'Low', class: 'bg-muted text-muted-foreground border-muted' },
    };
    return config[severity];
  };
  
  // Helper to get priority badge
  const getPriorityBadge = (priority: 'urgent' | 'high' | 'medium') => {
    const config = {
      urgent: { label: 'Urgent', class: 'bg-destructive/10 text-destructive border-destructive/30' },
      high: { label: 'High', class: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
      medium: { label: 'Medium', class: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    };
    return config[priority];
  };
  
  // Format currency
  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  if (riskAnalyses.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Deal Health Check</h3>
            <p className="text-sm text-muted-foreground">All deals look healthy!</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          No at-risk deals detected. Keep up the great work!
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Deal Risk Detection</h3>
              <p className="text-sm text-muted-foreground">
                {riskAnalyses.length} at-risk deal{riskAnalyses.length !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          </div>
          
          {/* Summary badges */}
          <div className="flex items-center gap-2">
            {summary.highRisk > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                {summary.highRisk} High Risk
              </Badge>
            )}
            {summary.mediumRisk > 0 && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                {summary.mediumRisk} Medium
              </Badge>
            )}
            <Badge variant="outline">
              {formatCurrency(summary.totalValue)} at risk
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Risk List */}
      <div className="divide-y">
        {riskAnalyses.map((analysis) => (
          <div
            key={analysis.deal.id}
            className="p-4 hover:bg-muted/20 transition-colors"
          >
            {/* Deal Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDealClick?.(analysis.deal)}
                    className="font-medium text-foreground hover:text-primary hover:underline text-left truncate"
                  >
                    {analysis.deal.name}
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {analysis.deal.company}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatCurrency(analysis.deal.value, analysis.deal.currency)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {analysis.deal.stage}
                  </span>
                </div>
              </div>
              
              {/* Risk Score */}
              <div className="text-right flex-shrink-0">
                <div className={cn('text-2xl font-bold', getRiskColor(analysis.riskScore))}>
                  {analysis.riskScore}
                </div>
                <div className="text-xs text-muted-foreground">Risk Score</div>
              </div>
            </div>
            
            {/* Signals */}
            {analysis.signals.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {analysis.signals.map((signal) => {
                  const badge = getSeverityBadge(signal.severity);
                  const icon = {
                    no_contact: Phone,
                    negative_sentiment: TrendingDown,
                    deal_stalled: Clock,
                    budget_concerns: DollarSign,
                    objections_unresolved: AlertCircle,
                  }[signal.type];
                  const Icon = icon;
                  
                  return (
                    <Badge
                      key={signal.id}
                      variant="outline"
                      className={cn('flex items-center gap-1', badge.class)}
                    >
                      <Icon className="h-3 w-3" />
                      {signal.label}
                    </Badge>
                  );
                })}
              </div>
            )}
            
            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recommended Actions
                </p>
                {analysis.recommendations.map((rec) => {
                  const badge = getPriorityBadge(rec.priority);
                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{rec.action}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={cn('text-xs', badge.class)}>
                          {badge.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => onActionClick?.(rec)}
                        >
                          Take Action
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      {deals.length > maxDeals && (
        <div className="p-3 border-t bg-muted/30 text-center">
          <Button variant="ghost" size="sm">
            View all {deals.length} deals
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Export analysis function for use elsewhere
export { analyzeDealRisk, DEFAULT_THRESHOLDS };
export type { RiskThresholds };
