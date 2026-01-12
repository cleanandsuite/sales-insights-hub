import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Globe, Zap, Sparkles } from 'lucide-react';

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
    <section className="relative bg-hero-gradient pt-24 pb-16 md:pt-48 md:pb-40 overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center">
      {/* AI Neural Network Pattern Overlay */}
      <div className="bg-hero-ai-pattern" />
      
      {/* Animated gradient orbs - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="hidden md:block absolute bottom-20 right-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8">
          
          {/* URGENCY BANNER - Responsive */}
          <div className="inline-block animate-fade-in">
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl md:rounded-2xl blur-lg opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/30">
                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-white animate-bounce" />
                  <span className="text-base md:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-lg">
                    🔥 First 100 Users Get Grandfathered Pricing!
                  </span>
                  <Sparkles className="hidden sm:block h-5 w-5 md:h-7 md:w-7 text-white animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                <p className="text-white/90 font-bold text-sm md:text-lg mt-1">$29/mo locked in forever — Regular price $49/mo</p>
              </div>
            </div>
          </div>

          {/* H1 Headline - Mobile Optimized */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
            Become{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent">
                Rejection
              </span>
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              Proof
            </span>
          </h1>

          {/* Subheadline - Mobile Optimized */}
          <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white font-bold max-w-4xl mx-auto leading-tight drop-shadow-lg px-2">
            AI Sales Coaching in <span className="text-cyan-300">60 Seconds</span>
            <br />
            <span className="text-white/90 text-lg sm:text-xl md:text-3xl lg:text-4xl">No Setup. No Fees. Just Results.</span>
          </p>

          {/* CTA Buttons - Mobile Stack */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center pt-6 md:pt-8 px-4">
            <Button 
              size="lg" 
              onClick={scrollToPricing}
              className="group gap-2 md:gap-3 font-black text-xl md:text-2xl lg:text-3xl px-8 py-8 md:px-14 md:py-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 bg-white text-[#0052CC] hover:bg-cyan-50 rounded-xl md:rounded-2xl border-4 border-white/50 animate-cta-pulse w-full md:w-auto"
            >
              Start Free 14-Day Trial
              <ArrowRight className="h-6 w-6 md:h-8 md:w-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemoClick}
              className="group gap-2 md:gap-3 font-bold text-lg md:text-xl lg:text-2xl px-8 py-8 md:px-12 md:py-10 bg-white/20 border-4 border-white text-white hover:bg-white hover:text-[#0052CC] backdrop-blur-md rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] w-full md:w-auto"
            >
              <Play className="h-5 w-5 md:h-7 md:w-7 group-hover:scale-110 transition-transform fill-white group-hover:fill-[#0052CC]" />
              Watch 60s Demo
            </Button>
          </div>

          {/* Credit card notice */}
          <p className="text-base md:text-lg text-white/80 font-medium">
            Card required • 14 days free • Cancel anytime
          </p>

          {/* Trust Badges - Mobile Responsive */}
          <div className="pt-6 md:pt-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-8 lg:gap-12 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 shadow-2xl">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <Shield className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <span className="text-base md:text-xl lg:text-2xl font-bold text-white">SOC 2</span>
              </div>
              <div className="hidden sm:block w-px h-8 md:h-10 bg-white/40" />
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <Globe className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <span className="text-base md:text-xl lg:text-2xl font-bold text-white">No Downloads</span>
              </div>
              <div className="hidden sm:block w-px h-8 md:h-10 bg-white/40" />
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <Zap className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <span className="text-base md:text-xl lg:text-2xl font-bold text-white">60s Setup</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
