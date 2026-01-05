import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MissedOpportunitiesTab } from './MissedOpportunitiesTab';
import { BetterResponsesTab } from './BetterResponsesTab';
import { DealRisksTab } from './DealRisksTab';
import { ImprovementPlanTab } from './ImprovementPlanTab';
import { CoachingSummaryCard } from './CoachingSummaryCard';

interface CoachingSession {
  id: string;
  overall_score: number;
  win_probability: number;
  potential_win_probability: number;
  missed_opportunities: any[];
  deal_risks: any[];
  better_responses: any[];
  improvement_areas: any[];
  key_moments: any[];
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  action_items: string[];
}

interface DealCoachPanelProps {
  recordingId: string;
  transcript: string;
  userId: string;
}

export function DealCoachPanel({ recordingId, transcript, userId }: DealCoachPanelProps) {
  const [coaching, setCoaching] = useState<CoachingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    loadExistingSession();
  }, [recordingId]);

  const loadExistingSession = async () => {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      setCoaching(data as CoachingSession);
      setHasExisting(true);
    }
  };

  const runCoachingAnalysis = async () => {
    if (!transcript || transcript.length < 50) {
      toast.error('Transcript too short for meaningful coaching analysis');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('deal-coach', {
        body: { recordingId, transcript, userId }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCoaching(data as CoachingSession);
      setHasExisting(true);
      toast.success('AI coaching analysis complete!');
    } catch (error) {
      console.error('Coaching analysis failed:', error);
      toast.error('Failed to analyze call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!coaching && !loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">AI Deal Coach</CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            Get expert coaching on this call. Discover missed opportunities, better responses, and how to improve your win rate.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-4">
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-amber-500" />
              <span>Missed Opportunities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span>Better Responses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Win Probability</span>
            </div>
          </div>
          <Button 
            size="lg" 
            onClick={runCoachingAnalysis}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Analyze with AI Coach
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <Loader2 className="h-6 w-6 text-primary animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="text-center">
            <p className="font-medium">Analyzing your call...</p>
            <p className="text-sm text-muted-foreground">
              Our AI coach is reviewing the conversation for coaching insights
            </p>
          </div>
          <Progress value={66} className="w-48" />
        </CardContent>
      </Card>
    );
  }

  if (!coaching) return null;

  const improvementPotential = coaching.potential_win_probability - coaching.win_probability;

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Call Score</p>
                <p className="text-3xl font-bold">{coaching.overall_score}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${coaching.win_probability >= 60 ? 'border-l-green-500' : coaching.win_probability >= 40 ? 'border-l-amber-500' : 'border-l-red-500'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Probability</p>
                <p className="text-3xl font-bold">{coaching.win_probability}%</p>
              </div>
              <TrendingUp className={`h-6 w-6 ${coaching.win_probability >= 60 ? 'text-green-500' : coaching.win_probability >= 40 ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential</p>
                <p className="text-3xl font-bold">{coaching.potential_win_probability}%</p>
              </div>
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-3xl font-bold text-green-600">+{improvementPotential}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <CoachingSummaryCard 
        summary={coaching.executive_summary}
        strengths={coaching.strengths}
        weaknesses={coaching.weaknesses}
        actionItems={coaching.action_items}
      />

      {/* Detailed Coaching Tabs */}
      <Card>
        <Tabs defaultValue="opportunities" className="w-full">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Coaching Insights
              </CardTitle>
              <TabsList>
                <TabsTrigger value="opportunities" className="gap-1.5">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Missed Opportunities</span>
                  <Badge variant="secondary" className="ml-1">
                    {coaching.missed_opportunities?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="responses" className="gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Better Responses</span>
                  <Badge variant="secondary" className="ml-1">
                    {coaching.better_responses?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="risks" className="gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Deal Risks</span>
                  <Badge variant="secondary" className="ml-1">
                    {coaching.deal_risks?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="improvement" className="gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Improve</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <TabsContent value="opportunities" className="mt-0">
              <MissedOpportunitiesTab opportunities={coaching.missed_opportunities || []} />
            </TabsContent>
            
            <TabsContent value="responses" className="mt-0">
              <BetterResponsesTab responses={coaching.better_responses || []} />
            </TabsContent>
            
            <TabsContent value="risks" className="mt-0">
              <DealRisksTab risks={coaching.deal_risks || []} />
            </TabsContent>
            
            <TabsContent value="improvement" className="mt-0">
              <ImprovementPlanTab 
                areas={coaching.improvement_areas || []} 
                keyMoments={coaching.key_moments || []}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Re-analyze option */}
      {hasExisting && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={runCoachingAnalysis}
            disabled={loading}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Re-analyze with AI Coach
          </Button>
        </div>
      )}
    </div>
  );
}
