import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoWidget } from './BentoWidget';
import { Phone, Star, DollarSign, Target, BarChart3, Lightbulb, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      <div className="grid grid-cols-2 gap-2.5">
        <BentoWidget
          label="Calls Today"
          value={kpis.callsToday}
          icon={Phone}
          iconColor="text-primary"
          subtitle={`${kpis.callsWeek} this week`}
          onClick={() => navigate('/dashboard')}
        />
        <BentoWidget
          label="Avg Score"
          value={kpis.avgScore > 0 ? kpis.avgScore : '—'}
          icon={Star}
          iconColor="text-warning"
          subtitle="Last 7 days"
          onClick={() => navigate('/analytics')}
        />
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
        <BentoWidget
          label="Pipeline"
          value="—"
          icon={BarChart3}
          iconColor="text-primary"
          subtitle="View deals →"
          onClick={() => navigate('/enterprise')}
        />
        <BentoWidget
          label="AI Tip"
          value=""
          icon={Lightbulb}
          iconColor="text-accent"
          onClick={() => navigate('/analytics')}
        >
          <span className="text-xs text-foreground font-medium leading-snug -mt-2">
            {coachingTip}
          </span>
        </BentoWidget>
      </div>
    </div>
  );
}
