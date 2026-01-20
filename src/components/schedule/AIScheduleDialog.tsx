import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Loader2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useScheduleAssistant } from '@/hooks/useScheduleAssistant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AIScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedRecordingId?: string | null;
}

interface CallRecording {
  id: string;
  name: string | null;
  file_name: string;
  created_at: string;
}

interface ConflictInfo {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
}

export function AIScheduleDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  preSelectedRecordingId 
}: AIScheduleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    extractFromTranscript, 
    suggestTimes, 
    checkConflicts,
    isExtracting,
    isSuggestingTimes,
    isCheckingConflicts
  } = useScheduleAssistant();

  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string>('');
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    contactName: '',
    contactEmail: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    duration: '30',
    meetingProvider: 'zoom',
    meetingUrl: '',
    prepNotes: ''
  });

  const [extraction, setExtraction] = useState<{
    confidence?: number;
    urgency?: string;
    follow_up_reason?: string;
  } | null>(null);

  // Load recent recordings
  useEffect(() => {
    if (!user || !open) return;

    const loadRecordings = async () => {
      const { data } = await supabase
        .from('call_recordings')
        .select('id, name, file_name, created_at')
        .eq('user_id', user.id)
        .not('live_transcription', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      setRecordings(data || []);

      if (preSelectedRecordingId) {
        setSelectedRecording(preSelectedRecordingId);
        handleExtract(preSelectedRecordingId);
      }
    };

    loadRecordings();
  }, [user, open, preSelectedRecordingId]);

  // Check conflicts when date/time changes
  useEffect(() => {
    if (!formData.scheduledDate || !formData.scheduledTime) return;

    const checkForConflicts = async () => {
      const proposedStart = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const result = await checkConflicts(proposedStart, parseInt(formData.duration));
      setConflicts(result.conflicts);
    };

    checkForConflicts();
  }, [formData.scheduledDate, formData.scheduledTime, formData.duration]);

  // Suggest times when date changes
  useEffect(() => {
    if (!formData.scheduledDate) return;

    const loadSuggestions = async () => {
      const times = await suggestTimes(formData.scheduledDate);
      setSuggestedTimes(times);
    };

    loadSuggestions();
  }, [formData.scheduledDate]);

  const handleExtract = async (recordingId: string) => {
    const result = await extractFromTranscript(recordingId);
    if (result) {
      setFormData(prev => ({
        ...prev,
        title: result.suggested_title || prev.title,
        contactName: result.contact_name || prev.contactName,
        contactEmail: result.contact_email || prev.contactEmail,
        scheduledDate: result.suggested_date ? result.suggested_date.split('T')[0] : prev.scheduledDate,
        scheduledTime: result.suggested_time || prev.scheduledTime,
        duration: result.suggested_duration?.toString() || prev.duration,
        meetingProvider: result.meeting_provider || prev.meetingProvider,
        prepNotes: result.prep_notes || prev.prepNotes
      }));

      setExtraction({
        confidence: result.confidence,
        urgency: result.urgency,
        follow_up_reason: result.follow_up_reason
      });
    }
  };

  const handleCreate = async () => {
    if (!user || !formData.title || !formData.scheduledDate) return;

    setIsCreating(true);
    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      const { error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id,
          title: formData.title,
          contact_name: formData.contactName || null,
          contact_email: formData.contactEmail || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(formData.duration),
          meeting_provider: formData.meetingProvider,
          meeting_url: formData.meetingUrl || null,
          prep_notes: formData.prepNotes || null,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({ title: 'Call scheduled successfully!' });
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        title: '',
        contactName: '',
        contactEmail: '',
        scheduledDate: '',
        scheduledTime: '09:00',
        duration: '30',
        meetingProvider: 'zoom',
        meetingUrl: '',
        prepNotes: ''
      });
      setExtraction(null);
      setSelectedRecording('');
    } catch (error) {
      console.error('Create error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to schedule call'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Assisted Scheduling
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Recording Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Auto-fill from past call
            </Label>
            <div className="flex gap-2">
              <Select 
                value={selectedRecording} 
                onValueChange={setSelectedRecording}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a recording..." />
                </SelectTrigger>
                <SelectContent>
                  {recordings.map(rec => (
                    <SelectItem key={rec.id} value={rec.id}>
                      {rec.name || rec.file_name} - {format(new Date(rec.created_at), 'MMM d')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                disabled={!selectedRecording || isExtracting}
                onClick={() => handleExtract(selectedRecording)}
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Extraction Result */}
          {extraction && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">
                  AI extracted details ({extraction.confidence}% confidence)
                </span>
                {extraction.urgency && (
                  <Badge variant={extraction.urgency === 'high' ? 'destructive' : 'secondary'}>
                    {extraction.urgency} priority
                  </Badge>
                )}
              </div>
              {extraction.follow_up_reason && (
                <p className="text-xs text-muted-foreground">
                  {extraction.follow_up_reason}
                </p>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-2">
            <Label>Call Title *</Label>
            <Input
              placeholder="Follow-up: Demo discussion"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input
                placeholder="John Smith"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          {/* AI Time Suggestions */}
          {suggestedTimes.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Available times
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTimes.map(time => (
                  <Button
                    key={time}
                    size="sm"
                    variant={formData.scheduledTime === time ? "default" : "outline"}
                    className="text-xs h-7"
                    onClick={() => setFormData({ ...formData, scheduledTime: time })}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning">Scheduling Conflict</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overlaps with: {conflicts.map(c => c.title).join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={formData.meetingProvider}
                onValueChange={(value) => setFormData({ ...formData, meetingProvider: value })}
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
              value={formData.meetingUrl}
              onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Prep Notes</Label>
            <Textarea
              placeholder="Key topics to discuss, materials needed..."
              value={formData.prepNotes}
              onChange={(e) => setFormData({ ...formData, prepNotes: e.target.value })}
              rows={3}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleCreate}
            disabled={!formData.title || !formData.scheduledDate || isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Schedule Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
