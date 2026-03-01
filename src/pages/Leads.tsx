import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeadCard } from '@/components/leads/LeadCard';
import { AILeadStatus } from '@/components/leads/AILeadStatus';

import { PriorityAlerts } from '@/components/leads/PriorityAlerts';
import { RecentActivityFeed } from '@/components/leads/RecentActivityFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useDemoMode } from '@/hooks/useDemoMode';
import { demoLeads, demoLeadActivities } from '@/data/demoData';

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
// Demo data now comes from centralized demoData.ts

export default function Leads() {
  const { user } = useAuth();
  const { isManager, teamId } = useUserRole();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiActive, setAiActive] = useState(true);
  const { isDemoMode: demoMode } = useDemoMode();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeCallName, setActiveCallName] = useState<string | undefined>(undefined);
  const [pendingCallLead, setPendingCallLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importRefreshKey, setImportRefreshKey] = useState(0);
  // For imported leads call-next flow
  const [importedLeadsList, setImportedLeadsList] = useState<any[]>([]);
  const [currentImportedLeadIndex, setCurrentImportedLeadIndex] = useState(-1);
  const [activeLeadContext, setActiveLeadContext] = useState<any>(null);
  const [stats, setStats] = useState({
    todaysLeads: 0, weeklyLeads: 0, conversionRate: 28, avgResponseTime: '1.2 hrs'
  });

  useEffect(() => {
    if (demoMode) {
      setLeads(demoLeads as Lead[]);
      setStats({ todaysLeads: 2, weeklyLeads: 6, conversionRate: 34, avgResponseTime: '0.8 hrs' });
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
    ? demoLeadActivities
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

  const handleStartCall = (phoneNumber: string, callName?: string) => {
    setShowCallDialog(false); setActiveCall(phoneNumber); setActiveCallName(callName); setPendingCallLead(null);
  };

  const handleStartCallWithImportedLead = (lead: any, allLeads: any[]) => {
    if (!lead.phone_number) {
      toast.error('No phone number for this lead. Add a phone number first.');
      return;
    }
    setImportedLeadsList(allLeads.filter((l: any) => l.phone_number));
    const idx = allLeads.findIndex((l: any) => l.id === lead.id);
    setCurrentImportedLeadIndex(idx >= 0 ? idx : 0);
    setActiveCall(lead.phone_number);
    setActiveCallName(lead.contact_name);
    setActiveLeadContext({
      contact_name: lead.contact_name,
      business: lead.business,
      location: lead.location,
      lead_type: lead.lead_type,
      pain_point: lead.pain_point,
      previous_rep: lead.previous_rep,
      notes: lead.notes,
      contact_date: lead.contact_date,
      phone_number: lead.phone_number,
    });
  };

  const handleCallNextLead = () => {
    const nextIdx = currentImportedLeadIndex + 1;
    if (nextIdx < importedLeadsList.length) {
      const nextLead = importedLeadsList[nextIdx];
      setCurrentImportedLeadIndex(nextIdx);
      setActiveCall(nextLead.phone_number);
      setActiveCallName(nextLead.contact_name);
      setActiveLeadContext({
        contact_name: nextLead.contact_name,
        business: nextLead.business,
        location: nextLead.location,
        lead_type: nextLead.lead_type,
        pain_point: nextLead.pain_point,
        previous_rep: nextLead.previous_rep,
        notes: nextLead.notes,
        contact_date: nextLead.contact_date,
        phone_number: nextLead.phone_number,
      });
    } else {
      toast.info('No more leads in the list');
      setActiveCall(null);
      setActiveCallName(undefined);
      setImportedLeadsList([]);
      setCurrentImportedLeadIndex(-1);
      setActiveLeadContext(null);
    }
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

  // Demo mode is now controlled globally via Settings > Profile

  return (
    <>
      {activeCall && (
        <CallInterface
          phoneNumber={activeCall}
          callName={activeCallName}
          onClose={() => { setActiveCall(null); setActiveCallName(undefined); setImportedLeadsList([]); setCurrentImportedLeadIndex(-1); setActiveLeadContext(null); }}
          onCallNextLead={importedLeadsList.length > 0 && currentImportedLeadIndex < importedLeadsList.length - 1 ? handleCallNextLead : undefined}
          nextLeadName={importedLeadsList.length > 0 && currentImportedLeadIndex < importedLeadsList.length - 1
            ? importedLeadsList[currentImportedLeadIndex + 1]?.contact_name
            : undefined}
          leadContext={activeLeadContext}
        />
      )}
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
                pendingFollowups={pendingFollowups}
                hotLeads={hotLeads}
                recentCalls={leads.filter(l => l.call_duration_seconds).length}
                onToggleAI={() => setAiActive(!aiActive)}
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
              <ImportedLeadsTable
                refreshKey={importRefreshKey}
                demoMode={demoMode}
                onStartCallWithLead={handleStartCallWithImportedLead}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
