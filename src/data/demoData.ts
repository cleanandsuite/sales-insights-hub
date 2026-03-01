// ─── Pinnacle Software: Unified Demo Data ───
// Mid-market B2B SaaS selling project management tools
// 12-person sales team, $4.2M pipeline, targeting mid-market

// ──── Leads ────
export const demoLeads = [
  {
    id: 'demo-1', contact_name: 'Sarah Mitchell', company: 'TechFlow Solutions',
    title: 'VP of Sales', email: 'sarah@techflow.io', phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA', ai_confidence: 94, priority_score: 9.2,
    lead_status: 'qualified', primary_pain_point: 'Current tool requires 3 weeks of onboarding per rep',
    budget_info: '$50k-100k annual', timeline: '1-3 months',
    next_action: 'Schedule demo with procurement team',
    next_action_due: new Date(Date.now() + 2 * 86400000).toISOString(),
    is_hot_lead: true, urgency_level: 'high',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    call_duration_seconds: 1847, recording_id: null, engagement_score: 92,
    key_quotes: ['"We need something our reps can use on day one"', '"Budget is approved, just need to finalize vendor"'],
    agreed_next_steps: ['Send ROI calculator', 'Schedule procurement call Thursday'],
    bant_budget: 85, bant_authority: 95, bant_need: 90, bant_timeline: 80,
    sentiment_trend: [{ score: 0.7 }, { score: 0.8 }, { score: 0.9 }],
    objection_patterns: ['Integration complexity'],
    next_best_actions: [
      { action: 'Send case study from similar company', priority: 'high', reason: 'Address integration concerns' },
      { action: 'Prepare ROI comparison vs current tool', priority: 'medium', reason: 'Budget justification' }
    ],
    risk_level: 'low', deal_velocity_days: 14,
    predicted_close_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    predicted_deal_value: 75000, ai_assisted: true,
  },
  {
    id: 'demo-2', contact_name: 'Marcus Chen', company: 'CloudScale Inc',
    title: 'Director of Revenue Operations', email: 'mchen@cloudscale.com',
    phone: '+1 (555) 345-6789', location: 'Austin, TX',
    ai_confidence: 78, priority_score: 7.8, lead_status: 'contacted',
    primary_pain_point: 'Spending 4 hours/week on call reviews manually',
    budget_info: 'Evaluating options', timeline: '3-6 months',
    next_action: 'Follow up on feature requirements',
    next_action_due: new Date(Date.now() + 5 * 86400000).toISOString(),
    is_hot_lead: false, urgency_level: 'medium',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    call_duration_seconds: 1234, recording_id: null, engagement_score: 74,
    key_quotes: ['"Manual review is killing our productivity"'],
    agreed_next_steps: ['Send feature comparison doc'],
    bant_budget: 60, bant_authority: 70, bant_need: 85, bant_timeline: 50,
    sentiment_trend: [{ score: 0.6 }, { score: 0.7 }],
    objection_patterns: ['Timeline uncertainty', 'Need stakeholder buy-in'],
    next_best_actions: [
      { action: 'Identify additional stakeholders', priority: 'high', reason: 'Need multi-threading' },
    ],
    risk_level: 'medium', deal_velocity_days: 45,
    predicted_close_date: new Date(Date.now() + 60 * 86400000).toISOString(),
    predicted_deal_value: 45000, ai_assisted: true,
  },
  {
    id: 'demo-3', contact_name: 'Emily Rodriguez', company: 'DataSync Pro',
    title: 'Head of Sales Enablement', email: 'emily.r@datasyncpro.com',
    phone: '+1 (555) 456-7890', location: 'New York, NY',
    ai_confidence: 88, priority_score: 8.5, lead_status: 'proposal',
    primary_pain_point: 'Junior reps taking 6 months to ramp',
    budget_info: '$30k-50k', timeline: 'immediate',
    next_action: 'Send customized proposal',
    next_action_due: new Date(Date.now() + 1 * 86400000).toISOString(),
    is_hot_lead: true, urgency_level: 'high',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    call_duration_seconds: 2156, recording_id: null, engagement_score: 88,
    key_quotes: ['"We need to cut ramp time in half"'],
    agreed_next_steps: ['Finalize pricing', 'Set up pilot program'],
    bant_budget: 75, bant_authority: 80, bant_need: 95, bant_timeline: 90,
    sentiment_trend: [{ score: 0.75 }, { score: 0.85 }, { score: 0.88 }],
    objection_patterns: ['Needs CFO approval'],
    next_best_actions: [
      { action: 'Prepare CFO-ready ROI deck', priority: 'high', reason: 'CFO is key decision maker' },
    ],
    risk_level: 'low', deal_velocity_days: 21,
    predicted_close_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    predicted_deal_value: 42000, ai_assisted: true,
  },
  {
    id: 'demo-4', contact_name: 'James Wilson', company: 'Velocity Partners',
    title: 'Sales Manager', email: 'jwilson@velocitypartners.com',
    phone: '+1 (555) 567-8901', location: 'Chicago, IL',
    ai_confidence: 65, priority_score: 6.2, lead_status: 'new',
    primary_pain_point: 'No visibility into rep call quality',
    budget_info: 'TBD', timeline: '6+ months',
    next_action: 'Discovery call to understand full needs',
    next_action_due: new Date(Date.now() + 7 * 86400000).toISOString(),
    is_hot_lead: false, urgency_level: 'low',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    call_duration_seconds: 678, recording_id: null, engagement_score: 55,
    key_quotes: ['"Just exploring options for now"'],
    agreed_next_steps: ['Schedule deeper discovery'],
    bant_budget: 40, bant_authority: 55, bant_need: 70, bant_timeline: 30,
    sentiment_trend: [{ score: 0.5 }],
    objection_patterns: ['Early stage', 'No budget allocated'],
    next_best_actions: [
      { action: 'Nurture with educational content', priority: 'low', reason: 'Long sales cycle expected' }
    ],
    risk_level: 'high', deal_velocity_days: null,
    predicted_close_date: null, predicted_deal_value: 25000, ai_assisted: true,
  },
  {
    id: 'demo-5', contact_name: 'Lisa Park', company: 'Pinnacle Software',
    title: 'CTO', email: 'lpark@pinnaclesw.com',
    phone: '+1 (555) 678-9012', location: 'Seattle, WA',
    ai_confidence: 91, priority_score: 9.0, lead_status: 'qualified',
    primary_pain_point: 'Engineering team frustrated with current PM tools',
    budget_info: '$80k-120k', timeline: '1-2 months',
    next_action: 'Technical deep-dive with eng team',
    next_action_due: new Date(Date.now() + 3 * 86400000).toISOString(),
    is_hot_lead: true, urgency_level: 'high',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    call_duration_seconds: 2340, recording_id: null, engagement_score: 90,
    key_quotes: ['"Our devs are losing 2 hours a day to tool friction"'],
    agreed_next_steps: ['Schedule technical POC', 'Share API documentation'],
    bant_budget: 90, bant_authority: 85, bant_need: 95, bant_timeline: 85,
    sentiment_trend: [{ score: 0.8 }, { score: 0.88 }, { score: 0.91 }],
    objection_patterns: ['API compatibility'],
    next_best_actions: [
      { action: 'Prepare technical POC environment', priority: 'high', reason: 'CTO wants hands-on evaluation' },
    ],
    risk_level: 'low', deal_velocity_days: 18,
    predicted_close_date: new Date(Date.now() + 28 * 86400000).toISOString(),
    predicted_deal_value: 95000, ai_assisted: true,
  },
  {
    id: 'demo-6', contact_name: 'Robert Finch', company: 'Summit Financial',
    title: 'VP of Operations', email: 'rfinch@summitfin.com',
    phone: '+1 (555) 789-0123', location: 'Boston, MA',
    ai_confidence: 72, priority_score: 7.0, lead_status: 'contacted',
    primary_pain_point: 'Compliance concerns with current recording solution',
    budget_info: '$40k-60k', timeline: '3-6 months',
    next_action: 'Send compliance whitepaper',
    next_action_due: new Date(Date.now() + 4 * 86400000).toISOString(),
    is_hot_lead: false, urgency_level: 'medium',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    call_duration_seconds: 1456, recording_id: null, engagement_score: 68,
    key_quotes: ['"Compliance is non-negotiable for us"'],
    agreed_next_steps: ['Share SOC 2 documentation', 'Intro to security team'],
    bant_budget: 70, bant_authority: 65, bant_need: 80, bant_timeline: 55,
    sentiment_trend: [{ score: 0.55 }, { score: 0.65 }],
    objection_patterns: ['Security concerns', 'Need legal review'],
    next_best_actions: [
      { action: 'Schedule call with security team', priority: 'medium', reason: 'Compliance is top concern' },
    ],
    risk_level: 'medium', deal_velocity_days: 35,
    predicted_close_date: new Date(Date.now() + 45 * 86400000).toISOString(),
    predicted_deal_value: 52000, ai_assisted: true,
  },
];

// ──── Lead Activities ────
export const demoLeadActivities = [
  {
    id: 'demo-act-1', type: 'ai_scored' as const,
    title: 'AI detected buying signal',
    description: 'Sarah Mitchell mentioned "budget is approved" - high intent detected',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    leadId: 'demo-1', confidence: 94,
  },
  {
    id: 'demo-act-2', type: 'new_lead' as const,
    title: 'New hot lead: Lisa Park (Pinnacle Software)',
    description: 'CTO looking to replace current PM tools',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    leadId: 'demo-5', confidence: 91,
  },
  {
    id: 'demo-act-3', type: 'ai_scored' as const,
    title: 'Lead score increased: Emily Rodriguez',
    description: 'Moved to Proposal stage, confidence up 12%',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    leadId: 'demo-3', confidence: 88,
  },
  {
    id: 'demo-act-4', type: 'new_lead' as const,
    title: 'New lead: James Wilson (Velocity)',
    description: 'Sales Manager exploring call quality tools',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    leadId: 'demo-4', confidence: 65,
  },
];

// ──── Scheduled Calls ────
export const demoScheduledCalls = [
  {
    id: 'demo-sc-1', title: 'Technical Deep-Dive — Pinnacle Software',
    description: 'POC walkthrough with CTO and engineering lead', contact_name: 'Lisa Park',
    contact_email: 'lpark@pinnaclesw.com',
    scheduled_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    duration_minutes: 45, meeting_url: 'https://zoom.us/j/demo1', meeting_provider: 'zoom',
    status: 'scheduled', prep_notes: 'Prepare API demo. Have POC environment ready.',
  },
  {
    id: 'demo-sc-2', title: 'Discovery Call — TechFlow Solutions',
    description: 'Initial discovery with VP of Sales', contact_name: 'Sarah Mitchell',
    contact_email: 'sarah@techflow.io',
    scheduled_at: new Date(Date.now() + 26 * 3600000).toISOString(),
    duration_minutes: 30, meeting_url: null, meeting_provider: 'zoom',
    status: 'scheduled', prep_notes: 'Review their current tech stack. Prepare ROI comparison.',
  },
  {
    id: 'demo-sc-3', title: 'Proposal Review — DataSync Pro',
    description: 'Walk through customized proposal with CFO present', contact_name: 'Emily Rodriguez',
    contact_email: 'emily.r@datasyncpro.com',
    scheduled_at: new Date(Date.now() + 50 * 3600000).toISOString(),
    duration_minutes: 60, meeting_url: 'https://teams.microsoft.com/demo', meeting_provider: 'teams',
    status: 'scheduled', prep_notes: 'CFO-ready ROI deck. Pilot program details ready.',
  },
  {
    id: 'demo-sc-4', title: 'Follow-up — CloudScale Inc',
    description: 'Second call to discuss feature requirements', contact_name: 'Marcus Chen',
    contact_email: 'mchen@cloudscale.com',
    scheduled_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    duration_minutes: 45, meeting_url: null, meeting_provider: 'other',
    status: 'completed', prep_notes: 'Bring feature comparison doc. Address timeline concerns.',
  },
  {
    id: 'demo-sc-5', title: 'Compliance Review — Summit Financial',
    description: 'Security and compliance deep-dive', contact_name: 'Robert Finch',
    contact_email: 'rfinch@summitfin.com',
    scheduled_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    duration_minutes: 30, meeting_url: null, meeting_provider: 'other',
    status: 'completed', prep_notes: 'SOC 2 docs ready. Compliance whitepaper printed.',
  },
];

// ──── Recordings ────
export const demoRecordings = [
  {
    id: 'demo-rec-1', file_name: 'pinnacle-lisa-park-discovery.mp3',
    name: 'Discovery — Lisa Park (Pinnacle Software)', status: 'analyzed',
    sentiment_score: 0.91, duration_seconds: 2340,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    audio_url: null, key_topics: ['PM tools', 'API integration', 'engineering friction'],
    live_transcription: null, summary: 'Highly engaged CTO. Engineering team frustrated with current PM tools. Strong interest in API capabilities and technical POC.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-2', file_name: 'techflow-sarah-mitchell-intro.mp3',
    name: 'Intro Call — Sarah Mitchell (TechFlow)', status: 'analyzed',
    sentiment_score: 0.85, duration_seconds: 1847,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    audio_url: null, key_topics: ['onboarding', 'ROI', 'vendor selection'],
    live_transcription: null, summary: 'VP of Sales at TechFlow exploring alternatives. Budget approved, evaluating 3 vendors. Key concern: onboarding speed.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-3', file_name: 'datasync-emily-proposal.mp3',
    name: 'Proposal Walkthrough — Emily Rodriguez', status: 'analyzed',
    sentiment_score: 0.88, duration_seconds: 2156,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    audio_url: null, key_topics: ['ramp time', 'pricing', 'pilot program'],
    live_transcription: null, summary: 'Emily wants to cut rep ramp time in half. Needs CFO sign-off. Proposed pilot program for Q2.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-4', file_name: 'cloudscale-marcus-followup.mp3',
    name: 'Follow-up — Marcus Chen (CloudScale)', status: 'analyzed',
    sentiment_score: 0.72, duration_seconds: 1234,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    audio_url: null, key_topics: ['manual reviews', 'stakeholder alignment', 'timeline'],
    live_transcription: null, summary: 'Marcus concerned about manual call review overhead. Needs to align internal stakeholders before moving forward.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-5', file_name: 'velocity-james-discovery.mp3',
    name: 'Discovery — James Wilson (Velocity)', status: 'analyzed',
    sentiment_score: 0.55, duration_seconds: 678,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    audio_url: null, key_topics: ['call quality', 'visibility', 'early stage'],
    live_transcription: null, summary: 'Early-stage exploration. No allocated budget yet. Interested in call quality analytics.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-6', file_name: 'summit-robert-compliance.mp3',
    name: 'Compliance Review — Robert Finch (Summit)', status: 'analyzed',
    sentiment_score: 0.68, duration_seconds: 1456,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    audio_url: null, key_topics: ['compliance', 'SOC 2', 'data residency'],
    live_transcription: null, summary: 'Robert focused on compliance and security requirements. Needs SOC 2 Type II report and data residency options.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-7', file_name: 'pinnacle-lisa-technical-poc.mp3',
    name: 'Technical POC — Lisa Park (Pinnacle)', status: 'analyzed',
    sentiment_score: 0.93, duration_seconds: 2780,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    audio_url: null, key_topics: ['API demo', 'integration', 'team adoption'],
    live_transcription: null, summary: 'Extremely positive POC session. Lisa impressed with API speed. Engineering team asked about webhook support.',
    deleted_at: null,
  },
  {
    id: 'demo-rec-8', file_name: 'techflow-sarah-procurement.mp3',
    name: 'Procurement Call — Sarah Mitchell (TechFlow)', status: 'pending',
    sentiment_score: null, duration_seconds: 890,
    created_at: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    audio_url: null, key_topics: null,
    live_transcription: null, summary: null,
    deleted_at: null,
  },
];

// ──── Dashboard KPIs ────
export const demoKPIs = {
  callsToday: 4,
  callsWeek: 12,
  avgScore: 78,
};

// ──── Activity Feed (for Dashboard) ────
export const demoActivityFeed = demoRecordings
  .filter(r => r.status === 'analyzed')
  .map(r => ({
    id: r.id,
    name: r.name,
    file_name: r.file_name,
    summary: r.summary,
    sentiment_score: r.sentiment_score,
    duration_seconds: r.duration_seconds,
    status: r.status,
    created_at: r.created_at,
    key_topics: r.key_topics,
  }));

// ──── Analytics Demo Data ────
export const demoAnalyticsData = {
  callsOverTime: [
    { date: 'Mon', count: 3 }, { date: 'Tue', count: 5 }, { date: 'Wed', count: 2 },
    { date: 'Thu', count: 4 }, { date: 'Fri', count: 6 }, { date: 'Sat', count: 1 },
    { date: 'Sun', count: 0 },
  ],
  talkRatio: { you: 42, them: 58, isOptimal: true },
  scoreDistribution: [
    { range: '0-20', count: 0 }, { range: '21-40', count: 1 }, { range: '41-60', count: 2 },
    { range: '61-80', count: 4 }, { range: '81-100', count: 3 },
  ],
  topPatterns: [
    { pattern: 'Open-ended discovery questions', count: 6, successRate: 87 },
    { pattern: 'Pain point acknowledgment', count: 5, successRate: 82 },
    { pattern: 'ROI-focused positioning', count: 4, successRate: 78 },
  ],
  improvementAreas: [
    { area: 'Closing techniques', score: 62, change: 5, suggestion: 'Try the assumptive close' },
    { area: 'Objection handling', score: 68, change: -2, suggestion: 'Use feel-felt-found framework' },
  ],
  competitorMentions: [
    { name: 'Gong', count: 3, sentiment: 'neutral' },
    { name: 'Chorus', count: 2, sentiment: 'negative' },
    { name: 'Outreach', count: 1, sentiment: 'positive' },
  ],
  currentSkills: { rapport: 82, discovery: 78, presentation: 71, objectionHandling: 68, closing: 62 },
  previousSkills: { rapport: 78, discovery: 72, presentation: 68, objectionHandling: 65, closing: 58 },
  skillTrends: [
    { date: 'W1', rapport: 72, discovery: 65, presentation: 60, objectionHandling: 58, closing: 52 },
    { date: 'W2', rapport: 75, discovery: 68, presentation: 63, objectionHandling: 60, closing: 55 },
    { date: 'W3', rapport: 78, discovery: 72, presentation: 68, objectionHandling: 65, closing: 58 },
    { date: 'W4', rapport: 82, discovery: 78, presentation: 71, objectionHandling: 68, closing: 62 },
  ],
  callsByTimeSlot: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: i >= 9 && i <= 17 ? Math.floor(Math.random() * 5) + 1 : 0,
  })),
  totalCalls: 12,
  avgScore: 78,
  avgDuration: 1713,
  totalRecordingMinutes: 342,
  longestStreak: 5,
};

// ──── Coaching Demo Data ────
export const demoCoachingSkills = [
  { name: 'Rapport', current: 82, previous: 78, trend: 'up' as const },
  { name: 'Discovery', current: 78, previous: 72, trend: 'up' as const },
  { name: 'Presentation', current: 71, previous: 68, trend: 'up' as const },
  { name: 'Objection Handling', current: 68, previous: 65, trend: 'up' as const },
  { name: 'Closing', current: 62, previous: 58, trend: 'up' as const },
];

export const demoCoachingRecommendations = [
  { id: '1', skill_area: 'closing', recommendation: 'Practice the assumptive close with Pinnacle Software — Lisa is ready to buy', resource_url: null, resource_type: 'practice', is_completed: false },
  { id: '2', skill_area: 'objection_handling', recommendation: 'Use "feel, felt, found" when Summit Financial raises compliance concerns', resource_url: null, resource_type: 'article', is_completed: false },
  { id: '3', skill_area: 'discovery', recommendation: 'Ask more SPIN-style situation questions with new leads like James Wilson', resource_url: null, resource_type: 'practice', is_completed: false },
];

// ──── Coaching Queue Demo Data ────
export const demoCoachingAssignments = [
  {
    id: 'demo-ca-1',
    coaching_type: 'objection_handling',
    priority: 'high' as const,
    reason: "Review Lisa Park's objection handling — she raised API compatibility concerns during POC",
    status: 'pending',
    notes: 'Focus on technical objection reframing techniques',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assigned_by_name: 'Manager',
    assigned_by_avatar: undefined,
  },
  {
    id: 'demo-ca-2',
    coaching_type: 'high_stakes_closer',
    priority: 'critical' as const,
    reason: 'Complete closing technique training before the DataSync Pro proposal review with CFO',
    status: 'in_progress',
    notes: 'Emily Rodriguez deal is worth $42k — needs strong close',
    due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    assigned_by_name: 'Sales Director',
    assigned_by_avatar: undefined,
  },
  {
    id: 'demo-ca-3',
    coaching_type: 'discovery_booker',
    priority: 'medium' as const,
    reason: 'Improve discovery call structure — James Wilson call was too short (11 min)',
    status: 'pending',
    notes: null,
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    assigned_by_name: 'Manager',
    assigned_by_avatar: undefined,
  },
];

// ──── AI Coaching Analytics Demo Data ────
export const demoROIMetrics = {
  aiAssistedWinRate: 68,
  nonAiWinRate: 42,
  avgVelocityWithAi: 18,
  avgVelocityWithoutAi: 32,
  avgDealSizeWithAi: 72000,
  avgDealSizeWithoutAi: 48000,
  totalSuggestions: 47,
  appliedSuggestions: 34,
  positiveOutcomes: 28,
};

export const demoTopSuggestions = [
  { text: 'objection_handling', applied: 12, positive: 10, effectiveness: 83 },
  { text: 'discovery', applied: 9, positive: 7, effectiveness: 78 },
  { text: 'closing', applied: 8, positive: 6, effectiveness: 75 },
  { text: 'rapport_building', applied: 5, positive: 5, effectiveness: 100 },
];

export const demoRiskAlerts = [
  {
    id: 'demo-4',
    contact_name: 'James Wilson',
    company: 'Velocity Partners',
    risk_level: 'high',
    predicted_close_date: null,
    ai_confidence: 65,
  },
  {
    id: 'demo-6',
    contact_name: 'Robert Finch',
    company: 'Summit Financial',
    risk_level: 'high',
    predicted_close_date: new Date(Date.now() + 45 * 86400000).toISOString(),
    ai_confidence: 72,
  },
];
