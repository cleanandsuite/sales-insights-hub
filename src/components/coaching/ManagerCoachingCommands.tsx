import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Send, Users, Clock, MapPin, Target, BookOpen, 
  PhoneForwarded, Focus, Briefcase, Plus, Calendar,
  AlertTriangle, CheckCircle2, User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const TASK_TYPES = [
  { value: 'follow_up', label: 'Follow Up', icon: PhoneForwarded, color: 'text-primary', description: 'Follow up with a prospect or client' },
  { value: 'training', label: 'Training', icon: BookOpen, color: 'text-warning', description: 'Complete a training module or practice session' },
  { value: 'focus', label: 'Focus Area', icon: Focus, color: 'text-accent', description: 'Concentrate on improving a specific skill' },
  { value: 'job_task', label: 'Job Task', icon: Briefcase, color: 'text-success', description: 'Complete a specific work task' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

interface SentCommand {
  id: string;
  coaching_type: string;
  priority: string;
  reason: string;
  status: string;
  due_date: string | null;
  created_at: string;
  assigned_to_name?: string;
  notes: string | null;
}

export function ManagerCoachingCommands() {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sentCommands, setSentCommands] = useState<SentCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [selectedMember, setSelectedMember] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
      fetchSentCommands();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    if (!user) return;
    try {
      const { data: teams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .in('role', ['manager', 'admin']);

      if (!teams?.length) return;

      const teamIds = teams.map(t => t.team_id);
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .in('team_id', teamIds)
        .neq('user_id', user.id);

      if (!members?.length) return;

      const memberIds = [...new Set(members.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', memberIds);

      setTeamMembers(profiles || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const fetchSentCommands = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('coaching_assignments')
        .select('id, coaching_type, priority, reason, status, due_date, created_at, assigned_to, notes')
        .eq('assigned_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const assignedToIds = [...new Set((data || []).map(d => d.assigned_to).filter(Boolean))];
      let profiles: Record<string, string> = {};
      if (assignedToIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', assignedToIds);
        profileData?.forEach(p => { profiles[p.user_id] = p.full_name || 'Team Member'; });
      }

      setSentCommands((data || []).map(d => ({
        ...d,
        assigned_to_name: profiles[d.assigned_to] || 'Team Member',
      })));
    } catch (err) {
      console.error('Error fetching sent commands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!user || !selectedMember || !taskType || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      // Get team_id
      const { data: teams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .in('role', ['manager', 'admin'])
        .limit(1);

      if (!teams?.length) throw new Error('No team found');

      const fullNotes = [notes, location ? `Location: ${location}` : '', estimatedTime ? `Est. Time: ${estimatedTime}` : '']
        .filter(Boolean).join('\n');

      const { error } = await supabase
        .from('coaching_assignments')
        .insert({
          team_id: teams[0].team_id,
          assigned_to: selectedMember,
          assigned_by: user.id,
          coaching_type: taskType,
          priority,
          reason,
          notes: fullNotes || null,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Coaching task sent!');
      setShowDialog(false);
      resetForm();
      fetchSentCommands();
    } catch (err) {
      console.error('Error sending command:', err);
      toast.error('Failed to send coaching task');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSelectedMember('');
    setTaskType('');
    setPriority('medium');
    setReason('');
    setNotes('');
    setDueDate('');
    setLocation('');
    setEstimatedTime('');
  };

  const getTaskIcon = (type: string) => {
    const found = TASK_TYPES.find(t => t.value === type);
    if (!found) return <Target className="h-4 w-4 text-muted-foreground" />;
    const Icon = found.icon;
    return <Icon className={`h-4 w-4 ${found.color}`} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-success/20 text-success border-success/30 text-xs">Done</Badge>;
      case 'in_progress': return <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">In Progress</Badge>;
      case 'dismissed': return <Badge variant="outline" className="text-muted-foreground text-xs">Dismissed</Badge>;
      default: return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  return (
    <>
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Send className="h-5 w-5 text-primary" />
                Manager Commands
              </CardTitle>
              <CardDescription>Assign coaching tasks, follow-ups, and training to your team</CardDescription>
            </div>
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : sentCommands.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No coaching tasks sent yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Create tasks to guide your team's improvement.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sentCommands.map(cmd => (
                <div key={cmd.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  {getTaskIcon(cmd.coaching_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{cmd.reason}</span>
                      {getStatusBadge(cmd.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{cmd.assigned_to_name}</span>
                      <span>{formatDistanceToNow(new Date(cmd.created_at), { addSuffix: true })}</span>
                      {cmd.due_date && (
                        <span className="flex items-center gap-1 text-warning">
                          <Clock className="h-3 w-3" />
                          Due {formatDistanceToNow(new Date(cmd.due_date), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Assign Coaching Task
            </DialogTitle>
            <DialogDescription>Send a task to a team member with details and deadline</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Assign to */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Assign To</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.full_name || 'Team Member'}
                    </SelectItem>
                  ))}
                  {teamMembers.length === 0 && (
                    <SelectItem value="none" disabled>No team members found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Task Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TASK_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setTaskType(type.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        taskType === type.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${type.color} mb-1`} />
                      <p className="text-sm font-medium text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason/Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
              <Textarea
                placeholder="What should they work on?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            {/* Priority + Due Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Time + Location row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Est. Time
                </label>
                <Input placeholder="e.g. 30 min" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </label>
                <Input placeholder="e.g. Office / Remote" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label>
              <Textarea
                placeholder="Any extra context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending || !selectedMember || !taskType || !reason} className="gap-2">
              {sending ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? 'Sending...' : 'Send Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
