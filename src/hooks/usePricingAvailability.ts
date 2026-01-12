import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingAvailability {
  singleUser: {
    available: boolean;
    spotsRemaining: number;
    grandfatheredPrice: number;
    regularPrice: number;
  };
  enterprise: {
    available: boolean;
    spotsRemaining: number;
    grandfatheredPrice: number;
    regularPrice: number;
  };
  deadline: Date;
  isDeadlinePassed: boolean;
}

export function usePricingAvailability() {
  const [availability, setAvailability] = useState<PricingAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const { data, error } = await supabase
          .from('subscription_counter')
          .select('*');

        if (error) throw error;

        const singleUserData = data?.find(d => d.plan_type === 'single_user');
        const enterpriseData = data?.find(d => d.plan_type === 'enterprise');
        
        const deadline = new Date(singleUserData?.deadline || '2026-01-31T23:59:59Z');
        const now = new Date();
        const isDeadlinePassed = now > deadline;

        setAvailability({
          singleUser: {
            available: !isDeadlinePassed && (singleUserData?.count || 0) < (singleUserData?.max_spots || 100),
            spotsRemaining: Math.max(0, (singleUserData?.max_spots || 100) - (singleUserData?.count || 0)),
            grandfatheredPrice: (singleUserData?.grandfathered_price_cents || 2900) / 100,
            regularPrice: (singleUserData?.regular_price_cents || 4900) / 100,
          },
          enterprise: {
            available: !isDeadlinePassed && (enterpriseData?.count || 0) < (enterpriseData?.max_spots || 100),
            spotsRemaining: Math.max(0, (enterpriseData?.max_spots || 100) - (enterpriseData?.count || 0)),
            grandfatheredPrice: (enterpriseData?.grandfathered_price_cents || 7900) / 100,
            regularPrice: (enterpriseData?.regular_price_cents || 9900) / 100,
          },
          deadline,
          isDeadlinePassed,
        });
      } catch (err) {
        console.error('Failed to fetch pricing availability:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, []);

  return { availability, loading };
}
