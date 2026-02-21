import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onStartTrialClick: () => void;
}

export function FinalCTA({ onStartTrialClick }: FinalCTAProps) {
  return (
    <section className="bg-[#0A0A0A] py-28">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
          Ready to Close More Deals with{' '}
          <span className="text-emerald-400">AI Sales Coaching</span>?
        </h2>
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
          Join 100+ sales teams already using SellSig to coach reps in real-time, 
          detect buyer signals, and win more revenue.
        </p>
        <Button
          size="lg"
          onClick={onStartTrialClick}
          className="group gap-3 font-bold text-lg px-10 py-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          Start Your Free Trial
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-sm text-gray-500 mt-4">No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}
