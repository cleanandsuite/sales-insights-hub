import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface TranscriptionPanelProps {
  transcription: string;
  isProcessing: boolean;
}

export function TranscriptionPanel({ transcription, isProcessing }: TranscriptionPanelProps) {
  return (
    <div className="flex-1 flex flex-col rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Live Transcription</h3>
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        {transcription ? (
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {transcription}
          </p>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Transcription will appear here as you speak...</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
