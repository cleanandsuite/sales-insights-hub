import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  ClipboardList, Target, TrendingUp, AlertTriangle, Zap,
  Clock, CheckCircle2, PlayCircle, XCircle, User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDemoMode } from '@/hooks/useDemoMode';
import { demoCoachingAssignments } from '@/data/demoData';

interface CoachingAssignment {
  id: string;
  coaching_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  status: string;
  notes: string | null;
  due_date: string | null;
  created_at: string;
  assigned_by_name?: string;
  assigned_by_avatar?: string;
}

export function CoachingQueueCard() {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [assignments, setAssignments] = useState<CoachingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<CoachingAssignment | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [dialogAction, setDialogAction] = useState<'start' | 'complete' | 'dismiss' | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setAssignments(demoCoachingAssignments);
      setLoading(false);
      return;
    }
    if (user) fetchAssignments();
  }, [user, isDemoMode]);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coaching_assignments')
        .select(`
          id,
          coaching_type,
          priority,
          reason,
          status,
          notes,
          due_date,
          created_at,
          assigned_by
        `)
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch manager names
      const assignedByIds = [...new Set((data || []).map(a => a.assigned_by).filter(Boolean))];
      let profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (assignedByIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', assignedByIds);
        
        profileData?.forEach(p => {
          profiles[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      const enriched: CoachingAssignment[] = (data || []).map(a => ({
        id: a.id,
        coaching_type: a.coaching_type,
        priority: a.priority as 'low' | 'medium' | 'high' | 'critical',
        reason: a.reason,
        status: a.status,
        notes: a.notes,
        due_date: a.due_date,
        created_at: a.created_at,
        assigned_by_name: a.assigned_by ? profiles[a.assigned_by]?.full_name || 'Manager' : 'System',
        assigned_by_avatar: a.assigned_by ? profiles[a.assigned_by]?.avatar_url || undefined : undefined
      }));

      setAssignments(enriched);
    } catch (error) {
      console.error('Error fetching coaching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'in_progress' | 'completed' | 'dismissed') => {
    if (!selectedAssignment) return;

    setUpdating(true);
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        if (completionNotes) {
          updateData.notes = selectedAssignment.notes 
            ? `${selectedAssignment.notes}\n\n---\nCompletion notes: ${completionNotes}`
            : `Completion notes: ${completionNotes}`;
        }
      }

      const { error } = await supabase
        .from('coaching_assignments')
        .update(updateData)
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      const actionLabel = newStatus === 'in_progress' ? 'started' : newStatus;
      toast.success(`Coaching ${actionLabel}!`);
      
      setSelectedAssignment(null);
      setCompletionNotes('');
      setDialogAction(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update coaching status');
    } finally {
      setUpdating(false);
    }
  };

  const getCoachingIcon = (type: string) => {
    switch (type) {
      case 'high_stakes_closer': return <Target className="h-5 w-5 text-destructive" />;
      case 'discovery_booker': return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'objection_handling': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'activity_boost': return <Zap className="h-5 w-5 text-primary" />;
      default: return <ClipboardList className="h-5 w-5 text-muted-foreground" />;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress': 
        return <Badge className="bg-primary/20 text-primary border-primary/30">In Progress</Badge>;
      default: 
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  const getCoachingLabel = (type: string) => {
    switch (type) {
      case 'high_stakes_closer': return 'High Stakes Closer';
      case 'discovery_booker': return 'Discovery Booker';
      case 'objection_handling': return 'Objection Handling';
      case 'activity_boost': return 'Activity Review';
      case 'energy_booster': return 'Energy Booster';
      case 'layered_closer': return 'Layered Closer';
      default: return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  };

  const openDialog = (assignment: CoachingAssignment, action: 'start' | 'complete' | 'dismiss') => {
    setSelectedAssignment(assignment);
    setDialogAction(action);
    setCompletionNotes('');
  };

  if (loading) {
    return (
      <Card className="card-gradient">
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Your Coaching Queue</CardTitle>
          </div>
          <CardDescription>Manager-assigned coaching tasks for you to complete</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-foreground font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending coaching assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCoachingIcon(assignment.coaching_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground">
                        {getCoachingLabel(assignment.coaching_type)}
                      </span>
                      {getPriorityBadge(assignment.priority)}
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{assignment.reason}</p>
                    
                    {assignment.notes && (
                      <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">
                        "{assignment.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>From: {assignment.assigned_by_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}</span>
                      </div>
                      {assignment.due_date && (
                        <div className="flex items-center gap-1 text-warning">
                          <Clock className="h-3 w-3" />
                          <span>Due: {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {assignment.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => openDialog(assignment, 'start')}
                        className="gap-1"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Start
                      </Button>
                    )}
                    {assignment.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => openDialog(assignment, 'complete')}
                        className="gap-1 bg-success hover:bg-success/90"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => openDialog(assignment, 'dismiss')}
                      className="text-muted-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'start' && 'Start Coaching'}
              {dialogAction === 'complete' && 'Complete Coaching'}
              {dialogAction === 'dismiss' && 'Dismiss Coaching'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'start' && 'Mark this coaching as in progress to track your work.'}
              {dialogAction === 'complete' && 'Mark this coaching as completed and optionally add notes.'}
              {dialogAction === 'dismiss' && 'Are you sure you want to dismiss this coaching assignment?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {getCoachingIcon(selectedAssignment.coaching_type)}
                <div>
                  <p className="font-medium text-foreground">
                    {getCoachingLabel(selectedAssignment.coaching_type)}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedAssignment.reason}
                  </p>
                </div>
              </div>

              {dialogAction === 'complete' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Completion notes (optional)</label>
                  <Textarea
                    placeholder="What did you learn? Any key takeaways..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (dialogAction === 'start') handleStatusChange('in_progress');
                if (dialogAction === 'complete') handleStatusChange('completed');
                if (dialogAction === 'dismiss') handleStatusChange('dismissed');
              }}
              disabled={updating}
              variant={dialogAction === 'dismiss' ? 'destructive' : 'default'}
            >
              {updating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {dialogAction === 'start' && 'Start Coaching'}
                  {dialogAction === 'complete' && 'Mark Complete'}
                  {dialogAction === 'dismiss' && 'Dismiss'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
