import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface Marker {
  id: string;
  type: string;
  content: string;
  timestampSeconds: number | null;
  color: string;
}

interface Coaching {
  strengths: string[];
  improvements: string[];
  tips: string[];
}

interface DealIntelligence {
  sentiment: 'positive' | 'neutral' | 'negative';
  winProbability: number;
  suggestedStage: string;
  riskFactors: string[];
  nextSteps: string[];
  budgetMentioned: number | null;
  decisionTimeline: string | null;
}

interface AIInsightsSidebarProps {
  markers: Marker[];
  coaching?: Coaching;
  dealIntelligence?: DealIntelligence;
  summary?: string;
  onMarkerClick?: (marker: Marker) => void;
}

export function AIInsightsSidebar({
  markers,
  coaching,
  dealIntelligence,
  summary,
  onMarkerClick
}: AIInsightsSidebarProps) {
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'buying_signal':
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'objection':
      case 'negative':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'key_moment':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'question':
        return <MessageCircle className="h-4 w-4 text-warning" />;
      default:
        return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Summary */}
        {summary && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Call Summary
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Deal Intelligence */}
        {dealIntelligence && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Deal Intelligence</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Win Probability</p>
                <p className="text-2xl font-bold text-primary">
                  {dealIntelligence.winProbability}%
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Sentiment</p>
                <p className={`text-lg font-semibold capitalize ${getSentimentColor(dealIntelligence.sentiment)}`}>
                  {dealIntelligence.sentiment}
                </p>
              </div>
            </div>

            {dealIntelligence.suggestedStage && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground">Suggested Stage</p>
                <p className="text-sm font-medium text-foreground">{dealIntelligence.suggestedStage}</p>
              </div>
            )}

            {dealIntelligence.decisionTimeline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Timeline:</span>
                <span className="text-foreground">{dealIntelligence.decisionTimeline}</span>
              </div>
            )}

            {dealIntelligence.budgetMentioned && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Budget:</span>
                <span className="text-foreground font-medium">
                  ${dealIntelligence.budgetMentioned.toLocaleString()}
                </span>
              </div>
            )}

            {dealIntelligence.riskFactors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-destructive">Risk Factors</p>
                <ul className="space-y-1">
                  {dealIntelligence.riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dealIntelligence.nextSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-success">Recommended Next Steps</p>
                <ul className="space-y-1">
                  {dealIntelligence.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-success mt-0.5 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Coaching Insights */}
        {coaching && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Coaching Insights</h3>
            
            {coaching.strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-success flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  What Went Well
                </p>
                <ul className="space-y-1">
                  {coaching.strengths.map((strength, i) => (
                    <li key={i} className="text-xs text-muted-foreground pl-5">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.improvements.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-warning flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Areas to Improve
                </p>
                <ul className="space-y-1">
                  {coaching.improvements.map((improvement, i) => (
                    <li key={i} className="text-xs text-muted-foreground pl-5">• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.tips.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Tips
                </p>
                <ul className="space-y-1">
                  {coaching.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground pl-5">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Timeline Markers */}
        {markers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Key Moments</h3>
            <div className="space-y-2">
              {markers.slice(0, 10).map((marker) => (
                <Button
                  key={marker.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => onMarkerClick?.(marker)}
                >
                  <div className="flex items-start gap-3 w-full">
                    {getMarkerIcon(marker.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium capitalize text-foreground">
                        {marker.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {marker.content}
                      </p>
                    </div>
                    {marker.timestampSeconds !== null && (
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        {formatTime(marker.timestampSeconds)}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}