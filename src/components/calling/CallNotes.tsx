import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { StickyNote, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallNotesProps {
  recordingId?: string;
  className?: string;
}

export function CallNotes({ recordingId, className }: CallNotesProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save after 2 seconds of no typing
  const [debouncedNotes, setDebouncedNotes] = useState(notes);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNotes(notes);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notes]);

  useEffect(() => {
    if (debouncedNotes && recordingId && debouncedNotes !== notes) {
      handleSave();
    }
  }, [debouncedNotes, recordingId]);

  const handleSave = useCallback(async () => {
    if (!recordingId || !notes.trim()) return;

    setIsSaving(true);
    try {
      // Update the recording's summary field with notes
      const { error } = await supabase
        .from('call_recordings')
        .update({ 
          summary: notes.trim()
        })
        .eq('id', recordingId);

      if (error) throw error;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save notes',
      });
    } finally {
      setIsSaving(false);
    }
  }, [recordingId, notes, toast]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('border-t bg-muted/30', className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-between px-4 py-2 h-auto"
        >
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            <span className="text-sm font-medium">Call Notes</span>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Take notes during the call... (auto-saves)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {notes.length} characters
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || !notes.trim()}
              className="gap-1"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
