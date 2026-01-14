import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/hero-sales-team.jpg';
import dashboardPreview from '@/assets/dashboard-preview.jpg';
interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}
export function HeroSection({
  onStartTrialClick,
  onWatchDemoClick
}: HeroSectionProps) {
  return <section className="relative bg-hero-gradient min-h-[100vh] flex items-center overflow-hidden">
      {/* Pattern overlay */}
      <div className="bg-hero-ai-pattern" />
      
      {/* Promo Banner */}
      <div className="absolute top-16 left-0 right-0 bg-promo-banner py-3 z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-semibold text-sm md:text-base">
            🎉 New Year Deal: Start free and get 40% off your first 3 months with code <span className="font-bold">NEWYEAR40</span>
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
              <Badge className="bg-white/15 text-white border-white/30 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                ⚡ The #1 AI Sales Coach
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] animate-slide-up">
              Sales Reps and AI
              <br />
              <span className="gradient-text">Close Deals Together.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up" style={{
            animationDelay: '0.1s'
          }}>
              SellSig transforms every sales call with real-time AI coaching that helps you crush objections, boost closes by 15-25%, and never miss a deal insight again.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{
            animationDelay: '0.2s'
          }}>
              <Button size="lg" onClick={() => window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank')} className="group gap-2 font-bold text-lg px-8 py-6 bg-white text-primary hover:bg-white/95 shadow-xl hover:shadow-2xl transition-all rounded-lg animate-cta-pulse">
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={onWatchDemoClick} className="gap-2 font-semibold text-lg px-8 py-6 border-2 border-white/40 text-white hover:bg-white/10 rounded-lg backdrop-blur-sm">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-white/80 text-sm animate-slide-up" style={{
            animationDelay: '0.3s'
          }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <div className="relative animate-slide-in-right hidden lg:block">
            <div className="relative">
              {/* Main dashboard image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
                <img src={dashboardPreview} alt="SellSig AI Dashboard" className="w-full h-auto" />
              </div>
              
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">+27%</p>
                    <p className="text-sm text-muted-foreground">Close Rate</p>
                  </div>
                </div>
              </div>

              {/* Floating coaching card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-2xl p-4 animate-float" style={{
              animationDelay: '1s'
            }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sales Coaching</p>
                    <p className="text-xs text-muted-foreground">Ai Powered Sales Scripts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}