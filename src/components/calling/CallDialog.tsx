import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Loader2 } from 'lucide-react';

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartCall: (phoneNumber: string) => void;
  isConnecting?: boolean;
}

export function CallDialog({ open, onOpenChange, onStartCall, isConnecting }: CallDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      onStartCall(phoneNumber.trim());
    }
  };

  const formatPhoneDisplay = (value: string) => {
    // Remove non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Start a Call
          </DialogTitle>
          <DialogDescription>
            Enter a phone number to start a call with real-time transcription.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneDisplay(e.target.value))}
              className="text-lg font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Include country code for international calls
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!phoneNumber.trim() || isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Call
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
