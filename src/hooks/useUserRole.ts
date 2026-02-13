import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'user' | 'manager';

interface UserRoleState {
  role: UserRole;
  loading: boolean;
  teamId: string | null;
}

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const isCheckingRef = useRef(false);
  const [state, setState] = useState<UserRoleState>({
    role: 'user',
    loading: true,
    teamId: null,
  });

  const fetchRole = useCallback(async () => {
    // Prevent concurrent checks and wait for auth to be ready
    if (isCheckingRef.current || authLoading) return;
    
    if (!user) {
      setState({ role: 'user', loading: false, teamId: null });
      return;
    }

    isCheckingRef.current = true;
    try {
      // Get user's team membership to check role
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (teamError) {
        console.error('Error fetching team membership:', teamError);
      }

      // Check if the user has a manager role based on team membership
      const isManager = teamMember?.role === 'manager' || teamMember?.role === 'owner';
      const role: UserRole = isManager ? 'manager' : 'user';
      const teamId = teamMember?.team_id || null;

      setState({
        role,
        loading: false,
        teamId,
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setState(prev => ({ ...prev, loading: false }));
    } finally {
      isCheckingRef.current = false;
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const promoteToManager = async (targetUserId: string) => {
    if (state.role !== 'manager') {
      throw new Error('Only managers can promote users');
    }

    // Use the secure SECURITY DEFINER function
    // Using type assertion since types may not be regenerated yet
    const { error } = await (supabase.rpc as any)(
      'promote_user_to_manager', 
      { target_user_id: targetUserId }
    );

    if (error) throw error;
  };

  const demoteToUser = async (targetUserId: string) => {
    if (state.role !== 'manager') {
      throw new Error('Only managers can demote users');
    }

    // Use the secure SECURITY DEFINER function
    // Using type assertion since types may not be regenerated yet
    const { error } = await (supabase.rpc as any)(
      'demote_user_from_manager', 
      { target_user_id: targetUserId }
    );

    if (error) throw error;
  };

  return {
    ...state,
    isManager: state.role === 'manager',
    promoteToManager,
    demoteToUser,
    refetch: fetchRole,
  };
}
