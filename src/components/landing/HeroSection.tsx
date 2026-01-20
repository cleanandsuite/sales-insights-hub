import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, CheckCircle, Phone, Brain, Sparkles, Users } from 'lucide-react';
import dashboardPreview from '@/assets/dashboard-preview.jpg';

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

export function HeroSection({
  onStartTrialClick,
  onWatchDemoClick
}: HeroSectionProps) {
  return (
    <section className="relative bg-hero-gradient min-h-[100vh] flex items-center overflow-hidden">
      {/* Aurora mesh background - 2025/2026 trend */}
      <div className="bg-hero-aurora" />
      <div className="bg-hero-mesh" />
      
      {/* Promo Banner */}
      <div className="absolute top-16 left-0 right-0 bg-promo-banner py-3 z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-semibold text-sm md:text-base">
            🔥 Limited Offer: 40% off for life – grandfathered pricing for the next 100 users!
            <ArrowRight className="inline h-4 w-4 ml-2" />
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Pre-headline badge */}
            <div className="inline-block animate-fade-in">
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md glass-effect">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                AI-Powered Sales Coaching in 60 Seconds
              </Badge>
            </div>

            {/* Main Headline - H1 optimized for SEO */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] animate-slide-up">
              AI Coaching for Sales Calls:
              <br />
              <span className="gradient-text-aurora">Win More Deals, Faster</span>
            </h1>

            {/* Subheadline - Description optimized */}
            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up" style={{
              animationDelay: '0.1s'
            }}>
              Get AI coaching for sales calls that analyzes every conversation, gives real-time guidance, speeds up team ramp-up, and helps your reps win more deals with confidence—no guesswork needed.
            </p>

            {/* Primary CTA - Made bigger and more prominent */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{
              animationDelay: '0.2s'
            }}>
              <Button 
                size="lg" 
                onClick={onStartTrialClick} 
                className="group gap-3 font-bold text-lg px-10 py-7 bg-white text-primary hover:bg-white/95 shadow-2xl hover:shadow-3xl transition-all rounded-xl animate-cta-pulse glass-button"
              >
                Start 14-Day Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onWatchDemoClick} 
                className="group gap-2 font-semibold text-lg px-8 py-7 border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary rounded-xl backdrop-blur-md transition-all glass-effect"
              >
                <Play className="h-5 w-5 fill-current" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof - Added rep count */}
            <div className="flex items-center gap-3 justify-center lg:justify-start animate-slide-up" style={{
              animationDelay: '0.25s'
            }}>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-white/90 text-sm font-medium">Join 500+ reps becoming rejection-proof</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-white/80 text-sm animate-slide-up" style={{
              animationDelay: '0.3s'
            }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Real-time AI coaching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Sales call analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Right Side - Dashboard Preview with glass effect */}
          <div className="relative animate-slide-in-right hidden lg:block">
            <div className="relative">
              {/* Main dashboard image with glass frame */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/5 backdrop-blur-xl glass-card">
                <img src={dashboardPreview} alt="AI Coaching for Sales Calls Dashboard - Real-time analysis and guidance" className="w-full h-auto" />
              </div>
              
              {/* Floating stat card - glass style */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 animate-float glass-card-solid">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">+40%</p>
                    <p className="text-sm text-muted-foreground">Call Success Rate</p>
                  </div>
                </div>
              </div>

              {/* Floating AI card */}
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 animate-float glass-card-solid" style={{
                animationDelay: '1s'
              }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">AI Coaching</p>
                    <p className="text-xs text-muted-foreground">Real-time guidance</p>
                  </div>
                </div>
              </div>

              {/* Floating sales call card */}
              <div className="absolute top-1/2 -right-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-3 animate-float glass-card-solid" style={{
                animationDelay: '2s'
              }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">Live Sales Call Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}