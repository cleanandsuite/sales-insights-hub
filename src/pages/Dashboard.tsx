import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// New Redesigned Components
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
import { ProfileSetupBanner } from '@/components/recording/ProfileSetupBanner';
import { LiveRecordingInterface } from '@/components/recording/LiveRecordingInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, TrendingUp, Phone, ArrowRight, Crown } from 'lucide-react';

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
  const [isRecording, setIsRecording] = useState(false);
  const [aiActive, setAiActive] = useState(true);
  const [headphoneMode, setHeadphoneMode] = useState(false);
  const [kpis, setKpis] = useState<TeamKPIs | null>(null);
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

  // Enterprise Dashboard for Executive users
  if (isExecutive && teamId) {
    return (
      <>
        {isRecording && (
          <LiveRecordingInterface onClose={() => setIsRecording(false)} useScreenShare={headphoneMode} />
        )}
        
        <DashboardLayout>
          <div className="space-y-6 animate-fade-in">
            <DashboardHeader
              title="Executive Dashboard"
              subtitle="Team performance, goals, and revenue intelligence"
              isRecording={isRecording}
              headphoneMode={headphoneMode}
              onStartRecording={() => setIsRecording(true)}
              onHeadphoneModeChange={setHeadphoneMode}
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
      {isRecording && (
        <LiveRecordingInterface onClose={() => setIsRecording(false)} useScreenShare={headphoneMode} />
      )}
      
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <DashboardHeader
            title="Sales Dashboard"
            subtitle="AI-powered revenue intelligence"
            isRecording={isRecording}
            headphoneMode={headphoneMode}
            onStartRecording={() => setIsRecording(true)}
            onHeadphoneModeChange={setHeadphoneMode}
          />

          <ProfileSetupBanner variant="full" />

          {/* AI Status Bar */}
          <AIStatusBar
            isActive={aiActive}
            todayLeads={todaysLeads || mockAIStatus.todayLeads}
            weekLeads={leads.length || mockAIStatus.weekLeads}
            conversionRate={mockAIStatus.conversionRate}
            avgResponseTime={mockAIStatus.avgResponseTime}
          />

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(mockMetrics.totalRevenue)}
              icon={DollarSign}
              iconColor="text-success"
              progress={{
                current: mockMetrics.totalRevenue,
                goal: mockMetrics.revenueGoal,
                label: `${Math.round((mockMetrics.totalRevenue / mockMetrics.revenueGoal) * 100)}% to ${formatCurrency(mockMetrics.revenueGoal)} goal`,
              }}
              trend={{
                value: mockMetrics.revenueTrend,
                direction: 'up',
              }}
            />

            <MetricCard
              label="Active Pipeline"
              value={formatCurrency(mockMetrics.activePipeline)}
              icon={TrendingUp}
              iconColor="text-secondary"
              subtitle={`${mockMetrics.pipelineDeals} open deals`}
              trend={{
                value: mockMetrics.pipelineTrend,
                direction: 'up',
              }}
            />

            <MetricCard
              label="Win Rate"
              value={`${mockMetrics.winRate}%`}
              icon={Target}
              iconColor="text-primary"
              subtitle={`${mockMetrics.wonDeals} Won / ${mockMetrics.lostDeals} Lost`}
              trend={{
                value: mockMetrics.winRateTrend,
                direction: 'up',
              }}
            />

            <MetricCard
              label="Calls Today"
              value={last24hCalls || mockMetrics.callsToday}
              icon={Phone}
              iconColor="text-warning"
              highlight={`${hotLeads || mockMetrics.hotLeads} hot leads 🔥`}
              highlightColor="warning"
              action={{
                label: 'View Queue',
                onClick: () => navigate('/leads'),
              }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Revenue Trend Chart - 60% */}
            <div className="lg:col-span-3">
              <RevenueTrendChart data={mockRevenueData} goal={100000} />
            </div>

            {/* Priority Deals - 40% */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 bg-card h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <Target className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          My Deals
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Priority actions needed</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/enterprise')}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockPriorityDeals.slice(0, 4).map((deal) => (
                    <DealPriorityCard
                      key={deal.id}
                      name={deal.name}
                      company={deal.company}
                      value={deal.value}
                      stage={deal.stage}
                      health={deal.health}
                      alert={deal.alert}
                      nextAction={deal.nextAction}
                      onClick={() => toast.info(`Opening deal: ${deal.name}`)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Calls Section */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Recent Calls
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">AI-analyzed call activity</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/recordings')}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRecentCalls.slice(0, 4).map((call) => (
                  <RecentCallCard
                    key={call.id}
                    contactName={call.contactName}
                    company={call.company}
                    score={call.score}
                    summary={call.summary}
                    timestamp={call.timestamp}
                    buyingSignals={call.buyingSignals}
                    onViewSummary={() => toast.info(`Opening summary for ${call.company}`)}
                    onViewLead={() => navigate('/leads')}
                    onSchedule={() => navigate('/schedule')}
                    onCall={() => toast.info(`Calling ${call.contactName}...`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}
