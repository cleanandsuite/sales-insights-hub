import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduleExtraction {
  suggested_title?: string;
  contact_name?: string;
  contact_email?: string;
  suggested_date?: string;
  suggested_time?: string;
  suggested_duration?: number;
  meeting_provider?: string;
  prep_notes?: string;
  confidence?: number;
  follow_up_reason?: string;
  urgency?: 'high' | 'medium' | 'low';
  lead_company?: string;
  lead_timeline?: string;
  ai_summary?: string;
  key_points?: string[];
  objections?: string[];
  next_steps?: string[];
}

interface ConflictInfo {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
}

interface ScheduleAnalytics {
  totalCalls: number;
  completedCalls: number;
  noShows: number;
  cancelledCalls: number;
  avgDuration: number;
  peakHours: number[];
  peakDays: string[];
  completionRate: number;
}

interface EmailScript {
  subject: string;
  body: string;
  tone: string;
}

export function useScheduleAssistant() {
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSuggestingTimes, setIsSuggestingTimes] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);

  const extractFromTranscript = async (recordingId: string): Promise<ScheduleExtraction | null> => {
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: { action: 'extract-from-transcript', recordingId }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            variant: 'destructive',
            title: 'Rate Limited',
            description: 'Please try again in a moment'
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Extraction failed',
            description: data.error
          });
        }
        return null;
      }

      return data.extraction;
    } catch (error) {
      console.error('Extract error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to extract scheduling info',
        description: 'Please try again or enter details manually'
      });
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  const coachingQuery = async (recordingId: string, query: string): Promise<string> => {
    setIsCoaching(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: { action: 'coaching-query', recordingId, query }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Coaching query failed',
          description: data.error
        });
        return 'Unable to process query. Please try again.';
      }

      return data.response;
    } catch (error) {
      console.error('Coaching error:', error);
      return 'An error occurred. Please try again.';
    } finally {
      setIsCoaching(false);
    }
  };

  const generateEmailScript = async (recordingId: string, customPrompt?: string): Promise<EmailScript | null> => {
    setIsGeneratingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: { action: 'generate-email', recordingId, customPrompt }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Email generation failed',
          description: data.error
        });
        return null;
      }

      return data.emailScript;
    } catch (error) {
      console.error('Email generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to generate email',
        description: 'Please try again'
      });
      return null;
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const suggestTimes = async (date: string): Promise<string[]> => {
    setIsSuggestingTimes(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: { action: 'suggest-times', date }
      });

      if (error) throw error;
      return data.suggestedTimes || [];
    } catch (error) {
      console.error('Suggest times error:', error);
      return [];
    } finally {
      setIsSuggestingTimes(false);
    }
  };

  const checkConflicts = async (
    proposedStart: Date,
    durationMinutes: number
  ): Promise<{ hasConflict: boolean; conflicts: ConflictInfo[] }> => {
    setIsCheckingConflicts(true);
    try {
      const proposedEnd = new Date(proposedStart.getTime() + durationMinutes * 60000);

      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: {
          action: 'check-conflicts',
          proposedStart: proposedStart.toISOString(),
          proposedEnd: proposedEnd.toISOString()
        }
      });

      if (error) throw error;
      return {
        hasConflict: data.hasConflict || false,
        conflicts: data.conflicts || []
      };
    } catch (error) {
      console.error('Check conflicts error:', error);
      return { hasConflict: false, conflicts: [] };
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  const getAnalytics = async (): Promise<ScheduleAnalytics | null> => {
    setIsLoadingAnalytics(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: { action: 'get-analytics' }
      });

      if (error) throw error;
      return data.analytics;
    } catch (error) {
      console.error('Analytics error:', error);
      return null;
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  return {
    extractFromTranscript,
    suggestTimes,
    checkConflicts,
    getAnalytics,
    coachingQuery,
    generateEmailScript,
    isExtracting,
    isSuggestingTimes,
    isCheckingConflicts,
    isLoadingAnalytics,
    isGeneratingEmail,
    isCoaching
  };
}
