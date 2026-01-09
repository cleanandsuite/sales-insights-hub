import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TeamPainSummary } from '@/components/manager/TeamPainSummary';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { Users, TrendingUp, Award, Target, Shield, Crown, Brain } from 'lucide-react';

interface TeamMemberStats {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  avg_overall_score: number;
  avg_rapport_score: number;
  avg_discovery_score: number;
  avg_presentation_score: number;
  avg_closing_score: number;
  avg_objection_handling_score: number;
  total_calls: number;
  deals_won: number;
  deals_lost: number;
  win_rate: number;
  avg_deal_velocity: number;
}

export default function Manager() {
  const { user } = useAuth();
  const { isManager, loading: roleLoading, teamId } = useUserRole();
  const navigate = useNavigate();
  const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isManager) {
      toast.error('Access denied. Manager role required.');
      navigate('/dashboard');
    }
  }, [isManager, roleLoading, navigate]);

  useEffect(() => {
    if (isManager && teamId) {
      fetchTeamStats();
    }
  }, [isManager, teamId]);

  const fetchTeamStats = async () => {
    if (!teamId) return;
    
    try {
      const { data, error } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setTeamStats(data || []);
    } catch (error) {
      console.error('Error fetching team stats:', error);
      toast.error('Failed to load team statistics');
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: 'manager' })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('User promoted to manager');
      fetchTeamStats();
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  if (roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isManager) {
    return null;
  }

  const aggregateStats = {
    totalCalls: teamStats.reduce((sum, m) => sum + (m.total_calls || 0), 0),
    avgScore: teamStats.length > 0 
      ? teamStats.reduce((sum, m) => sum + (m.avg_overall_score || 0), 0) / teamStats.length 
      : 0,
    totalDealsWon: teamStats.reduce((sum, m) => sum + (m.deals_won || 0), 0),
    avgWinRate: teamStats.length > 0
      ? teamStats.reduce((sum, m) => sum + (m.win_rate || 0), 0) / teamStats.length
      : 0,
  };

  const barChartData = teamStats.map(member => ({
    name: member.full_name?.split(' ')[0] || 'Unknown',
    overall: Math.round(member.avg_overall_score || 0),
    closing: Math.round(member.avg_closing_score || 0),
    discovery: Math.round(member.avg_discovery_score || 0),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manager Dashboard</h1>
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Manager
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Team performance and analytics</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateStats.totalCalls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Avg Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(aggregateStats.avgScore)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Win Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(aggregateStats.avgWinRate)}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="pains" className="gap-1">
              <Brain className="h-3 w-3" />
              Pain Analysis
            </TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Comparison</CardTitle>
                <CardDescription>Score breakdown by team member</CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="overall" fill="hsl(var(--primary))" name="Overall" />
                      <Bar dataKey="closing" fill="hsl(var(--chart-2))" name="Closing" />
                      <Bar dataKey="discovery" fill="hsl(var(--chart-3))" name="Discovery" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No performance data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pains" className="space-y-4">
            {teamId && <TeamPainSummary teamId={teamId} />}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4">
              {teamStats.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members found</p>
                      <p className="text-sm">Invite team members to see their stats here</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                teamStats.map((member) => (
                  <Card key={member.user_id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{member.full_name || 'Unknown'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {member.total_calls} calls • {member.win_rate}% win rate
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => promoteUser(member.user_id)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Promote
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Overall Score</p>
                              <Progress value={member.avg_overall_score || 0} className="h-2" />
                              <p className="text-xs font-medium mt-1">{Math.round(member.avg_overall_score || 0)}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Closing</p>
                              <Progress value={member.avg_closing_score || 0} className="h-2" />
                              <p className="text-xs font-medium mt-1">{Math.round(member.avg_closing_score || 0)}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Discovery</p>
                              <Progress value={member.avg_discovery_score || 0} className="h-2" />
                              <p className="text-xs font-medium mt-1">{Math.round(member.avg_discovery_score || 0)}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Rapport</p>
                              <Progress value={member.avg_rapport_score || 0} className="h-2" />
                              <p className="text-xs font-medium mt-1">{Math.round(member.avg_rapport_score || 0)}/100</p>
                            </div>
                          </div>

                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">✓ {member.deals_won} won</span>
                            <span className="text-red-600">✗ {member.deals_lost} lost</span>
                            <span className="text-muted-foreground">
                              ~{Math.round(member.avg_deal_velocity || 0)} days avg velocity
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
