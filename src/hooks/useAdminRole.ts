import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAdminRole() {
  const { user, loading: authLoading } = useAuth();
  const isCheckingRef = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = useCallback(async () => {
    // Prevent concurrent checks and wait for auth to be ready
    if (isCheckingRef.current || authLoading) return;
    
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    isCheckingRef.current = true;
    try {
      // Use maybeSingle() to gracefully handle 0 rows without throwing
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
      isCheckingRef.current = false;
    }
  }, [user, authLoading]);

  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

  return { isAdmin, loading };
}
