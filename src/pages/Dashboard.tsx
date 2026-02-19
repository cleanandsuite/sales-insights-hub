import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DealPriorityCard } from '@/components/dashboard/DealPriorityCard';
import { RecentCallCard } from '@/components/dashboard/RecentCallCard';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';
import { AIStatusBar } from '@/components/dashboard/AIStatusBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, DollarSign, Target, TrendingUp, BarChart3, ArrowRight, Mic, Clock, Star
} from 'lucide-react';

// Inline Call Activity Feed (from Recordings page logic, simplified)
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

const revenueData = [
  { month: 'Jul', revenue: 35000, target: 50000 },
  { month: 'Aug', revenue: 42000, target: 50000 },
  { month: 'Sep', revenue: 58000, target: 60000 },
  { month: 'Oct', revenue: 72000, target: 70000 },
  { month: 'Nov', revenue: 89000, target: 85000 },
  { month: 'Dec', revenue: 95000, target: 90000 },
  { month: 'Jan', revenue: 45000, target: 100000 },
];

const priorityDeals = [
  { name: 'Enterprise License', company: 'Acme Corp', value: 125000, stage: 'Proposal', health: 'at_risk' as const, alert: 'No contact in 8 days', nextAction: 'Schedule follow-up call' },
  { name: 'Platform Migration', company: 'TechStart Inc', value: 89000, stage: 'Qualification', health: 'on_track' as const, nextAction: 'Send proposal deck' },
  { name: 'Annual Renewal', company: 'Global Systems', value: 67000, stage: 'Negotiation', health: 'monitor' as const, alert: 'Competitor mentioned', nextAction: 'Prepare competitive analysis' },
  { name: 'Expansion Deal', company: 'MegaCorp', value: 156000, stage: 'Proposal', health: 'on_track' as const, nextAction: 'Demo scheduled Thursday' },
];

const recentCalls = [
  {
    contactName: 'John Smith',
    company: 'Apex Energy Solutions',
    score: 75,
    summary: 'High energy costs driving urgency. Budget approved for Q1. Need to address integration concerns.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    buyingSignals: ['Budget Confirmed', 'Timeline Q1'],
  },
  {
    contactName: 'Sarah Chen',
    company: 'YouTube Channel Growth',
    score: 95,
    summary: 'Excellent call — SEO strategy resonated well. Ready to move to proposal stage.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    buyingSignals: ['Budget', 'Timeline Q1', 'Decision Maker'],
  },
];

function CallActivityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('call_recordings')
      .select('id, name, file_name, status, sentiment_score, duration_seconds, created_at, summary, key_topics')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setRecordings(data || []);
        setLoading(false);
      });
  }, [user]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    const pct = score * 100;
    if (pct >= 70) return 'text-green-600';
    if (pct >= 40) return 'text-yellow-600';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mic className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No calls recorded yet</p>
        <p className="text-sm mt-1">Your call activity will appear here after your first call.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recordings.map((rec) => {
        const displayName = rec.name || rec.file_name;
        const score = rec.sentiment_score ? Math.round(rec.sentiment_score * 100) : null;
        return (
          <div
            key={rec.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/30 transition-colors cursor-pointer"
            onClick={() => navigate('/recordings')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground truncate">{displayName}</p>
                <span className="text-xs text-muted-foreground shrink-0">{formatTime(rec.created_at)}</span>
              </div>
              {rec.summary && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{rec.summary}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {rec.duration_seconds && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(rec.duration_seconds)}
                  </span>
                )}
                {score !== null && (
                  <span className={`flex items-center gap-1 text-xs font-semibold ${getScoreColor(rec.sentiment_score)}`}>
                    <Star className="h-3 w-3" />
                    {score}/100
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    rec.status === 'analyzed'
                      ? 'border-green-500/30 text-green-600'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {rec.status === 'analyzed' ? 'AI Analyzed' : rec.status || 'Pending'}
                </Badge>
                {rec.key_topics?.slice(0, 2).map((t: string) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
      )}
      
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={(phone) => setActiveCall(phone)}
      />
      
      <DashboardLayout>
        <div className="bg-dashboard-gradient -m-3 sm:-m-4 lg:-m-8 p-3 sm:p-4 lg:p-8 min-h-screen space-y-4 sm:space-y-6">
          {/* Header */}
          <DashboardHeader onStartCall={() => setShowCallDialog(true)} />

          {/* AI Status */}
          <AIStatusBar
            isActive={true}
            todayLeads={12}
            weekLeads={47}
            conversionRate={68}
            avgResponseTime="2.4 min"
          />

          {/* Dashboard Tabs */}
          <Tabs defaultValue="calls" className="space-y-6">
            <TabsList className="bg-muted/50 h-10">
              <TabsTrigger value="calls" className="gap-2">
                <Phone className="h-4 w-4" />
                Calls & Activity
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue & Pipeline
              </TabsTrigger>
            </TabsList>

            {/* === CALLS TAB === */}
            <TabsContent value="calls" className="space-y-6 mt-0">
              {/* Call KPIs only */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Calls Today"
                  value="1"
                  icon={Phone}
                  iconColor="text-primary"
                  highlight="4 hot leads 🔥"
                  highlightColor="warning"
                  action={{ label: 'View Queue', onClick: () => navigate('/leads') }}
                />
                <MetricCard
                  label="Avg Call Score"
                  value="82"
                  icon={Star}
                  iconColor="text-warning"
                  subtitle="Last 7 days"
                  trend={{ value: 4.2, direction: 'up' }}
                />
                <MetricCard
                  label="Calls This Week"
                  value="14"
                  icon={Mic}
                  iconColor="text-primary"
                  subtitle="vs 11 last week"
                  trend={{ value: 27, direction: 'up' }}
                />
              </div>

              {/* Recent AI-Coached Calls */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Recent Calls
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => navigate('/recordings')}
                    >
                      View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {recentCalls.map((call, i) => (
                      <RecentCallCard
                        key={i}
                        {...call}
                        onViewSummary={() => navigate('/recordings')}
                        onViewLead={() => navigate('/leads')}
                        onCall={() => setShowCallDialog(true)}
                        onSchedule={() => navigate('/schedule')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Call Activity Feed */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      Call Activity Feed
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => navigate('/recordings')}
                    >
                      All Recordings <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CallActivityFeed />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === REVENUE TAB === */}
            <TabsContent value="revenue" className="space-y-6 mt-0">
              {/* Revenue KPIs */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Total Revenue"
                  value="$301K"
                  icon={DollarSign}
                  iconColor="text-success"
                  progress={{ current: 301000, goal: 500000, label: '60% of annual goal' }}
                  trend={{ value: 12.5, direction: 'up' }}
                />
                <MetricCard
                  label="Pipeline"
                  value="$2.1M"
                  icon={BarChart3}
                  iconColor="text-primary"
                  subtitle="47 open deals"
                  trend={{ value: 5.8, direction: 'up' }}
                />
                <MetricCard
                  label="Win Rate"
                  value="68%"
                  icon={Target}
                  iconColor="text-warning"
                  subtitle="24 Won / 11 Lost"
                  trend={{ value: 3, direction: 'up' }}
                />
              </div>

              {/* Revenue Chart + Priority Deals */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <RevenueTrendChart data={revenueData} goal={100000} />
                </div>
                <Card className="lg:col-span-2 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Priority Deals
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => navigate('/enterprise')}
                      >
                        View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {priorityDeals.map((deal, i) => (
                      <DealPriorityCard
                        key={i}
                        {...deal}
                        onClick={() => navigate('/enterprise')}
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
