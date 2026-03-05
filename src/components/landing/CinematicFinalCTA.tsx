import { ArrowRight, Phone } from 'lucide-react';
import { useScrollReveal, usePulsingGlow } from './gsap/useGSAPAnimations';

interface CinematicFinalCTAProps {
  onStartTrialClick: () => void;
}

export function CinematicFinalCTA({ onStartTrialClick }: CinematicFinalCTAProps) {
  const revealRef = useScrollReveal();
  const glowRef = usePulsingGlow();

  return (
    <section ref={revealRef} className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--cin-teal)/0.08),transparent_60%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center relative z-10" data-reveal>
        <h2 className="text-[clamp(36px,5vw,56px)] font-bold tracking-[-2px] leading-[1.05] text-white mb-4">
          Start Closing<br />
          <span className="italic text-[hsl(var(--cin-teal))]">More Deals Today.</span>
        </h2>

        <p className="text-base text-white/50 mb-10 max-w-md mx-auto">
          14-day free trial. No credit card required. Setup in 2 minutes. Cancel anytime.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            ref={glowRef}
            onClick={onStartTrialClick}
            className="px-8 py-4 rounded-full bg-[hsl(var(--cin-teal))] text-black font-semibold text-base flex items-center gap-2 hover:brightness-110 transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="tel:+18005551234"
            className="px-8 py-4 rounded-full border border-white/[0.12] text-white/70 font-medium text-sm flex items-center gap-2 hover:bg-white/[0.05] transition-colors"
          >
            <Phone className="w-4 h-4" />
            Talk to Sales
          </a>
        </div>

        <p className="text-[11px] font-mono uppercase tracking-[.15em] text-white/20">
          Join 2,000+ sales teams already using SellSig
        </p>
      </div>
    </section>
  );
}
