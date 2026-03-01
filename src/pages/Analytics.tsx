import { useState, useEffect } from 'react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { demoCoachingSkills, demoCoachingRecommendations, demoAnalyticsData } from '@/data/demoData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAnalyticsV2, TimeRange } from '@/hooks/useAnalyticsV2';
import { AlertTriangle, RefreshCw, Brain, Target, BookOpen, ClipboardList } from 'lucide-react';
import { AICoachingAnalytics } from '@/components/coaching/AICoachingAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { CoachingROIDashboard } from '@/components/coaching/CoachingROIDashboard';
import { CoachingQueueCard } from '@/components/coaching/CoachingQueueCard';
import { CompletedCoachingList } from '@/components/coaching/CompletedCoachingList';
import { CoachStyleSelector } from '@/components/settings/CoachStyleSelector';
import { EnhancedSkillsTab } from '@/components/coaching/EnhancedSkillsTab';
import { ManagerCoachingCommands } from '@/components/coaching/ManagerCoachingCommands';
import { supabase } from '@/integrations/supabase/client';

// Analytics Components
import { AnalyticsOverviewCards } from '@/components/analytics/AnalyticsOverviewCards';
import { PerformanceRadarChart } from '@/components/analytics/PerformanceRadarChart';
import { ScoreDistributionChart } from '@/components/analytics/ScoreDistributionChart';
import { SkillTrendChart } from '@/components/analytics/SkillTrendChart';
// SkillBreakdownPanel is now integrated inside PerformanceRadarChart
import { TimeHeatmap } from '@/components/analytics/TimeHeatmap';
import { TalkRatioDonut } from '@/components/analytics/TalkRatioDonut';
import { TopPatternsGrid } from '@/components/analytics/TopPatternsGrid';
import { ImprovementFocus } from '@/components/analytics/ImprovementFocus';
import { CompetitorIntelligence } from '@/components/analytics/CompetitorIntelligence';
import { CallsOverTimeChart } from '@/components/analytics/CallsOverTimeChart';

interface SkillData {
  name: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
}

interface Recommendation {
  id: string;
  skill_area: string;
  recommendation: string;
  resource_url: string | null;
  resource_type: string | null;
  is_completed: boolean;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: realData, loading: realLoading, error, refetch } = useAnalyticsV2(timeRange);
  const { user } = useAuth();
  const { isEnterprise } = useEnterpriseSubscription();
  const { isManager } = useUserRole();
  const { isDemoMode } = useDemoMode();

  const loading = realLoading;
  const data = isDemoMode ? {
    totalCalls: { value: demoAnalyticsData.totalCalls, change: 15, isPositive: true },
    avgScore: { value: demoAnalyticsData.avgScore, change: 8, isPositive: true },
    winRate: { value: 42, change: 5, isPositive: true },
    avgDuration: { value: demoAnalyticsData.avgDuration, change: 12, isPositive: true },
    talkRatio: demoAnalyticsData.talkRatio,
    avgQuestions: { value: 7, change: 2, isPositive: true },
    currentSkills: { ...demoAnalyticsData.currentSkills, engagement: 85 },
    previousSkills: { ...demoAnalyticsData.previousSkills, engagement: 78 },
    skillTrends: demoAnalyticsData.skillTrends.map(s => ({ ...s, overall: Math.round((s.rapport + s.discovery + s.presentation + s.closing + s.objectionHandling) / 5) })),
    scoreDistribution: demoAnalyticsData.scoreDistribution.map(s => ({ ...s, percentage: Math.round((s.count / 10) * 100) })),
    callsByTimeSlot: demoAnalyticsData.callsByTimeSlot.map(s => ({ ...s, day: 'Mon', successRate: 70 })),
    topPatterns: demoAnalyticsData.topPatterns,
    improvementAreas: demoAnalyticsData.improvementAreas.map(a => ({ area: a.area, frequency: 3, priority: 'high' as const, recommendation: a.suggestion })),
    competitorMentions: demoAnalyticsData.competitorMentions.map(c => ({ competitor: c.name, count: c.count, winRate: 65 })),
    callsOverTime: demoAnalyticsData.callsOverTime.map(c => ({ date: c.date, calls: c.count, avgScore: 78 })),
  } satisfies import('@/hooks/useAnalyticsV2').AnalyticsDataV2 : realData;

  // Coaching state
  const [coachingLoading, setCoachingLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [callsAnalyzed, setCallsAnalyzed] = useState(0);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      setOverallScore(78);
      setCallsAnalyzed(12);
      setSkills(demoCoachingSkills);
      setRecommendations(demoCoachingRecommendations as Recommendation[]);
      setCoachingLoading(false);
      return;
    }
    fetchCoachingData();
  }, [user, isDemoMode]);

  const fetchCoachingData = async () => {
    if (!user) return;
    try {
      const { data: recordings } = await supabase
        .from('call_recordings')
        .select('id, sentiment_score, call_score_id')
        .eq('user_id', user.id)
        .eq('status', 'analyzed')
        .order('created_at', { ascending: false })
        .limit(20);

      setCallsAnalyzed(recordings?.length || 0);

      if (recordings && recordings.length > 0) {
        const scores = recordings
          .filter(r => r.sentiment_score !== null)
          .map(r => (r.sentiment_score || 0) * 100);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        setOverallScore(Math.round(avg));
      }

      const { data: skillData } = await supabase
        .from('skill_progress')
        .select('skill_name, score, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      const skillMap = new Map<string, number[]>();
      skillData?.forEach(s => {
        const existing = skillMap.get(s.skill_name) || [];
        existing.push(Number(s.score));
        skillMap.set(s.skill_name, existing);
      });

      const processedSkills: SkillData[] = [];
      const defaultSkills = ['Rapport', 'Discovery', 'Presentation', 'Objection Handling', 'Closing'];
      defaultSkills.forEach(skillName => {
        const scores = skillMap.get(skillName.toLowerCase()) || [];
        const current = scores[0] || Math.random() * 30 + 50;
        const previous = scores[1] || current - (Math.random() * 10 - 5);
        processedSkills.push({
          name: skillName,
          current: Math.round(current),
          previous: Math.round(previous),
          trend: current > previous ? 'up' : current < previous ? 'down' : 'stable'
        });
      });
      setSkills(processedSkills);

      const { data: recData, error: recRecsError } = await supabase
        .from('training_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('priority', { ascending: true })
        .limit(5);

      if (!recRecsError && recData) {
        setRecommendations(recData);
      } else {
        setRecommendations([
          { id: '1', skill_area: 'objection_handling', recommendation: 'Practice the "feel, felt, found" technique for handling price objections', resource_url: null, resource_type: 'practice', is_completed: false },
          { id: '2', skill_area: 'discovery', recommendation: 'Ask more open-ended questions to uncover customer pain points', resource_url: null, resource_type: 'article', is_completed: false },
          { id: '3', skill_area: 'closing', recommendation: 'Try the assumptive close technique in your next 3 calls', resource_url: null, resource_type: 'practice', is_completed: false }
        ]);
      }
    } catch (err) {
      console.error('Error fetching coaching data:', err);
    } finally {
      setCoachingLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.info('Refreshing analytics...');
    await refetch();
    toast.success('Analytics updated');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics & Coaching</h1>
            <p className="text-sm text-muted-foreground mt-1">Performance metrics, AI insights, and coaching tools</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex bg-muted rounded-lg p-1">
              {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="performance" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1 w-full">
            <TabsTrigger value="performance" className="flex-1 sm:flex-none text-xs sm:text-sm">Performance</TabsTrigger>
            <TabsTrigger value="skills" className="flex-1 sm:flex-none text-xs sm:text-sm">Skills</TabsTrigger>
            <TabsTrigger value="coaching-queue" className="gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
              <ClipboardList className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Coaching </span>Queue
            </TabsTrigger>
            <TabsTrigger value="ai-coach" className="gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
              <Brain className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="coaching-roi" className="flex-1 sm:flex-none text-xs sm:text-sm">ROI</TabsTrigger>
          </TabsList>

          {/* Analytics: Performance Tab */}
          <TabsContent value="performance" className="space-y-4 sm:space-y-6">
            <AnalyticsOverviewCards data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <CallsOverTimeChart data={data.callsOverTime} />
              <TalkRatioDonut 
                you={data.talkRatio.you} 
                them={data.talkRatio.them} 
                isOptimal={data.talkRatio.isOptimal} 
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TimeHeatmap data={data.callsByTimeSlot} />
              <ScoreDistributionChart distribution={data.scoreDistribution} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <TopPatternsGrid patterns={data.topPatterns} />
              <ImprovementFocus areas={data.improvementAreas} />
              <CompetitorIntelligence competitors={data.competitorMentions} />
            </div>
          </TabsContent>

          {/* Analytics: Skills Tab - Radar is now primary/first */}
          <TabsContent value="skills" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Radar Chart - Primary, takes 2 cols */}
              <div className="lg:col-span-2">
                <PerformanceRadarChart 
                  currentSkills={data.currentSkills} 
                  previousSkills={data.previousSkills} 
                />
              </div>
              {/* Stats on the right side of radar */}
              <div className="lg:col-span-3">
                {!coachingLoading && (
                  <EnhancedSkillsTab 
                    overallScore={overallScore}
                    callsAnalyzed={callsAnalyzed}
                    skills={skills}
                  />
                )}
              </div>
            </div>
            <SkillTrendChart trends={data.skillTrends} />
          </TabsContent>

          {/* Coaching: Queue Tab - Now with Manager Commands */}
          <TabsContent value="coaching-queue" className="mt-0 space-y-6">
            {/* Manager Commands Section - shown to managers/enterprise */}
            {(isManager || isEnterprise) && (
              <ManagerCoachingCommands />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CoachingQueueCard />
              </div>
              <div>
                <CompletedCoachingList />
              </div>
            </div>
          </TabsContent>

          {/* Coaching: AI Coach Tab */}
          <TabsContent value="ai-coach" className="mt-0 space-y-6">
            {isEnterprise && (
              <div className="card-gradient rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Select Your AI Coach
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose a coaching personality that matches your sales style.
                </p>
                <CoachStyleSelector enterpriseMode={true} />
              </div>
            )}
            <AICoachingAnalytics />
          </TabsContent>

          {/* Coaching: ROI Tab */}
          <TabsContent value="coaching-roi" className="mt-0 space-y-6">
            <CoachingROIDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
