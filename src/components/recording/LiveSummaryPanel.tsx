import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  FileText, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LiveSummaryPanelProps {
  transcription: string;
  isRecording: boolean;
  isPaused: boolean;
}

interface SummaryData {
  mainTopic: string;
  keyPoints: string[];
  customerNeeds: string[];
  objections: string[];
  nextSteps: string[];
  budgetMentioned: string | null;
  timelineMentioned: string | null;
  decisionMakers: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementLevel: 'high' | 'medium' | 'low';
}

export function LiveSummaryPanel({ 
  transcription, 
  isRecording,
  isPaused
}: LiveSummaryPanelProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastProcessedRef = useRef<string>('');
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateSummary = useCallback(async () => {
    if (!transcription || transcription.length < 50 || isPaused || !isRecording) return;
    if (transcription === lastProcessedRef.current) return;
    
    lastProcessedRef.current = transcription;
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('live-summary', {
        body: { transcription }
      });

      if (fnError) {
        console.error('Summary error:', fnError);
        if (fnError.message?.includes('429')) {
          setError('Rate limited - summary paused briefly');
        }
        return;
      }

      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.error('Summary generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [transcription, isRecording, isPaused]);

  // Run summary generation every 10 seconds
  useEffect(() => {
    if (!isRecording || isPaused) return;

    // Initial generation
    const initialTimeout = setTimeout(generateSummary, 3000);
    
    // Regular interval
    analysisIntervalRef.current = setInterval(generateSummary, 10000);

    return () => {
      clearTimeout(initialTimeout);
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isRecording, isPaused, generateSummary]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-500 bg-emerald-500/10';
      case 'negative': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-emerald-500';
      case 'low': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Live Call Summary</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </div>
          )}
          {error && (
            <span className="text-xs text-amber-500">{error}</span>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {!summary && !transcription ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Call summary will appear here...</p>
            <p className="text-xs mt-1">Key points extracted in real-time</p>
          </div>
        ) : !summary ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="h-8 w-8 mb-2 animate-spin opacity-50" />
            <p className="text-sm">Building summary...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={cn("gap-1", getSentimentColor(summary.sentiment))}>
                {summary.sentiment === 'positive' ? '😊' : summary.sentiment === 'negative' ? '😟' : '😐'}
                {summary.sentiment} tone
              </Badge>
              <Badge variant="outline" className={cn("gap-1", getEngagementColor(summary.engagementLevel))}>
                <TrendingUp className="h-3 w-3" />
                {summary.engagementLevel} engagement
              </Badge>
            </div>

            {/* Main Topic */}
            {summary.mainTopic && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                  <MessageSquare className="h-4 w-4" />
                  Main Topic
                </div>
                <p className="text-foreground">{summary.mainTopic}</p>
              </div>
            )}

            {/* Key Points */}
            {summary.keyPoints.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Key Points
                </div>
                <ul className="space-y-1">
                  {summary.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer Needs */}
            {summary.customerNeeds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Customer Needs
                </div>
                <ul className="space-y-1">
                  {summary.customerNeeds.map((need, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-6">
                      • {need}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Objections */}
            {summary.objections.length > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Objections Raised
                </div>
                <ul className="space-y-1">
                  {summary.objections.map((objection, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      ⚠️ {objection}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Budget & Timeline */}
            <div className="grid grid-cols-2 gap-3">
              {summary.budgetMentioned && (
                <div className="p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    Budget
                  </div>
                  <p className="text-sm font-medium text-foreground">{summary.budgetMentioned}</p>
                </div>
              )}
              {summary.timelineMentioned && (
                <div className="p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    Timeline
                  </div>
                  <p className="text-sm font-medium text-foreground">{summary.timelineMentioned}</p>
                </div>
              )}
            </div>

            {/* Decision Makers */}
            {summary.decisionMakers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Decision Makers Mentioned
                </div>
                <div className="flex flex-wrap gap-1">
                  {summary.decisionMakers.map((dm, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {dm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {summary.nextSteps.length > 0 && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Agreed Next Steps
                </div>
                <ul className="space-y-1">
                  {summary.nextSteps.map((step, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      → {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
