import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Redesigned Components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AIStatusBar } from '@/components/dashboard/AIStatusBar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';
import { DealPriorityCard } from '@/components/dashboard/DealPriorityCard';
import { RecentCallCard } from '@/components/dashboard/RecentCallCard';

// Mock Data
import {
  mockMetrics,
  mockRevenueData,
  mockPriorityDeals,
  mockRecentCalls,
  mockAIStatus,
} from '@/data/dashboardMockData';

// Existing Components
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DollarSign, Target, TrendingUp, Phone, ArrowRight, LayoutDashboard, Briefcase, PhoneCall, CheckSquare } from 'lucide-react';

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

interface TeamKPIs {
  teamWinRate: number;
  avgCallsPerRep: number;
  coachingCoveragePct: number;
  avgDiscoveryScore: number;
  avgCloserScore: number;
  forecastRiskPct: number;
  totalReps: number;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isManager, teamId } = useUserRole();
  const { isEnterprise, tier } = useEnterpriseSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [aiActive, setAiActive] = useState(true);
  const [kpis, setKpis] = useState<TeamKPIs | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<{ id: string; name: string; company: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'calls' | 'deals'>('overview');

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

  // Handle subscription success message
  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const fromCheckout = searchParams.get('from_checkout') === 'true';

    if (subscription === 'success' || fromCheckout) {
      toast.success('Subscription activated! Welcome to SellSig.', {
        duration: 5000,
        description: 'Your premium features are now available.',
      });
      // Note: Removed manual refreshSession() call - the AuthProvider's 
      // coordinated refresh handles session updates automatically.
      // Manual refreshes can cause token rotation conflicts in multi-tab scenarios.
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysLeads = leads.filter(l => new Date(l.created_at) >= today).length;
  const hotLeads = leads.filter(l => l.is_hot_lead).length;
  const last24hCalls = recordings.filter(r => {
    const callDate = new Date(r.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return callDate >= dayAgo;
  }).length;

  // Handle starting a call
  const handleStartCall = (phoneNumber: string) => {
    setShowCallDialog(false);
    setActiveCall(phoneNumber);
  };

  // Enterprise Dashboard for Executive users
  if (isExecutive && teamId) {
    return (
      <>
        {activeCall && (
          <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
        )}
        
        <CallDialog
          open={showCallDialog}
          onOpenChange={setShowCallDialog}
          onStartCall={handleStartCall}
        />
        
        <DashboardLayout>
          <div className="space-y-6 animate-fade-in">
            <DashboardHeader
              title="Executive Dashboard"
              subtitle="Team performance, goals, and revenue intelligence"
              onStartCall={() => setShowCallDialog(true)}
              showEnterpriseBadge
            />

            <PipelineKPICards kpis={pipelineKpis} />
            <PipelineTrendChart teamId={teamId} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <StaffCallOverview teamId={teamId} />
              </div>
              <ProductsAppointmentsCard teamId={teamId} />
            </div>

            <StaffPerformanceGrid 
              teamId={teamId} 
              onSelectStaff={(userId, name) => setSelectedDeal({ id: userId, name, company: 'View Details' })}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <CompanyGoalsWidget teamId={teamId} kpis={kpis} />
              <TeamLeadManagement teamId={teamId} />
            </div>

            <EnterpriseActivityFeed teamId={teamId} />

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

  // ============================================
  // REDESIGNED SALES DASHBOARD
  // ============================================
  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
      )}
      
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={handleStartCall}
      />
      
      <DashboardLayout>
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <DashboardHeader
            title="Sales Dashboard"
            subtitle="AI-powered revenue intelligence"
            onStartCall={() => setShowCallDialog(true)}
          />

          {/* AI Status Bar - Compact */}
          <AIStatusBar
            isActive={aiActive}
            todayLeads={todaysLeads || mockAIStatus.todayLeads}
            weekLeads={leads.length || mockAIStatus.weekLeads}
            conversionRate={mockAIStatus.conversionRate}
            avgResponseTime={mockAIStatus.avgResponseTime}
          />

          {/* Tab Navigation - Scrollable on mobile */}
          <div className="flex items-center gap-1 border-b border-border/50 pb-1 overflow-x-auto pb-2 -mb-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
              { id: 'calls', label: 'Calls', icon: PhoneCall },
              { id: 'deals', label: 'Deals', icon: Briefcase },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  onClick={() => setShowCallDialog(true)}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Call
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/leads')}
                  className="w-full sm:w-auto"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  New Lead
                </Button>
              </div>

              {/* Compact KPI Grid - Single col on mobile, 2 col small, 4 col desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <MetricCard
                  label="Revenue"
                  value={formatCurrency(mockMetrics.totalRevenue)}
                  icon={DollarSign}
                  iconColor="text-success"
                  trend={{ value: mockMetrics.revenueTrend, direction: 'up' }}
                  progress={{
                    current: mockMetrics.totalRevenue,
                    goal: mockMetrics.revenueGoal,
                    label: `${Math.round((mockMetrics.totalRevenue / mockMetrics.revenueGoal) * 100)}% of goal`,
                  }}
                />
                <MetricCard
                  label="Pipeline"
                  value={formatCurrency(mockMetrics.activePipeline)}
                  icon={TrendingUp}
                  iconColor="text-secondary"
                  subtitle={`${mockMetrics.pipelineDeals} deals`}
                  trend={{ value: mockMetrics.pipelineTrend, direction: 'up' }}
                />
                <MetricCard
                  label="Win Rate"
                  value={`${mockMetrics.winRate}%`}
                  icon={Target}
                  iconColor="text-primary"
                  trend={{ value: mockMetrics.winRateTrend, direction: 'up' }}
                />
                <MetricCard
                  label="Calls Today"
                  value={last24hCalls || mockMetrics.callsToday}
                  icon={Phone}
                  iconColor="text-warning"
                  highlight={`${hotLeads || mockMetrics.hotLeads} hot`}
                  highlightColor="warning"
                  action={{ label: 'Queue', onClick: () => navigate('/leads') }}
                />
              </div>

              {/* Revenue Chart - Full Width */}
              <RevenueTrendChart data={mockRevenueData} goal={100000} />

              {/* Two Column: Deals & Calls - Stacked on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Priority Deals */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Priority Deals</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/enterprise')}>
                        View All <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockPriorityDeals.slice(0, 3).map((deal) => (
                      <DealPriorityCard
                        key={deal.id}
                        name={deal.name}
                        company={deal.company}
                        value={deal.value}
                        stage={deal.stage}
                        health={deal.health}
                        alert={deal.alert}
                        nextAction={deal.nextAction}
                        onClick={() => toast.info(`Opening: ${deal.name}`)}
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Calls */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/recordings')}>
                        View All <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockRecentCalls.slice(0, 2).map((call) => (
                      <RecentCallCard
                        key={call.id}
                        contactName={call.contactName}
                        company={call.company}
                        score={call.score}
                        summary={call.summary}
                        timestamp={call.timestamp}
                        buyingSignals={call.buyingSignals}
                        onViewSummary={() => toast.info(`Summary: ${call.company}`)}
                        onViewLead={() => navigate('/leads')}
                        onSchedule={() => navigate('/schedule')}
                        onCall={() => toast.info(`Calling ${call.contactName}...`)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <MetricCard
                  label="Pipeline"
                  value={formatCurrency(mockMetrics.activePipeline)}
                  icon={TrendingUp}
                  iconColor="text-secondary"
                  subtitle={`${mockMetrics.pipelineDeals} deals`}
                />
                <MetricCard
                  label="Win Rate"
                  value={`${mockMetrics.winRate}%`}
                  icon={Target}
                  iconColor="text-primary"
                  subtitle="24 won / 11 lost"
                />
                <MetricCard
                  label="Revenue"
                  value={formatCurrency(mockMetrics.totalRevenue)}
                  icon={DollarSign}
                  iconColor="text-success"
                  progress={{
                    current: mockMetrics.totalRevenue,
                    goal: mockMetrics.revenueGoal,
                    label: 'of goal',
                  }}
                />
                <MetricCard
                  label="Avg Deal"
                  value="$85K"
                  icon={TrendingUp}
                  iconColor="text-secondary"
                  subtitle="per opportunity"
                />
              </div>
              <RevenueTrendChart data={mockRevenueData} goal={100000} />
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Recent Calls</h3>
                <Button onClick={() => setShowCallDialog(true)} className="w-full sm:w-auto">
                  <Phone className="h-4 w-4 mr-2" />
                  Start Call
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockRecentCalls.map((call) => (
                  <RecentCallCard
                    key={call.id}
                    contactName={call.contactName}
                    company={call.company}
                    score={call.score}
                    summary={call.summary}
                    timestamp={call.timestamp}
                    buyingSignals={call.buyingSignals}
                    onViewSummary={() => toast.info(`Summary: ${call.company}`)}
                    onViewLead={() => navigate('/leads')}
                    onSchedule={() => navigate('/schedule')}
                    onCall={() => toast.info(`Calling ${call.contactName}...`)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Priority Deals</h3>
                <Button variant="outline" onClick={() => navigate('/enterprise')} className="w-full sm:w-auto">
                  View All Deals
                </Button>
              </div>
              <div className="space-y-3">
                {mockPriorityDeals.map((deal) => (
                  <DealPriorityCard
                    key={deal.id}
                    name={deal.name}
                    company={deal.company}
                    value={deal.value}
                    stage={deal.stage}
                    health={deal.health}
                    alert={deal.alert}
                    nextAction={deal.nextAction}
                    onClick={() => toast.info(`Opening: ${deal.name}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
