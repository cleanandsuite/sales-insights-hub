import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AccountStatus {
  isActive: boolean;
  subscriptionStatus: string | null;
  loading: boolean;
  error: string | null;
}

export function useAccountStatus() {
  const { user, loading: authLoading } = useAuth();
  const hasResolvedOnceRef = useRef(false);
  const isCheckingRef = useRef(false);
  const [status, setStatus] = useState<AccountStatus>({
    isActive: true,
    subscriptionStatus: null,
    loading: true,
    error: null,
  });

  const checkAccountStatus = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) return;
    
    // Wait for auth to be ready
    if (authLoading) return;

    if (!user) {
      hasResolvedOnceRef.current = false;
      setStatus({ isActive: true, subscriptionStatus: null, loading: false, error: null });
      return;
    }

    isCheckingRef.current = true;

    try {
      // Only show loading on the very first check to prevent UI flicker
      if (!hasResolvedOnceRef.current) {
        setStatus(prev => ({ ...prev, loading: true, error: null }));
      }

      // Use maybeSingle() instead of single() to gracefully handle 0 rows
      const { data, error } = await supabase
        .from('profiles')
        .select('is_active, subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Account status check error:', error);
        // Default to active on error to prevent blocking legitimate users
        hasResolvedOnceRef.current = true;
        setStatus({
          isActive: true,
          subscriptionStatus: null,
          loading: false,
          error: error.message,
        });
        return;
      }

      // If no profile found, assume active (new user) - this is now handled gracefully
      if (!data) {
        hasResolvedOnceRef.current = true;
        setStatus({
          isActive: true,
          subscriptionStatus: 'none',
          loading: false,
          error: null,
        });
        return;
      }

      hasResolvedOnceRef.current = true;
      setStatus({
        isActive: data.is_active ?? true,
        subscriptionStatus: data.subscription_status ?? 'none',
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Account status check error:', error);
      hasResolvedOnceRef.current = true;
      // Default to active on error to prevent blocking legitimate users
      setStatus({
        isActive: true,
        subscriptionStatus: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check account status',
      });
    } finally {
      isCheckingRef.current = false;
    }
  }, [user?.id, authLoading]);

  // Initial check when user changes
  useEffect(() => {
    checkAccountStatus();
  }, [checkAccountStatus]);

  // Re-check every 60 seconds (only when user is logged in)
  useEffect(() => {
    if (!user || authLoading) return;
    const interval = setInterval(checkAccountStatus, 60000);
    return () => clearInterval(interval);
  }, [user, authLoading, checkAccountStatus]);

  return {
    ...status,
    checkAccountStatus,
  };
}
