import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeadCard } from '@/components/leads/LeadCard';
import { AILeadStatus } from '@/components/leads/AILeadStatus';
import { QuickOverviewCards } from '@/components/leads/QuickOverviewCards';
import { PriorityAlerts } from '@/components/leads/PriorityAlerts';
import { RecentActivityFeed } from '@/components/leads/RecentActivityFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { Search, Filter, Download, Users, Sparkles, Upload, LayoutList, FileSpreadsheet } from 'lucide-react';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { ImportLeadsDialog } from '@/components/leads/ImportLeadsDialog';
import { ImportedLeadsTable } from '@/components/leads/ImportedLeadsTable';

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
  recording_id: string | null;
  engagement_score: number | null;
  key_quotes: any;
  agreed_next_steps: string[] | null;
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

// Demo data for showcasing AI capabilities
const DEMO_LEADS: Lead[] = [
  {
    id: 'demo-1',
    contact_name: 'Sarah Mitchell',
    company: 'TechFlow Solutions',
    title: 'VP of Sales',
    email: 'sarah@techflow.io',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    ai_confidence: 94,
    priority_score: 9.2,
    lead_status: 'qualified',
    primary_pain_point: 'Current tool requires 3 weeks of onboarding per rep',
    budget_info: '$50k-100k annual',
    timeline: '1-3 months',
    next_action: 'Schedule demo with procurement team',
    next_action_due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_hot_lead: true,
    urgency_level: 'high',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    call_duration_seconds: 1847,
    recording_id: null,
    engagement_score: 92,
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
    predicted_close_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    predicted_deal_value: 75000, ai_assisted: true
  },
  {
    id: 'demo-2',
    contact_name: 'Marcus Chen',
    company: 'CloudScale Inc',
    title: 'Director of Revenue Operations',
    email: 'mchen@cloudscale.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    ai_confidence: 78, priority_score: 7.8,
    lead_status: 'contacted',
    primary_pain_point: 'Spending 4 hours/week on call reviews manually',
    budget_info: 'Evaluating options', timeline: '3-6 months',
    next_action: 'Follow up on feature requirements',
    next_action_due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_hot_lead: false, urgency_level: 'medium',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
    predicted_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    predicted_deal_value: 45000, ai_assisted: true
  },
  {
    id: 'demo-3',
    contact_name: 'Emily Rodriguez',
    company: 'DataSync Pro',
    title: 'Head of Sales Enablement',
    email: 'emily.r@datasyncpro.com',
    phone: '+1 (555) 456-7890',
    location: 'New York, NY',
    ai_confidence: 88, priority_score: 8.5,
    lead_status: 'proposal',
    primary_pain_point: 'Junior reps taking 6 months to ramp',
    budget_info: '$30k-50k', timeline: 'immediate',
    next_action: 'Send customized proposal',
    next_action_due: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_hot_lead: true, urgency_level: 'high',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    predicted_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    predicted_deal_value: 42000, ai_assisted: true
  },
  {
    id: 'demo-4',
    contact_name: 'James Wilson',
    company: 'Velocity Partners',
    title: 'Sales Manager',
    email: 'jwilson@velocitypartners.com',
    phone: '+1 (555) 567-8901',
    location: 'Chicago, IL',
    ai_confidence: 65, priority_score: 6.2,
    lead_status: 'new',
    primary_pain_point: 'No visibility into rep call quality',
    budget_info: 'TBD', timeline: '6+ months',
    next_action: 'Discovery call to understand full needs',
    next_action_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_hot_lead: false, urgency_level: 'low',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    predicted_close_date: null, predicted_deal_value: 25000, ai_assisted: true
  }
];

const DEMO_ACTIVITIES = [
  {
    id: 'demo-act-1', type: 'ai_scored' as const,
    title: 'AI detected buying signal',
    description: 'Sarah Mitchell mentioned "budget is approved" - high intent detected',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    leadId: 'demo-1', confidence: 94
  },
  {
    id: 'demo-act-2', type: 'new_lead' as const,
    title: 'New hot lead: Sarah Mitchell (TechFlow)',
    description: 'VP of Sales looking for Gong alternative',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    leadId: 'demo-1', confidence: 94
  },
  {
    id: 'demo-act-3', type: 'ai_scored' as const,
    title: 'Lead score increased: Emily Rodriguez',
    description: 'Moved to Proposal stage, confidence up 12%',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    leadId: 'demo-3', confidence: 88
  },
  {
    id: 'demo-act-4', type: 'new_lead' as const,
    title: 'New lead: James Wilson (Velocity)',
    description: 'Sales Manager exploring call quality tools',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    leadId: 'demo-4', confidence: 65
  }
];

export default function Leads() {
  const { user } = useAuth();
  const { isManager, teamId } = useUserRole();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiActive, setAiActive] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [pendingCallLead, setPendingCallLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importRefreshKey, setImportRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    todaysLeads: 0, weeklyLeads: 0, conversionRate: 28, avgResponseTime: '1.2 hrs'
  });

  useEffect(() => {
    if (demoMode) {
      setLeads(DEMO_LEADS);
      setStats({ todaysLeads: 2, weeklyLeads: 4, conversionRate: 34, avgResponseTime: '0.8 hrs' });
      setLoading(false);
    } else {
      fetchLeads();
    }
  }, [user, demoMode]);

  const fetchLeads = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } else {
      setLeads(data || []);
      calculateStats(data || []);
    }
    setLoading(false);
  };

  const calculateStats = (leadsData: Lead[]) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const todaysLeads = leadsData.filter(l => new Date(l.created_at) >= today).length;
    const weeklyLeads = leadsData.filter(l => new Date(l.created_at) >= weekAgo).length;
    setStats({ todaysLeads, weeklyLeads, conversionRate: 28, avgResponseTime: '1.2 hrs' });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hotLeads = leads.filter(l => l.is_hot_lead).length;
  const pendingFollowups = leads.filter(l => l.next_action_due && new Date(l.next_action_due) <= new Date()).length;

  const recentActivities = demoMode
    ? DEMO_ACTIVITIES
    : leads.slice(0, 5).map(lead => ({
        id: lead.id, type: 'new_lead' as const,
        title: `New lead: ${lead.contact_name}${lead.company ? ` (${lead.company})` : ''}`,
        description: lead.primary_pain_point || 'Contact captured from call',
        timestamp: lead.created_at, leadId: lead.id,
        confidence: lead.ai_confidence || undefined
      }));

  const alerts = [
    ...(pendingFollowups > 0 ? [{ id: '1', type: 'urgent_followup' as const, title: 'Urgent Follow-ups', count: pendingFollowups, description: 'Waiting for response' }] : []),
    ...(hotLeads > 0 ? [{ id: '2', type: 'high_score' as const, title: 'High-Score Leads', count: hotLeads, description: '>90% confidence' }] : [])
  ];

  const handleCall = (lead: Lead) => {
    if (demoMode) { toast.info('Demo mode: Call action simulated'); return; }
    if (lead.phone) { setPendingCallLead(lead); setShowCallDialog(true); }
    else toast.error('No phone number available');
  };

  const handleStartCall = (phoneNumber: string) => {
    setShowCallDialog(false); setActiveCall(phoneNumber); setPendingCallLead(null);
  };

  const handleEmail = (lead: Lead) => {
    if (demoMode) { toast.info('Demo mode: Email action simulated'); return; }
    if (lead.email) window.location.href = `mailto:${lead.email}`;
    else toast.error('No email available');
  };

  const handleViewSummary = (lead: Lead) => {
    if (demoMode) { toast.info('Demo mode: This would show the AI call summary'); return; }
    if (lead.recording_id) navigate(`/recording/${lead.recording_id}`);
    else toast.info('No recording associated with this lead');
  };

  const handleSchedule = (lead: Lead) => {
    if (demoMode) { toast.info('Demo mode: Schedule action simulated'); return; }
    navigate('/schedule');
  };

  const handleToggleDemo = () => {
    setDemoMode(!demoMode);
    if (!demoMode) toast.success('Demo mode enabled - showing sample AI-generated leads');
    else toast('Demo mode disabled', { description: 'Showing your actual leads' });
  };

  return (
    <>
      {activeCall && <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />}
      <CallDialog open={showCallDialog} onOpenChange={setShowCallDialog} onStartCall={handleStartCall} />
      <ImportLeadsDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={() => setImportRefreshKey(k => k + 1)}
      />

      <DashboardLayout>
        <div className="space-y-5 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Leads</h1>
              <p className="text-sm text-muted-foreground mt-1">AI-powered lead generation and management</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                <Sparkles className={`h-4 w-4 ${demoMode ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor="demo-mode" className="text-sm font-medium cursor-pointer">Demo</Label>
                <Switch id="demo-mode" checked={demoMode} onCheckedChange={handleToggleDemo} />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import Leads</span>
              </Button>
              <AddLeadDialog onLeadAdded={fetchLeads} />
            </div>
          </div>

          {/* Demo Mode Banner */}
          {demoMode && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Demo Mode Active</p>
                <p className="text-xs text-muted-foreground">Showing sample AI-generated leads to demonstrate capabilities.</p>
              </div>
            </div>
          )}

          {/* Sub-Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="gap-2">
                <LayoutList className="h-4 w-4" />
                All Leads
              </TabsTrigger>
              <TabsTrigger value="imported" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Imported Leads
              </TabsTrigger>
            </TabsList>

            {/* All Leads Tab */}
            <TabsContent value="all" className="space-y-5 mt-4">
              <AILeadStatus
                isActive={aiActive}
                todaysLeads={stats.todaysLeads}
                weeklyLeads={stats.weeklyLeads}
                conversionRate={stats.conversionRate}
                avgResponseTime={stats.avgResponseTime}
                onToggleAI={() => setAiActive(!aiActive)}
              />

              <QuickOverviewCards
                newLeadsToday={stats.todaysLeads}
                pendingFollowups={pendingFollowups}
                hotLeads={hotLeads}
                recentCalls={leads.filter(l => l.call_duration_seconds).length}
              />

              {alerts.length > 0 && (
                <PriorityAlerts
                  alerts={alerts}
                  onAlertClick={(alert) => toast.info(`Viewing ${alert.title}`)}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leads</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="card-gradient rounded-xl border border-border/50 p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No leads yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {demoMode ? 'No demo leads match your filters' : 'Leads will appear here as the AI captures them from your calls'}
                      </p>
                      {!demoMode && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={() => navigate('/dashboard')}>Start Recording</Button>
                          <Button variant="outline" onClick={handleToggleDemo} className="gap-2">
                            <Sparkles className="h-4 w-4" />Try Demo Mode
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onCall={handleCall}
                          onEmail={handleEmail}
                          onViewSummary={handleViewSummary}
                          onSchedule={handleSchedule}
                          onLeadUpdated={(updatedLead: any) => {
                            if (!demoMode) setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l));
                          }}
                          isManager={isManager}
                          teamId={teamId}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <RecentActivityFeed
                    activities={recentActivities}
                    onViewLead={(id) => toast.info(`Viewing lead ${id}`)}
                    onViewSummary={(id) => {
                      if (demoMode) { toast.info('Demo mode: This would show the call summary'); return; }
                      const lead = leads.find(l => l.id === id);
                      if (lead?.recording_id) navigate(`/recording/${lead.recording_id}`);
                    }}
                    onCallNow={(id) => { const lead = leads.find(l => l.id === id); if (lead) handleCall(lead); }}
                    onSchedule={() => {
                      if (demoMode) { toast.info('Demo mode: Schedule action simulated'); return; }
                      navigate('/schedule');
                    }}
                    onEmail={(id) => { const lead = leads.find(l => l.id === id); if (lead) handleEmail(lead); }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Imported Leads Tab */}
            <TabsContent value="imported" className="mt-4">
              <ImportedLeadsTable refreshKey={importRefreshKey} />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
