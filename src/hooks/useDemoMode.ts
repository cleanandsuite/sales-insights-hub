import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdminRole } from './useAdminRole';

export function useDemoMode() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || adminLoading) return;
    if (!isAdmin) {
      setDemoEnabled(false);
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('demo_mode_enabled')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setDemoEnabled(!!(data as any)?.demo_mode_enabled);
        setLoading(false);
      });
  }, [user, isAdmin, adminLoading]);

  const toggleDemoMode = useCallback(async () => {
    if (!user || !isAdmin) return;
    const newVal = !demoEnabled;
    setDemoEnabled(newVal);
    await supabase
      .from('profiles')
      .update({ demo_mode_enabled: newVal } as any)
      .eq('user_id', user.id);
  }, [user, isAdmin, demoEnabled]);

  return {
    isDemoMode: isAdmin && demoEnabled,
    isAdmin,
    toggleDemoMode,
    loading: loading || adminLoading,
  };
}
