import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
}

export function HeroSection({ onStartTrialClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center text-center overflow-hidden bg-[#020617] pt-24 pb-16">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 to-[#020617]/90 z-0" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-6">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
          <span className="bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            Buyer Signal Intelligence That Turns Every Call Into a Win
          </span>
        </h1>

        {/* Subheadline */}
        <h2 className="text-lg sm:text-xl font-bold text-white/95">
          AI That Detects Intent Before Your Buyer Says It
        </h2>

        {/* Tagline */}
        <p className="text-base sm:text-lg font-semibold text-indigo-200 border-t-2 border-violet-600 pt-4 mt-4 inline-block tracking-wide">
          Close faster. Ramp quicker. Win more.
        </p>

        {/* CTA */}
        <div className="pt-4">
          <Button
            size="lg"
            onClick={onStartTrialClick}
            className="group gap-3 font-extrabold text-lg px-10 py-7 bg-white text-violet-700 hover:bg-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.2)] rounded-full transition-all border-0"
          >
            Start Free Trial – No Card Required
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
