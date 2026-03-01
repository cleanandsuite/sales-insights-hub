import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoWidget } from './BentoWidget';
import { Phone, Star, Target, BarChart3, Lightbulb, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface BentoGridProps {
  kpis: { callsToday: number; callsWeek: number; avgScore: number };
  className?: string;
}

export function BentoGrid({ kpis, className }: BentoGridProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roiStats, setRoiStats] = useState({ avgWinProb: 0, suggestionsApplied: 0, totalSuggestions: 0, trend: 'stable' as string });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('coaching_sessions').select('win_probability, overall_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('coaching_metrics').select('was_applied').eq('user_id', user.id),
    ]).then(([sessionsRes, metricsRes]) => {
      const sessions = sessionsRes.data || [];
      const metrics = metricsRes.data || [];
      const avgWinProb = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + (s.win_probability || 0), 0) / sessions.length) : 0;
      setRoiStats({
        avgWinProb,
        suggestionsApplied: metrics.filter(m => m.was_applied).length,
        totalSuggestions: metrics.length,
        trend: sessions.length >= 2 && (sessions[0]?.overall_score || 0) > (sessions[1]?.overall_score || 0) ? 'up' : 'stable',
      });
    });
  }, [user]);

  const coachingTip = kpis.avgScore >= 70
    ? 'Focus on closing — your discovery is strong'
    : kpis.avgScore > 0
      ? 'Ask more open-ended questions early'
      : 'Make your first call to unlock tips';

  const adoptionRate = roiStats.totalSuggestions > 0 ? Math.round((roiStats.suggestionsApplied / roiStats.totalSuggestions) * 100) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        Quick Stats
      </h3>

      {/* Hero Metric — Calls Today */}
      <button
        onClick={() => navigate('/recordings')}
        className={cn(
          'w-full rounded-2xl p-5 text-left transition-all duration-300',
          'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
          'border border-primary/20 hover:border-primary/40 hover:shadow-md',
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Calls Today</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-extrabold text-foreground">{kpis.callsToday}</span>
              <span className="text-sm text-muted-foreground pb-1">{kpis.callsWeek} this week</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Phone className="h-6 w-6 text-primary" />
          </div>
        </div>
        {kpis.callsToday > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            Active today
          </div>
        )}
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Avg Score with visual indicator */}
        <BentoWidget
          label="Avg Score"
          value={kpis.avgScore > 0 ? kpis.avgScore : '—'}
          icon={Star}
          iconColor="text-warning"
          subtitle="Last 7 days"
          onClick={() => navigate('/analytics')}
        >
          {kpis.avgScore > 0 && (
            <div className="w-full bg-muted/50 rounded-full h-1.5 mt-1">
              <div
                className={cn('h-full rounded-full transition-all duration-500', 
                  kpis.avgScore >= 70 ? 'bg-success' : kpis.avgScore >= 40 ? 'bg-warning' : 'bg-destructive'
                )}
                style={{ width: `${kpis.avgScore}%` }}
              />
            </div>
          )}
        </BentoWidget>

        <BentoWidget
          label="Win Prob"
          value={roiStats.avgWinProb > 0 ? `${roiStats.avgWinProb}%` : '—'}
          icon={Target}
          iconColor="text-accent"
          subtitle="Coaching avg"
          onClick={() => navigate('/analytics')}
        />
        <BentoWidget
          label="Adoption"
          value={roiStats.totalSuggestions > 0 ? `${adoptionRate}%` : '—'}
          icon={CheckCircle2}
          iconColor="text-success"
          subtitle={`${roiStats.suggestionsApplied}/${roiStats.totalSuggestions} applied`}
          onClick={() => navigate('/analytics')}
        />

        {/* Pipeline — honest empty state */}
        <button
          onClick={() => navigate('/enterprise')}
          className={cn(
            'flex flex-col items-start gap-2 p-4 rounded-xl',
            'bg-card border border-dashed border-border/60',
            'hover:border-primary/30 hover:bg-primary/5',
            'transition-all duration-200 text-left w-full',
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-muted-foreground">Pipeline</span>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-muted/50 text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground leading-snug">
            Track your deals →
          </span>
        </button>
      </div>

      {/* AI Tip — visually distinct */}
      <button
        onClick={() => navigate('/coaching')}
        className={cn(
          'w-full rounded-xl p-4 text-left transition-all duration-200',
          'bg-accent/5 border border-accent/20',
          'hover:border-accent/40 hover:shadow-sm',
        )}
      >
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">AI Insight</span>
            <p className="text-sm font-medium text-foreground mt-0.5 leading-snug">{coachingTip}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </div>
      </button>
    </div>
  );
}
