import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';

const TRUSTED_BY = ['TechFlow', 'CloudScale', 'DataSync', 'Velocity', 'Nexus'];

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleStartTrial = async (planKey: string = 'single_user') => {
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-trial-checkout', {
        body: { plan: planKey },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoVideoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
      
      {/* Fixed Header */}
      <LandingHeader onStartTrialClick={() => handleStartTrial()} />

      {/* Hero Section */}
      <HeroSection 
        onStartTrialClick={() => handleStartTrial()} 
        onWatchDemoClick={() => setDemoModalOpen(true)} 
      />

      {/* Trusted By Section */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Trusted by sales teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUSTED_BY.map((company) => (
              <div 
                key={company} 
                className="text-lg font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-foreground mb-2">See It In Action</h2>
              <p className="text-muted-foreground text-lg">
                Get started in under 2 minutes — no RevOps required
              </p>
            </div>
            <div 
              className="aspect-video card-enterprise overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
              onClick={() => setDemoModalOpen(true)}
            >
              <div className="w-full h-full flex items-center justify-center bg-muted/50 relative">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to watch demo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-foreground">Ready to Close More Deals?</h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of sales teams already using AI to improve their close rates.
              Start your 14-day trial today — no charge until you're convinced.
            </p>
            <Button 
              size="lg" 
              onClick={() => handleStartTrial()}
              className="gap-2 font-semibold text-base px-8 py-6 shadow-md hover:shadow-lg transition-shadow"
              disabled={loadingPlan !== null}
            >
              {loadingPlan ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
