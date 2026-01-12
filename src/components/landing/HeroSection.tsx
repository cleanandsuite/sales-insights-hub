import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Globe, Zap, Clock } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-hero-gradient pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* AI Neural Network Pattern Overlay */}
      <div className="bg-hero-ai-pattern" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold animate-fade-in shadow-lg">
            <Clock className="h-4 w-4" />
            <span>Limited Intro Pricing – Lock in $29/mo</span>
          </div>

          {/* H1 Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95]">
            Become{' '}
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent">
              Rejection Proof
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-2xl md:text-3xl text-white font-medium max-w-3xl mx-auto leading-snug">
            AI Sales Coaching in 60 Seconds – No Setup, No Fees
          </p>

          {/* SEO-rich body text */}
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
            The ultimate <strong className="text-white font-semibold">AI Sales Coach</strong> for rejection-proof cold calls and higher close rates—transforming every call into a learning opportunity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToPricing}
              className="gap-2 font-bold text-lg px-10 py-8 shadow-2xl hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] bg-white text-primary hover:bg-white/95 rounded-xl"
            >
              Start 14-Day Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemoClick}
              className="gap-2 font-semibold text-lg px-10 py-8 border-2 border-white/60 text-white hover:bg-white/15 backdrop-blur-md rounded-xl"
            >
              <Play className="h-5 w-5" />
              Watch 60s Demo
            </Button>
          </div>

          {/* Social Proof */}
          <p className="text-base text-white/90 pt-2 font-medium">
            Be one of the first 100 to lock in grandfathered pricing
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-10 pt-8">
            <div className="flex items-center gap-3 text-base text-white font-medium">
              <div className="h-10 w-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-3 text-base text-white font-medium">
              <div className="h-10 w-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span>No Downloads</span>
            </div>
            <div className="flex items-center gap-3 text-base text-white font-medium">
              <div className="h-10 w-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span>60s Setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
