import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Phone, Clock, TrendingUp, MessageSquare, Target, Percent, Users, BarChart3, Lightbulb, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CallMetrics {
  totalCalls: number;
  avgDuration: number;
  avgTalkRatio: number;
  avgQuestions: number;
  leadGenerationRate: number;
  followUpConversion: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CallMetrics>({
    totalCalls: 0,
    avgDuration: 0,
    avgTalkRatio: 55,
    avgQuestions: 6,
    leadGenerationRate: 42,
    followUpConversion: 68
  });
  const [callsOverTime, setCallsOverTime] = useState<any[]>([]);
  const [topPatterns, setTopPatterns] = useState<any[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    const [recordingsResult, scoresResult, summariesResult] = await Promise.all([
      supabase.from('call_recordings').select('*').order('created_at', { ascending: true }),
      supabase.from('call_scores').select('*'),
      supabase.from('call_summaries').select('*')
    ]);

    const recordings = recordingsResult.data || [];
    const scores = scoresResult.data || [];
    const summaries = summariesResult.data || [];

    // Calculate metrics
    const totalCalls = recordings.length;
    const avgDuration = recordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / (totalCalls || 1);
    
    const avgTalkRatio = summaries.length > 0 
      ? summaries.reduce((acc, s) => acc + (s.talk_ratio_you || 50), 0) / summaries.length 
      : 55;
    
    const avgQuestions = summaries.length > 0
      ? summaries.reduce((acc, s) => acc + (s.question_count_you || 5), 0) / summaries.length
      : 6;

    setMetrics({
      totalCalls,
      avgDuration,
      avgTalkRatio,
      avgQuestions,
      leadGenerationRate: 42,
      followUpConversion: 68
    });

    // Group calls by date for chart
    const callsByDate: Record<string, number> = {};
    recordings.forEach(r => {
      const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      callsByDate[date] = (callsByDate[date] || 0) + 1;
    });
    
    setCallsOverTime(Object.entries(callsByDate).slice(-14).map(([date, count]) => ({
      date,
      calls: count
    })));

    // Set example patterns and improvements
    setTopPatterns([
      { pattern: 'Problem → Solution → Timeline', success: 89 },
      { pattern: 'Question-heavy first 2 mins', success: 76 },
      { pattern: 'Competitor comparison mid-call', success: 82 }
    ]);

    setImprovements([
      'Reduce talk time by 15%',
      'Ask 2 more questions per call',
      'Address pricing earlier (avg: 4.2 mins)'
    ]);

    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const COLORS = ['hsl(186, 100%, 50%)', 'hsl(152, 76%, 44%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

  const talkRatioData = [
    { name: 'You', value: metrics.avgTalkRatio },
    { name: 'Them', value: 100 - metrics.avgTalkRatio }
  ];

  const bestTimesData = [
    { time: '9 AM', rate: 78 },
    { time: '10 AM', rate: 92 },
    { time: '11 AM', rate: 85 },
    { time: '2 PM', rate: 88 },
    { time: '3 PM', rate: 76 },
    { time: '4 PM', rate: 84 }
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Call performance metrics and conversation intelligence</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Calls"
            value={metrics.totalCalls}
            icon={Phone}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Avg Duration"
            value={formatDuration(metrics.avgDuration)}
            icon={Clock}
          />
          <StatCard
            title="Lead Gen Rate"
            value={`${metrics.leadGenerationRate}%`}
            icon={Target}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Follow-up Conversion"
            value={`${metrics.followUpConversion}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calls Over Time Chart */}
          <div className="card-gradient rounded-xl border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Calls Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={callsOverTime}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 8%)', 
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="hsl(186, 100%, 50%)" 
                    fillOpacity={1} 
                    fill="url(#colorCalls)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Talk Ratio */}
          <div className="card-gradient rounded-xl border border-border/50 p-6">
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
                      {talkRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{metrics.avgTalkRatio}%</p>
                  <p className="text-sm text-muted-foreground">You talking</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-success">{100 - metrics.avgTalkRatio}%</p>
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
          <div className="card-gradient rounded-xl border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Best Time to Call
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestTimesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="time" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 8%)', 
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="rate" fill="hsl(186, 100%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-foreground">
                <span className="text-success font-medium">10:30 AM</span> - 92% answer rate
              </p>
              <p className="text-sm text-foreground">
                <span className="text-primary font-medium">2:15 PM</span> - 88% engagement
              </p>
            </div>
          </div>

          {/* Top Performing Patterns */}
          <div className="card-gradient rounded-xl border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Top Performing Patterns
            </h3>
            <div className="space-y-4">
              {topPatterns.map((pattern, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{pattern.pattern}</p>
                    <span className="text-sm font-bold text-success">{pattern.success}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full"
                      style={{ width: `${pattern.success}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="card-gradient rounded-xl border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call Quality Metrics */}
        <div className="card-gradient rounded-xl border border-border/50 p-6">
          <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Call Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-3xl font-bold text-foreground">{formatDuration(metrics.avgDuration)}</p>
              <p className="text-sm text-muted-foreground">Avg Call Duration</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-3xl font-bold text-foreground">{metrics.leadGenerationRate}%</p>
              <p className="text-sm text-muted-foreground">Lead Generation Rate</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-3xl font-bold text-foreground">{metrics.followUpConversion}%</p>
              <p className="text-sm text-muted-foreground">Follow-up Conversion</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-3xl font-bold text-foreground">{Math.round(metrics.avgQuestions)}</p>
              <p className="text-sm text-muted-foreground">Avg Questions/Call</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
