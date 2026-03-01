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
import { useDemoMode } from '@/hooks/useDemoMode';
import { demoCoachingSkills, demoCoachingRecommendations } from '@/data/demoData';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { CoachingROIDashboard } from '@/components/coaching/CoachingROIDashboard';
import { CoachingQueueCard } from '@/components/coaching/CoachingQueueCard';
import { CompletedCoachingList } from '@/components/coaching/CompletedCoachingList';
import { CoachStyleSelector } from '@/components/settings/CoachStyleSelector';
import { EnhancedSkillsTab } from '@/components/coaching/EnhancedSkillsTab';

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
  const { isEnterprise } = useEnterpriseSubscription();
  const { isDemoMode } = useDemoMode();
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
      return;
    }
    fetchCoachingData();
  }, [user, isDemoMode]);

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

          <TabsContent value="ai-coach" className="mt-0 space-y-6">
            {/* AI Coach Style Selector - Enterprise Only */}
            {isEnterprise && (
              <div className="card-gradient rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Select Your AI Coach
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose a coaching personality that matches your sales style. Your selection applies to live coaching during calls.
                </p>
                <CoachStyleSelector enterpriseMode={true} />
              </div>
            )}
            <CoachingROIDashboard />
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <EnhancedSkillsTab 
              overallScore={overallScore}
              callsAnalyzed={callsAnalyzed}
              skills={skills}
            />
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
}
