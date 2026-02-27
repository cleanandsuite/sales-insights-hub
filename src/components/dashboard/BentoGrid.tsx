import { useNavigate } from 'react-router-dom';
import { BentoWidget } from './BentoWidget';
import { Phone, Star, DollarSign, Target, BarChart3, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  kpis: { callsToday: number; callsWeek: number; avgScore: number };
  className?: string;
}

export function BentoGrid({ kpis, className }: BentoGridProps) {
  const navigate = useNavigate();

  const coachingTip = kpis.avgScore >= 70
    ? 'Focus on closing — your discovery is strong'
    : kpis.avgScore > 0
      ? 'Ask more open-ended questions early'
      : 'Make your first call to unlock tips';

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
          onClick={() => navigate('/recordings')}
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
          label="Revenue"
          value="$301K"
          icon={DollarSign}
          iconColor="text-success"
          subtitle="60% of goal"
          onClick={() => navigate('/enterprise')}
        />
        <BentoWidget
          label="Win Rate"
          value="68%"
          icon={Target}
          iconColor="text-accent"
          subtitle="24W / 11L"
          onClick={() => navigate('/enterprise')}
        />
        <BentoWidget
          label="Pipeline"
          value="$2.1M"
          icon={BarChart3}
          iconColor="text-primary"
          subtitle="47 open deals"
          onClick={() => navigate('/enterprise')}
        />
        <BentoWidget
          label="AI Tip"
          value=""
          icon={Lightbulb}
          iconColor="text-accent"
          onClick={() => navigate('/coaching')}
        >
          <span className="text-xs text-foreground font-medium leading-snug -mt-2">
            {coachingTip}
          </span>
        </BentoWidget>
      </div>
    </div>
  );
}
