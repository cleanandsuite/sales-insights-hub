import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, AlertCircle } from 'lucide-react';

interface TranscriptionPanelProps {
  transcription: string;
  isProcessing: boolean;
  status?: 'idle' | 'processing' | 'rate-limited' | 'error';
  retryCountdown?: number;
}

export function TranscriptionPanel({ 
  transcription, 
  isProcessing,
  status = 'idle',
  retryCountdown = 0
}: TranscriptionPanelProps) {
  return (
    <div className="flex-1 flex flex-col rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Live Transcription</h3>
        <div className="flex items-center gap-2 text-sm">
          {isProcessing && status === 'processing' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          )}
          {status === 'rate-limited' && (
            <div className="flex items-center gap-2 text-amber-500">
              <Clock className="h-4 w-4" />
              Resuming in {retryCountdown}s
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Error
            </div>
          )}
        </div>
      </div>
      
      {status === 'rate-limited' && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Rate limit reached. Recording continues, transcription will resume shortly.
          </p>
        </div>
      )}
      
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
