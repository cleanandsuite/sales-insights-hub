import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onStartTrialClick: () => void;
}

export function CTASection({ onStartTrialClick }: CTASectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-3xl bg-blue-700 text-white text-center px-8 py-14 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to close more deals?
            </h2>
            <p className="text-base sm:text-lg font-medium opacity-90 max-w-xl mx-auto">
              Get your first buyer signal insights and a personalized coaching strategy in minutes.
            </p>
            <Button
              size="lg"
              onClick={onStartTrialClick}
              className="group gap-3 font-bold text-base px-10 py-6 bg-white text-blue-700 hover:bg-gray-50 shadow-lg rounded-xl border-0 transition-all"
            >
              Start Free Trial – No Card Required
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm opacity-70 font-medium">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
