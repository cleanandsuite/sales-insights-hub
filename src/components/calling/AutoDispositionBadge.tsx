import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bot, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISPOSITIONS = [
  { value: 'connected_interested', label: 'Interested', color: 'bg-emerald-500/15 text-emerald-700 border-emerald-300' },
  { value: 'connected_not_interested', label: 'Not Interested', color: 'bg-red-500/15 text-red-700 border-red-300' },
  { value: 'meeting_booked', label: 'Meeting Booked', color: 'bg-primary/15 text-primary border-primary/30' },
  { value: 'callback_requested', label: 'Callback', color: 'bg-amber-500/15 text-amber-700 border-amber-300' },
  { value: 'voicemail', label: 'Voicemail', color: 'bg-muted text-muted-foreground border-border' },
  { value: 'no_answer', label: 'No Answer', color: 'bg-muted text-muted-foreground border-border' },
  { value: 'gatekeeper', label: 'Gatekeeper', color: 'bg-orange-500/15 text-orange-700 border-orange-300' },
  { value: 'wrong_number', label: 'Wrong Number', color: 'bg-destructive/15 text-destructive border-destructive/30' },
] as const;

interface AutoDispositionBadgeProps {
  recordingId: string;
  className?: string;
}

export function AutoDispositionBadge({ recordingId, className }: AutoDispositionBadgeProps) {
  const [disposition, setDisposition] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isOverriding, setIsOverriding] = useState(false);

  useEffect(() => {
    if (!recordingId) return;

    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('call_recordings')
        .select('call_disposition, disposition_confidence')
        .eq('id', recordingId)
        .maybeSingle();

      if (data?.call_disposition) {
        setDisposition(data.call_disposition);
        setConfidence(data.disposition_confidence);
        clearInterval(poll);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [recordingId]);

  const handleOverride = async (newDisposition: string) => {
    setDisposition(newDisposition);
    setConfidence(100); // manual override = 100% confidence
    setIsOverriding(false);

    const { error } = await supabase
      .from('call_recordings')
      .update({ call_disposition: newDisposition, disposition_confidence: 100 })
      .eq('id', recordingId);

    if (error) {
      toast.error('Failed to update disposition');
    } else {
      toast.success('Disposition updated');
    }
  };

  if (!disposition) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground animate-pulse', className)}>
        <Bot className="h-3.5 w-3.5" />
        <span>Classifying outcome…</span>
      </div>
    );
  }

  const match = DISPOSITIONS.find(d => d.value === disposition);
  const label = match?.label || disposition;
  const colorClass = match?.color || 'bg-muted text-muted-foreground border-border';

  if (isOverriding) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={disposition} onValueChange={handleOverride}>
          <SelectTrigger className="h-7 text-xs w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISPOSITIONS.map(d => (
              <SelectItem key={d.value} value={d.value} className="text-xs">
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOverriding(true)}
      className={cn('flex items-center gap-1.5 group cursor-pointer', className)}
      title="Click to override disposition"
    >
      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
      <Badge variant="outline" className={cn('text-xs font-medium', colorClass)}>
        {label}
        {confidence != null && confidence < 100 && (
          <span className="ml-1 opacity-70">{confidence}%</span>
        )}
      </Badge>
      <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
