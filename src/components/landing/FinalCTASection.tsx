import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface FinalCTASectionProps {
  onStartTrialClick: () => void;
  loadingPlan: string | null;
}

export function FinalCTASection({ onStartTrialClick, loadingPlan }: FinalCTASectionProps) {
  return (
    <section className="relative py-20 md:py-28 bg-cta-gradient overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready to Transform Your{' '}
            <span className="text-accent">Sales Performance?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
            Join forward-thinking sales teams who are already using AI sales tools to close more deals, 
            improve forecasting accuracy, and drive measurable revenue growth.
          </p>
          <div className="pt-4">
            <Button 
              size="lg" 
              onClick={onStartTrialClick}
              className="gap-2 font-bold text-lg px-10 py-7 bg-white text-primary hover:bg-white/95 shadow-xl hover:shadow-2xl rounded-lg animate-cta-pulse"
              disabled={loadingPlan !== null}
            >
              {loadingPlan ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-sm text-white/80 mt-4">
              14-day free trial • No credit card required • Full access to all features
            </p>
          </div>

          {/* Trust Points */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { stat: '35%', label: 'Revenue Growth' },
              { stat: '95%', label: 'Forecast Accuracy' },
              { stat: '40%', label: 'Time Saved' },
              { stat: '2x', label: 'Deal Velocity' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{item.stat}</p>
                <p className="text-sm text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
