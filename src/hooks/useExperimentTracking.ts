import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getVisitorId } from './useExperiment';

interface TrackEventOptions {
  experimentId: string;
  variantId: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  revenueCents?: number;
  planType?: string;
}

export function useExperimentTracking() {
  const { user } = useAuth();
  const visitorId = getVisitorId();

  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    try {
      const { experimentId, variantId, eventType, eventData, revenueCents, planType } = options;

      // Get assignment ID if exists
      const { data: assignment } = await supabase
        .from('experiment_assignments')
        .select('id')
        .eq('experiment_id', experimentId)
        .eq('visitor_id', visitorId)
        .single();

      const { error } = await supabase
        .from('experiment_events')
        .insert([{
          experiment_id: experimentId,
          variant_id: variantId,
          assignment_id: assignment?.id || null,
          visitor_id: visitorId,
          user_id: user?.id || null,
          event_type: eventType,
          event_data: (eventData || {}) as Record<string, string | number | boolean>,
          revenue_cents: revenueCents || null,
          plan_type: planType || null,
        }]);

      if (error) {
        console.error('Error tracking experiment event:', error);
      }
    } catch (err) {
      console.error('Failed to track experiment event:', err);
    }
  }, [user?.id, visitorId]);

  const trackPageView = useCallback(async (experimentId: string, variantId: string, pageName: string) => {
    await trackEvent({
      experimentId,
      variantId,
      eventType: 'page_view',
      eventData: { page: pageName },
    });
  }, [trackEvent]);

  const trackClick = useCallback(async (experimentId: string, variantId: string, elementId: string) => {
    await trackEvent({
      experimentId,
      variantId,
      eventType: 'cta_click',
      eventData: { element: elementId },
    });
  }, [trackEvent]);

  const trackConversion = useCallback(async (
    experimentId: string, 
    variantId: string, 
    conversionType: string,
    revenueCents?: number,
    planType?: string
  ) => {
    await trackEvent({
      experimentId,
      variantId,
      eventType: 'conversion',
      eventData: { conversion_type: conversionType },
      revenueCents,
      planType,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackConversion,
    visitorId,
  };
}
