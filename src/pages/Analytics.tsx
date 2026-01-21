import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAnalyticsV2, TimeRange } from '@/hooks/useAnalyticsV2';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { AICoachingAnalytics } from '@/components/coaching/AICoachingAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Analytics Components
import { AnalyticsOverviewCards } from '@/components/analytics/AnalyticsOverviewCards';
import { PerformanceRadarChart } from '@/components/analytics/PerformanceRadarChart';
import { ScoreDistributionChart } from '@/components/analytics/ScoreDistributionChart';
import { SkillTrendChart } from '@/components/analytics/SkillTrendChart';
import { TimeHeatmap } from '@/components/analytics/TimeHeatmap';
import { TalkRatioDonut } from '@/components/analytics/TalkRatioDonut';
import { TopPatternsGrid } from '@/components/analytics/TopPatternsGrid';
import { ImprovementFocus } from '@/components/analytics/ImprovementFocus';
import { CompetitorIntelligence } from '@/components/analytics/CompetitorIntelligence';
import { CallsOverTimeChart } from '@/components/analytics/CallsOverTimeChart';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data, loading, error, refetch } = useAnalyticsV2(timeRange);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Real-time performance metrics and AI coaching insights</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-muted rounded-lg p-1">
              {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="performance">Call Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills & Trends</TabsTrigger>
            <TabsTrigger value="ai-coaching">AI Coaching ROI</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Executive Summary Cards */}
            <AnalyticsOverviewCards data={data} />

            {/* Main Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              <CallsOverTimeChart data={data.callsOverTime} />
              <TalkRatioDonut 
                you={data.talkRatio.you} 
                them={data.talkRatio.them} 
                isOptimal={data.talkRatio.isOptimal} 
              />
            </div>

            {/* Secondary Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <TimeHeatmap data={data.callsByTimeSlot} />
              <ScoreDistributionChart distribution={data.scoreDistribution} />
            </div>

            {/* Patterns & Improvements */}
            <div className="grid lg:grid-cols-3 gap-6">
              <TopPatternsGrid patterns={data.topPatterns} />
              <ImprovementFocus areas={data.improvementAreas} />
              <CompetitorIntelligence competitors={data.competitorMentions} />
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <PerformanceRadarChart 
                currentSkills={data.currentSkills} 
                previousSkills={data.previousSkills} 
              />
              <SkillTrendChart trends={data.skillTrends} />
            </div>
          </TabsContent>

          {/* AI Coaching Tab */}
          <TabsContent value="ai-coaching" className="space-y-6">
            <AICoachingAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
