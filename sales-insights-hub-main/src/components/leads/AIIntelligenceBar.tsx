import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentPoint {
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

interface AIIntelligenceBarProps {
  aiConfidence: number | null;
  sentimentTrend: SentimentPoint[];
  objectionPatterns: string[];
  riskLevel: string;
}

export const AIIntelligenceBar = ({
  aiConfidence,
  sentimentTrend,
  objectionPatterns,
  riskLevel
}: AIIntelligenceBarProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    if (confidence >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSentimentIcon = () => {
    if (!sentimentTrend || sentimentTrend.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    const recent = sentimentTrend[sentimentTrend.length - 1];
    const previous = sentimentTrend[sentimentTrend.length - 2];
    
    if (recent.score > previous.score) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (recent.score < previous.score) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getCurrentSentiment = () => {
    if (!sentimentTrend || sentimentTrend.length === 0) return 'unknown';
    return sentimentTrend[sentimentTrend.length - 1]?.sentiment || 'unknown';
  };

  const confidence = aiConfidence ?? 0;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
        {/* AI Confidence Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Brain className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium truncate">AI Confidence</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Progress value={confidence} className="w-20 h-2" />
            <span className={`text-sm font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}%
            </span>
          </div>
        </div>

        {/* Sentiment & Risk Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {getSentimentIcon()}
            <span className="text-xs text-muted-foreground capitalize">
              {getCurrentSentiment()} sentiment
            </span>
          </div>
          
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={getRiskBadgeVariant(riskLevel)} className="text-xs">
                {riskLevel === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {riskLevel} risk
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI-assessed deal risk level</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Objection Patterns */}
        {objectionPatterns && objectionPatterns.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Objections:</span>
            {objectionPatterns.slice(0, 3).map((objection, i) => (
              <Badge key={i} variant="outline" className="text-xs py-0">
                {objection}
              </Badge>
            ))}
            {objectionPatterns.length > 3 && (
              <Badge variant="outline" className="text-xs py-0">
                +{objectionPatterns.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
