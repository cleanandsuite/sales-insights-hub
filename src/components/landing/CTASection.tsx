import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onStartTrialClick: () => void;
}

export function CTASection({ onStartTrialClick }: CTASectionProps) {
  return (
    <section className="relative py-16 px-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-5">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">
          Stop Chasing. Start Detecting.
        </h2>
        <p className="text-base sm:text-lg font-semibold opacity-95">
          Get your first buyer signal insights and personalized strategy in minutes.
        </p>
        <Button
          size="lg"
          onClick={onStartTrialClick}
          className="group gap-3 font-extrabold text-base px-10 py-7 bg-white text-violet-700 hover:bg-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.2)] rounded-full transition-all border-0"
        >
          Start Free Trial – No Card Required
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
}
