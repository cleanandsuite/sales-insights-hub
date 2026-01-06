import { useState, useEffect, useCallback } from 'react';
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

export const PRICING_TIERS = {
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
  team: {
    name: 'Team',
    priceId: 'price_1SmY6YAbfbNoHWTTnHLW4w07',
    price: 99,
    features: [
      'Everything in Single User',
      'Team sharing & collaboration',
      'Lead assignment & reassignment',
      'Manager dashboard & analytics',
      'AI-suggested lead assignments',
      'Team performance benchmarks',
    ],
    maxUsers: 10,
  },
};

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    plan: null,
    subscriptionEnd: null,
    quantity: 0,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, subscribed: false, plan: null }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setState(prev => ({ ...prev, loading: false, subscribed: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

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
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every minute
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const startCheckout = async (planKey: 'single_user' | 'team', quantity = 1) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const priceId = PRICING_TIERS[planKey].priceId;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, quantity },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

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
