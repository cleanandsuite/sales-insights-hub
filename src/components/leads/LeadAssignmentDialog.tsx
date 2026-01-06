import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, User, TrendingUp } from 'lucide-react';

interface TeamMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AISuggestion {
  user_id: string;
  full_name: string;
  reason: string;
  score: number;
}

interface LeadAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  currentAssignee?: string | null;
  teamId: string;
  onAssigned: () => void;
}

export function LeadAssignmentDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  currentAssignee,
  teamId,
  onAssigned,
}: LeadAssignmentDialogProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open && teamId) {
      fetchTeamMembers();
      fetchAISuggestions();
    }
  }, [open, teamId, leadId]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId);

      if (error) throw error;

      const members = (data || []).map((m: any) => ({
        user_id: m.user_id,
        full_name: m.profiles?.full_name,
        avatar_url: m.profiles?.avatar_url,
      }));

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const { data, error } = await supabase.rpc('suggest_lead_assignment', {
        p_lead_id: leadId,
        p_team_id: teamId,
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignLead = async (userId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to_user_id: userId })
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Lead assigned successfully');
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to assign lead');
    } finally {
      setAssigning(false);
    }
  };

  const unassignLead = async () => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to_user_id: null })
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Lead unassigned');
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to unassign lead');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <DialogDescription>
            Assign "{leadName}" to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI Recommendations
              </div>
              {suggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion.user_id}
                  onClick={() => assignLead(suggestion.user_id)}
                  disabled={assigning}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-950/40 transition-colors text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {suggestion.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{suggestion.full_name}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round(suggestion.score)}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* All Team Members */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              All Team Members
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No team members found
                </p>
              ) : (
                teamMembers.map((member) => (
                  <button
                    key={member.user_id}
                    onClick={() => assignLead(member.user_id)}
                    disabled={assigning}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left ${
                      currentAssignee === member.user_id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm truncate">
                      {member.full_name || 'Unknown'}
                    </span>
                    {currentAssignee === member.user_id && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {currentAssignee && (
            <Button
              variant="outline"
              className="w-full"
              onClick={unassignLead}
              disabled={assigning}
            >
              Remove Assignment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
