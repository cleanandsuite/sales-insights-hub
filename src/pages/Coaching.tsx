import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Award,
  BarChart3,
  Zap,
  Brain,
  ClipboardList
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CoachingROIDashboard } from '@/components/coaching/CoachingROIDashboard';
import { CoachingQueueCard } from '@/components/coaching/CoachingQueueCard';
import { CompletedCoachingList } from '@/components/coaching/CompletedCoachingList';

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

export default function Coaching() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [callsAnalyzed, setCallsAnalyzed] = useState(0);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchCoachingData();
  }, [user]);

  const fetchCoachingData = async () => {
    if (!user) return;

    try {
      const { data: recordings, error: recError } = await supabase
        .from('call_recordings')
        .select('id, sentiment_score, call_score_id')
        .eq('user_id', user.id)
        .eq('status', 'analyzed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (recError) throw recError;

      setCallsAnalyzed(recordings?.length || 0);

      if (recordings && recordings.length > 0) {
        const scores = recordings
          .filter(r => r.sentiment_score !== null)
          .map(r => (r.sentiment_score || 0) * 100);
        const avg = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;
        setOverallScore(Math.round(avg));
      }

      const { data: skillData, error: skillError } = await supabase
        .from('skill_progress')
        .select('skill_name, score, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (skillError) throw skillError;

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
          {
            id: '1',
            skill_area: 'objection_handling',
            recommendation: 'Practice the "feel, felt, found" technique for handling price objections',
            resource_url: null,
            resource_type: 'practice',
            is_completed: false
          },
          {
            id: '2',
            skill_area: 'discovery',
            recommendation: 'Ask more open-ended questions to uncover customer pain points',
            resource_url: null,
            resource_type: 'article',
            is_completed: false
          },
          {
            id: '3',
            skill_area: 'closing',
            recommendation: 'Try the assumptive close technique in your next 3 calls',
            resource_url: null,
            resource_type: 'practice',
            is_completed: false
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching coaching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coaching</h1>
          <p className="text-muted-foreground mt-1">Track your progress and improve your sales skills</p>
        </div>

        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="queue" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="ai-coach" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Target className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CoachingQueueCard />
              </div>
              <div>
                <CompletedCoachingList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-coach" className="mt-0">
            <CoachingROIDashboard />
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-gradient rounded-xl border border-border/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className={`h-8 w-8 ${getScoreColor(overallScore)}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                        {overallScore}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-gradient rounded-xl border border-border/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calls Analyzed</p>
                      <p className="text-4xl font-bold text-foreground">{callsAnalyzed}</p>
                    </div>
                  </div>
                </div>

                <div className="card-gradient rounded-xl border border-border/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-4xl font-bold text-foreground">7 days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="card-gradient rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Skill Breakdown
                </h2>
                
                <div className="space-y-5">
                  {skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(skill.trend)}
                          <span className={`text-sm font-semibold ${getScoreColor(skill.current)}`}>
                            {skill.current}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`absolute inset-y-0 left-0 rounded-full transition-all ${getProgressColor(skill.current)}`}
                          style={{ width: `${skill.current}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Trend */}
              <div className="card-gradient rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Performance Trend</h2>
                
                <div className="h-48 flex items-end justify-between gap-2">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const height = 30 + Math.random() * 60;
                    const isGood = height >= 70;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: isGood 
                            ? 'hsl(var(--success) / 0.6)' 
                            : height >= 50 
                              ? 'hsl(var(--warning) / 0.6)' 
                              : 'hsl(var(--destructive) / 0.4)'
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>2 weeks ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-0">
            <div className="card-gradient rounded-xl border border-border/50 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Training Recommendations
              </h2>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                          {rec.skill_area.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-foreground">{rec.recommendation}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3 pl-11">
                      <Button size="sm" variant="outline" className="text-xs">
                        Start Practice
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Skip
                      </Button>
                    </div>
                  </div>
                ))}

                {recommendations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recommendations yet. Complete more calls to get personalized tips!
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
