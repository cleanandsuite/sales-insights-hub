import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface EnterpriseStatus {
  isEnterprise: boolean;
  tier: 'executive' | 'staff' | null;
  subscriptionEnd: string | null;
  subscriptionId: string | null;
  loading: boolean;
  error: string | null;
}

export function useEnterpriseSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<EnterpriseStatus>({
    isEnterprise: false,
    tier: null,
    subscriptionEnd: null,
    subscriptionId: null,
    loading: true,
    error: null,
  });

  const checkEnterprise = useCallback(async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false, isEnterprise: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-enterprise-subscription');
      
      if (error) throw error;
      
      setStatus({
        isEnterprise: data.isEnterprise,
        tier: data.tier,
        subscriptionEnd: data.subscriptionEnd,
        subscriptionId: data.subscriptionId,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error checking enterprise subscription:', err);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription',
      }));
    }
  }, [user]);

  useEffect(() => {
    checkEnterprise();
  }, [checkEnterprise]);

  const initiateEnterpriseCheckout = async (tier: 'executive' | 'staff', targetEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('enterprise-checkout', {
        body: { tier, targetEmail },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        return { success: true, url: data.url };
      }
      throw new Error('No checkout URL returned');
    } catch (err) {
      console.error('Error initiating enterprise checkout:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Checkout failed' 
      };
    }
  };

  return {
    ...status,
    refresh: checkEnterprise,
    initiateCheckout: initiateEnterpriseCheckout,
  };
}
