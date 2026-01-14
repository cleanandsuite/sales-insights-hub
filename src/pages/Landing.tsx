import { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Critical above-the-fold components loaded eagerly
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';

// Below-the-fold components lazy loaded for faster initial paint
const BenefitsSection = lazy(() => import('@/components/landing/BenefitsSection').then(m => ({ default: m.BenefitsSection })));
const DemoVideoSection = lazy(() => import('@/components/landing/DemoVideoSection').then(m => ({ default: m.DemoVideoSection })));
const FeaturesSection = lazy(() => import('@/components/landing/FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const TestimonialsSection = lazy(() => import('@/components/landing/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const PricingSection = lazy(() => import('@/components/landing/PricingSection').then(m => ({ default: m.PricingSection })));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter').then(m => ({ default: m.LandingFooter })));
const DemoVideoModal = lazy(() => import('@/components/landing/DemoVideoModal').then(m => ({ default: m.DemoVideoModal })));

// Minimal section loading placeholder
const SectionLoader = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const TRUSTED_BY = ['TechFlow', 'CloudScale', 'DataSync', 'SalesForge', 'RevHub'];

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
      <Suspense fallback={null}>
        {demoModalOpen && <DemoVideoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />}
      </Suspense>
      
      {/* Fixed Header - Critical */}
      <LandingHeader onStartTrialClick={() => handleStartTrial()} />

      {/* Hero Section - Critical above-the-fold */}
      <HeroSection 
        onStartTrialClick={() => handleStartTrial()} 
        onWatchDemoClick={() => setDemoModalOpen(true)} 
      />

      {/* Trusted By Section */}
      <section className="py-8 border-y border-border bg-card">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6 font-medium">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {TRUSTED_BY.map((company) => (
              <div 
                key={company} 
                className="text-lg md:text-xl font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Below-the-fold sections - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <DemoVideoSection onWatchDemoClick={() => setDemoModalOpen(true)} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <BenefitsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <PricingSection />
      </Suspense>

      {/* CTA Section */}
      <section className="relative py-16 md:py-20 bg-cta-gradient overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Boost Your Close Rate?
            </h2>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              Join the first 100 sales reps to lock in grandfathered pricing.
              Start your 14-day free trial today.
            </p>
            <div className="pt-2">
              <Button 
                size="lg" 
                onClick={() => handleStartTrial()}
                className="gap-2 font-semibold text-base px-8 py-6 bg-white text-primary hover:bg-white/95 shadow-lg rounded-lg"
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
              <p className="text-sm text-white/80 mt-4">
                Card required • 14 days free • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}
