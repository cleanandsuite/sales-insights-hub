import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalCalls: number;
  avgScore: number;
  wins: number;
  isYou: boolean;
}

export function useLeaderboardData() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchLeaderboard() {
      try {
        // Get user's team
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (!teamMember?.team_id) {
          // Solo user - show own stats
          const { data: recordings } = await supabase
            .from('call_recordings')
            .select('id')
            .eq('user_id', user!.id)
            .is('deleted_at', null);

          const { data: scores } = await supabase
            .from('call_scores')
            .select('overall_score, recording_id');

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', user!.id)
            .maybeSingle();

          const recordingIds = new Set((recordings || []).map(r => r.id));
          const myScores = (scores || []).filter(s => recordingIds.has(s.recording_id));
          const avgScore = myScores.length > 0
            ? Math.round(myScores.reduce((acc, s) => acc + s.overall_score, 0) / myScores.length)
            : 0;

          // Count "wins" from leads
          const { count: winsCount } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user!.id)
            .eq('outcome', 'won');

          setEntries([{
            userId: user!.id,
            name: profile?.full_name || 'You',
            totalCalls: recordings?.length || 0,
            avgScore,
            wins: winsCount || 0,
            isYou: true,
          }]);
          setLoading(false);
          return;
        }

        // Team leaderboard - use the DB function
        const { data: stats, error } = await supabase
          .rpc('get_team_member_stats', { p_team_id: teamMember.team_id });

        if (error) {
          console.error('Leaderboard fetch error:', error);
          setLoading(false);
          return;
        }

        // Get win counts for each user
        const userIds = (stats || []).map((s: any) => s.user_id);
        const { data: allLeads } = await supabase
          .from('leads')
          .select('user_id')
          .in('user_id', userIds)
          .eq('outcome', 'won');

        const winsMap: Record<string, number> = {};
        (allLeads || []).forEach(l => {
          winsMap[l.user_id] = (winsMap[l.user_id] || 0) + 1;
        });

        const mapped: LeaderboardEntry[] = (stats || []).map((s: any) => ({
          userId: s.user_id,
          name: s.full_name || 'Unknown',
          totalCalls: Number(s.total_calls) || 0,
          avgScore: Number(s.avg_score) || 0,
          wins: winsMap[s.user_id] || 0,
          isYou: s.user_id === user!.id,
        }));

        // Sort by avg score descending
        mapped.sort((a, b) => b.avgScore - a.avgScore);
        setEntries(mapped);
      } catch (err) {
        console.error('Leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [user]);

  return { entries, loading };
}
