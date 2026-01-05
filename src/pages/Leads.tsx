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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, Filter, Plus, Download, Users } from 'lucide-react';

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
  // AI fields
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

export default function Leads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiActive, setAiActive] = useState(true);
  const [stats, setStats] = useState({
    todaysLeads: 0,
    weeklyLeads: 0,
    conversionRate: 28,
    avgResponseTime: '1.2 hrs'
  });

  useEffect(() => {
    fetchLeads();
  }, [user]);

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todaysLeads = leadsData.filter(l => new Date(l.created_at) >= today).length;
    const weeklyLeads = leadsData.filter(l => new Date(l.created_at) >= weekAgo).length;

    setStats({
      todaysLeads,
      weeklyLeads,
      conversionRate: 28,
      avgResponseTime: '1.2 hrs'
    });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hotLeads = leads.filter(l => l.is_hot_lead).length;
  const pendingFollowups = leads.filter(l => l.next_action_due && new Date(l.next_action_due) <= new Date()).length;
  
  const recentActivities = leads.slice(0, 5).map(lead => ({
    id: lead.id,
    type: 'new_lead' as const,
    title: `New lead: ${lead.contact_name}${lead.company ? ` (${lead.company})` : ''}`,
    description: lead.primary_pain_point || 'Contact captured from call',
    timestamp: lead.created_at,
    leadId: lead.id,
    confidence: lead.ai_confidence || undefined
  }));

  const alerts = [
    ...(pendingFollowups > 0 ? [{
      id: '1',
      type: 'urgent_followup' as const,
      title: 'Urgent Follow-ups',
      count: pendingFollowups,
      description: 'Waiting for response'
    }] : []),
    ...(hotLeads > 0 ? [{
      id: '2',
      type: 'high_score' as const,
      title: 'High-Score Leads',
      count: hotLeads,
      description: '>90% confidence'
    }] : [])
  ];

  const handleCall = (lead: Lead) => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = (lead: Lead) => {
    if (lead.email) {
      window.location.href = `mailto:${lead.email}`;
    } else {
      toast.error('No email available');
    }
  };

  const handleViewSummary = (lead: Lead) => {
    if (lead.recording_id) {
      navigate(`/recording/${lead.recording_id}`);
    } else {
      toast.info('No recording associated with this lead');
    }
  };

  const handleSchedule = (lead: Lead) => {
    navigate('/schedule');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">AI-powered lead generation and management</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* AI Status */}
        <AILeadStatus
          isActive={aiActive}
          todaysLeads={stats.todaysLeads}
          weeklyLeads={stats.weeklyLeads}
          conversionRate={stats.conversionRate}
          avgResponseTime={stats.avgResponseTime}
          onToggleAI={() => setAiActive(!aiActive)}
          onTestMode={() => toast.info('Test mode coming soon')}
          onViewLogs={() => toast.info('Logs coming soon')}
        />

        {/* Quick Overview */}
        <QuickOverviewCards
          newLeadsToday={stats.todaysLeads}
          pendingFollowups={pendingFollowups}
          hotLeads={hotLeads}
          recentCalls={leads.filter(l => l.call_duration_seconds).length}
        />

        {/* Priority Alerts */}
        {alerts.length > 0 && (
          <PriorityAlerts
            alerts={alerts}
            onAlertClick={(alert) => toast.info(`Viewing ${alert.title}`)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
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

            {/* Leads */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="card-gradient rounded-xl border border-border/50 p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No leads yet</h3>
                <p className="text-muted-foreground mb-4">
                  Leads will appear here as the AI captures them from your calls
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Start Recording
                </Button>
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
                      setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l));
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Sidebar */}
          <div>
            <RecentActivityFeed
              activities={recentActivities}
              onViewLead={(id) => toast.info(`Viewing lead ${id}`)}
              onViewSummary={(id) => {
                const lead = leads.find(l => l.id === id);
                if (lead?.recording_id) navigate(`/recording/${lead.recording_id}`);
              }}
              onCallNow={(id) => {
                const lead = leads.find(l => l.id === id);
                if (lead) handleCall(lead);
              }}
              onSchedule={() => navigate('/schedule')}
              onEmail={(id) => {
                const lead = leads.find(l => l.id === id);
                if (lead) handleEmail(lead);
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
