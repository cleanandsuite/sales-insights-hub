import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Zap,
  Brain,
  Quote,
  Lightbulb
} from 'lucide-react';

interface PainPoint {
  type: 'follow_up' | 'closing' | 'prospecting' | 'objection_handling' | 'turnover' | 'talk_ratio' | 'pricing';
  severity: number;
  evidenceQuote: string;
  industryBenchmarkImpact: string;
  coachingFix: string;
  predictedWinRateLift: number;
}

interface PainAnalysisResult {
  pains: PainPoint[];
  overallHealthScore: number;
  priorityActions: string[];
}

interface PainDetectorPanelProps {
  recordingId: string;
  transcript: string;
  existingAnalysis?: PainAnalysisResult | null;
}

const PAIN_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  follow_up: { label: 'Follow-up', icon: <Target className="h-4 w-4" />, color: 'text-blue-500' },
  closing: { label: 'Closing', icon: <Zap className="h-4 w-4" />, color: 'text-orange-500' },
  prospecting: { label: 'Prospecting', icon: <MessageSquare className="h-4 w-4" />, color: 'text-purple-500' },
  objection_handling: { label: 'Objection Handling', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-500' },
  turnover: { label: 'Turnover', icon: <TrendingUp className="h-4 w-4" />, color: 'text-yellow-500' },
  talk_ratio: { label: 'Talk Ratio', icon: <MessageSquare className="h-4 w-4" />, color: 'text-cyan-500' },
  pricing: { label: 'Pricing', icon: <Target className="h-4 w-4" />, color: 'text-green-500' },
};

export function PainDetectorPanel({ recordingId, transcript, existingAnalysis }: PainDetectorPanelProps) {
  const [analysis, setAnalysis] = useState<PainAnalysisResult | null>(existingAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [expandedPains, setExpandedPains] = useState<Set<number>>(new Set());

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to analyze');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pain-detector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ recordingId, transcript }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
      toast.success('Pain analysis complete');
    } catch (error) {
      console.error('Pain analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePain = (index: number) => {
    const newSet = new Set(expandedPains);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedPains(newSet);
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 5) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  if (!analysis && !loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">AI Pain Detector</h3>
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
            Scan this call for common sales pains like weak closing, poor follow-up, and talk ratio issues. Get actionable coaching fixes with predicted win-rate lifts.
          </p>
          <Button onClick={runAnalysis} className="gap-2">
            <Zap className="h-4 w-4" />
            Run Pain Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Analyzing call for sales pains...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Pain Detector
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Health Score:</span>
            <Badge variant={analysis.overallHealthScore >= 70 ? 'default' : analysis.overallHealthScore >= 50 ? 'secondary' : 'destructive'}>
              {analysis.overallHealthScore}/100
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority Actions */}
        {analysis.priorityActions.length > 0 && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Priority Actions
            </h4>
            <ul className="space-y-1">
              {analysis.priorityActions.map((action, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pain Points */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Detected Pains ({analysis.pains.length})</h4>
          
          {analysis.pains.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              ✓ No significant sales pains detected in this call
            </p>
          ) : (
            analysis.pains.map((pain, index) => {
              const config = PAIN_LABELS[pain.type] || { label: pain.type, icon: <AlertTriangle className="h-4 w-4" />, color: 'text-muted-foreground' };
              const isExpanded = expandedPains.has(index);

              return (
                <Collapsible key={index} open={isExpanded} onOpenChange={() => togglePain(index)}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={config.color}>{config.icon}</div>
                        <div>
                          <span className="font-medium text-sm">{config.label}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-16 rounded-full bg-muted overflow-hidden`}>
                              <div 
                                className={`h-full ${getSeverityColor(pain.severity)}`}
                                style={{ width: `${pain.severity * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">Severity: {pain.severity}/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          +{pain.predictedWinRateLift}% win rate if fixed
                        </Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 ml-7 p-4 rounded-lg bg-muted/30 space-y-3">
                      {/* Evidence Quote */}
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <Quote className="h-3 w-3" /> Evidence
                        </h5>
                        <p className="text-sm italic border-l-2 border-primary/50 pl-3 text-muted-foreground">
                          "{pain.evidenceQuote}"
                        </p>
                      </div>

                      {/* Industry Benchmark */}
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Industry Benchmark Impact
                        </h5>
                        <p className="text-sm text-muted-foreground">{pain.industryBenchmarkImpact}</p>
                      </div>

                      {/* Coaching Fix */}
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                        <h5 className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" /> Coaching Fix
                        </h5>
                        <p className="text-sm">{pain.coachingFix}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>

        {/* Re-analyze button */}
        <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loading} className="w-full">
          Re-analyze Call
        </Button>
      </CardContent>
    </Card>
  );
}
