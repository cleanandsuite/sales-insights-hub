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
    <section className="relative bg-hero-gradient pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* AI Neural Network Pattern Overlay */}
      <div className="bg-hero-ai-pattern" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium animate-fade-in shadow-lg">
            <Clock className="h-4 w-4" />
            <span>Limited Intro Pricing – Lock in $29/mo</span>
          </div>

          {/* H1 Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-lg">
            Become{' '}
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Rejection Proof
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            AI Sales Coaching in 60 Seconds – No Setup, No Fees
          </p>

          {/* SEO-rich body text */}
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            The ultimate <strong className="text-white">AI Sales Coach</strong> for rejection-proof cold calls and higher close rates—transforming every call into a learning opportunity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToPricing}
              className="gap-2 font-semibold text-lg px-8 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] bg-white text-[#005f9e] hover:bg-white/90"
            >
              Start 14-Day Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemoClick}
              className="gap-2 font-medium text-lg px-8 py-7 border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Play className="h-5 w-5" />
              Watch 60s Demo
            </Button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-white/80 pt-2">
            Be one of the first 100 to lock in grandfathered pricing
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <span>No Downloads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span>60s Setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
