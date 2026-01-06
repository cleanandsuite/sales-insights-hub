import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'user' | 'manager';

interface UserRoleState {
  role: UserRole;
  loading: boolean;
  teamId: string | null;
}

export function useUserRole() {
  const { user } = useAuth();
  const [state, setState] = useState<UserRoleState>({
    role: 'user',
    loading: true,
    teamId: null,
  });

  const fetchRole = useCallback(async () => {
    if (!user) {
      setState({ role: 'user', loading: false, teamId: null });
      return;
    }

    try {
      // Get user's profile role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Get user's team
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      const role = (profile?.user_role as UserRole) || 'user';
      const teamId = teamMember?.team_id || null;

      setState({
        role,
        loading: false,
        teamId,
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const promoteToManager = async (targetUserId: string) => {
    if (state.role !== 'manager') {
      throw new Error('Only managers can promote users');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ user_role: 'manager' })
      .eq('user_id', targetUserId);

    if (error) throw error;
  };

  const demoteToUser = async (targetUserId: string) => {
    if (state.role !== 'manager') {
      throw new Error('Only managers can demote users');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ user_role: 'user' })
      .eq('user_id', targetUserId);

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
