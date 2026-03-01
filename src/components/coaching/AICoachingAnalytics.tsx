import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Trophy, 
  AlertTriangle,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Bot,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useDemoMode } from "@/hooks/useDemoMode";
import { demoROIMetrics, demoTopSuggestions, demoRiskAlerts } from "@/data/demoData";

interface CoachingMetric {
  id: string;
  suggestion_type: string;
  suggestion_text: string;
  was_applied: boolean;
  outcome_positive: boolean | null;
  deal_value_impact: number | null;
  created_at: string;
}

interface ROIMetrics {
  aiAssistedWinRate: number;
  nonAiWinRate: number;
  avgVelocityWithAi: number;
  avgVelocityWithoutAi: number;
  avgDealSizeWithAi: number;
  avgDealSizeWithoutAi: number;
  totalSuggestions: number;
  appliedSuggestions: number;
  positiveOutcomes: number;
}

interface TopSuggestion {
  text: string;
  effectiveness: number;
  applied: number;
  positive: number;
}

export const AICoachingAnalytics = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ROIMetrics>({
    aiAssistedWinRate: 0,
    nonAiWinRate: 0,
    avgVelocityWithAi: 0,
    avgVelocityWithoutAi: 0,
    avgDealSizeWithAi: 0,
    avgDealSizeWithoutAi: 0,
    totalSuggestions: 0,
    appliedSuggestions: 0,
    positiveOutcomes: 0
  });
  const [topSuggestions, setTopSuggestions] = useState<TopSuggestion[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      // Fetch leads with outcomes for ROI calculation
      const { data: leads } = await supabase
        .from('leads')
        .select('ai_assisted, outcome, actual_deal_value, deal_velocity_days')
        .eq('user_id', user.id)
        .not('outcome', 'is', null);

      // Fetch coaching metrics
      const { data: coachingData } = await supabase
        .from('ai_coaching_metrics')
        .select('*')
        .eq('user_id', user.id);

      // Fetch high-risk leads
      const { data: highRiskLeads } = await supabase
        .from('leads')
        .select('id, contact_name, company, risk_level, predicted_close_date, ai_confidence')
        .eq('user_id', user.id)
        .in('risk_level', ['high', 'critical'])
        .order('ai_confidence', { ascending: true })
        .limit(5);

      if (leads) {
        const aiAssistedLeads = leads.filter(l => l.ai_assisted);
        const nonAiLeads = leads.filter(l => !l.ai_assisted);

        const aiWins = aiAssistedLeads.filter(l => l.outcome === 'won').length;
        const nonAiWins = nonAiLeads.filter(l => l.outcome === 'won').length;

        const aiVelocity = aiAssistedLeads
          .filter(l => l.deal_velocity_days)
          .reduce((acc, l) => acc + (l.deal_velocity_days || 0), 0) / 
          (aiAssistedLeads.filter(l => l.deal_velocity_days).length || 1);

        const nonAiVelocity = nonAiLeads
          .filter(l => l.deal_velocity_days)
          .reduce((acc, l) => acc + (l.deal_velocity_days || 0), 0) / 
          (nonAiLeads.filter(l => l.deal_velocity_days).length || 1);

        const aiDealSize = aiAssistedLeads
          .filter(l => l.actual_deal_value)
          .reduce((acc, l) => acc + Number(l.actual_deal_value || 0), 0) / 
          (aiAssistedLeads.filter(l => l.actual_deal_value).length || 1);

        const nonAiDealSize = nonAiLeads
          .filter(l => l.actual_deal_value)
          .reduce((acc, l) => acc + Number(l.actual_deal_value || 0), 0) / 
          (nonAiLeads.filter(l => l.actual_deal_value).length || 1);

        setMetrics({
          aiAssistedWinRate: aiAssistedLeads.length > 0 
            ? Math.round((aiWins / aiAssistedLeads.length) * 100) 
            : 0,
          nonAiWinRate: nonAiLeads.length > 0 
            ? Math.round((nonAiWins / nonAiLeads.length) * 100) 
            : 0,
          avgVelocityWithAi: Math.round(aiVelocity) || 0,
          avgVelocityWithoutAi: Math.round(nonAiVelocity) || 0,
          avgDealSizeWithAi: Math.round(aiDealSize) || 0,
          avgDealSizeWithoutAi: Math.round(nonAiDealSize) || 0,
          totalSuggestions: coachingData?.length || 0,
          appliedSuggestions: coachingData?.filter(c => c.was_applied).length || 0,
          positiveOutcomes: coachingData?.filter(c => c.outcome_positive).length || 0
        });
      }

      // Calculate top performing suggestions
      if (coachingData && coachingData.length > 0) {
        const suggestionGroups = coachingData.reduce((acc: any, item) => {
          const key = item.suggestion_type;
          if (!acc[key]) {
            acc[key] = { text: item.suggestion_type, applied: 0, positive: 0, total: 0 };
          }
          acc[key].total++;
          if (item.was_applied) acc[key].applied++;
          if (item.outcome_positive) acc[key].positive++;
          return acc;
        }, {});

        const topList = Object.values(suggestionGroups)
          .map((s: any) => ({
            text: s.text,
            applied: s.applied,
            positive: s.positive,
            effectiveness: s.applied > 0 ? Math.round((s.positive / s.applied) * 100) : 0
          }))
          .sort((a: any, b: any) => b.effectiveness - a.effectiveness)
          .slice(0, 5);

        setTopSuggestions(topList as TopSuggestion[]);
      }

      setRiskAlerts(highRiskLeads || []);

    } catch (error) {
      console.error('Failed to fetch coaching analytics:', error);
      toast.error('Failed to load coaching analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setMetrics(demoROIMetrics);
      setTopSuggestions(demoTopSuggestions);
      setRiskAlerts(demoRiskAlerts);
      setIsLoading(false);
      return;
    }
    fetchAnalytics();
  }, [user?.id, isDemoMode]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const winRateDiff = metrics.aiAssistedWinRate - metrics.nonAiWinRate;
  const velocityDiff = metrics.avgVelocityWithoutAi - metrics.avgVelocityWithAi;
  const dealSizeDiff = metrics.avgDealSizeWithAi - metrics.avgDealSizeWithoutAi;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Coaching ROI</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAnalytics}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">AI-Coached Win Rate</span>
              </div>
              {winRateDiff > 0 && (
                <Badge variant="secondary" className="text-green-600 bg-green-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{winRateDiff}%
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold">{metrics.aiAssistedWinRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {metrics.nonAiWinRate}% without AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Avg Deal Velocity</span>
              </div>
              {velocityDiff > 0 && (
                <Badge variant="secondary" className="text-green-600 bg-green-100">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -{velocityDiff} days
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold">{metrics.avgVelocityWithAi} days</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {metrics.avgVelocityWithoutAi} days without AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Avg Deal Size</span>
              </div>
              {dealSizeDiff > 0 && (
                <Badge variant="secondary" className="text-green-600 bg-green-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{formatCurrency(dealSizeDiff)}
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(metrics.avgDealSizeWithAi)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(metrics.avgDealSizeWithoutAi)} without AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coaching Effectiveness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Coaching Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suggestions Given</span>
                <span className="font-medium">{metrics.totalSuggestions}</span>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Applied Rate</span>
                  <span className="font-medium">
                    {metrics.totalSuggestions > 0 
                      ? Math.round((metrics.appliedSuggestions / metrics.totalSuggestions) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={metrics.totalSuggestions > 0 
                    ? (metrics.appliedSuggestions / metrics.totalSuggestions) * 100 
                    : 0} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {metrics.appliedSuggestions > 0 
                      ? Math.round((metrics.positiveOutcomes / metrics.appliedSuggestions) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={metrics.appliedSuggestions > 0 
                    ? (metrics.positiveOutcomes / metrics.appliedSuggestions) * 100 
                    : 0} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Top Suggestions */}
            {topSuggestions.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Top Performing Suggestions</h4>
                <div className="space-y-2">
                  {topSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm truncate max-w-[200px]">{suggestion.text}</span>
                      </div>
                      <Badge variant={suggestion.effectiveness >= 70 ? 'default' : 'secondary'}>
                        {suggestion.effectiveness}% effective
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              AI Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                <p>No high-risk deals detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskAlerts.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{lead.contact_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="destructive"
                        className="capitalize"
                      >
                        {lead.risk_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {lead.ai_confidence}% conf
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
