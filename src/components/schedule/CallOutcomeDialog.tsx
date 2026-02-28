import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Phone, PhoneOff, Voicemail, Calendar, XCircle, ArrowRight, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths } from 'date-fns';

interface ScheduledCall {
  id: string;
  title: string;
  contact_name: string | null;
  contact_email: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_provider: string | null;
  status: string;
  prep_notes: string | null;
  outcome?: string | null;
  recurrence_rule?: string | null;
}

interface CallOutcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  call: ScheduledCall | null;
  onOutcomeLogged: () => void;
  isDemoMode?: boolean;
}

const OUTCOMES = [
  { value: 'connected', label: 'Connected', icon: Phone, color: 'text-emerald-500', suggestion: 'Great conversation! Consider updating the lead stage.' },
  { value: 'voicemail', label: 'Voicemail', icon: Voicemail, color: 'text-amber-500', suggestion: 'Schedule a retry in 2 days.' },
  { value: 'no_show', label: 'No Show', icon: PhoneOff, color: 'text-destructive', suggestion: 'Send a follow-up email and reschedule.' },
  { value: 'rescheduled', label: 'Rescheduled', icon: Calendar, color: 'text-primary', suggestion: 'The call has been moved — a new slot will be created.' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-muted-foreground', suggestion: 'Mark the lead for future outreach.' },
] as const;

const LEAD_STAGE_MAP: Record<string, string> = {
  connected: 'contacted',
  voicemail: 'contacted',
  rescheduled: 'contacted',
};

export function CallOutcomeDialog({ open, onOpenChange, call, onOutcomeLogged, isDemoMode }: CallOutcomeDialogProps) {
  const { user } = useAuth();
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [leadSuggestion, setLeadSuggestion] = useState<{ leadId: string; newStage: string } | null>(null);
  const [step, setStep] = useState<'outcome' | 'lead'>('outcome');

  const handleSelectOutcome = async (outcome: string) => {
    setSelectedOutcome(outcome);

    // Check for matching lead to suggest pipeline update
    if (call?.contact_name && LEAD_STAGE_MAP[outcome]) {
      if (isDemoMode) {
        setLeadSuggestion({ leadId: 'demo-lead', newStage: LEAD_STAGE_MAP[outcome] });
      } else {
        const { data } = await supabase
          .from('leads')
          .select('id, lead_status')
          .ilike('contact_name', `%${call.contact_name}%`)
          .limit(1);

        if (data?.[0] && data[0].lead_status !== LEAD_STAGE_MAP[outcome]) {
          setLeadSuggestion({ leadId: data[0].id, newStage: LEAD_STAGE_MAP[outcome] });
        }
      }
    }
  };

  const handleSave = async () => {
    if (!call || !selectedOutcome) return;
    setSaving(true);

    try {
      if (isDemoMode) {
        toast({ title: 'Outcome logged (demo)', description: `Marked as "${selectedOutcome}"` });
        if (leadSuggestion) {
          setStep('lead');
          setSaving(false);
          return;
        }
        onOutcomeLogged();
        resetAndClose();
        return;
      }

      // Update the call
      await supabase
        .from('scheduled_calls')
        .update({
          outcome: selectedOutcome,
          outcome_notes: notes || null,
          status: selectedOutcome === 'cancelled' ? 'cancelled' : 'completed',
        } as any)
        .eq('id', call.id);

      // Handle recurring: create next occurrence
      if ((call as any).recurrence_rule) {
        const rule = (call as any).recurrence_rule as string;
        const currentDate = new Date(call.scheduled_at);
        let nextDate: Date;
        if (rule === 'weekly') nextDate = addWeeks(currentDate, 1);
        else if (rule === 'biweekly') nextDate = addWeeks(currentDate, 2);
        else nextDate = addMonths(currentDate, 1);

        await supabase.from('scheduled_calls').insert({
          user_id: user!.id,
          title: call.title,
          contact_name: call.contact_name,
          contact_email: call.contact_email,
          scheduled_at: nextDate.toISOString(),
          duration_minutes: call.duration_minutes,
          meeting_url: call.meeting_url,
          meeting_provider: call.meeting_provider,
          prep_notes: call.prep_notes,
          status: 'scheduled',
          recurrence_rule: rule,
          recurrence_parent_id: call.id,
        } as any);

        toast({ title: 'Next recurring call created', description: `Scheduled for ${nextDate.toLocaleDateString()}` });
      }

      toast({ title: 'Outcome logged', description: `Marked as "${selectedOutcome}"` });

      if (leadSuggestion) {
        setStep('lead');
        setSaving(false);
        return;
      }

      onOutcomeLogged();
      resetAndClose();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to save outcome' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!leadSuggestion) return;

    if (!isDemoMode) {
      await supabase
        .from('leads')
        .update({ lead_status: leadSuggestion.newStage })
        .eq('id', leadSuggestion.leadId);
    }

    toast({ title: 'Lead updated', description: `Stage changed to "${leadSuggestion.newStage}"` });
    onOutcomeLogged();
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedOutcome(null);
    setNotes('');
    setLeadSuggestion(null);
    setStep('outcome');
    onOpenChange(false);
  };

  if (!call) return null;

  const outcomeInfo = OUTCOMES.find(o => o.value === selectedOutcome);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'lead' ? 'Update Lead Pipeline?' : 'Log Call Outcome'}
          </DialogTitle>
        </DialogHeader>

        {step === 'outcome' && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              How did the call with <span className="font-medium text-foreground">{call.contact_name || call.title}</span> go?
            </p>

            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => handleSelectOutcome(value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-sm font-medium ${
                    selectedOutcome === value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/50 hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selectedOutcome === value ? color : ''}`} />
                  {label}
                </button>
              ))}
            </div>

            {outcomeInfo && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  {outcomeInfo.suggestion}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about this call..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={resetAndClose}>Cancel</Button>
              <Button size="sm" disabled={!selectedOutcome || saving} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save Outcome'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'lead' && leadSuggestion && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Update <span className="font-medium text-foreground">{call.contact_name}</span>'s pipeline stage?
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <Badge variant="outline" className="text-xs">Current</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-primary/15 text-primary border-primary/30 text-xs capitalize">
                {leadSuggestion.newStage}
              </Badge>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { onOutcomeLogged(); resetAndClose(); }}>
                Skip
              </Button>
              <Button size="sm" onClick={handleUpdateLead}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Update Lead
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
