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
    <section className="relative bg-hero-gradient pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden min-h-[90vh] flex items-center">
      {/* AI Neural Network Pattern Overlay */}
      <div className="bg-hero-ai-pattern" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          
          {/* URGENCY BANNER - BAM! In your face */}
          <div className="inline-block animate-fade-in">
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-lg opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/30">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-7 w-7 text-white animate-bounce" />
                  <span className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-lg">
                    🔥 First 100 Users Get Grandfathered Pricing Forever!
                  </span>
                  <Sparkles className="h-7 w-7 text-white animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                <p className="text-white/90 font-bold text-lg mt-1">Only $29/mo locked in — Regular price $49/mo</p>
              </div>
            </div>
          </div>

          {/* H1 Headline - MASSIVE */}
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
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

          {/* Subheadline - Bold and Clear */}
          <p className="text-3xl md:text-4xl lg:text-5xl text-white font-bold max-w-4xl mx-auto leading-tight drop-shadow-lg">
            AI Sales Coaching in <span className="text-cyan-300">60 Seconds</span>
            <br />
            <span className="text-white/90">No Setup. No Fees. Just Results.</span>
          </p>

          {/* CTA Buttons - HUGE and Prominent */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={scrollToPricing}
              className="group gap-3 font-black text-2xl md:text-3xl px-14 py-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 bg-white text-[#0052CC] hover:bg-cyan-50 rounded-2xl border-4 border-white/50 animate-cta-pulse"
            >
              Start Free 14-Day Trial
              <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemoClick}
              className="group gap-3 font-bold text-xl md:text-2xl px-12 py-10 bg-white/20 border-4 border-white text-white hover:bg-white hover:text-[#0052CC] backdrop-blur-md rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <Play className="h-7 w-7 group-hover:scale-110 transition-transform fill-white group-hover:fill-[#0052CC]" />
              Watch 60s Demo
            </Button>
          </div>

          {/* Credit card notice */}
          <p className="text-lg text-white/80 font-medium">
            Card required • 14 days free • Cancel anytime
          </p>

          {/* Trust Badges - ONE UNIFIED BUBBLE */}
          <div className="pt-8">
            <div className="inline-flex items-center justify-center gap-8 md:gap-12 px-10 py-6 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white">SOC 2 Compliant</span>
              </div>
              <div className="w-px h-10 bg-white/40" />
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white">No Downloads</span>
              </div>
              <div className="w-px h-10 bg-white/40" />
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white">60s Setup</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
