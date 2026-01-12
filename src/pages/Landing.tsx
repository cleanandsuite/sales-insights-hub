import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { DemoVideoSection } from '@/components/landing/DemoVideoSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';

const TRUSTED_BY = ['Salesforce', 'HubSpot', 'Outreach', 'Gong', 'ZoomInfo'];

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
      <section className="py-8 border-y border-border bg-background">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6">
            Trusted by sales teams competing with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {TRUSTED_BY.map((company) => (
              <div 
                key={company} 
                className="text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <DemoVideoSection onWatchDemoClick={() => setDemoModalOpen(true)} />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Become Rejection Proof?
            </h2>
            <p className="text-lg text-muted-foreground">
              Be one of the first 100 to lock in grandfathered pricing with our AI Sales Coaching.
              Start your 14-day free trial today.
            </p>
            <div className="pt-2">
              <Button 
                size="lg" 
                onClick={() => handleStartTrial()}
                className="gap-2 font-semibold text-lg px-10 py-7 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
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
              <p className="text-sm text-muted-foreground mt-4">
                Card required • 14 days free • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
