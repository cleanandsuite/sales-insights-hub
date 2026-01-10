import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Phone, Clock, TrendingUp, MessageSquare, Target, BarChart3, Lightbulb, AlertTriangle, RefreshCw } from 'lucide-react';
import { AICoachingAnalytics } from '@/components/coaching/AICoachingAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

export default function Analytics() {
  const { data, loading, error, refetch } = useAnalytics();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = async () => {
    toast.info('Refreshing analytics...');
    await refetch();
    toast.success('Analytics updated');
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

  const talkRatioData = [
    { name: 'You', value: data.avgTalkRatio },
    { name: 'Them', value: 100 - data.avgTalkRatio }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Call performance metrics and AI coaching insights</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Call Performance</TabsTrigger>
            <TabsTrigger value="ai-coaching">AI Coaching ROI</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-coaching" className="space-y-6">
            <AICoachingAnalytics />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Calls (7d)"
                value={data.totalCalls}
                icon={Phone}
                trend={data.totalCalls > 0 ? { value: 12, isPositive: true } : undefined}
              />
              <StatCard
                title="Avg Duration"
                value={formatDuration(data.avgDuration)}
                icon={Clock}
              />
              <StatCard
                title="Lead Gen Rate"
                value={`${data.leadGenerationRate}%`}
                icon={Target}
                trend={data.leadGenerationRate > 30 ? { value: 5, isPositive: true } : undefined}
              />
              <StatCard
                title="Follow-up Conversion"
                value={`${data.followUpConversion}%`}
                icon={TrendingUp}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calls Over Time Chart */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Calls Over Time
                </h3>
                <div className="h-64">
                  {data.callsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.callsOverTime}>
                        <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="calls" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorCalls)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No call data yet. Record some calls to see trends.
                    </div>
                  )}
                </div>
              </div>

              {/* Talk Ratio */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Talk/Listen Ratio
                </h3>
                <div className="flex items-center gap-8">
                  <div className="h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={talkRatioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {talkRatioData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">{data.avgTalkRatio}%</p>
                      <p className="text-sm text-muted-foreground">You talking</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-accent">{100 - data.avgTalkRatio}%</p>
                      <p className="text-sm text-muted-foreground">Them talking</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: 40% you / 60% them
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Best Time to Call */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Best Time to Call
                </h3>
                <div className="h-48">
                  {data.bestTimes.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.bestTimes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Record calls at different times to see optimal call windows.
                    </div>
                  )}
                </div>
                {data.bestTimes.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {data.bestTimes.slice(0, 2).map((t, i) => (
                      <p key={i} className="text-sm text-foreground">
                        <span className={`font-medium ${i === 0 ? 'text-primary' : 'text-accent'}`}>
                          {t.time}
                        </span> - {t.rate}% success rate
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Performing Patterns */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Top Performing Patterns
                </h3>
                <div className="space-y-4">
                  {data.topPatterns.map((pattern, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">{pattern.pattern}</p>
                        <span className="text-sm font-bold text-accent">{pattern.success}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${pattern.success}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {data.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-orange-500/20 text-orange-600 text-xs flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-foreground">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Call Quality Metrics */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Call Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">{formatDuration(data.avgDuration)}</p>
                  <p className="text-sm text-muted-foreground">Avg Call Duration</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">{data.leadGenerationRate}%</p>
                  <p className="text-sm text-muted-foreground">Lead Generation Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">{data.followUpConversion}%</p>
                  <p className="text-sm text-muted-foreground">Follow-up Conversion</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">{data.avgQuestions}</p>
                  <p className="text-sm text-muted-foreground">Avg Questions/Call</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
