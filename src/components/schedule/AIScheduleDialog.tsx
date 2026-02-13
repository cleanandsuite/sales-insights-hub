import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Loader2,
  FileText
} from 'lucide-react';
import { useScheduleAssistant } from '@/hooks/useScheduleAssistant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScheduleConfirmModal } from './ScheduleConfirmModal';

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

interface ExtractionData {
  suggested_title?: string;
  contact_name?: string;
  contact_email?: string;
  suggested_date?: string;
  suggested_time?: string;
  suggested_duration?: number;
  meeting_provider?: string;
  prep_notes?: string;
  confidence?: number;
  follow_up_reason?: string;
  urgency?: 'high' | 'medium' | 'low';
  ai_summary?: string;
  key_points?: string[];
  objections?: string[];
  next_steps?: string[];
}

interface ConflictInfo {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
}

interface EmailScript {
  subject: string;
  body: string;
  tone: string;
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
    checkConflicts,
    coachingQuery,
    generateEmailScript,
    isExtracting,
    isGeneratingEmail
  } = useScheduleAssistant();

  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string>('');
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [emailScript, setEmailScript] = useState<EmailScript | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  // Check conflicts when extraction has date/time
  useEffect(() => {
    if (!extraction?.suggested_date || !extraction?.suggested_time) return;

    const checkForConflicts = async () => {
      const proposedStart = new Date(`${extraction.suggested_date}T${extraction.suggested_time}`);
      const result = await checkConflicts(proposedStart, extraction.suggested_duration || 30);
      setConflicts(result.conflicts);
    };

    checkForConflicts();
  }, [extraction?.suggested_date, extraction?.suggested_time, extraction?.suggested_duration]);

  const handleExtract = async (recordingId: string) => {
    const result = await extractFromTranscript(recordingId);
    if (result) {
      setExtraction(result);
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = async (data: ExtractionData) => {
    if (!user || !data.suggested_title) return;

    setIsCreating(true);
    try {
      const scheduledAt = data.suggested_date && data.suggested_time
        ? new Date(`${data.suggested_date}T${data.suggested_time}`)
        : new Date();

      const { error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id,
          title: data.suggested_title,
          contact_name: data.contact_name || null,
          contact_email: data.contact_email || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: data.suggested_duration || 30,
          meeting_provider: data.meeting_provider || 'zoom',
          prep_notes: data.prep_notes || null,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({ title: 'Call scheduled successfully!' });
      setShowConfirmModal(false);
      onSuccess();
      onOpenChange(false);

      // Reset state
      setExtraction(null);
      setEmailScript(null);
      setSelectedRecording('');
      setConflicts([]);
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

  const handleGenerateEmail = async (customPrompt?: string) => {
    if (!selectedRecording) return;
    const script = await generateEmailScript(selectedRecording, customPrompt);
    if (script) {
      setEmailScript(script);
    }
  };

  const handleCoachingQuery = async (query: string): Promise<string> => {
    if (!selectedRecording) return 'Please select a recording first.';
    return await coachingQuery(selectedRecording, query);
  };

  return (
    <>
      <Dialog open={open && !showConfirmModal} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Assisted Scheduling
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Select a call to extract scheduling info
              </Label>
              <Select 
                value={selectedRecording} 
                onValueChange={setSelectedRecording}
              >
                <SelectTrigger>
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
            </div>

            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary opacity-60" />
              <p className="text-sm text-muted-foreground mb-3">
                AI will analyze the call transcript to extract:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Contact name & email</li>
                <li>• Suggested meeting date/time</li>
                <li>• Meeting platform</li>
                <li>• Call summary & key points</li>
                <li>• Follow-up email script</li>
              </ul>
            </div>

            <Button
              className="w-full"
              disabled={!selectedRecording || isExtracting}
              onClick={() => handleExtract(selectedRecording)}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing Call...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract & Schedule
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ScheduleConfirmModal
        open={showConfirmModal}
        onOpenChange={(open) => {
          setShowConfirmModal(open);
          if (!open) {
            setExtraction(null);
            setEmailScript(null);
          }
        }}
        extraction={extraction}
        conflicts={conflicts}
        emailScript={emailScript}
        isGeneratingEmail={isGeneratingEmail}
        onConfirm={handleConfirm}
        onGenerateEmail={handleGenerateEmail}
        onCoachingQuery={handleCoachingQuery}
      />
    </>
  );
}
