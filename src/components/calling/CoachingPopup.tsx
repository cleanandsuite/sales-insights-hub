import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Pin, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CoachingSignal {
  id: string;
  text: string;
  urgency: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface CoachingPopupProps {
  signals: CoachingSignal[];
  onDismiss: (id: string) => void;
}

interface ActiveBanner {
  signal: CoachingSignal;
  pinned: boolean;
}

export function CoachingPopup({ signals, onDismiss }: CoachingPopupProps) {
  const [banners, setBanners] = useState<ActiveBanner[]>([]);

  // Add new signals as banners
  useEffect(() => {
    if (signals.length === 0) return;
    const latest = signals[signals.length - 1];
    
    setBanners(prev => {
      if (prev.some(b => b.signal.id === latest.id)) return prev;
      const unpinned = prev.filter(b => !b.pinned);
      const pinned = prev.filter(b => b.pinned);
      const newBanners = [...pinned, ...unpinned, { signal: latest, pinned: false }];
      // Keep max 2 unpinned + pinned
      const finalUnpinned = newBanners.filter(b => !b.pinned).slice(-2);
      return [...newBanners.filter(b => b.pinned), ...finalUnpinned];
    });
  }, [signals]);

  // Auto-dismiss unpinned banners
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    banners.forEach(b => {
      if (b.pinned) return;
      const delay = b.signal.urgency === 'high' ? 8000 : 5000;
      const elapsed = Date.now() - b.signal.timestamp;
      const remaining = Math.max(delay - elapsed, 500);
      
      const timer = setTimeout(() => {
        setBanners(prev => prev.filter(bb => bb.signal.id !== b.signal.id));
        onDismiss(b.signal.id);
      }, remaining);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [banners, onDismiss]);

  const handlePin = useCallback((id: string) => {
    setBanners(prev => prev.map(b => 
      b.signal.id === id ? { ...b, pinned: !b.pinned } : b
    ));
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setBanners(prev => prev.filter(b => b.signal.id !== id));
    onDismiss(id);
  }, [onDismiss]);

  if (banners.length === 0) return null;

  return (
    <div className="space-y-2 mb-3">
      {banners.map(({ signal, pinned }) => (
        <div
          key={signal.id}
          className={cn(
            'flex items-start gap-2 p-3 rounded-lg border animate-fade-in transition-all',
            signal.urgency === 'high'
              ? 'bg-destructive/10 border-destructive/30'
              : signal.urgency === 'medium'
              ? 'bg-warning/10 border-warning/30'
              : 'bg-primary/5 border-primary/20',
            pinned && 'ring-1 ring-primary/40'
          )}
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs flex-1">{signal.text}</p>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => handlePin(signal.id)}
            >
              <Pin className={cn('h-3 w-3', pinned && 'text-primary')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => handleDismiss(signal.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

