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
import { DollarSign, Target, TrendingUp, Phone, ArrowRight, LayoutDashboard, Briefcase, PhoneCall, CheckSquare, Zap, Calendar, BarChart3, Sparkles } from 'lucide-react';

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

  const [pipelineKpis] = useState({
    bookingAttainment: 1245000,
    bookingTarget: 15000000,
    gapToTarget: 13755000,
    coverage: 2.8,
    openPipeline: 3200000,
    totalPipelineCreated: 4200000,
    pipelineTarget: 45000000,
    productsSold: 89,
    appointmentsSet: 67,
    appointmentTarget: 100,
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

  // Enterprise Dashboard for Manager users - TEMPORARILY UNLOCKED FOR TESTING
  if (true || teamId) {
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
            {/* Header */}
            <DashboardHeader
              title="Manager Dashboard"
              subtitle="Team performance, pipeline, and forecasting"
              onStartCall={() => setShowCallDialog(true)}
              showEnterpriseBadge
            />

            {/* Team KPI Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/50 bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Revenue</p>
                      <p className="text-2xl font-bold">${formatCurrency(pipelineKpis.bookingAttainment)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round((pipelineKpis.bookingAttainment / pipelineKpis.bookingTarget) * 100)}% of ${formatCurrency(pipelineKpis.bookingTarget)} target
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pipeline Coverage</p>
                      <p className="text-2xl font-bold">{pipelineKpis.coverage}x</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ${formatCurrency(pipelineKpis.openPipeline)} open
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Products Sold</p>
                      <p className="text-2xl font-bold">{pipelineKpis.productsSold}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {pipelineKpis.appointmentsSet} appointments set
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gap to Target</p>
                      <p className="text-2xl font-bold text-destructive">${formatCurrency(pipelineKpis.gapToTarget)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-destructive" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Remaining to close
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Trend Chart */}
            <PipelineTrendChart teamId={teamId} />

            {/* Two Column: Staff Performance & Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <StaffPerformanceGrid 
                  teamId={teamId} 
                  onSelectStaff={(userId, name) => setSelectedDeal({ id: userId, name, company: 'View Details' })}
                />
              </div>
              <div className="space-y-6">
                <ProductsAppointmentsCard teamId={teamId} />
                <TeamLeadManagement teamId={teamId} />
              </div>
            </div>

            {/* Team Goals & Forecast */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CompanyGoalsWidget teamId={teamId} kpis={kpis} />
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                    <div>
                      <p className="text-sm font-medium">Best Case</p>
                      <p className="text-xs text-muted-foreground">High-confidence deals</p>
                    </div>
                    <p className="text-xl font-bold text-success">${formatCurrency(pipelineKpis.openPipeline * 0.6)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <p className="text-sm font-medium">Commit</p>
                      <p className="text-xs text-muted-foreground">Expected closure</p>
                    </div>
                    <p className="text-xl font-bold text-primary">${formatCurrency(pipelineKpis.openPipeline * 0.4)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                    <div>
                      <p className="text-sm font-medium">Worst Case</p>
                      <p className="text-xs text-muted-foreground">Conservative outlook</p>
                    </div>
                    <p className="text-xl font-bold text-warning">${formatCurrency(pipelineKpis.openPipeline * 0.2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
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
  // SIMPLE SALES DASHBOARD - TODAY'S VIEW
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
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <DashboardHeader
            title="Good morning!"
            subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            onStartCall={() => setShowCallDialog(true)}
          />

          {/* Today's Priorities */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Leads to Call Today */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Today's Priorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Leads to Call</p>
                    <p className="text-xs text-muted-foreground">Follow up today</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">3</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Follow-ups Due</p>
                    <p className="text-xs text-muted-foreground">Don't forget</p>
                  </div>
                  <p className="text-2xl font-bold text-warning">2</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Closing Soon</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                  <p className="text-2xl font-bold text-success">1</p>
                </div>
              </CardContent>
            </Card>

            {/* Big Action Button */}
            <Card className="border-border/50 bg-primary/5 md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center h-full py-4">
                  <Button
                    onClick={() => setShowCallDialog(true)}
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    Start Call
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    AI coaching ready • WinWords active
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              label="Win Rate"
              value={`${mockMetrics.winRate}%`}
              icon={Target}
              iconColor="text-primary"
            />
            <MetricCard
              label="Active Deals"
              value={mockMetrics.pipelineDeals}
              icon={TrendingUp}
              iconColor="text-secondary"
              subtitle="In pipeline"
            />
            <MetricCard
              label="Calls Today"
              value={mockMetrics.callsToday}
              icon={Phone}
              iconColor="text-warning"
              highlight={`${mockMetrics.hotLeads} hot leads`}
              highlightColor="warning"
            />
          </div>

          {/* Two Column: Today's Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Calls */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRecentCalls.slice(0, 3).map((call) => (
                  <div key={call.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{call.contactName}</p>
                        <Badge variant={call.score >= 85 ? 'default' : call.score >= 70 ? 'secondary' : 'destructive'}>
                          {call.score}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{call.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">{call.summary}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/recordings')}>
                  View All Calls
                </Button>
              </CardContent>
            </Card>

            {/* Priority Deals */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Priority Deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPriorityDeals.slice(0, 3).map((deal) => (
                  <div key={deal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{deal.name}</p>
                        <Badge variant={
                          deal.health === 'on_track' ? 'default' :
                          deal.health === 'monitor' ? 'secondary' : 'destructive'
                        }>
                          {deal.stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
                      <p className="text-sm font-medium mt-1">{formatCurrency(deal.value)}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/enterprise')}>
                  View All Deals
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Simple Nav Links */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
              <Target className="h-4 w-4 mr-2" />
              Leads
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/winwords')}>
              <Sparkles className="h-4 w-4 mr-2" />
              WinWords
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
