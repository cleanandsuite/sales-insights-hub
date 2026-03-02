import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play } from 'lucide-react';

interface CinematicHeroProps {
  onStartTrialClick: () => void;
}

export function CinematicHero({ onStartTrialClick }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

      {/* Waveform decoration */}
      <div className="absolute right-0 top-1/3 w-1/2 h-1/3 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 600 200" fill="none" className="w-full h-full opacity-20">
          {Array.from({ length: 60 }).map((_, i) => (
            <rect
              key={i}
              x={i * 10}
              y={100 - Math.sin(i * 0.3) * 60 - Math.random() * 20}
              width="3"
              height={Math.abs(Math.sin(i * 0.3) * 120) + 10}
              rx="1.5"
              fill="hsl(168, 76%, 40%)"
              opacity={0.3 + Math.random() * 0.7}
            />
          ))}
        </svg>
      </div>

      {/* Content — bottom-left */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28 pt-32">
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

          <p data-hero-anim className="text-white/50 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
            Real-time AI coaching built by reps, for reps — so every call becomes a win. 
            Stop guessing. Start closing.
          </p>

          <div data-hero-anim className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStartTrialClick}
              className="magnetic-btn inline-flex items-center justify-center gap-2 bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))] px-8 py-4 rounded-full text-base font-semibold"
            >
              <span className="relative z-10 flex items-center gap-2">
                Book a Demo <ArrowRight className="w-5 h-5" />
              </span>
              <span className="btn-slide bg-[hsl(168,76%,35%)] rounded-full" />
            </button>
            <button
              onClick={onStartTrialClick}
              className="magnetic-btn inline-flex items-center justify-center gap-2 border border-white/[0.15] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-white/[0.05]"
            >
              <Play className="w-4 h-4" />
              Start 14-Day Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}