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
import { Phone, PhoneOff, Loader2, AlertTriangle, Delete } from 'lucide-react';
import { useCallLimits } from '@/hooks/useCallLimits';
import { CallLimitIndicator } from './CallLimitIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartCall: (phoneNumber: string, callName?: string) => void;
  isConnecting?: boolean;
}

const dialPadKeys = [
  [{ digit: '1', letters: '' }, { digit: '2', letters: 'ABC' }, { digit: '3', letters: 'DEF' }],
  [{ digit: '4', letters: 'GHI' }, { digit: '5', letters: 'JKL' }, { digit: '6', letters: 'MNO' }],
  [{ digit: '7', letters: 'PQRS' }, { digit: '8', letters: 'TUV' }, { digit: '9', letters: 'WXYZ' }],
  [{ digit: '*', letters: '' }, { digit: '0', letters: '+' }, { digit: '#', letters: '' }],
];

export function CallDialog({ open, onOpenChange, onStartCall, isConnecting }: CallDialogProps) {
  // Handle keyboard input for dial pad
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ('0123456789*#+'.includes(e.key)) {
      e.preventDefault();
      setPhoneNumber(prev => prev + e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setPhoneNumber(prev => prev.slice(0, -1));
    }
  };
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callName, setCallName] = useState('');
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
      onStartCall(phoneNumber.trim(), callName.trim() || undefined);
    }
  };

  const handleDigitPress = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleLongPressZero = () => {
    setPhoneNumber(prev => prev + '+');
  };

  const formatDisplay = (num: string) => {
    const digits = num.replace(/[^\d+*#]/g, '');
    if (digits.startsWith('+1') && digits.length > 2) {
      const rest = digits.slice(2);
      if (rest.length <= 3) return `+1 (${rest}`;
      if (rest.length <= 6) return `+1 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
      return `+1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
    }
    return digits;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden" onKeyDown={handleKeyDown}>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-center text-lg font-semibold">
            New Call
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Enter a number to dial
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Call name input */}
          <div className="px-6 pt-2">
            <input
              type="text"
              value={callName}
              onChange={(e) => setCallName(e.target.value)}
              placeholder="Name this call (e.g. Discovery - Acme Corp)"
              className="w-full text-sm text-center bg-muted/30 border border-border/50 rounded-lg px-3 py-2 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Phone number display */}
          <div className="px-6 py-3 text-center min-h-[64px] flex items-center justify-center">
            <span className={cn(
              'font-mono tracking-wider transition-all',
              phoneNumber.length > 12 ? 'text-xl' : 'text-2xl',
              phoneNumber ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {phoneNumber ? formatDisplay(phoneNumber) : '+1 (___) ___-____'}
            </span>
          </div>

          {/* Dial pad grid */}
          <div className="px-6 pb-2">
            <div className="grid grid-cols-3 gap-2">
              {dialPadKeys.flat().map(({ digit, letters }) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitPress(digit)}
                  onDoubleClick={digit === '0' ? handleLongPressZero : undefined}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-full h-16 w-16 mx-auto',
                    'bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors',
                    'select-none cursor-pointer'
                  )}
                >
                  <span className="text-2xl font-semibold text-foreground leading-none">{digit}</span>
                  {letters && (
                    <span className="text-[10px] font-medium text-muted-foreground tracking-widest mt-0.5">
                      {letters}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action row: backspace, call, cancel */}
          <div className="px-6 pb-3 pt-2 flex items-center justify-center gap-6">
            {/* Empty spacer for balance */}
            <div className="w-14" />

            {/* Call button */}
            <Button
              type="submit"
              disabled={!phoneNumber.trim() || isConnecting || (!canMakeCall && limitEnforced)}
              className={cn(
                'h-16 w-16 rounded-full p-0',
                'bg-primary hover:bg-primary/90 active:bg-primary/80',
                'text-primary-foreground shadow-lg shadow-primary/30'
              )}
            >
              {isConnecting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </Button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              className={cn(
                'h-14 w-14 flex items-center justify-center rounded-full',
                'hover:bg-muted/50 transition-colors',
                !phoneNumber && 'opacity-0 pointer-events-none'
              )}
            >
              <Delete className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Call Limit Indicator */}
          {!isLoading && (
            <div className="px-6 pb-3">
              <CallLimitIndicator
                callsToday={callsToday}
                dailyLimit={dailyLimit}
                warmupDay={warmupDay}
                enforced={limitEnforced}
              />
            </div>
          )}

          {/* Warning when at limit */}
          {!canMakeCall && limitEnforced && (
            <div className="px-6 pb-3">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Daily call limit reached. Helps maintain number reputation during warmup.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {canMakeCall && isNearLimit && (
            <div className="px-6 pb-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Approaching daily call limit. Pace your calls to maintain number reputation.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Hang Up / Cancel */}
          <div className="px-6 pb-6">
            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate('/dashboard');
              }}
              disabled={isConnecting}
            >
              <PhoneOff className="h-4 w-4" />
              Hang Up
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
