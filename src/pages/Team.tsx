import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamStatsOverview } from '@/components/team/TeamStatsOverview';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { 
  Users, 
  Plus, 
  Crown, 
  Mail,
  Settings,
  BarChart3,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface TeamMemberStats {
  user_id: string;
  full_name: string;
  role: string;
  total_calls: number;
  avg_score: number;
  active_leads: number;
  joined_at: string;
}

export default function Team() {
  const { user } = useAuth();
  const { isManager } = useUserRole();
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMemberStats(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberTeams && memberTeams.length > 0) {
        const teamIds = memberTeams.map(m => m.team_id);
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);
        if (teamsData && teamsData.length > 0 && !selectedTeam) {
          setSelectedTeam(teamsData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStats = async (teamId: string) => {
    try {
      const { data, error } = await (supabase.rpc as any)('get_team_member_stats', { 
        p_team_id: teamId 
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching member stats:', error);
      // Fallback to basic member fetch
      const { data: basicMembers } = await supabase
        .from('team_members')
        .select('user_id, role, joined_at')
        .eq('team_id', teamId);

      if (basicMembers) {
        const membersWithProfiles = await Promise.all(
          basicMembers.map(async (member) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', member.user_id)
              .maybeSingle();

            return {
              user_id: member.user_id,
              full_name: profile?.full_name || 'Unknown User',
              role: member.role,
              total_calls: 0,
              avg_score: 0,
              active_leads: 0,
              joined_at: member.joined_at
            };
          })
        );
        setMembers(membersWithProfiles);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !newTeamName.trim()) return;

    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: newTeamName,
          description: newTeamDescription || null,
          owner_id: user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      toast.success('Team created successfully!');
      setIsCreateOpen(false);
      setNewTeamName('');
      setNewTeamDescription('');
      fetchTeams();
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    }
  };

  const handlePromote = async (targetUserId: string) => {
    try {
      const { error } = await (supabase.rpc as any)('promote_user_to_manager', { 
        target_user_id: targetUserId 
      });
      if (error) throw error;
      toast.success('User promoted to manager');
      fetchMemberStats(selectedTeam!.id);
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast.error(error.message || 'Failed to promote user');
    }
  };

  const handleDemote = async (targetUserId: string) => {
    try {
      const { error } = await (supabase.rpc as any)('demote_user_from_manager', { 
        target_user_id: targetUserId 
      });
      if (error) throw error;
      toast.success('User demoted to member');
      fetchMemberStats(selectedTeam!.id);
    } catch (error: any) {
      console.error('Error demoting user:', error);
      toast.error(error.message || 'Failed to demote user');
    }
  };

  const handleRemove = async (targetUserId: string) => {
    if (!selectedTeam) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', selectedTeam.id)
        .eq('user_id', targetUserId);

      if (error) throw error;
      toast.success('Member removed from team');
      fetchMemberStats(selectedTeam.id);
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const isTeamOwner = selectedTeam?.owner_id === user?.id;
  
  const teamStats = useMemo(() => {
    const totalCalls = members.reduce((sum, m) => sum + m.total_calls, 0);
    const totalLeads = members.reduce((sum, m) => sum + m.active_leads, 0);
    const scoresWithValue = members.filter(m => m.avg_score > 0);
    const avgScore = scoresWithValue.length > 0 
      ? scoresWithValue.reduce((sum, m) => sum + m.avg_score, 0) / scoresWithValue.length 
      : 0;
    return { totalMembers: members.length, totalCalls, totalLeads, avgScore };
  }, [members]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team</h1>
            <p className="text-muted-foreground mt-1">Manage your team and collaborations</p>
          </div>
          
          <div className="flex gap-2">
            {isManager && selectedTeam && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/revenue-intelligence')}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Revenue Intel
              </Button>
            )}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      placeholder="Sales Team"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamDesc">Description (optional)</Label>
                    <Input
                      id="teamDesc"
                      placeholder="Our amazing sales team"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateTeam} className="w-full">
                    Create Team
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {teams.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-6">Create a team to start collaborating with others</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Teams List */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Your Teams
              </h2>
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`
                    rounded-xl border p-4 cursor-pointer transition-all
                    ${selectedTeam?.id === team.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-primary/30 bg-card'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{team.name}</h3>
                      {team.description && (
                        <p className="text-xs text-muted-foreground truncate">{team.description}</p>
                      )}
                    </div>
                    {team.owner_id === user?.id && (
                      <Crown className="h-4 w-4 text-warning" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Team Details */}
            {selectedTeam && (
              <div className="lg:col-span-3 space-y-6">
                {/* Team Stats Overview */}
                <TeamStatsOverview {...teamStats} />

                {/* Team Members Card */}
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedTeam.name}
                          {isTeamOwner && (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                              Owner
                            </Badge>
                          )}
                        </CardTitle>
                        {selectedTeam.description && (
                          <p className="text-muted-foreground text-sm mt-1">{selectedTeam.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => setIsInviteOpen(true)}
                        >
                          <Mail className="h-4 w-4" />
                          Invite
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">
                      Team Members ({members.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {members.map((member) => (
                        <TeamMemberCard
                          key={member.user_id}
                          member={member}
                          isOwner={isTeamOwner}
                          isCurrentUser={member.user_id === user?.id}
                          onPromote={handlePromote}
                          onDemote={handleDemote}
                          onRemove={handleRemove}
                        />
                      ))}
                    </div>

                    {isManager && (
                      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">Revenue Intelligence</h4>
                            <p className="text-sm text-muted-foreground">
                              Access advanced team analytics and AI-powered insights
                            </p>
                          </div>
                          <Button 
                            onClick={() => navigate('/revenue-intelligence')}
                            className="gap-2"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Open Dashboard
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Invite Member Dialog */}
        {selectedTeam && user && (
          <InviteMemberDialog
            open={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            teamId={selectedTeam.id}
            invitedBy={user.id}
            onSuccess={() => fetchMemberStats(selectedTeam.id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
