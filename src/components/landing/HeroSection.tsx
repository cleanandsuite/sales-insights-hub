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
    <section className="relative bg-gradient-to-b from-background via-background to-muted/20 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-fade-in">
            <Clock className="h-4 w-4" />
            <span>Limited Intro Pricing – Lock in $19/mo</span>
          </div>

          {/* H1 Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1]">
            Become{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Rejection Proof
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI Sales Coaching in 60 Seconds – No Setup, No Fees
          </p>

          {/* SEO-rich body text */}
          <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto">
            The ultimate <strong className="text-foreground">AI Sales Coach</strong> for rejection-proof cold calls and higher close rates—transforming every call into a learning opportunity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToPricing}
              className="gap-2 font-semibold text-lg px-8 py-7 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-primary hover:bg-primary/90"
            >
              Start 14-Day Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemoClick}
              className="gap-2 font-medium text-lg px-8 py-7 border-2 hover:bg-muted/50"
            >
              <Play className="h-5 w-5" />
              Watch 60s Demo
            </Button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-muted-foreground pt-2">
            Join <span className="font-semibold text-foreground">2,400+ reps</span> crushing their quotas with AI Sales Coaching
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span>No Downloads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span>60s Setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
