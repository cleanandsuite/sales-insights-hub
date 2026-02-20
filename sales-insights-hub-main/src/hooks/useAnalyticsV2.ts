import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type TimeRange = '7d' | '30d' | '90d';

interface SkillScores {
  rapport: number;
  discovery: number;
  presentation: number;
  closing: number;
  objectionHandling: number;
  engagement: number;
}

interface TrendData {
  value: number;
  change: number;
  isPositive: boolean;
}

interface CallsByHour {
  hour: number;
  day: string;
  count: number;
  successRate: number;
}

interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface SkillTrend {
  date: string;
  overall: number;
  rapport: number;
  discovery: number;
  presentation: number;
  closing: number;
  objectionHandling: number;
}

interface TopPattern {
  pattern: string;
  count: number;
  successRate: number;
}

interface ImprovementArea {
  area: string;
  frequency: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface CompetitorMention {
  competitor: string;
  count: number;
  winRate: number;
}

export interface AnalyticsDataV2 {
  // Executive Summary
  totalCalls: TrendData;
  avgScore: TrendData;
  winRate: TrendData;
  avgDuration: TrendData;
  talkRatio: { you: number; them: number; isOptimal: boolean };
  avgQuestions: TrendData;
  
  // Skill Analysis
  currentSkills: SkillScores;
  previousSkills: SkillScores;
  skillTrends: SkillTrend[];
  
  // Distribution & Patterns
  scoreDistribution: ScoreDistribution[];
  callsByTimeSlot: CallsByHour[];
  topPatterns: TopPattern[];
  improvementAreas: ImprovementArea[];
  
  // Competitive Intelligence
  competitorMentions: CompetitorMention[];
  
  // Raw counts for charts
  callsOverTime: Array<{ date: string; calls: number; avgScore: number }>;
}

const defaultSkills: SkillScores = {
  rapport: 0,
  discovery: 0,
  presentation: 0,
  closing: 0,
  objectionHandling: 0,
  engagement: 0
};

const defaultData: AnalyticsDataV2 = {
  totalCalls: { value: 0, change: 0, isPositive: true },
  avgScore: { value: 0, change: 0, isPositive: true },
  winRate: { value: 0, change: 0, isPositive: true },
  avgDuration: { value: 0, change: 0, isPositive: true },
  talkRatio: { you: 50, them: 50, isOptimal: false },
  avgQuestions: { value: 0, change: 0, isPositive: true },
  currentSkills: defaultSkills,
  previousSkills: defaultSkills,
  skillTrends: [],
  scoreDistribution: [],
  callsByTimeSlot: [],
  topPatterns: [],
  improvementAreas: [],
  competitorMentions: [],
  callsOverTime: []
};

export function useAnalyticsV2(timeRange: TimeRange = '30d') {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsDataV2>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateRanges = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - days);
    
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);
    
    return {
      currentStart: currentStart.toISOString(),
      previousStart: previousStart.toISOString(),
      previousEnd: currentStart.toISOString(),
      now: now.toISOString()
    };
  }, [timeRange]);

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        currentRecordingsResult,
        previousRecordingsResult,
        currentScoresResult,
        previousScoresResult,
        summariesResult,
        leadsResult,
        coachingResult
      ] = await Promise.all([
        // Current period recordings
        supabase
          .from('call_recordings')
          .select('id, created_at, duration_seconds, sentiment_score')
          .eq('user_id', user.id)
          .gte('created_at', dateRanges.currentStart)
          .order('created_at', { ascending: true }),
        
        // Previous period recordings
        supabase
          .from('call_recordings')
          .select('id, created_at, duration_seconds')
          .eq('user_id', user.id)
          .gte('created_at', dateRanges.previousStart)
          .lt('created_at', dateRanges.previousEnd),
        
        // Current period scores
        supabase
          .from('call_scores')
          .select(`
            recording_id, overall_score, rapport_score, discovery_score,
            presentation_score, closing_score, objection_handling_score,
            talk_ratio, questions_asked, filler_words_count, competitor_mentions,
            created_at
          `)
          .gte('created_at', dateRanges.currentStart),
        
        // Previous period scores
        supabase
          .from('call_scores')
          .select('overall_score, rapport_score, discovery_score, presentation_score, closing_score, objection_handling_score')
          .gte('created_at', dateRanges.previousStart)
          .lt('created_at', dateRanges.previousEnd),
        
        // Call summaries for talk ratio
        supabase
          .from('call_summaries')
          .select('talk_ratio_you, talk_ratio_them, question_count_you, recording_id')
          .order('created_at', { ascending: false })
          .limit(100),
        
        // Leads for win rate calculation
        supabase
          .from('leads')
          .select('id, recording_id, lead_status, created_at')
          .eq('user_id', user.id),
        
        // Coaching sessions for patterns and improvements
        supabase
          .from('coaching_sessions')
          .select('strengths, weaknesses, improvement_areas, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      // Handle errors
      if (currentRecordingsResult.error) throw currentRecordingsResult.error;
      if (currentScoresResult.error) throw currentScoresResult.error;

      const currentRecordings = currentRecordingsResult.data || [];
      const previousRecordings = previousRecordingsResult.data || [];
      const currentScores = currentScoresResult.data || [];
      const previousScores = previousScoresResult.data || [];
      const summaries = summariesResult.data || [];
      const leads = leadsResult.data || [];
      const coachingSessions = coachingResult.data || [];

      // 1. EXECUTIVE SUMMARY METRICS
      
      // Total Calls with trend
      const totalCallsCurrent = currentRecordings.length;
      const totalCallsPrevious = previousRecordings.length;
      const totalCallsChange = totalCallsPrevious > 0 
        ? Math.round(((totalCallsCurrent - totalCallsPrevious) / totalCallsPrevious) * 100)
        : 0;

      // Average Score with trend
      const avgScoreCurrent = currentScores.length > 0
        ? Math.round(currentScores.reduce((acc, s) => acc + (s.overall_score || 0), 0) / currentScores.length)
        : 0;
      const avgScorePrevious = previousScores.length > 0
        ? Math.round(previousScores.reduce((acc, s) => acc + (s.overall_score || 0), 0) / previousScores.length)
        : 0;
      const avgScoreChange = avgScorePrevious > 0
        ? Math.round(avgScoreCurrent - avgScorePrevious)
        : 0;

      // Win Rate calculation
      const currentRecordingIds = new Set(currentRecordings.map(r => r.id));
      const winsInPeriod = leads.filter(l => 
        l.recording_id && 
        currentRecordingIds.has(l.recording_id) && 
        (l.lead_status === 'won' || l.lead_status === 'closed_won' || l.lead_status === 'qualified')
      ).length;
      const winRateCurrent = totalCallsCurrent > 0 
        ? Math.round((winsInPeriod / totalCallsCurrent) * 100) 
        : 0;
      
      const previousRecordingIds = new Set(previousRecordings.map(r => r.id));
      const winsPrevious = leads.filter(l => 
        l.recording_id && previousRecordingIds.has(l.recording_id) &&
        (l.lead_status === 'won' || l.lead_status === 'closed_won' || l.lead_status === 'qualified')
      ).length;
      const winRatePrevious = totalCallsPrevious > 0
        ? Math.round((winsPrevious / totalCallsPrevious) * 100)
        : 0;
      const winRateChange = winRateCurrent - winRatePrevious;

      // Average Duration
      const avgDurationCurrent = totalCallsCurrent > 0
        ? Math.round(currentRecordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / totalCallsCurrent)
        : 0;
      const avgDurationPrevious = totalCallsPrevious > 0
        ? Math.round(previousRecordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / totalCallsPrevious)
        : 0;
      const durationChange = avgDurationPrevious > 0
        ? Math.round(((avgDurationCurrent - avgDurationPrevious) / avgDurationPrevious) * 100)
        : 0;

      // Talk Ratio
      const avgTalkRatioYou = summaries.length > 0
        ? Math.round(summaries.reduce((acc, s) => acc + (s.talk_ratio_you || 50), 0) / summaries.length)
        : 50;
      const isOptimalTalkRatio = avgTalkRatioYou >= 35 && avgTalkRatioYou <= 45;

      // Average Questions
      const avgQuestionsCurrent = summaries.length > 0
        ? Math.round(summaries.reduce((acc, s) => acc + (s.question_count_you || 0), 0) / summaries.length)
        : 0;

      // 2. SKILL ANALYSIS
      
      const calculateSkills = (scores: Array<{ rapport_score: number; discovery_score: number; presentation_score: number; closing_score: number; objection_handling_score: number; overall_score: number }>): SkillScores => {
        if (scores.length === 0) return defaultSkills;
        return {
          rapport: Math.round(scores.reduce((acc, s) => acc + (s.rapport_score || 0), 0) / scores.length),
          discovery: Math.round(scores.reduce((acc, s) => acc + (s.discovery_score || 0), 0) / scores.length),
          presentation: Math.round(scores.reduce((acc, s) => acc + (s.presentation_score || 0), 0) / scores.length),
          closing: Math.round(scores.reduce((acc, s) => acc + (s.closing_score || 0), 0) / scores.length),
          objectionHandling: Math.round(scores.reduce((acc, s) => acc + (s.objection_handling_score || 0), 0) / scores.length),
          engagement: Math.round(scores.reduce((acc, s) => acc + ((s.overall_score || 0) * 0.8 + (s.rapport_score || 0) * 0.2), 0) / scores.length)
        };
      };

      const currentSkills = calculateSkills(currentScores);
      const previousSkills = calculateSkills(previousScores as Array<{ rapport_score: number; discovery_score: number; presentation_score: number; closing_score: number; objection_handling_score: number; overall_score: number }>);

      // 3. SKILL TRENDS OVER TIME
      const skillsByDate: Record<string, { scores: typeof currentScores }> = {};
      currentScores.forEach(score => {
        if (!score.created_at) return;
        const date = new Date(score.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!skillsByDate[date]) {
          skillsByDate[date] = { scores: [] };
        }
        skillsByDate[date].scores.push(score);
      });

      const skillTrends: SkillTrend[] = Object.entries(skillsByDate).map(([date, { scores }]) => ({
        date,
        overall: Math.round(scores.reduce((acc, s) => acc + (s.overall_score || 0), 0) / scores.length),
        rapport: Math.round(scores.reduce((acc, s) => acc + (s.rapport_score || 0), 0) / scores.length),
        discovery: Math.round(scores.reduce((acc, s) => acc + (s.discovery_score || 0), 0) / scores.length),
        presentation: Math.round(scores.reduce((acc, s) => acc + (s.presentation_score || 0), 0) / scores.length),
        closing: Math.round(scores.reduce((acc, s) => acc + (s.closing_score || 0), 0) / scores.length),
        objectionHandling: Math.round(scores.reduce((acc, s) => acc + (s.objection_handling_score || 0), 0) / scores.length)
      }));

      // 4. SCORE DISTRIBUTION
      const scoreRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
      const distribution: Record<string, number> = {};
      scoreRanges.forEach(r => distribution[r] = 0);
      
      currentScores.forEach(s => {
        const score = s.overall_score || 0;
        if (score <= 20) distribution['0-20']++;
        else if (score <= 40) distribution['21-40']++;
        else if (score <= 60) distribution['41-60']++;
        else if (score <= 80) distribution['61-80']++;
        else distribution['81-100']++;
      });

      const totalScores = currentScores.length || 1;
      const scoreDistribution: ScoreDistribution[] = scoreRanges.map(range => ({
        range,
        count: distribution[range],
        percentage: Math.round((distribution[range] / totalScores) * 100)
      }));

      // 5. CALLS BY TIME SLOT (HEATMAP DATA)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const callsByTimeSlot: CallsByHour[] = [];
      
      const timeSlotData: Record<string, { count: number; wins: number }> = {};
      currentRecordings.forEach(r => {
        const d = new Date(r.created_at);
        const hour = d.getHours();
        const day = days[d.getDay()];
        const key = `${day}-${hour}`;
        
        if (!timeSlotData[key]) {
          timeSlotData[key] = { count: 0, wins: 0 };
        }
        timeSlotData[key].count++;
        
        // Check if this call has a lead
        const hasLead = leads.some(l => l.recording_id === r.id);
        if (hasLead) timeSlotData[key].wins++;
      });

      Object.entries(timeSlotData).forEach(([key, data]) => {
        const [day, hour] = key.split('-');
        callsByTimeSlot.push({
          hour: parseInt(hour),
          day,
          count: data.count,
          successRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0
        });
      });

      // 6. TOP PATTERNS FROM COACHING SESSIONS
      const strengthsCount: Record<string, number> = {};
      coachingSessions.forEach(session => {
        if (session.strengths && Array.isArray(session.strengths)) {
          session.strengths.forEach((strength: unknown) => {
            if (typeof strength === 'string') {
              const normalized = strength.toLowerCase().trim();
              strengthsCount[normalized] = (strengthsCount[normalized] || 0) + 1;
            }
          });
        }
      });

      const topPatterns: TopPattern[] = Object.entries(strengthsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern, count]) => ({
          pattern: pattern.charAt(0).toUpperCase() + pattern.slice(1),
          count,
          successRate: Math.min(95, 70 + Math.round(count * 5))
        }));

      // 7. IMPROVEMENT AREAS
      const weaknessesCount: Record<string, number> = {};
      coachingSessions.forEach(session => {
        if (session.weaknesses && Array.isArray(session.weaknesses)) {
          session.weaknesses.forEach((weakness: unknown) => {
            if (typeof weakness === 'string') {
              const normalized = weakness.toLowerCase().trim();
              weaknessesCount[normalized] = (weaknessesCount[normalized] || 0) + 1;
            }
          });
        }
      });

      const recommendationMap: Record<string, string> = {
        'discovery': 'Use the SPIN framework to uncover deeper pain points',
        'objection': 'Practice the Feel-Felt-Found technique for handling objections',
        'closing': 'Use assumptive closes and clear next steps',
        'questions': 'Prepare 5-7 open-ended questions before each call',
        'talk ratio': 'Aim to listen 60% of the time using active silence',
        'rapport': 'Start with personalized research and genuine curiosity',
        'value proposition': 'Lead with outcomes and ROI, not features',
        'follow-up': 'Set specific callback times before ending calls'
      };

      const improvementAreas: ImprovementArea[] = Object.entries(weaknessesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([area, frequency], index) => ({
          area: area.charAt(0).toUpperCase() + area.slice(1),
          frequency,
          priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
          recommendation: Object.entries(recommendationMap).find(([key]) => 
            area.toLowerCase().includes(key)
          )?.[1] || 'Review coaching feedback for specific guidance'
        }));

      // 8. COMPETITOR MENTIONS
      const competitorData: Record<string, { count: number; wins: number }> = {};
      currentScores.forEach(score => {
        if (score.competitor_mentions && Array.isArray(score.competitor_mentions)) {
          score.competitor_mentions.forEach((competitor: unknown) => {
            if (typeof competitor === 'string') {
              const normalized = competitor.toLowerCase().trim();
              if (!competitorData[normalized]) {
                competitorData[normalized] = { count: 0, wins: 0 };
              }
              competitorData[normalized].count++;
              
              // Check if associated with a won lead
              const recording = currentRecordings.find(r => 
                currentScores.find(s => s.recording_id === r.id)
              );
              if (recording) {
                const hasWin = leads.some(l => 
                  l.recording_id === recording.id && 
                  (l.lead_status === 'won' || l.lead_status === 'closed_won')
                );
                if (hasWin) competitorData[normalized].wins++;
              }
            }
          });
        }
      });

      const competitorMentions: CompetitorMention[] = Object.entries(competitorData)
        .map(([competitor, data]) => ({
          competitor: competitor.charAt(0).toUpperCase() + competitor.slice(1),
          count: data.count,
          winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 9. CALLS OVER TIME WITH SCORES
      const callsByDate: Record<string, { count: number; totalScore: number }> = {};
      currentRecordings.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!callsByDate[date]) {
          callsByDate[date] = { count: 0, totalScore: 0 };
        }
        callsByDate[date].count++;
        
        const score = currentScores.find(s => s.recording_id === r.id);
        if (score) {
          callsByDate[date].totalScore += score.overall_score || 0;
        }
      });

      const callsOverTime = Object.entries(callsByDate).map(([date, data]) => ({
        date,
        calls: data.count,
        avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
      }));

      setData({
        totalCalls: { 
          value: totalCallsCurrent, 
          change: totalCallsChange, 
          isPositive: totalCallsChange >= 0 
        },
        avgScore: { 
          value: avgScoreCurrent, 
          change: avgScoreChange, 
          isPositive: avgScoreChange >= 0 
        },
        winRate: { 
          value: winRateCurrent, 
          change: winRateChange, 
          isPositive: winRateChange >= 0 
        },
        avgDuration: { 
          value: avgDurationCurrent, 
          change: durationChange, 
          isPositive: durationChange >= 0 
        },
        talkRatio: { 
          you: avgTalkRatioYou, 
          them: 100 - avgTalkRatioYou, 
          isOptimal: isOptimalTalkRatio 
        },
        avgQuestions: { 
          value: avgQuestionsCurrent, 
          change: 0, 
          isPositive: true 
        },
        currentSkills,
        previousSkills,
        skillTrends,
        scoreDistribution,
        callsByTimeSlot,
        topPatterns,
        improvementAreas,
        competitorMentions,
        callsOverTime
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [user, dateRanges]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
    timeRange
  };
}
