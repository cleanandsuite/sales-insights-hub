import { ArrowRight } from 'lucide-react';

interface FinalCTASectionProps {
  onStartTrialClick: () => void;
}

export function FinalCTASection({ onStartTrialClick }: FinalCTASectionProps) {
  return (
    <section className="py-20 md:py-28 bg-[#0f172a]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-[640px] mx-auto text-center">
          {/* Headline */}
          <h2 className="text-[32px] md:text-[44px] font-bold text-white leading-[1.12] tracking-[-0.02em] mb-5">
            Start closing more deals today
          </h2>

          {/* Subtext */}
          <p className="text-[17px] text-gray-400 leading-relaxed mb-10 max-w-[480px] mx-auto">
            Join the revenue teams that use SellSig to turn every conversation
            into a competitive advantage. Free for 14 days.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={onStartTrialClick}
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0f172a] text-[15px] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start your free trial
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onStartTrialClick}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-gray-400 text-[15px] font-medium rounded-lg border border-gray-700 hover:border-gray-600 hover:text-gray-300 transition-all"
            >
              Talk to sales
            </button>
          </div>

          {/* Trust line */}
          <p className="text-[13px] text-gray-500">
            No credit card required &middot; 14-day free trial &middot; Cancel anytime
          </p>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-8 max-w-[480px] mx-auto mt-16 pt-12 border-t border-gray-800">
            {[
              { value: '2,000+', label: 'Revenue teams' },
              { value: '4.9/5', label: 'Customer rating' },
              { value: '<5 min', label: 'Setup time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[22px] font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[12px] text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
