import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { differenceInDays, startOfDay, format } from 'date-fns';

interface CallLimits {
  dailyLimit: number;
  warmupStartDate: Date;
  enforceLimit: boolean;
}

interface UseCallLimitsReturn {
  dailyLimit: number;
  callsToday: number;
  warmupDay: number;
  canMakeCall: boolean;
  isNearLimit: boolean;
  limitEnforced: boolean;
  isLoading: boolean;
  incrementCallCount: () => Promise<void>;
  getRemainingCalls: () => number;
  refreshLimits: () => Promise<void>;
}

// Recommended limits based on warmup day
function getRecommendedLimit(warmupDay: number): number {
  if (warmupDay <= 7) return 20;
  if (warmupDay <= 14) return 40;
  if (warmupDay <= 30) return 75;
  return 100;
}

export function useCallLimits(): UseCallLimitsReturn {
  const { user } = useAuth();
  const [limits, setLimits] = useState<CallLimits | null>(null);
  const [callsToday, setCallsToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const warmupDay = limits
    ? differenceInDays(new Date(), new Date(limits.warmupStartDate)) + 1
    : 1;

  const dailyLimit = limits?.dailyLimit ?? getRecommendedLimit(warmupDay);
  const limitEnforced = limits?.enforceLimit ?? false;
  const canMakeCall = !limitEnforced || callsToday < dailyLimit;
  const isNearLimit = callsToday >= dailyLimit * 0.8;

  const fetchLimits = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch or create call limits
      let { data: limitsData, error: limitsError } = await supabase
        .from('call_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (limitsError && limitsError.code === 'PGRST116') {
        // No record exists, create one
        const { data: newLimits, error: insertError } = await supabase
          .from('call_limits')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        limitsData = newLimits;
      } else if (limitsError) {
        throw limitsError;
      }

      if (limitsData) {
        setLimits({
          dailyLimit: limitsData.daily_limit,
          warmupStartDate: new Date(limitsData.warmup_start_date),
          enforceLimit: limitsData.enforce_limit,
        });
      }

      // Count today's calls from call_recordings
      const todayStart = startOfDay(new Date());
      const { count, error: countError } = await supabase
        .from('call_recordings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString());

      if (countError) throw countError;
      setCallsToday(count ?? 0);
    } catch (error) {
      console.error('Error fetching call limits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const incrementCallCount = useCallback(async () => {
    // The call count is derived from call_recordings, so we just refresh
    setCallsToday((prev) => prev + 1);
  }, []);

  const getRemainingCalls = useCallback(() => {
    return Math.max(dailyLimit - callsToday, 0);
  }, [dailyLimit, callsToday]);

  const refreshLimits = useCallback(async () => {
    await fetchLimits();
  }, [fetchLimits]);

  return {
    dailyLimit,
    callsToday,
    warmupDay,
    canMakeCall,
    isNearLimit,
    limitEnforced,
    isLoading,
    incrementCallCount,
    getRemainingCalls,
    refreshLimits,
  };
}
