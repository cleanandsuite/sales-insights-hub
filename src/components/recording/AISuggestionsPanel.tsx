import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';

export interface AISuggestion {
  type: 'tip' | 'warning' | 'opportunity';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keyTopics: string[];
  isAnalyzing: boolean;
}

export function AISuggestionsPanel({ 
  suggestions, 
  sentiment, 
  keyTopics,
  isAnalyzing 
}: AISuggestionsPanelProps) {
  const getIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'tip': return Lightbulb;
      case 'warning': return AlertTriangle;
      case 'opportunity': return TrendingUp;
    }
  };

  const getColors = (type: AISuggestion['type']) => {
    switch (type) {
      case 'tip': return 'bg-primary/10 border-primary/30 text-primary';
      case 'warning': return 'bg-warning/10 border-warning/30 text-warning';
      case 'opportunity': return 'bg-success/10 border-success/30 text-success';
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-80 flex flex-col rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">AI Coach</h3>
        {isAnalyzing && (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        )}
      </div>
      
      {/* Sentiment indicator */}
      <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Call Sentiment</span>
        <span className={`text-sm font-medium capitalize ${getSentimentColor()}`}>
          {sentiment}
        </span>
      </div>

      {/* Key topics */}
      {keyTopics.length > 0 && (
        <div className="px-4 py-2 border-b border-border/30">
          <div className="flex flex-wrap gap-1">
            {keyTopics.slice(0, 4).map((topic, i) => (
              <span 
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>AI suggestions will appear here based on the conversation...</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const Icon = getIcon(suggestion.type);
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getColors(suggestion.type)} animate-fade-in`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{suggestion.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
