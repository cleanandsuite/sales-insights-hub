import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { AILeadStatus } from '@/components/leads/AILeadStatus';
import { QuickOverviewCards } from '@/components/leads/QuickOverviewCards';
import { PriorityAlerts } from '@/components/leads/PriorityAlerts';
import { RecentActivityFeed } from '@/components/leads/RecentActivityFeed';
import { ProfileSetupBanner } from '@/components/recording/ProfileSetupBanner';
import { Phone, Clock, ThumbsUp, Mic, Users, Headphones, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { LiveRecordingInterface } from '@/components/recording/LiveRecordingInterface';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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

interface PipelineKPIs {
  bookingAttainment: number;
  bookingTarget: number;
  gapToTarget: number;
  coverage: number;
  openPipeline: number;
  totalPipelineCreated: number;
  pipelineTarget: number;
  productsSold: number;
  appointmentsSet: number;
  appointmentTarget: number;
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
  const [pipelineKpis, setPipelineKpis] = useState<PipelineKPIs>({
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
  const [selectedDeal, setSelectedDeal] = useState<{ id: string; name: string; company: string } | null>(null);

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

  const totalCalls = recordings.length;
  const analyzedCalls = recordings.filter(r => r.status === 'analyzed').length;
  const avgSentiment = recordings
    .filter(r => r.sentiment_score !== null)
    .reduce((acc, r) => acc + (r.sentiment_score || 0), 0) / (analyzedCalls || 1);
  const totalDuration = recordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0);

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const recentActivities = leads.slice(0, 5).map(lead => ({
    id: lead.id,
    type: lead.is_hot_lead ? 'ai_scored' as const : 'new_lead' as const,
    title: `${lead.is_hot_lead ? 'AI scored lead:' : 'New lead:'} ${lead.contact_name}${lead.company ? ` (${lead.company})` : ''}`,
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
    }] : []),
  ];

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

  // Standard Dashboard for non-enterprise users
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">AI-powered sales call analytics and lead generation</p>
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

          <ProfileSetupBanner variant="full" />

          <AILeadStatus
            isActive={aiActive}
            todaysLeads={todaysLeads}
            weeklyLeads={leads.length}
            conversionRate={28}
            avgResponseTime="1.2 hrs"
            onToggleAI={() => setAiActive(!aiActive)}
            onTestMode={() => toast.info('Test mode coming soon')}
            onViewLogs={() => toast.info('Logs coming soon')}
          />

          <QuickOverviewCards
            newLeadsToday={todaysLeads}
            pendingFollowups={pendingFollowups}
            hotLeads={hotLeads}
            recentCalls={last24hCalls}
          />

          {alerts.length > 0 && (
            <PriorityAlerts
              alerts={alerts}
              onAlertClick={(alert) => {
                if (alert.type === 'high_score' || alert.type === 'urgent_followup') {
                  navigate('/leads');
                } else {
                  navigate('/call-history');
                }
              }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Calls" value={totalCalls} icon={Phone} trend={{ value: 12, isPositive: true }} />
            <StatCard title="Leads Generated" value={leads.length} icon={Users} trend={{ value: 8, isPositive: true }} />
            <StatCard title="Total Duration" value={formatDuration(totalDuration)} icon={Clock} />
            <StatCard title="Avg Sentiment" value={avgSentiment ? `${(avgSentiment * 100).toFixed(0)}%` : 'N/A'} icon={ThumbsUp} />
          </div>

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
