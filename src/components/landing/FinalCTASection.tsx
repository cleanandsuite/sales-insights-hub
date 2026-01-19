import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Brain, Sparkles } from 'lucide-react';

interface FinalCTASectionProps {
  onStartTrialClick: () => void;
}

export function FinalCTASection({ onStartTrialClick }: FinalCTASectionProps) {
  return (
    <section className="relative py-20 md:py-28 bg-cta-aurora overflow-hidden">
      {/* Aurora mesh background */}
      <div className="absolute inset-0 bg-hero-aurora opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Transform Your Sales Calls Today</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready for AI Coaching That{' '}
            <span className="text-accent">Drives Results?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
            Join forward-thinking sales teams using AI coaching to improve sales calls, 
            close more deals, and drive sustainable revenue growth across changing markets.
          </p>
          
          <div className="pt-4">
            <Button 
              size="lg" 
              onClick={onStartTrialClick}
              className="group gap-2 font-bold text-lg px-10 py-7 bg-white text-primary hover:bg-white/95 shadow-2xl hover:shadow-3xl rounded-xl animate-cta-pulse"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-white/80 mt-4">
              14-day free trial • No credit card required • Full AI coaching access
            </p>
          </div>

          {/* Trust Points */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { stat: '35%', label: 'Revenue Growth', icon: Phone },
              { stat: '95%', label: 'Forecast Accuracy', icon: Brain },
              { stat: '40%', label: 'Time Saved', icon: Sparkles },
              { stat: '2x', label: 'Deal Velocity', icon: ArrowRight },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
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
