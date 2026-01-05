import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User,
  Video,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileText
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
}

export default function Schedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form state
  const [newCall, setNewCall] = useState({
    title: '',
    contactName: '',
    contactEmail: '',
    scheduledAt: '',
    scheduledTime: '09:00',
    duration: '30',
    meetingUrl: '',
    meetingProvider: 'zoom',
    prepNotes: ''
  });

  useEffect(() => {
    fetchCalls();
  }, [user, currentMonth]);

  const fetchCalls = async () => {
    if (!user) return;
    
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCall = async () => {
    if (!user || !newCall.title.trim() || !newCall.scheduledAt) return;

    try {
      const scheduledDateTime = new Date(`${newCall.scheduledAt}T${newCall.scheduledTime}`);
      
      const { error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id,
          title: newCall.title,
          contact_name: newCall.contactName || null,
          contact_email: newCall.contactEmail || null,
          scheduled_at: scheduledDateTime.toISOString(),
          duration_minutes: parseInt(newCall.duration),
          meeting_url: newCall.meetingUrl || null,
          meeting_provider: newCall.meetingProvider || null,
          prep_notes: newCall.prepNotes || null,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({ title: 'Call scheduled successfully!' });
      setIsCreateOpen(false);
      setNewCall({
        title: '',
        contactName: '',
        contactEmail: '',
        scheduledAt: '',
        scheduledTime: '09:00',
        duration: '30',
        meetingUrl: '',
        meetingProvider: 'zoom',
        prepNotes: ''
      });
      fetchCalls();
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({ 
        variant: 'destructive',
        title: 'Failed to schedule call'
      });
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getCallsForDay = (date: Date) => {
    return calls.filter(call => isSameDay(new Date(call.scheduled_at), date));
  };

  const selectedDayCalls = selectedDate ? getCallsForDay(selectedDate) : [];

  const getProviderIcon = (provider: string | null) => {
    switch (provider) {
      case 'zoom':
      case 'teams':
      case 'google_meet':
        return <Video className="h-4 w-4 text-primary" />;
      default:
        return <Phone className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/20 text-primary';
      case 'completed': return 'bg-success/20 text-success';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      case 'no_show': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-1">Plan and prepare for upcoming calls</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule a Call</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Call Title</Label>
                  <Input
                    placeholder="Discovery call with Acme Corp"
                    value={newCall.title}
                    onChange={(e) => setNewCall({ ...newCall, title: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input
                      placeholder="John Smith"
                      value={newCall.contactName}
                      onChange={(e) => setNewCall({ ...newCall, contactName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      placeholder="john@acme.com"
                      value={newCall.contactEmail}
                      onChange={(e) => setNewCall({ ...newCall, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newCall.scheduledAt}
                      onChange={(e) => setNewCall({ ...newCall, scheduledAt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newCall.scheduledTime}
                      onChange={(e) => setNewCall({ ...newCall, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select 
                      value={newCall.duration}
                      onValueChange={(value) => setNewCall({ ...newCall, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select 
                      value={newCall.meetingProvider}
                      onValueChange={(value) => setNewCall({ ...newCall, meetingProvider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="teams">Teams</SelectItem>
                        <SelectItem value="google_meet">Google Meet</SelectItem>
                        <SelectItem value="other">Phone/Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Meeting Link (optional)</Label>
                  <Input
                    placeholder="https://zoom.us/j/..."
                    value={newCall.meetingUrl}
                    onChange={(e) => setNewCall({ ...newCall, meetingUrl: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateCall} className="w-full">
                  Schedule Call
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="card-gradient rounded-xl border border-border/50 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the 1st */}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {days.map((day) => {
                  const dayCalls = getCallsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square p-1 rounded-lg text-sm transition-all relative
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : isToday
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-muted'
                        }
                        ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground/50' : 'text-foreground'}
                      `}
                    >
                      <span className="absolute top-1 left-1/2 -translate-x-1/2">
                        {format(day, 'd')}
                      </span>
                      {dayCalls.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayCalls.slice(0, 3).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="space-y-4">
            <div className="card-gradient rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {selectedDate 
                  ? format(selectedDate, 'EEEE, MMMM d')
                  : 'Select a day'
                }
              </h3>

              {selectedDate && selectedDayCalls.length === 0 && (
                <p className="text-muted-foreground text-sm">No calls scheduled</p>
              )}

              <div className="space-y-3">
                {selectedDayCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{call.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(call.scheduled_at), 'h:mm a')}
                          <span>•</span>
                          {call.duration_minutes} min
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </div>

                    {call.contact_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{call.contact_name}</span>
                      </div>
                    )}

                    {call.meeting_url && (
                      <div className="flex items-center gap-2 text-sm">
                        {getProviderIcon(call.meeting_provider)}
                        <a 
                          href={call.meeting_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Start Recording
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}