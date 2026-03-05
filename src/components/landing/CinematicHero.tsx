import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play, Sparkles, Shield, Clock, CreditCard } from 'lucide-react';

interface CinematicHeroProps {
  onStartTrialClick: () => void;
}

const COACHING_SIGNALS = [
  { text: 'Objection detected — use the empathy close', color: 'bg-red-500', urgency: 'high' },
  { text: 'Buyer mentioned budget timeline — pivot to ROI', color: 'bg-[hsl(var(--cin-teal))]', urgency: 'medium' },
  { text: 'Positive sentiment shift — ask for the close now', color: 'bg-[hsl(var(--cin-teal))]', urgency: 'medium' },
  { text: 'Losing attention — pause and re-engage with a question', color: 'bg-amber-500', urgency: 'high' },
  { text: 'Decision-maker confirmed — transition to proposal', color: 'bg-emerald-500', urgency: 'low' },
  { text: 'Competitor mentioned — highlight your differentiator', color: 'bg-red-500', urgency: 'high' },
];

const POPUP_SLOTS = [
  { top: '8%', right: '4%' },
  { top: '22%', right: '42%' },
  { top: '42%', right: '12%' },
  { top: '62%', right: '48%' },
  { top: '18%', right: '58%' },
  { top: '52%', right: '28%' },
  { top: '35%', right: '55%' },
];

export function CinematicHero({ onStartTrialClick }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePopup, setActivePopup] = useState<{ index: number; slot: number } | null>(null);
  const [fading, setFading] = useState(false);
  const prevSlotRef = useRef(-1);
  const msgIndexRef = useRef(0);

  // Deterministic waveform bar data
  const bars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const h = Math.sin(i * 0.3) * 50 + Math.sin(i * 0.7) * 25 + Math.sin(i * 0.15) * 15 + 60;
      const duration = 1.5 + Math.sin(i * 0.4) * 1.2;
      const delay = i * 0.04;
      return { height: Math.abs(h), duration, delay };
    });
  }, []);

  // GSAP hero text entrance
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('[data-hero-anim]');
      if (!els) return;
      gsap.fromTo(
        els,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.3 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Coaching popup cycle
  const showNext = useCallback(() => {
    const idx = msgIndexRef.current;
    let slot: number;
    do {
      slot = Math.floor(Math.random() * POPUP_SLOTS.length);
    } while (slot === prevSlotRef.current && POPUP_SLOTS.length > 1);
    prevSlotRef.current = slot;
    msgIndexRef.current = (idx + 1) % COACHING_SIGNALS.length;

    setFading(false);
    setActivePopup({ index: idx, slot });
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      showNext();
    }, 2000);
    return () => clearTimeout(startTimer);
  }, [showNext]);

  useEffect(() => {
    if (activePopup === null) return;
    const fadeTimer = setTimeout(() => setFading(true), 3500);
    const nextTimer = setTimeout(() => {
      setActivePopup(null);
      setTimeout(showNext, 300);
    }, 4000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(nextTimer);
    };
  }, [activePopup, showNext]);

  const signal = activePopup !== null ? COACHING_SIGNALS[activePopup.index] : null;
  const slotStyle = activePopup !== null ? POPUP_SLOTS[activePopup.slot] : null;

  return (
    <section
      id="cinematic-hero"
      ref={containerRef}
      className="relative min-h-[100dvh] flex items-end bg-[hsl(var(--cin-bg))] overflow-hidden"
    >
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[80%] rounded-full bg-[hsl(var(--cin-teal))]/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[50%] rounded-full bg-[hsl(var(--cin-purple))]/[0.05] blur-[100px]" />
      </div>

      {/* Animated waveform */}
      <div className="absolute right-0 top-1/4 w-1/2 h-2/5 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 800 200" fill="none" className="w-full h-full opacity-25" preserveAspectRatio="none">
          {bars.map((bar, i) => (
            <rect
              key={i}
              x={i * 10}
              y={100 - bar.height / 2}
              width="4"
              height={bar.height}
              rx="2"
              fill="hsl(168, 76%, 40%)"
              style={{
                animationName: 'cin-waveform',
                animationDuration: `${bar.duration}s`,
                animationDelay: `${bar.delay}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                transformOrigin: 'center',
              }}
            />
          ))}
        </svg>

        {/* Coaching popup */}
        {activePopup !== null && signal && slotStyle && (
          <div
            className="absolute max-w-[260px] transition-opacity duration-500"
            style={{
              top: slotStyle.top,
              right: slotStyle.right,
              opacity: fading ? 0 : 1,
              animation: !fading ? 'cin-coach-pop 0.4s ease-out both' : undefined,
            }}
          >
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.12] rounded-xl px-4 py-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[hsl(var(--cin-teal))] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${signal.color}`} />
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
                    AI Coach
                  </span>
                </div>
                <p className="text-white/80 text-xs leading-relaxed">{signal.text}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content — bottom-left */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 pt-32">
        <div className="max-w-3xl">
          <div data-hero-anim className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] mb-8">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--cin-teal))] cin-pulse-dot" />
            <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Revenue Intelligence Platform</span>
          </div>

          <h1 data-hero-anim className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[0.95] tracking-tight mb-2">
            Sales Coach
          </h1>
          <h1 data-hero-anim className="text-5xl md:text-7xl lg:text-8xl font-light italic text-white/90 leading-[0.95] tracking-tight mb-8">
            Intelligence.
          </h1>

          <p data-hero-anim className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
            Real-time AI coaching built by reps, for reps — so every call becomes a win. 
            Stop guessing. Start closing.
          </p>

          <div data-hero-anim className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={onStartTrialClick}
              className="magnetic-btn inline-flex items-center justify-center gap-2 bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))] px-8 py-4 rounded-full text-base font-semibold"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </span>
              <span className="btn-slide bg-[hsl(168,76%,35%)] rounded-full" />
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="magnetic-btn inline-flex items-center justify-center gap-2 border border-white/[0.15] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-white/[0.05]"
            >
              <Play className="w-4 h-4" />
              See Plans & Pricing
            </button>
          </div>

          {/* Trust micro-strip */}
          <div data-hero-anim className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/35 text-xs">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Setup in 2 minutes</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> SOC 2 compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
