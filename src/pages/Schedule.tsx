import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Clock, Sparkles, AlertTriangle, Bell, Phone, CalendarIcon
} from 'lucide-react';
import { format, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AIScheduleDialog } from '@/components/schedule/AIScheduleDialog';
import { FollowUpPrompt } from '@/components/schedule/FollowUpPrompt';
import { ScheduleEmailDialog } from '@/components/schedule/ScheduleEmailDialog';
import { ScheduleDetailPanel } from '@/components/schedule/ScheduleDetailPanel';
import { Switch } from '@/components/ui/switch';
import { useScheduleAssistant } from '@/hooks/useScheduleAssistant';

interface ScheduledCall {
  id: string;
  title: string;
  description: string | null;
  contact_name: string | null;
  contact_email: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_provider: string | null;
  status: string;
  prep_notes: string | null;
  reminder_sent?: boolean;
  reminder_minutes_before?: number;
}

interface RecentRecording {
  id: string;
  name: string | null;
  file_name: string;
  created_at: string;
}

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkConflicts } = useScheduleAssistant();
  
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [preSelectedRecordingId, setPreSelectedRecordingId] = useState<string | null>(null);
  const [recentRecording, setRecentRecording] = useState<RecentRecording | null>(null);
  const [conflicts, setConflicts] = useState<{id: string; title: string}[]>([]);
  const [emailDialogCall, setEmailDialogCall] = useState<ScheduledCall | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState('30');

  const [newCall, setNewCall] = useState({
    title: '', contactName: '', contactEmail: '', scheduledAt: '',
    scheduledTime: '09:00', duration: '30', meetingUrl: '', meetingProvider: 'zoom', prepNotes: ''
  });

  useEffect(() => {
    fetchCalls();
    checkRecentRecordings();
  }, [user]);

  useEffect(() => {
    if (!newCall.scheduledAt || !newCall.scheduledTime) { setConflicts([]); return; }
    const check = async () => {
      const proposedStart = new Date(`${newCall.scheduledAt}T${newCall.scheduledTime}`);
      const result = await checkConflicts(proposedStart, parseInt(newCall.duration));
      setConflicts(result.conflicts.map(c => ({ id: c.id, title: c.title })));
    };
    check();
  }, [newCall.scheduledAt, newCall.scheduledTime, newCall.duration]);

  const fetchCalls = async () => {
    if (!user) return;
    try {
      // Fetch all upcoming + recent calls (last 30 days to next 90 days)
      const past = new Date(); past.setDate(past.getDate() - 30);
      const future = new Date(); future.setDate(future.getDate() + 90);
      
      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_at', past.toISOString())
        .lte('scheduled_at', future.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setCalls(data || []);
      // Auto-select first upcoming call
      if (data && data.length > 0 && !selectedCall) {
        const upcoming = data.find(c => isAfter(new Date(c.scheduled_at), new Date())) || data[0];
        setSelectedCall(upcoming);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRecentRecordings = async () => {
    if (!user) return;
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const { data } = await supabase
      .from('call_recordings')
      .select('id, name, file_name, created_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', twoHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const { data: existingCall } = await supabase
        .from('scheduled_calls').select('id').eq('user_id', user.id)
        .ilike('title', `%${data[0].name || data[0].file_name}%`).limit(1);
      if (!existingCall || existingCall.length === 0) setRecentRecording(data[0]);
    }
  };

  const handleCreateCall = async () => {
    if (!user || !newCall.title.trim() || !newCall.scheduledAt) return;
    try {
      const scheduledDateTime = new Date(`${newCall.scheduledAt}T${newCall.scheduledTime}`);
      const { error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id, title: newCall.title,
          contact_name: newCall.contactName || null, contact_email: newCall.contactEmail || null,
          scheduled_at: scheduledDateTime.toISOString(), duration_minutes: parseInt(newCall.duration),
          meeting_url: newCall.meetingUrl || null, meeting_provider: newCall.meetingProvider || null,
          prep_notes: newCall.prepNotes || null, status: 'scheduled',
          reminder_minutes_before: enableReminder ? parseInt(reminderMinutes) : 0, reminder_sent: false
        } as any);
      if (error) throw error;
      toast({ title: 'Call scheduled successfully!' });
      setIsCreateOpen(false);
      setNewCall({ title: '', contactName: '', contactEmail: '', scheduledAt: '', scheduledTime: '09:00', duration: '30', meetingUrl: '', meetingProvider: 'zoom', prepNotes: '' });
      fetchCalls();
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({ variant: 'destructive', title: 'Failed to schedule call' });
    }
  };

  const isUpcoming = (call: ScheduledCall) => isAfter(new Date(call.scheduled_at), startOfDay(new Date()));
  const isPast = (call: ScheduledCall) => isBefore(new Date(call.scheduled_at), startOfDay(new Date()));

  const upcomingCalls = calls.filter(isUpcoming);
  const pastCalls = calls.filter(isPast);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">Schedule</h1>
            <p className="text-xs text-muted-foreground">Plan and prepare for upcoming calls</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setPreSelectedRecordingId(null); setIsAIDialogOpen(true); }}>
              <Sparkles className="h-4 w-4 mr-1" /> AI Schedule
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Schedule Call</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Schedule a Call</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Call Title</Label>
                    <Input placeholder="Discovery call with Acme Corp" value={newCall.title} onChange={(e) => setNewCall({ ...newCall, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Contact Name</Label><Input placeholder="John Smith" value={newCall.contactName} onChange={(e) => setNewCall({ ...newCall, contactName: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Contact Email</Label><Input type="email" placeholder="john@acme.com" value={newCall.contactEmail} onChange={(e) => setNewCall({ ...newCall, contactEmail: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={newCall.scheduledAt} onChange={(e) => setNewCall({ ...newCall, scheduledAt: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Time</Label><Input type="time" value={newCall.scheduledTime} onChange={(e) => setNewCall({ ...newCall, scheduledTime: e.target.value })} /></div>
                  </div>
                  {conflicts.length > 0 && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <div><p className="text-sm font-medium text-warning">Scheduling Conflict</p><p className="text-xs text-muted-foreground mt-0.5">Overlaps with: {conflicts.map(c => c.title).join(', ')}</p></div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select value={newCall.duration} onValueChange={(v) => setNewCall({ ...newCall, duration: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem><SelectItem value="60">1 hr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={newCall.meetingProvider} onValueChange={(v) => setNewCall({ ...newCall, meetingProvider: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Zoom</SelectItem><SelectItem value="teams">Teams</SelectItem>
                          <SelectItem value="google_meet">Google Meet</SelectItem><SelectItem value="other">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Meeting Link (optional)</Label><Input placeholder="https://zoom.us/j/..." value={newCall.meetingUrl} onChange={(e) => setNewCall({ ...newCall, meetingUrl: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Prep Notes (optional)</Label><Input placeholder="Key topics to discuss..." value={newCall.prepNotes} onChange={(e) => setNewCall({ ...newCall, prepNotes: e.target.value })} /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /><Label htmlFor="reminder-toggle" className="cursor-pointer">Reminder</Label></div>
                    <div className="flex items-center gap-2">
                      {enableReminder && (
                        <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                          <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="60">1 hr</SelectItem></SelectContent>
                        </Select>
                      )}
                      <Switch id="reminder-toggle" checked={enableReminder} onCheckedChange={setEnableReminder} />
                    </div>
                  </div>
                  <Button onClick={handleCreateCall} className="w-full">Schedule Call</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Follow-up prompt */}
        {recentRecording && (
          <div className="px-4 pt-3">
            <FollowUpPrompt
              recordingId={recentRecording.id}
              recordingName={recentRecording.name || recentRecording.file_name}
              onSchedule={(id) => { setPreSelectedRecordingId(id); setIsAIDialogOpen(true); }}
              onDismiss={() => setRecentRecording(null)}
            />
          </div>
        )}

        {/* Main 3-panel layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LEFT: Call List */}
          <div className="w-64 xl:w-72 border-r border-border/50 flex flex-col shrink-0">
            <div className="p-3 border-b border-border/30">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Upcoming ({upcomingCalls.length})
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {upcomingCalls.map((call) => (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-all text-sm ${
                      selectedCall?.id === call.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate text-xs">
                        {call.contact_name || call.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0 px-1.5 py-0">
                        {call.status === 'scheduled' ? 'Upcoming' : call.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(call.scheduled_at), 'MMM d, h:mm a')}
                    </p>
                    {call.title !== call.contact_name && call.contact_name && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{call.title}</p>
                    )}
                  </button>
                ))}

                {pastCalls.length > 0 && (
                  <>
                    <div className="p-3 mt-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Past ({pastCalls.length})
                      </p>
                    </div>
                    {pastCalls.map((call) => (
                      <button
                        key={call.id}
                        onClick={() => setSelectedCall(call)}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-all text-sm opacity-70 ${
                          selectedCall?.id === call.id
                            ? 'bg-primary/10 border border-primary/30 opacity-100'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground truncate text-xs">
                            {call.contact_name || call.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] shrink-0 px-1.5 py-0">
                            {call.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(call.scheduled_at), 'MMM d, h:mm a')}
                        </p>
                      </button>
                    ))}
                  </>
                )}

                {calls.length === 0 && !loading && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No scheduled calls</p>
                    <p className="text-xs mt-1">Schedule your first call to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* CENTER + RIGHT: Detail Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedCall ? (
              <ScheduleDetailPanel
                key={selectedCall.id}
                call={selectedCall}
                onEmailDialog={(c) => { setEmailDialogCall(c); setIsEmailDialogOpen(true); }}
                onStartRecording={() => navigate('/recordings')}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a call to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AIScheduleDialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen} onSuccess={fetchCalls} preSelectedRecordingId={preSelectedRecordingId} />
      <ScheduleEmailDialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen} call={emailDialogCall} />
    </DashboardLayout>
  );
}