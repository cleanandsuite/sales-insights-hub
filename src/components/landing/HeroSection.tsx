import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Shield, Globe, Zap } from 'lucide-react';

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
    <section className="hero-enterprise">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge className="stat-badge">
            <Zap className="h-3.5 w-3.5" />
            Zero Setup — Browser Only
          </Badge>

          {/* Headline */}
          <h1 className="text-foreground">
            AI Sales Coaching That{' '}
            <span className="gradient-text">Closes More Deals</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn cold calls hot with AI insights. Easier than competitors, half the cost. 
            Record, analyze, and close more deals—all from your browser.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button 
              size="lg" 
              onClick={scrollToPricing}
              className="gap-2 font-semibold text-base px-8 py-6 shadow-md hover:shadow-lg transition-shadow"
            >
              Start 14-Day Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemoClick}
              className="gap-2 font-medium text-base px-8 py-6"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-muted-foreground">
            14-day trial — no charge until value proven. Cancel anytime.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>No Downloads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>60s Setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
