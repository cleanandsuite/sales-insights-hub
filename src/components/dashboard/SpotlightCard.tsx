import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, AlertTriangle, Lightbulb, ChevronLeft, ChevronRight, 
  Clock, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockPriorityDeals } from '@/data/dashboardMockData';

interface SpotlightCardProps {
  onStartCall: () => void;
  onNavigate: (path: string) => void;
  avgScore: number;
  className?: string;
}

interface SpotlightSlide {
  type: 'call' | 'deal' | 'coaching';
  icon: typeof Phone;
  iconBg: string;
  badge: string;
  badgeClass: string;
  title: string;
  subtitle: string;
  action: { label: string; onClick: () => void };
}

export function SpotlightCard({ onStartCall, onNavigate, avgScore, className }: SpotlightCardProps) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const atRiskDeal = mockPriorityDeals.find(d => d.health === 'at_risk');

  const slides: SpotlightSlide[] = [
    {
      type: 'call',
      icon: Phone,
      iconBg: 'bg-primary/10 text-primary',
      badge: 'Next Action',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
      title: 'Ready to make your next call?',
      subtitle: 'Start a call to build momentum and hit your daily targets.',
      action: { label: 'Start Call', onClick: onStartCall },
    },
    ...(atRiskDeal ? [{
      type: 'deal' as const,
      icon: AlertTriangle,
      iconBg: 'bg-warning/10 text-warning',
      badge: 'At Risk',
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      title: `${atRiskDeal.name} — ${atRiskDeal.company}`,
      subtitle: atRiskDeal.alert || `Next: ${atRiskDeal.nextAction}`,
      action: { label: 'View Deal', onClick: () => onNavigate('/enterprise') },
    }] : []),
    {
      type: 'coaching',
      icon: Lightbulb,
      iconBg: 'bg-accent/10 text-accent',
      badge: 'AI Insight',
      badgeClass: 'bg-accent/10 text-accent border-accent/20',
      title: avgScore >= 70
        ? 'Your scores are strong — focus on closing techniques'
        : avgScore > 0
          ? 'Try asking more open-ended questions to boost discovery scores'
          : 'Record your first call to get personalized AI coaching tips',
      subtitle: avgScore > 0 ? `Current avg score: ${avgScore}/100` : 'AI coaching unlocks after your first analyzed call.',
      action: { label: 'View Coaching', onClick: () => onNavigate('/coaching') },
    },
  ];

  const next = useCallback(() => setActive(a => (a + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setActive(a => (a - 1 + slides.length) % slides.length), [slides.length]);

  // Auto-advance every 15s
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { next(); return 0; }
        return p + (100 / 150); // 15s = 150 ticks at 100ms
      });
    }, 100);
    return () => clearInterval(interval);
  }, [active, next]);

  const slide = slides[active];

  return (
    <div className={cn(
      'relative rounded-2xl border border-border/50 bg-card p-5 sm:p-6 overflow-hidden',
      'shadow-sm transition-all duration-300',
      className
    )}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted/50">
        <div
          className="h-full bg-primary/40 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('flex items-center justify-center h-11 w-11 rounded-xl shrink-0', slide.iconBg)}>
          <slide.icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className={cn('text-[10px] mb-2', slide.badgeClass)}>
            {slide.badge}
          </Badge>
          <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug">
            {slide.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{slide.subtitle}</p>
        </div>

        {/* Action */}
        <Button
          size="sm"
          onClick={slide.action.onClick}
          className="shrink-0 gap-1.5 rounded-xl"
        >
          {slide.action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={prev} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <button onClick={next} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
