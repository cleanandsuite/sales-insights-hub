import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Target, 
  AlertCircle, 
  TrendingUp,
  ArrowRight,
  Quote,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LiveSummary {
  mainTopic: string;
  customerNeeds: string[];
  objections: string[];
  buyingSignals: string[];
  currentStage: 'discovery' | 'presentation' | 'negotiation' | 'closing' | 'unclear';
  nextStep: string;
  urgency: 'high' | 'medium' | 'low';
  keyQuote: string;
}

interface LiveSummaryPanelProps {
  transcript: string;
  isRecording: boolean;
  isPaused: boolean;
}

const STAGE_COLORS = {
  discovery: 'bg-blue-500',
  presentation: 'bg-purple-500',
  negotiation: 'bg-amber-500',
  closing: 'bg-emerald-500',
  unclear: 'bg-muted',
};

const URGENCY_COLORS = {
  high: 'text-red-500 border-red-500',
  medium: 'text-amber-500 border-amber-500',
  low: 'text-muted-foreground border-muted',
};

export function LiveSummaryPanel({ 
  transcript, 
  isRecording, 
  isPaused 
}: LiveSummaryPanelProps) {
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastAnalyzedRef = useRef<string>('');
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeSummary = useCallback(async () => {
    if (!transcript || transcript.length < 50 || isPaused || !isRecording) return;
    if (transcript === lastAnalyzedRef.current) return;
    
    lastAnalyzedRef.current = transcript;
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('live-summary', {
        body: { transcript }
      });

      if (fnError) {
        console.error('Summary error:', fnError);
        if (fnError.message?.includes('429')) {
          setError('Rate limited - summary paused');
        }
        return;
      }

      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Summary analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, isRecording, isPaused]);

  // Trigger analysis when transcript changes (debounced 3s for summary)
  useEffect(() => {
    if (!isRecording || isPaused || !transcript || transcript.length < 50) return;
    if (transcript === lastAnalyzedRef.current) return;

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Debounce: analyze 3 seconds after transcript stops updating
    analysisTimeoutRef.current = setTimeout(() => {
      analyzeSummary();
    }, 3000);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [transcript, isRecording, isPaused, analyzeSummary]);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Live Summary</h3>
            {isAnalyzing && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
          {summary && (
            <Badge 
              variant="outline" 
              className={cn("capitalize", URGENCY_COLORS[summary.urgency])}
            >
              {summary.urgency} urgency
            </Badge>
          )}
        </div>
        
        {/* Current Stage */}
        {summary && (
          <div className="mt-2">
            <Badge className={cn("capitalize text-white", STAGE_COLORS[summary.currentStage])}>
              {summary.currentStage} stage
            </Badge>
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-xs text-destructive">{error}</div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {!summary ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Summary will appear as the conversation develops...</p>
            <p className="text-xs mt-1">Keep talking for AI insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main Topic */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Main Topic
              </h4>
              <p className="text-sm font-medium">{summary.mainTopic}</p>
            </div>

            {/* Key Quote */}
            {summary.keyQuote && (
              <div className="bg-primary/5 border-l-2 border-primary p-3 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm italic">"{summary.keyQuote}"</p>
                </div>
              </div>
            )}

            {/* Customer Needs */}
            {summary.customerNeeds.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Customer Needs
                </h4>
                <ul className="space-y-1">
                  {summary.customerNeeds.map((need, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {need}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Objections */}
            {summary.objections.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  Objections
                </h4>
                <ul className="space-y-1">
                  {summary.objections.map((obj, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-amber-600 dark:text-amber-400">
                      <span>⚠</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buying Signals */}
            {summary.buyingSignals.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Buying Signals
                </h4>
                <ul className="space-y-1">
                  {summary.buyingSignals.map((signal, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-emerald-600 dark:text-emerald-400">
                      <span>✓</span>
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Step */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <h4 className="text-xs font-medium text-primary uppercase tracking-wide mb-1 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Suggested Next Step
              </h4>
              <p className="text-sm font-medium">{summary.nextStep}</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
