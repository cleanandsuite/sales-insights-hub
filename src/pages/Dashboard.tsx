import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { AILeadStatus } from '@/components/leads/AILeadStatus';
import { QuickOverviewCards } from '@/components/leads/QuickOverviewCards';
import { PriorityAlerts } from '@/components/leads/PriorityAlerts';
import { RecentActivityFeed } from '@/components/leads/RecentActivityFeed';
import { ProfileSetupBanner } from '@/components/recording/ProfileSetupBanner';
import { Phone, Clock, ThumbsUp, Mic, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LiveRecordingInterface } from '@/components/recording/LiveRecordingInterface';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [aiActive, setAiActive] = useState(true);
  const [headphoneMode, setHeadphoneMode] = useState(false);
  // Handle subscription success message with polling
  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const fromCheckout = searchParams.get('from_checkout') === 'true';

    if (subscription === 'success' || fromCheckout) {
      toast.success('Subscription activated! Welcome to SellSig.', {
        duration: 5000,
        description: 'Your premium features are now available.',
      });

      // Ensure session is hydrated after magic-link login
      supabase.auth.getSession().then(() => supabase.auth.refreshSession()).catch(() => {});

      // Poll for profile activation (webhook can be delayed)
      let pollCount = 0;
      const maxPolls = 6; // 30 seconds total (5s * 6)
      const pollInterval = setInterval(async () => {
        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          return;
        }

        try {
          if (user) {
            const { data } = await supabase
              .from('profiles')
              .select('is_active, subscription_status')
              .eq('user_id', user.id)
              .maybeSingle();

            if (data?.is_active) {
              clearInterval(pollInterval);
              return;
            }
          }

          // Fallback to Stripe-based check if profile hasn’t updated yet
          const { data } = await supabase.functions.invoke('check-subscription');
          if ((data as any)?.subscribed) {
            clearInterval(pollInterval);
            await supabase.auth.refreshSession();
          }
        } catch (error) {
          console.log('Subscription activation poll:', error);
        }
      }, 5000);

      // Remove handled query params
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('subscription');
      nextParams.delete('from_checkout');
      setSearchParams(nextParams, { replace: true });

      return () => clearInterval(pollInterval);
    }

    if (subscription === 'canceled') {
      toast.info('Subscription checkout was canceled.', {
        duration: 4000,
      });
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
    ...(last24hCalls > 0 ? [{
      id: '3',
      type: 'scheduled_today' as const,
      title: 'Calls Today',
      count: last24hCalls,
      description: 'with lead potential'
    }] : [])
  ];

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

          {/* Profile Setup Banner */}
          <ProfileSetupBanner variant="full" />

          {/* AI Lead Status */}
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

          {/* Quick Overview Cards */}
          <QuickOverviewCards
            newLeadsToday={todaysLeads}
            pendingFollowups={pendingFollowups}
            hotLeads={hotLeads}
            recentCalls={last24hCalls}
          />

          {/* Priority Alerts */}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Calls"
              value={totalCalls}
              icon={Phone}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Leads Generated"
              value={leads.length}
              icon={Users}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Total Duration"
              value={formatDuration(totalDuration)}
              icon={Clock}
            />
            <StatCard
              title="Avg Sentiment"
              value={avgSentiment ? `${(avgSentiment * 100).toFixed(0)}%` : 'N/A'}
              icon={ThumbsUp}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Calls */}
            <div className="lg:col-span-2 card-enterprise overflow-hidden">
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Calls</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                  View All
                </Button>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : recordings.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No calls recorded yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start recording to see your calls here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.slice(0, 5).map((recording) => (
                      <div
                        key={recording.id}
                        onClick={() => navigate(`/recording/${recording.id}`)}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{recording.file_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(recording.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {recording.duration_seconds && (
                            <span className="text-sm text-muted-foreground">
                              {formatDuration(recording.duration_seconds)}
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              recording.status === 'analyzed'
                                ? 'bg-success/20 text-success'
                                : recording.status === 'processing'
                                ? 'bg-warning/20 text-warning'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {recording.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <RecentActivityFeed
              activities={recentActivities}
              onViewLead={(id) => navigate('/leads')}
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
        </div>
      </DashboardLayout>
    </>
  );
}
