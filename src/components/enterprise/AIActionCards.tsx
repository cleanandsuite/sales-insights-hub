import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Zap, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronRight
} from 'lucide-react';

interface CoachingAction {
  id: string;
  rep_name: string;
  rep_avatar?: string;
  user_id: string;
  coaching_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  status: string;
}

interface AIActionCardsProps {
  teamId: string;
}

export function AIActionCards({ teamId }: AIActionCardsProps) {
  const { user } = useAuth();
  const [actions, setActions] = useState<CoachingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<CoachingAction | null>(null);
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchActions();
  }, [teamId]);

  const fetchActions = async () => {
    try {
      // Get team members with their performance data
      const { data: teamStats, error } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      // Generate AI-suggested actions based on performance gaps
      const generatedActions: CoachingAction[] = [];
      
      (teamStats || []).forEach((member) => {
        // Low closing score
        if (member.avg_closing_score < 50) {
          generatedActions.push({
            id: `${member.user_id}-closer`,
            rep_name: member.full_name || 'Unknown',
            rep_avatar: member.avatar_url,
            user_id: member.user_id,
            coaching_type: 'high_stakes_closer',
            priority: member.avg_closing_score < 30 ? 'critical' : 'high',
            reason: `Low closing score (${Math.round(member.avg_closing_score)}). Recommend High Stakes Closer coaching to improve deal conversion.`,
            status: 'pending'
          });
        }
        
        // Low discovery score
        if (member.avg_discovery_score < 50) {
          generatedActions.push({
            id: `${member.user_id}-discovery`,
            rep_name: member.full_name || 'Unknown',
            rep_avatar: member.avatar_url,
            user_id: member.user_id,
            coaching_type: 'discovery_booker',
            priority: 'high',
            reason: `Discovery score at ${Math.round(member.avg_discovery_score)}. Needs Discovery Booker training to improve qualification.`,
            status: 'pending'
          });
        }
        
        // Low objection handling
        if (member.avg_objection_handling_score < 40) {
          generatedActions.push({
            id: `${member.user_id}-objection`,
            rep_name: member.full_name || 'Unknown',
            rep_avatar: member.avatar_url,
            user_id: member.user_id,
            coaching_type: 'objection_handling',
            priority: 'medium',
            reason: `Objection handling needs improvement (${Math.round(member.avg_objection_handling_score)}). Focus on pullback techniques.`,
            status: 'pending'
          });
        }

        // Low activity
        if (member.total_calls < 3) {
          generatedActions.push({
            id: `${member.user_id}-activity`,
            rep_name: member.full_name || 'Unknown',
            rep_avatar: member.avatar_url,
            user_id: member.user_id,
            coaching_type: 'activity_boost',
            priority: 'medium',
            reason: `Only ${member.total_calls} calls recorded. Schedule 1:1 to discuss call volume targets.`,
            status: 'pending'
          });
        }
      });

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      generatedActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setActions(generatedActions.slice(0, 5)); // Top 5 actions
    } catch (error) {
      console.error('Error generating actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAction || !user) return;
    
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('coaching_assignments')
        .insert({
          team_id: teamId,
          assigned_to: selectedAction.user_id,
          assigned_by: user.id,
          coaching_type: selectedAction.coaching_type,
          priority: selectedAction.priority,
          reason: selectedAction.reason,
          notes: assignNotes || null,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success(`Coaching assigned to ${selectedAction.rep_name}`);
      setSelectedAction(null);
      setAssignNotes('');
      
      // Remove from list
      setActions(prev => prev.filter(a => a.id !== selectedAction.id));
    } catch (error) {
      console.error('Error assigning coaching:', error);
      toast.error('Failed to assign coaching');
    } finally {
      setAssigning(false);
    }
  };

  const getCoachingIcon = (type: string) => {
    switch (type) {
      case 'high_stakes_closer': return <Target className="h-5 w-5 text-destructive" />;
      case 'discovery_booker': return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'objection_handling': return <AlertTriangle className="h-5 w-5 text-warning" />;
      default: return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
      case 'high': return <Badge className="bg-warning text-warning-foreground">High</Badge>;
      case 'medium': return <Badge variant="outline">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getCoachingLabel = (type: string) => {
    switch (type) {
      case 'high_stakes_closer': return 'High Stakes Closer';
      case 'discovery_booker': return 'Discovery Booker';
      case 'objection_handling': return 'Objection Handling';
      case 'activity_boost': return 'Activity Review';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-enterprise">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">AI Coaching Recommendations</CardTitle>
          </div>
          <CardDescription>Prioritized actions based on team performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-foreground font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No urgent coaching actions needed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <div 
                  key={action.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCoachingIcon(action.coaching_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={action.rep_avatar || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {action.rep_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{action.rep_name}</span>
                      {getPriorityBadge(action.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{action.reason}</p>
                    <Badge variant="outline" className="text-xs">
                      {getCoachingLabel(action.coaching_type)}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedAction(action)}
                    className="gap-1 flex-shrink-0"
                  >
                    Assign
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Coaching</DialogTitle>
          </DialogHeader>
          
          {selectedAction && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar>
                  <AvatarImage src={selectedAction.rep_avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedAction.rep_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{selectedAction.rep_name}</p>
                  <p className="text-sm text-muted-foreground">{getCoachingLabel(selectedAction.coaching_type)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{selectedAction.reason}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Add notes (optional)</label>
                <Textarea
                  placeholder="Any specific areas to focus on..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAction(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assigning}>
              {assigning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
