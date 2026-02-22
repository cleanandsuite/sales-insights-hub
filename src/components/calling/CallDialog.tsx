import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Phone, Loader2, AlertTriangle } from 'lucide-react';
import { useCallLimits } from '@/hooks/useCallLimits';
import { CallLimitIndicator } from './CallLimitIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartCall: (phoneNumber: string) => void;
  isConnecting?: boolean;
}

export function CallDialog({ open, onOpenChange, onStartCall, isConnecting }: CallDialogProps) {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const {
    callsToday,
    dailyLimit,
    warmupDay,
    canMakeCall,
    isNearLimit,
    limitEnforced,
    isLoading,
  } = useCallLimits();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim() && canMakeCall) {
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

          {/* Call Limit Indicator */}
          {!isLoading && (
            <CallLimitIndicator
              callsToday={callsToday}
              dailyLimit={dailyLimit}
              warmupDay={warmupDay}
              enforced={limitEnforced}
            />
          )}

          {/* Warning when at limit */}
          {!canMakeCall && limitEnforced && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've reached your daily call limit. This helps maintain your number's reputation during warmup.
              </AlertDescription>
            </Alert>
          )}

          {/* Warning when near limit */}
          {canMakeCall && isNearLimit && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your daily call limit. Consider pacing your calls to maintain number reputation.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                navigate('/dashboard');
              }}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!phoneNumber.trim() || isConnecting || (!canMakeCall && limitEnforced)}
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
