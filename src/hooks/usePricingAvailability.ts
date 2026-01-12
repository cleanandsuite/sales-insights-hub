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
        // Use RPC function for secure public access
        const { data, error } = await supabase.rpc('get_public_pricing_availability');

        if (error) throw error;

        const pricingData = data as {
          singleUser: {
            available: boolean;
            spotsRemaining: number;
            grandfatheredPrice: number;
            regularPrice: number;
          };
          deadline: string;
          isDeadlinePassed: boolean;
        };

        setAvailability({
          singleUser: {
            available: pricingData.singleUser.available,
            spotsRemaining: pricingData.singleUser.spotsRemaining,
            grandfatheredPrice: pricingData.singleUser.grandfatheredPrice,
            regularPrice: pricingData.singleUser.regularPrice,
          },
          enterprise: {
            available: false, // Enterprise is coming soon
            spotsRemaining: 0,
            grandfatheredPrice: 79,
            regularPrice: 99,
          },
          deadline: new Date(pricingData.deadline),
          isDeadlinePassed: pricingData.isDeadlinePassed,
        });
      } catch (err) {
        console.error('Failed to fetch pricing availability:', err);
        // Fallback defaults
        setAvailability({
          singleUser: {
            available: true,
            spotsRemaining: 100,
            grandfatheredPrice: 29,
            regularPrice: 49,
          },
          enterprise: {
            available: false,
            spotsRemaining: 0,
            grandfatheredPrice: 79,
            regularPrice: 99,
          },
          deadline: new Date('2026-01-31T23:59:59Z'),
          isDeadlinePassed: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, []);

  return { availability, loading };
}