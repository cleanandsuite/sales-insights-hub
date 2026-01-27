import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SubscriptionState {
  subscribed: boolean;
  plan: 'single_user' | 'team' | null;
  subscriptionEnd: string | null;
  quantity: number;
  loading: boolean;
  error: string | null;
}

export const PRICING_TIERS: Record<string, {
  name: string;
  priceId: string;
  price: number;
  features: string[];
  maxUsers: number;
  comingSoon?: boolean;
}> = {
  single_user: {
    name: 'Single User',
    priceId: 'price_1SmY6SAbfbNoHWTTYuvR4kHQ',
    price: 29,
    features: [
      'Call recording & playback',
      'Basic transcription',
      'Personal AI coaching',
      'Lead capture',
    ],
    maxUsers: 1,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: 'price_1SmY6YAbfbNoHWTTnHLW4w07',
    price: 99,
    features: [
      'Everything in Single User',
      'Team sharing & collaboration',
      'Lead assignment & reassignment',
      'Manager dashboard & analytics',
      'AI-suggested lead assignments',
      'Team performance benchmarks',
      'SSO / SAML Authentication',
    ],
    maxUsers: 10,
    comingSoon: true,
  },
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const isCheckingRef = useRef(false);
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    plan: null,
    subscriptionEnd: null,
    quantity: 0,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    // Wait for auth to stabilize and prevent concurrent checks
    if (authLoading || isCheckingRef.current) return;
    
    if (!user) {
      setState(prev => ({ ...prev, loading: false, subscribed: false, plan: null }));
      return;
    }

    isCheckingRef.current = true;
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Let the Supabase client attach the auth header automatically
      // instead of manually fetching and passing the token
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      setState({
        subscribed: data.subscribed,
        plan: data.plan,
        subscriptionEnd: data.subscription_end,
        quantity: data.quantity || 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Subscription check error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      }));
    } finally {
      isCheckingRef.current = false;
    }
  }, [user, authLoading]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 5 minutes (reduced from 1 minute to lower pressure)
  useEffect(() => {
    if (!user || authLoading) return;
    const interval = setInterval(checkSubscription, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [user, authLoading, checkSubscription]);

  const startCheckout = async (planKey: 'single_user' | 'team', quantity = 1) => {
    try {
      const priceId = PRICING_TIERS[planKey].priceId;
      
      // Let Supabase client handle auth header automatically
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, quantity },
      });

      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      // Let Supabase client handle auth header automatically
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      throw error;
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!state.plan) return false;
    const tier = PRICING_TIERS[state.plan];
    if (!tier) return false;
    
    // Team plan has all features
    if (state.plan === 'team') return true;
    
    // Check specific features for single user
    const singleUserFeatures = ['recording', 'playback', 'basic_transcription', 'personal_coaching'];
    return singleUserFeatures.includes(feature);
  };

  const isManager = state.plan === 'team';

  return {
    ...state,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    hasFeature,
    isManager,
  };
}
