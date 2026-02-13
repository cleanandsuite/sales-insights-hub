export interface BuyingSignal {
  id: string;
  type: 'budget_confirmed' | 'timeline_set' | 'decision_maker_engaged' | 'champion_identified' | 'pain_point_validated' | 'competitor_displaced' | 'executive_sponsor' | 'technical_approval';
  label: string;
  detectedAt: Date;
  callId: string;
}

export interface Objection {
  id: string;
  text: string;
  suggestedResponse: string;
  detectedAt: Date;
  callId: string;
  resolved: boolean;
}

export interface CallRecord {
  id: string;
  date: Date;
  duration: number; // seconds
  score: number; // 0-100
  summary: string;
  outcome: 'positive' | 'neutral' | 'negative';
  buyingSignals: string[];
  objections: string[];
  contactName: string;
}

export type DealStage = 'lead' | 'qualified' | 'demo' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type HealthStatus = 'at_risk' | 'monitor' | 'on_track';

export interface Deal {
  id: string;
  name: string;
  company: string;
  contactName: string;
  contactEmail: string;
  value: number;
  currency: string;
  stage: DealStage;
  healthScore: number; // 0-100
  healthStatus: HealthStatus;
  owner: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
  lastCallDate: Date | null;
  lastCallSummary: string | null;
  daysSinceLastCall: number;
  nextAction: string | null;
  nextActionDueDate: Date | null;
  buyingSignals: BuyingSignal[];
  objections: Objection[];
  competitorMentions: string[];
  calls: CallRecord[];
}

export interface HealthBreakdown {
  lastCallDays: { value: number; impact: number };
  unresolvedObjections: { count: number; impact: number };
  buyingSignals: { count: number; impact: number };
  stageStalledDays: { value: number; impact: number };
  sentimentTrend: { trend: 'up' | 'down' | 'stable'; impact: number };
}

export interface CallActivity {
  id: string;
  date: Date;
  duration: number;
  score: number;
  contactName: string;
  company: string;
  dealId: string | null;
  dealName: string | null;
  userId: string;
  userName: string;
  summary: string;
  buyingSignals: string[];
  objections: { text: string; suggestedResponse: string }[];
  competitorMentions: string[];
  outcome: 'positive' | 'neutral' | 'negative';
  nextSteps: string;
}

export interface PipelineSummary {
  atRiskCount: number;
  atRiskValue: number;
  monitorCount: number;
  monitorValue: number;
  onTrackCount: number;
  onTrackValue: number;
  totalValue: number;
  totalDeals: number;
}

export const STAGE_LABELS: Record<DealStage, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  demo: 'Demo',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export const STAGE_ORDER: DealStage[] = ['lead', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export const BUYING_SIGNAL_LABELS: Record<string, string> = {
  budget_confirmed: 'Budget Confirmed',
  timeline_set: 'Timeline Set',
  decision_maker_engaged: 'Decision Maker Engaged',
  champion_identified: 'Champion Identified',
  pain_point_validated: 'Pain Point Validated',
  competitor_displaced: 'Competitor Displaced',
  executive_sponsor: 'Executive Sponsor',
  technical_approval: 'Technical Approval',
};
