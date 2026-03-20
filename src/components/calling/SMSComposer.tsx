import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SMSComposerProps {
  phoneNumber?: string;
  contactName?: string;
  leadId?: string;
  variant?: 'button' | 'icon';
}

export function SMSComposer({ phoneNumber, contactName, leadId, variant = 'button' }: SMSComposerProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(phoneNumber || '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const charCount = body.length;
  const segmentCount = Math.ceil(charCount / 160) || 1;

  const handleSend = async () => {
    if (!to || !body.trim()) {
      toast.error('Please enter a number and message');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: { to, body: body.trim(), leadId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('SMS sent successfully');
      setBody('');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const trigger = variant === 'icon' ? (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <MessageSquare className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      SMS
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send SMS{contactName ? ` to ${contactName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">To</label>
            <Input
              placeholder="+1 (555) 123-4567"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Message</label>
            <Textarea
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={1600}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{charCount}/1600 characters</span>
              <Badge variant="outline" className="text-xs">
                {segmentCount} segment{segmentCount > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSend}
              disabled={sending || !to || !body.trim()}
              className="gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
