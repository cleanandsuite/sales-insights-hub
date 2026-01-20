import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  MessageSquare, 
  Target, 
  Heart,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CoachingSuggestion {
  id: string;
  type: 'objection' | 'opportunity' | 'question' | 'close' | 'rapport' | 'warning';
  urgency: 'high' | 'medium' | 'low';
  message: string;
  script?: string;
  timestamp: Date;
}

interface LiveCoachingSidebarProps {
  transcript: string;
  coachStyle: 'cardone' | 'belfort' | 'neutral';
  isRecording: boolean;
  isPaused: boolean;
  onSuggestionFeedback?: (suggestionId: string, helpful: boolean) => void;
}

const TYPE_ICONS = {
  objection: AlertTriangle,
  opportunity: Lightbulb,
  question: MessageSquare,
  close: Target,
  rapport: Heart,
  warning: Zap,
};

const TYPE_COLORS = {
  objection: 'text-amber-500',
  opportunity: 'text-emerald-500',
  question: 'text-blue-500',
  close: 'text-purple-500',
  rapport: 'text-pink-500',
  warning: 'text-red-500',
};

const URGENCY_STYLES = {
  high: 'border-l-4 border-l-red-500 bg-red-500/5',
  medium: 'border-l-4 border-l-amber-500 bg-amber-500/5',
  low: 'border-l-2 border-l-muted',
};

const STYLE_LABELS = {
  cardone: { name: '10X Momentum', icon: '🔥', color: 'bg-orange-500' },
  belfort: { name: 'Straight Line', icon: '🎯', color: 'bg-blue-500' },
  neutral: { name: 'Balanced', icon: '⚖️', color: 'bg-muted' },
};

export function LiveCoachingSidebar({ 
  transcript, 
  coachStyle, 
  isRecording, 
  isPaused,
  onSuggestionFeedback 
}: LiveCoachingSidebarProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<CoachingSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [keyMoment, setKeyMoment] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastAnalyzedRef = useRef<string>('');
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSuggestionsRef = useRef<string[]>([]);

  // Analyze transcript for coaching suggestions
  const analyzeForCoaching = useCallback(async () => {
    if (!transcript || transcript.length < 30 || isPaused || !isRecording) return;
    if (transcript === lastAnalyzedRef.current) return;
    
    lastAnalyzedRef.current = transcript;
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('live-coach', {
        body: { 
          transcript, 
          coachStyle,
          previousSuggestions: previousSuggestionsRef.current
        }
      });

      if (fnError) {
        console.error('Coaching error:', fnError);
        if (fnError.message?.includes('429')) {
          setError('Rate limited - suggestions paused');
        }
        return;
      }

      if (data?.suggestions && data.suggestions.length > 0) {
        const newSuggestions: CoachingSuggestion[] = data.suggestions.map((s: any) => ({
          ...s,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }));

        setSuggestions(prev => [...newSuggestions, ...prev].slice(0, 15));
        
        // Track for deduplication
        previousSuggestionsRef.current = [
          ...previousSuggestionsRef.current,
          ...newSuggestions.map(s => s.message)
        ].slice(-10);

        // Show high-urgency suggestions as toast if not muted
        if (!isMuted) {
          const highUrgency = newSuggestions.find(s => s.urgency === 'high');
          if (highUrgency) {
            toast({
              title: `🚨 ${highUrgency.type.toUpperCase()}`,
              description: highUrgency.message,
              duration: 5000,
            });
          }
        }
      }

      if (data?.sentiment) setSentiment(data.sentiment);
      if (data?.keyMoment) setKeyMoment(data.keyMoment);

    } catch (err) {
      console.error('Coaching analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, coachStyle, isRecording, isPaused, isMuted, toast]);

  // Trigger analysis immediately when transcript changes (debounced 2s)
  useEffect(() => {
    if (!isRecording || isPaused || !transcript || transcript.length < 30) return;
    if (transcript === lastAnalyzedRef.current) return;

    // Clear any pending analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Debounce: analyze 2 seconds after transcript stops updating
    analysisTimeoutRef.current = setTimeout(() => {
      analyzeForCoaching();
    }, 2000);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [transcript, isRecording, isPaused, analyzeForCoaching]);

  const handleFeedback = (suggestionId: string, helpful: boolean) => {
    onSuggestionFeedback?.(suggestionId, helpful);
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, rated: true } as any : s)
    );
  };

  const styleInfo = STYLE_LABELS[coachStyle];

  return (
    <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Live AI Coach</h3>
            {isAnalyzing && (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Coach Style Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("gap-1", styleInfo.color, "text-white")}>
            <span>{styleInfo.icon}</span>
            {styleInfo.name} Style
          </Badge>
          
          {/* Sentiment indicator */}
          <Badge 
            variant="outline" 
            className={cn(
              sentiment === 'positive' && 'border-emerald-500 text-emerald-500',
              sentiment === 'negative' && 'border-red-500 text-red-500',
              sentiment === 'neutral' && 'border-muted-foreground'
            )}
          >
            {sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😟' : '😐'} 
            {sentiment}
          </Badge>
        </div>

        {/* Key Moment Alert */}
        {keyMoment && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-sm">
            <span className="font-medium text-primary">⚡ Key Moment:</span>
            <span className="ml-1 text-foreground">{keyMoment}</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-destructive">{error}</div>
        )}
      </div>

      {/* Suggestions List */}
      <ScrollArea className="flex-1 p-4">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <Brain className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Listening for coaching opportunities...</p>
            <p className="text-xs mt-1">Suggestions appear in real-time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const Icon = TYPE_ICONS[suggestion.type] || Lightbulb;
              const iconColor = TYPE_COLORS[suggestion.type] || 'text-muted-foreground';
              const urgencyStyle = URGENCY_STYLES[suggestion.urgency] || '';

              return (
                <div
                  key={suggestion.id}
                  className={cn(
                    "rounded-lg p-3 space-y-2 animate-fade-in bg-card",
                    urgencyStyle
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", iconColor)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {suggestion.type}
                        </Badge>
                        {suggestion.urgency === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Act Now
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{suggestion.message}</p>
                      
                      {suggestion.script && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm italic border-l-2 border-primary">
                          "{suggestion.script}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {suggestion.timestamp.toLocaleTimeString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleFeedback(suggestion.id, true)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleFeedback(suggestion.id, false)}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
