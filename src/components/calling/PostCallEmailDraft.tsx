import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Loader2, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOutboundEmail } from '@/hooks/useOutboundEmail';
import { toast } from 'sonner';

interface PostCallEmailDraftProps {
  transcript: string;
  contactName?: string;
  contactEmail?: string;
}

export function PostCallEmailDraft({ transcript, contactName, contactEmail }: PostCallEmailDraftProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [to, setTo] = useState(contactEmail || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const { sendEmail, isSending, isConfigured } = useOutboundEmail();

  const generateDraft = async () => {
    if (!transcript) {
      toast.error('No transcript available to generate email');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-assistant', {
        body: {
          action: 'generate_email',
          transcript,
          contactName: contactName || 'the prospect',
        },
      });

      if (error) throw error;
      if (data?.email) {
        setSubject(data.email.subject || `Follow-up: ${contactName || 'Our Call'}`);
        setBody(data.email.body || '');
      }
    } catch (err: any) {
      console.error('Email generation error:', err);
      // Fallback: generate a basic template
      setSubject(`Follow-up: ${contactName || 'Our Call Today'}`);
      setBody(
        `Hi ${contactName || 'there'},\n\nThank you for taking the time to speak with me today. ` +
        `I wanted to follow up on our conversation and recap the key points we discussed.\n\n` +
        `Please let me know if you have any questions or if there's anything else I can help with.\n\n` +
        `Best regards`
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!subject && !body) {
      generateDraft();
    }
  };

  const handleSend = async () => {
    if (!to) {
      toast.error('Please enter a recipient email');
      return;
    }
    const success = await sendEmail(to, subject, body);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2">
        <Mail className="h-4 w-4" />
        Draft Follow-up
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Follow-up Email
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To</label>
              <Input
                type="email"
                placeholder="recipient@company.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Input
                placeholder="Subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Body</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateDraft}
                  disabled={generating}
                  className="gap-1 text-xs"
                >
                  {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Regenerate
                </Button>
              </div>
              {generating ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Drafting email from transcript...
                </div>
              ) : (
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  placeholder="Email body..."
                  className="resize-none"
                />
              )}
            </div>

            {!isConfigured && (
              <p className="text-xs text-muted-foreground">
                Configure your SMTP settings in Settings → Email to send directly.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !to || !subject || !body}
                className="gap-2"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
