import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Shield, Globe, Zap } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  return (
    <section className="relative bg-hero-gradient pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden min-h-[85vh] flex items-center">
      {/* Subtle pattern overlay */}
      <div className="bg-hero-ai-pattern" />
      
      {/* Gradient orbs - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Urgency Badge */}
          <div className="inline-block animate-fade-in">
            <Badge className="bg-destructive text-destructive-foreground px-4 py-2 text-sm font-bold shadow-lg">
              🔥 Limited: First 100 Spots – Ends Jan 31!
            </Badge>
          </div>

          {/* H1 Headline - 48px as specified */}
          <h1 className="text-4xl sm:text-5xl md:text-[48px] font-bold text-white leading-tight">
            Sales Coaching in 60 Seconds
            <br />
            <span className="text-white/90">– No Setup, No Fees</span>
          </h1>

          {/* Subheadline - 20px */}
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Record calls in-browser, get live AI coaching, crush objections, boost closes 15-25%.
          </p>

          {/* Demo Video Placeholder */}
          <div className="max-w-2xl mx-auto my-8">
            <div 
              onClick={onWatchDemoClick}
              className="relative aspect-video bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl cursor-pointer group hover:bg-white/15 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
                </div>
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                Watch 60-Second Demo
              </p>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              onClick={() => window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank')}
              className="group gap-2 font-bold text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all rounded-lg"
            >
              Start Free 14-Day Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-white/70">
              Card required • 14 days free • Cancel anytime
            </p>
          </div>

          {/* Trust Badges */}
          <div className="pt-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-10 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-white/90" />
                <span className="text-sm font-medium text-white">GDPR Compliant</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30" />
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-white/90" />
                <span className="text-sm font-medium text-white">256-bit Encrypted</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30" />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-white/90" />
                <span className="text-sm font-medium text-white">60s Setup</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
