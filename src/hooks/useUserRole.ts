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
      // Check if user has manager role in the secure user_roles table
      // Using type assertion since types may not be regenerated yet
      const { data: isManager, error: roleError } = await (supabase.rpc as any)(
        'is_manager', 
        { _user_id: user.id }
      );

      if (roleError) {
        console.error('Error checking manager role:', roleError);
      }

      // Get user's team
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single();

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
    }
  }, [user]);

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
