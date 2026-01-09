import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AccountStatus {
  isActive: boolean;
  subscriptionStatus: string | null;
  loading: boolean;
  error: string | null;
}

export function useAccountStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AccountStatus>({
    isActive: true,
    subscriptionStatus: null,
    loading: true,
    error: null,
  });

  const checkAccountStatus = useCallback(async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false, isActive: true }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from('profiles')
        .select('is_active, subscription_status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no profile found, assume active (new user)
        if (error.code === 'PGRST116') {
          setStatus({
            isActive: true,
            subscriptionStatus: 'none',
            loading: false,
            error: null,
          });
          return;
        }
        throw error;
      }

      setStatus({
        isActive: data?.is_active ?? true,
        subscriptionStatus: data?.subscription_status ?? 'none',
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Account status check error:', error);
      // Default to active on error to prevent blocking legitimate users
      setStatus({
        isActive: true,
        subscriptionStatus: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check account status',
      });
    }
  }, [user]);

  useEffect(() => {
    checkAccountStatus();
  }, [checkAccountStatus]);

  // Re-check every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkAccountStatus, 60000);
    return () => clearInterval(interval);
  }, [user, checkAccountStatus]);

  return {
    ...status,
    checkAccountStatus,
  };
}
