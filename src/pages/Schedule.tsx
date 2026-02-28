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
  Plus, Clock, Sparkles, AlertTriangle, Bell, Phone, CalendarIcon, Repeat
} from 'lucide-react';
import { format, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AIScheduleDialog } from '@/components/schedule/AIScheduleDialog';
import { FollowUpPrompt } from '@/components/schedule/FollowUpPrompt';
import { ScheduleEmailDialog } from '@/components/schedule/ScheduleEmailDialog';
import { ScheduleDetailPanel } from '@/components/schedule/ScheduleDetailPanel';
import { CallOutcomeDialog } from '@/components/schedule/CallOutcomeDialog';
import { useScheduleAssistant } from '@/hooks/useScheduleAssistant';
import { useCallReminders } from '@/hooks/useCallReminders';

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
  outcome?: string | null;
  outcome_notes?: string | null;
  recurrence_rule?: string | null;
  recurrence_parent_id?: string | null;
}

interface RecentRecording {
  id: string;
  name: string | null;
  file_name: string;
  created_at: string;
}

const DEMO_SCHEDULED_CALLS: ScheduledCall[] = [
  {
    id: 'demo-sc-1', title: 'Discovery Call — TechFlow Solutions',
    description: 'Initial discovery with VP of Sales', contact_name: 'Sarah Mitchell',
    contact_email: 'sarah@techflow.io',
    scheduled_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    duration_minutes: 30, meeting_url: 'https://zoom.us/j/demo1', meeting_provider: 'zoom',
    status: 'scheduled', prep_notes: 'Review their current tech stack. Prepare ROI comparison.',
  },
  {
    id: 'demo-sc-2', title: 'Follow-up — CloudScale Inc',
    description: 'Second call to discuss feature requirements', contact_name: 'Marcus Chen',
    contact_email: 'mchen@cloudscale.com',
    scheduled_at: new Date(Date.now() + 26 * 3600000).toISOString(),
    duration_minutes: 45, meeting_url: null, meeting_provider: 'other',
    status: 'scheduled', prep_notes: 'Bring feature comparison doc. Address timeline concerns.',
  },
  {
    id: 'demo-sc-3', title: 'Proposal Review — DataSync Pro',
    description: 'Walk through customized proposal with CFO present', contact_name: 'Emily Rodriguez',
    contact_email: 'emily.r@datasyncpro.com',
    scheduled_at: new Date(Date.now() + 50 * 3600000).toISOString(),
    duration_minutes: 60, meeting_url: 'https://teams.microsoft.com/demo', meeting_provider: 'teams',
    status: 'scheduled', prep_notes: 'CFO-ready ROI deck. Pilot program details ready.',
  },
  {
    id: 'demo-sc-4', title: 'Quarterly Check-in — Pinnacle Group',
    description: 'Regular account review', contact_name: 'David Park',
    contact_email: 'dpark@pinnacle.com',
    scheduled_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    duration_minutes: 30, meeting_url: null, meeting_provider: 'zoom',
    status: 'completed', prep_notes: 'Review usage metrics and upsell opportunities.',
  },
  {
    id: 'demo-sc-5', title: 'Cold Outreach — Summit Financial',
    description: 'First contact after conference meeting', contact_name: 'Robert Finch',
    contact_email: 'rfinch@summitfin.com',
    scheduled_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    duration_minutes: 15, meeting_url: null, meeting_provider: 'other',
    status: 'completed', prep_notes: 'Met at SaaStr — interested in Q3 budget cycle.',
  },
];

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkConflicts } = useScheduleAssistant();
  useCallReminders();
  
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
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState('30');
  const [recurrenceRule, setRecurrenceRule] = useState('none');
  const [demoMode, setDemoMode] = useState(false);

  const [newCall, setNewCall] = useState({
    title: '', contactName: '', contactEmail: '', scheduledAt: '',
    scheduledTime: '09:00', duration: '30', meetingUrl: '', meetingProvider: 'zoom', prepNotes: '',
  });

  // Auto-open outcome dialog when selecting a past call without outcome
  const handleSelectCall = (call: ScheduledCall) => {
    setSelectedCall(call);
    const isPastCall = isBefore(new Date(call.scheduled_at), new Date());
    if (isPastCall && call.status === 'scheduled' && !call.outcome) {
      setIsOutcomeDialogOpen(true);
    }
  };

  useEffect(() => {
    if (demoMode) {
      setCalls(DEMO_SCHEDULED_CALLS);
      const upcoming = DEMO_SCHEDULED_CALLS.find(c => isAfter(new Date(c.scheduled_at), new Date())) || DEMO_SCHEDULED_CALLS[0];
      setSelectedCall(upcoming);
      setLoading(false);
    } else {
      fetchCalls();
      checkRecentRecordings();
    }
  }, [user, demoMode]);

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
          reminder_minutes_before: enableReminder ? parseInt(reminderMinutes) : 0, reminder_sent: false,
          recurrence_rule: recurrenceRule !== 'none' ? recurrenceRule : null,
        } as any);
      if (error) throw error;
      toast({ title: 'Call scheduled successfully!' });
      setIsCreateOpen(false);
      setNewCall({ title: '', contactName: '', contactEmail: '', scheduledAt: '', scheduledTime: '09:00', duration: '30', meetingUrl: '', meetingProvider: 'zoom', prepNotes: '' });
      setRecurrenceRule('none');
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
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
              <Sparkles className={`h-3.5 w-3.5 ${demoMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label htmlFor="schedule-demo" className="text-xs font-medium cursor-pointer">Demo</Label>
              <Switch id="schedule-demo" checked={demoMode} onCheckedChange={setDemoMode} />
            </div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Repeat</Label>
                      <Select value={recurrenceRule} onValueChange={setRecurrenceRule}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No repeat</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                      {recurrenceRule !== 'none' && (
                        <Badge variant="outline" className="text-xs w-fit flex items-center gap-1">
                          <Repeat className="h-3 w-3" /> Repeats {recurrenceRule}
                        </Badge>
                      )}
                    </div>
                  </div>
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
                    onClick={() => handleSelectCall(call)}
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
                    <div className="flex items-center gap-1 mt-0.5">
                      {call.title !== call.contact_name && call.contact_name && (
                        <p className="text-[10px] text-muted-foreground truncate">{call.title}</p>
                      )}
                      {call.recurrence_rule && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 flex items-center gap-0.5">
                          <Repeat className="h-2.5 w-2.5" /> {call.recurrence_rule}
                        </Badge>
                      )}
                    </div>
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
                        onClick={() => handleSelectCall(call)}
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
                            {call.outcome || call.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(call.scheduled_at), 'MMM d, h:mm a')}
                        </p>
                        {call.recurrence_rule && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5 flex items-center gap-0.5 w-fit">
                            <Repeat className="h-2.5 w-2.5" /> {call.recurrence_rule}
                          </Badge>
                        )}
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
      <CallOutcomeDialog
        open={isOutcomeDialogOpen}
        onOpenChange={setIsOutcomeDialogOpen}
        call={selectedCall}
        onOutcomeLogged={() => { if (demoMode) { /* demo refresh */ } else { fetchCalls(); } }}
        isDemoMode={demoMode}
      />
    </DashboardLayout>
  );
}