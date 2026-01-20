import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type CoachStyle = 'sellsig' | 'cardone' | 'belfort' | 'neutral';

interface LiveCoachingSettings {
  isEnabled: boolean;
  coachStyle: CoachStyle;
  loading: boolean;
}

export function useLiveCoaching(): LiveCoachingSettings & {
  setCoachStyle: (style: CoachStyle) => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  refetch: () => Promise<void>;
} {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [coachStyle, setCoachStyleState] = useState<CoachStyle>('neutral');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_lead_settings')
        .select('live_coach_style, live_coaching_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCoachStyleState((data.live_coach_style as CoachStyle) || 'neutral');
        setIsEnabled(data.live_coaching_enabled || false);
      }
    } catch (error) {
      console.error('Error fetching live coaching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const setCoachStyle = async (style: CoachStyle) => {
    if (!user) return;

    setCoachStyleState(style);

    try {
      await supabase
        .from('ai_lead_settings')
        .upsert({
          user_id: user.id,
          live_coach_style: style,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error saving coach style:', error);
    }
  };

  const setEnabled = async (enabled: boolean) => {
    if (!user) return;

    setIsEnabled(enabled);

    try {
      await supabase
        .from('ai_lead_settings')
        .upsert({
          user_id: user.id,
          live_coaching_enabled: enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error saving coaching enabled:', error);
    }
  };

  return {
    isEnabled,
    coachStyle,
    loading,
    setCoachStyle,
    setEnabled,
    refetch: fetchSettings,
  };
}
