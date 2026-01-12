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
      <section className="py-10 border-y border-border bg-background">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8 font-semibold">
            Trusted by sales teams competing with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {TRUSTED_BY.map((company) => (
              <div 
                key={company} 
                className="text-2xl font-bold text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
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
      <section className="relative py-24 bg-cta-gradient overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Ready to Become Rejection Proof?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Be one of the first 100 to lock in grandfathered pricing with our AI Sales Coaching.
              Start your 14-day free trial today.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={() => handleStartTrial()}
                className="gap-2 font-bold text-lg px-12 py-8 shadow-2xl hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all bg-white text-primary hover:bg-white/95 rounded-xl"
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
              <p className="text-base text-white/85 mt-5 font-medium">
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
