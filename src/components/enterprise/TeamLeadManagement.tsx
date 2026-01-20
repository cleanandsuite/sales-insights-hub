import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, ArrowRight, Sparkles, TrendingUp, Phone, Target, 
  Filter, RefreshCw, ChevronRight
} from 'lucide-react';

interface TeamLeadManagementProps {
  teamId: string;
}

interface Lead {
  id: string;
  contact_name: string;
  company: string | null;
  ai_confidence: number | null;
  is_hot_lead: boolean | null;
  user_id: string | null;
  assigned_to_user_id: string | null;
  created_at: string;
}

interface TeamMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  avg_overall_score: number;
  avg_closing_score: number;
  total_calls: number;
  win_rate: number;
}

export function TeamLeadManagement({ teamId }: TeamLeadManagementProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'hot'>('all');
  const [reassignDialog, setReassignDialog] = useState<{ lead: Lead; open: boolean } | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      // Fetch team members with stats
      const { data: memberStats } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId);

      setMembers(memberStats || []);

      // Get team member user IDs
      const { data: teamMemberIds } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (teamMemberIds && teamMemberIds.length > 0) {
        const userIds = teamMemberIds.map(m => m.user_id);
        
        // Fetch leads from team members
        const { data: teamLeads } = await supabase
          .from('leads')
          .select('id, contact_name, company, ai_confidence, is_hot_lead, user_id, assigned_to_user_id, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false })
          .limit(50);

        setLeads(teamLeads || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLeads = () => {
    switch (filter) {
      case 'unassigned':
        return leads.filter(l => !l.assigned_to_user_id);
      case 'hot':
        return leads.filter(l => l.is_hot_lead);
      default:
        return leads;
    }
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const member = members.find(m => m.user_id === userId);
    return member?.full_name || 'Unknown';
  };

  const getMemberStats = (userId: string) => {
    return members.find(m => m.user_id === userId);
  };

  const handleReassign = async (lead: Lead, newUserId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to_user_id: newUserId })
        .eq('id', lead.id);

      if (error) throw error;

      toast.success(`Lead reassigned to ${getMemberName(newUserId)}`);
      setReassignDialog(null);
      fetchData();
    } catch (error) {
      console.error('Error reassigning lead:', error);
      toast.error('Failed to reassign lead');
    } finally {
      setAssigning(false);
    }
  };

  const getSuggestedAssignee = (lead: Lead): TeamMember | null => {
    if (members.length === 0) return null;
    
    // Simple logic: suggest member with highest closing score for hot leads
    // Otherwise suggest member with highest overall score and capacity
    const sorted = [...members].sort((a, b) => {
      if (lead.is_hot_lead) {
        return b.avg_closing_score - a.avg_closing_score;
      }
      return b.avg_overall_score - a.avg_overall_score;
    });
    
    return sorted[0] || null;
  };

  const filteredLeads = getFilteredLeads();

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-enterprise">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Lead Management
              </CardTitle>
              <CardDescription>Reassign leads based on staff performance</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[130px] h-8">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="hot">Hot Leads</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No leads found</p>
              <p className="text-sm text-muted-foreground">
                {filter !== 'all' ? 'Try changing the filter' : 'Leads will appear here as they are captured'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredLeads.slice(0, 10).map((lead) => {
                const assignee = lead.assigned_to_user_id ? getMemberStats(lead.assigned_to_user_id) : null;
                const suggestion = getSuggestedAssignee(lead);

                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {lead.contact_name}
                          </p>
                          {lead.is_hot_lead && (
                            <Badge className="bg-destructive/10 text-destructive text-xs">Hot</Badge>
                          )}
                        </div>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                        )}
                      </div>
                      
                      {/* Current Assignment */}
                      <div className="flex items-center gap-2 min-w-[120px]">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {assignee.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                              {assignee.full_name?.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">Unassigned</Badge>
                        )}
                      </div>

                      {/* Confidence Score */}
                      {lead.ai_confidence && (
                        <Badge variant="outline" className="text-xs min-w-[50px] justify-center">
                          {Math.round(lead.ai_confidence)}%
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 ml-2"
                      onClick={() => setReassignDialog({ lead, open: true })}
                    >
                      Reassign
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={!!reassignDialog?.open} onOpenChange={() => setReassignDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Lead</DialogTitle>
            <DialogDescription>
              Select a team member to assign "{reassignDialog?.lead.contact_name}" based on their performance stats
            </DialogDescription>
          </DialogHeader>

          {reassignDialog && (
            <div className="space-y-4">
              {/* AI Suggestion */}
              {(() => {
                const suggestion = getSuggestedAssignee(reassignDialog.lead);
                if (!suggestion) return null;

                return (
                  <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">AI Recommendation</span>
                    </div>
                    <button
                      onClick={() => handleReassign(reassignDialog.lead, suggestion.user_id)}
                      disabled={assigning}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={suggestion.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {suggestion.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{suggestion.full_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Score: {Math.round(suggestion.avg_overall_score)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Win: {suggestion.win_rate}%
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                );
              })()}

              {/* All Members */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">All Team Members</p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {members.map((member) => (
                    <button
                      key={member.user_id}
                      onClick={() => handleReassign(reassignDialog.lead, member.user_id)}
                      disabled={assigning}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left ${
                        reassignDialog.lead.assigned_to_user_id === member.user_id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-muted">
                          {member.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.full_name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Score: {Math.round(member.avg_overall_score)}</span>
                          <span>•</span>
                          <span>Calls: {member.total_calls}</span>
                          <span>•</span>
                          <span>Win: {member.win_rate}%</span>
                        </div>
                      </div>
                      {reassignDialog.lead.assigned_to_user_id === member.user_id && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
