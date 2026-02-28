import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Phone, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const DELAY_OPTIONS = [
  { value: '3', label: '3s' },
  { value: '5', label: '5s' },
  { value: '10', label: '10s' },
  { value: '15', label: '15s' },
];

const STORAGE_KEY = 'power_dialer_settings';

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, delay: 5 };
}

function saveSettings(settings: { enabled: boolean; delay: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface PowerDialerControlsProps {
  onCallNextLead: () => void;
  nextLeadName?: string;
  className?: string;
}

export function PowerDialerControls({ onCallNextLead, nextLeadName, className }: PowerDialerControlsProps) {
  const [settings, setSettings] = useState(loadSettings);
  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  const startCountdown = useCallback(() => {
    if (!settings.enabled) return;
    cancelledRef.current = false;
    setCountdown(settings.delay);

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          if (!cancelledRef.current) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => onCallNextLead(), 0);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [settings.enabled, settings.delay, onCallNextLead]);

  // Start countdown when component mounts (call just ended)
  useEffect(() => {
    startCountdown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCountdown]);

  const cancelCountdown = () => {
    cancelledRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
  };

  const updateSettings = (updates: Partial<typeof settings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    saveSettings(next);

    // If toggling off while counting, cancel
    if (updates.enabled === false) cancelCountdown();
    // If toggling on, start
    if (updates.enabled === true && countdown === null) {
      setTimeout(() => {
        cancelledRef.current = false;
        setCountdown(next.delay);
        intervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(intervalRef.current!);
              intervalRef.current = null;
              if (!cancelledRef.current) setTimeout(() => onCallNextLead(), 0);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }, 0);
    }
  };

  const progress = countdown !== null ? ((settings.delay - countdown) / settings.delay) * 100 : 0;

  return (
    <div className={cn('rounded-lg border border-border bg-card p-3 space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">Power Dialer</Label>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={String(settings.delay)}
            onValueChange={v => updateSettings({ delay: Number(v) })}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELAY_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Switch
            checked={settings.enabled}
            onCheckedChange={enabled => updateSettings({ enabled })}
          />
        </div>
      </div>

      {settings.enabled && countdown !== null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Auto-dialing {nextLeadName ? <strong>{nextLeadName}</strong> : 'next lead'} in {countdown}s…
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={cancelCountdown}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {settings.enabled && countdown === null && (
        <p className="text-xs text-muted-foreground">
          Ready — will auto-dial after next call ends
        </p>
      )}
    </div>
  );
}
