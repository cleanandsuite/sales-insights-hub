import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Copy, Check, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { useScheduleAssistant } from '@/hooks/useScheduleAssistant';
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

interface ScheduleEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  call: ScheduledCall | null;
}

export function ScheduleEmailDialog({ open, onOpenChange, call }: ScheduleEmailDialogProps) {
  const { generateCallEmail, isGeneratingEmail } = useScheduleAssistant();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (open && call && !generated) {
      handleGenerate();
    }
  }, [open, call?.id]);

  useEffect(() => {
    if (!open) {
      setGenerated(false);
      setSubject('');
      setBody('');
      setCustomPrompt('');
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!call) return;
    
    // Demo calls (fake IDs) can't be looked up in the database — generate a template client-side
    if (call.id.startsWith('demo-')) {
      const contactName = call.contact_name || 'there';
      const meetingDate = new Date(call.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      setSubject(`Following up: ${call.title}`);
      setBody(`Hi ${contactName},\n\nThank you for taking the time to connect. I wanted to follow up on our ${call.title.toLowerCase()} scheduled for ${meetingDate}.\n\n${call.prep_notes ? `A few things I'd like to cover:\n${call.prep_notes}\n\n` : ''}Please let me know if you have any questions or need to adjust the time.\n\nBest regards,\n[Your Name]`);
      setGenerated(true);
      return;
    }

    const result = await generateCallEmail(call.id, customPrompt || undefined);
    if (result) {
      setSubject(result.subject);
      setBody(result.body);
      setGenerated(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    toast({ title: 'Email copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInClient = () => {
    const mailto = `mailto:${encodeURIComponent(call?.contact_email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email for: {call.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom prompt */}
          <div className="space-y-2">
            <Label>Custom Instructions (optional)</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g., 'More formal tone', 'Include agenda items', 'Mention pricing'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGeneratingEmail}
                className="h-auto"
              >
                {isGeneratingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isGeneratingEmail && !generated && (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating email draft...
            </div>
          )}

          {generated && (
            <>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </>
          )}
        </div>

        {generated && (
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {call.contact_email && (
              <Button onClick={handleOpenInClient}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Email Client
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
