import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// New Salesforce-style components
import { RevenueGauge } from '@/components/dashboard/RevenueGauge';
import { PipelineFunnel } from '@/components/dashboard/PipelineFunnel';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { QuarterlyRevenueChart } from '@/components/dashboard/QuarterlyRevenueChart';
import { WinRateCircle } from '@/components/dashboard/WinRateCircle';
import { TopOpportunitiesTable } from '@/components/dashboard/TopOpportunitiesTable';
import { TopAccountsChart } from '@/components/dashboard/TopAccountsChart';
import { LogClosedDealForm } from '@/components/dashboard/LogClosedDealForm';
import { KPICard } from '@/components/dashboard/KPICard';

// Existing components
import { AILeadStatus } from '@/components/leads/AILeadStatus';
import { ProfileSetupBanner } from '@/components/recording/ProfileSetupBanner';
import { RecentActivityFeed } from '@/components/leads/RecentActivityFeed';
import { LiveRecordingInterface } from '@/components/recording/LiveRecordingInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mic, Headphones, Crown, DollarSign, Target, 
  Users, TrendingUp, Zap, Phone 
} from 'lucide-react';

// Enterprise Components
import { PipelineKPICards } from '@/components/enterprise/PipelineKPICards';
import { PipelineTrendChart } from '@/components/enterprise/PipelineTrendChart';
import { StaffCallOverview } from '@/components/enterprise/StaffCallOverview';
import { StaffPerformanceGrid } from '@/components/enterprise/StaffPerformanceGrid';
import { CompanyGoalsWidget } from '@/components/enterprise/CompanyGoalsWidget';
import { TeamLeadManagement } from '@/components/enterprise/TeamLeadManagement';
import { EnterpriseActivityFeed } from '@/components/enterprise/EnterpriseActivityFeed';
import { ProductsAppointmentsCard } from '@/components/enterprise/ProductsAppointmentsCard';
import { DealBriefPanel } from '@/components/enterprise/DealBriefPanel';

interface CallRecording {
  id: string;
  file_name: string;
  status: string;
  sentiment_score: number | null;
  duration_seconds: number | null;
  created_at: string;
}

interface Lead {
  id: string;
  contact_name: string;
  company: string | null;
  ai_confidence: number | null;
  is_hot_lead: boolean | null;
  primary_pain_point: string | null;
  next_action_due: string | null;
  created_at: string;
  recording_id: string | null;
}

interface ClosedDeal {
  id: string;
  amount: number;
  closeDate: string;
  accountName: string;
  notes: string;
  createdAt: string;
}

interface TeamKPIs {
  teamWinRate: number;
  avgCallsPerRep: number;
  coachingCoveragePct: number;
  avgDiscoveryScore: number;
  avgCloserScore: number;
  forecastRiskPct: number;
  totalReps: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isManager, teamId } = useUserRole();
  const { isEnterprise, tier } = useEnterpriseSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [aiActive, setAiActive] = useState(true);
  const [headphoneMode, setHeadphoneMode] = useState(false);
  const [kpis, setKpis] = useState<TeamKPIs | null>(null);
  const [closedDeals, setClosedDeals] = useState<ClosedDeal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<{ id: string; name: string; company: string } | null>(null);

  const [pipelineKpis] = useState({
    bookingAttainment: 4150000,
    bookingTarget: 15000000,
    gapToTarget: 10850000,
    coverage: 2.5,
    openPipeline: 27100000,
    totalPipelineCreated: 30000000,
    pipelineTarget: 45000000,
    productsSold: 47,
    appointmentsSet: 28,
    appointmentTarget: 50,
  });

  const isExecutive = isEnterprise && tier === 'executive';

  // Mock data for charts - in production, fetch from Supabase
  const [monthlyData] = useState([
    { month: 'Jul', revenue: 45000, target: 50000 },
    { month: 'Aug', revenue: 62000, target: 55000 },
    { month: 'Sep', revenue: 58000, target: 60000 },
    { month: 'Oct', revenue: 71000, target: 65000 },
    { month: 'Nov', revenue: 85000, target: 70000 },
    { month: 'Dec', revenue: 92000, target: 80000 },
  ]);

  const [quarterlyData] = useState([
    { quarter: 'Q1', revenue: 180000, target: 200000 },
    { quarter: 'Q2', revenue: 245000, target: 250000 },
    { quarter: 'Q3', revenue: 165000, target: 200000 },
    { quarter: 'Q4', revenue: 0, target: 250000 },
  ]);

  const [pipelineStages] = useState([
    { name: 'Lead', value: 850000, count: 45, color: '#06b6d4' },
    { name: 'Qualified', value: 620000, count: 28, color: '#8b5cf6' },
    { name: 'Proposal', value: 380000, count: 15, color: '#f59e0b' },
    { name: 'Negotiation', value: 180000, count: 8, color: '#ec4899' },
    { name: 'Closed Won', value: 95000, count: 4, color: '#10b981' },
  ]);

  const [opportunities] = useState([
    { id: '1', name: 'Enterprise License', account: 'Acme Corp', amount: 125000, probability: 75, stage: 'Proposal', closeDate: '2026-02-15' },
    { id: '2', name: 'Platform Migration', account: 'TechStart Inc', amount: 89000, probability: 60, stage: 'Qualification', closeDate: '2026-03-01' },
    { id: '3', name: 'Annual Renewal', account: 'Global Systems', amount: 67000, probability: 90, stage: 'Negotiation', closeDate: '2026-01-31' },
    { id: '4', name: 'New Implementation', account: 'FastGrow LLC', amount: 45000, probability: 40, stage: 'Prospecting', closeDate: '2026-03-15' },
    { id: '5', name: 'Expansion Deal', account: 'MegaCorp', amount: 156000, probability: 55, stage: 'Proposal', closeDate: '2026-02-28' },
  ]);

  const [topAccounts] = useState([
    { name: 'Acme Corp', won: 245000, potential: 180000 },
    { name: 'TechStart', won: 189000, potential: 120000 },
    { name: 'Global Sys', won: 156000, potential: 95000 },
    { name: 'FastGrow', won: 98000, potential: 150000 },
    { name: 'MegaCorp', won: 78000, potential: 220000 },
  ]);

  // Calculate totals from closed deals
  const totalRevenue = closedDeals.reduce((sum, deal) => sum + deal.amount, 0) + 301000; // Base + new deals
  const revenueGoal = 3000000;
  const winRate = 68;
  const totalWon = 24 + closedDeals.length;
  const totalLost = 11;
  const avgDealSize = totalRevenue / (totalWon || 1);

  // Handle subscription success message
  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const fromCheckout = searchParams.get('from_checkout') === 'true';

    if (subscription === 'success' || fromCheckout) {
      toast.success('Subscription activated! Welcome to SellSig.', {
        duration: 5000,
        description: 'Your premium features are now available.',
      });
      supabase.auth.getSession().then(() => supabase.auth.refreshSession()).catch(() => {});
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('subscription');
      nextParams.delete('from_checkout');
      setSearchParams(nextParams, { replace: true });
    }

    if (subscription === 'canceled') {
      toast.info('Subscription checkout was canceled.', { duration: 4000 });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('subscription');
      nextParams.delete('from_checkout');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, user]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const [recordingsResult, leadsResult] = await Promise.all([
        supabase
          .from('call_recordings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (!recordingsResult.error && recordingsResult.data) {
        setRecordings(recordingsResult.data);
      }
      if (!leadsResult.error && leadsResult.data) {
        setLeads(leadsResult.data);
      }
      setLoading(false);
    }

    fetchData();
  }, [user]);

  // Fetch KPIs for enterprise users
  useEffect(() => {
    if (isExecutive && teamId) {
      fetchKPIs();
    }
  }, [isExecutive, teamId]);

  const fetchKPIs = async () => {
    if (!teamId) return;
    try {
      const { data } = await (supabase.rpc as any)('get_team_kpis', { p_team_id: teamId });
      setKpis(data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  const handleDealLogged = (deal: { amount: number; closeDate: string; accountName: string; notes: string }) => {
    const newDeal: ClosedDeal = {
      id: crypto.randomUUID(),
      ...deal,
      createdAt: new Date().toISOString(),
    };
    setClosedDeals(prev => [newDeal, ...prev]);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysLeads = leads.filter(l => new Date(l.created_at) >= today).length;
  const hotLeads = leads.filter(l => l.is_hot_lead).length;
  const pendingFollowups = leads.filter(l => l.next_action_due && new Date(l.next_action_due) <= new Date()).length;
  const last24hCalls = recordings.filter(r => {
    const callDate = new Date(r.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return callDate >= dayAgo;
  }).length;

  const recentActivities = leads.slice(0, 5).map(lead => ({
    id: lead.id,
    type: lead.is_hot_lead ? 'ai_scored' as const : 'new_lead' as const,
    title: `${lead.is_hot_lead ? 'AI scored lead:' : 'New lead:'} ${lead.contact_name}${lead.company ? ` (${lead.company})` : ''}`,
    description: lead.primary_pain_point || 'Contact captured from call',
    timestamp: lead.created_at,
    leadId: lead.id,
    confidence: lead.ai_confidence || undefined
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  // Enterprise Dashboard for Executive users
  if (isExecutive && teamId) {
    return (
      <>
        {isRecording && (
          <LiveRecordingInterface onClose={() => setIsRecording(false)} useScreenShare={headphoneMode} />
        )}
        
        <DashboardLayout>
          <div className="space-y-6 animate-fade-in">
            {/* Enterprise Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Executive Dashboard</h1>
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium gap-1">
                    <Crown className="h-3 w-3" />
                    Enterprise
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">Team performance, goals, and revenue intelligence</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Button
                  onClick={() => setIsRecording(true)}
                  size="lg"
                  className="gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow"
                >
                  <Mic className="h-5 w-5" />
                  Start Recording
                </Button>
                <div className="flex items-center gap-2">
                  <Switch
                    id="headphone-mode"
                    checked={headphoneMode}
                    onCheckedChange={setHeadphoneMode}
                  />
                  <Label htmlFor="headphone-mode" className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                    <Headphones className="h-4 w-4" />
                    Headphone Mode
                  </Label>
                </div>
              </div>
            </div>

            {/* Pipeline KPI Cards */}
            <PipelineKPICards kpis={pipelineKpis} />

            {/* Pipeline Trend Chart */}
            <PipelineTrendChart teamId={teamId} />

            {/* Staff Overview & Targets */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <StaffCallOverview teamId={teamId} />
              </div>
              <ProductsAppointmentsCard teamId={teamId} />
            </div>

            {/* Staff Performance Grid */}
            <StaffPerformanceGrid 
              teamId={teamId} 
              onSelectStaff={(userId, name) => setSelectedDeal({ id: userId, name, company: 'View Details' })}
            />

            {/* Goals & Lead Management */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CompanyGoalsWidget teamId={teamId} kpis={kpis} />
              <TeamLeadManagement teamId={teamId} />
            </div>

            {/* Activity Feed */}
            <EnterpriseActivityFeed teamId={teamId} />

            {/* Deal Brief Panel */}
            {selectedDeal && (
              <DealBriefPanel
                dealId={selectedDeal.id}
                dealName={selectedDeal.name}
                companyName={selectedDeal.company}
                onClose={() => setSelectedDeal(null)}
                teamId={teamId}
              />
            )}
          </div>
        </DashboardLayout>
      </>
    );
  }

  // Standard Salesforce-Style Dashboard for non-enterprise users
  return (
    <>
      {isRecording && (
        <LiveRecordingInterface onClose={() => setIsRecording(false)} useScreenShare={headphoneMode} />
      )}
      
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sales Dashboard</h1>
              <p className="text-muted-foreground mt-1">AI-powered sales intelligence & revenue tracking</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Button
                onClick={() => setIsRecording(true)}
                size="lg"
                className="gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
              <div className="flex items-center gap-2">
                <Switch
                  id="headphone-mode"
                  checked={headphoneMode}
                  onCheckedChange={setHeadphoneMode}
                />
                <Label htmlFor="headphone-mode" className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                  <Headphones className="h-4 w-4" />
                  Headphone Mode
                </Label>
              </div>
            </div>
          </div>

          <ProfileSetupBanner variant="full" />

          {/* AI Lead Status */}
          <AILeadStatus
            isActive={aiActive}
            todaysLeads={todaysLeads}
            weeklyLeads={leads.length}
            conversionRate={28}
            avgResponseTime="1.2 hrs"
            onToggleAI={() => setAiActive(!aiActive)}
          />

          {/* Top KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              subtitle="FYTD Closed Won"
              icon={DollarSign}
              iconColor="text-emerald-400"
              trend={{ value: 12.5, isPositive: true }}
            />
            <KPICard
              title="Avg Deal Size"
              value={formatCurrency(avgDealSize)}
              subtitle="Per closed deal"
              icon={Target}
              iconColor="text-purple-400"
              trend={{ value: 8.2, isPositive: true }}
            />
            <KPICard
              title="Active Pipeline"
              value={formatCurrency(2125000)}
              subtitle="Open opportunities"
              icon={TrendingUp}
              iconColor="text-cyan-400"
              trend={{ value: 5.8, isPositive: true }}
            />
            <KPICard
              title="Calls Today"
              value={last24hCalls}
              subtitle={`${hotLeads} hot leads 🔥`}
              icon={Phone}
              iconColor="text-amber-400"
            />
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Gauge - Large */}
            <div className="lg:col-span-1">
              <RevenueGauge current={totalRevenue} goal={revenueGoal} />
            </div>
            
            {/* Win Rate & Pipeline */}
            <div className="lg:col-span-1 space-y-6">
              <WinRateCircle rate={winRate} totalWon={totalWon} totalLost={totalLost} />
            </div>

            {/* Log Closed Deal Form */}
            <div className="lg:col-span-1">
              <LogClosedDealForm onDealLogged={handleDealLogged} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyRevenueChart data={monthlyData} />
            <QuarterlyRevenueChart data={quarterlyData} />
          </div>

          {/* Pipeline Funnel & Top Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineFunnel stages={pipelineStages} />
            <TopAccountsChart data={topAccounts} />
          </div>

          {/* Top Opportunities Table */}
          <TopOpportunitiesTable 
            opportunities={opportunities}
            onViewDetails={(id) => toast.info(`Opening opportunity ${id}`)}
          />

          {/* Recent Activity */}
          <RecentActivityFeed
            activities={recentActivities}
            onViewLead={() => navigate('/leads')}
            onViewSummary={(id) => {
              const lead = leads.find(l => l.id === id);
              if (lead?.recording_id) navigate(`/recording/${lead.recording_id}`);
            }}
            onCallNow={(id) => {
              const lead = leads.find(l => l.id === id);
              toast.info(`Calling ${lead?.contact_name || 'lead'}...`);
            }}
            onSchedule={() => navigate('/schedule')}
            onEmail={(id) => {
              const lead = leads.find(l => l.id === id);
              toast.info(`Emailing ${lead?.contact_name || 'lead'}...`);
            }}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
