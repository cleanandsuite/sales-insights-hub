import { useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Critical above-the-fold components loaded eagerly
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';

// Below-the-fold components lazy loaded for faster initial paint
const IntroSection = lazy(() => import('@/components/landing/IntroSection').then(m => ({ default: m.IntroSection })));
const WhatIsAISection = lazy(() => import('@/components/landing/WhatIsAISection').then(m => ({ default: m.WhatIsAISection })));
const BenefitsSection = lazy(() => import('@/components/landing/BenefitsSection').then(m => ({ default: m.BenefitsSection })));
const CoreFeaturesSection = lazy(() => import('@/components/landing/CoreFeaturesSection').then(m => ({ default: m.CoreFeaturesSection })));
const UseCasesSection = lazy(() => import('@/components/landing/UseCasesSection').then(m => ({ default: m.UseCasesSection })));
const HowToChooseSection = lazy(() => import('@/components/landing/HowToChooseSection').then(m => ({ default: m.HowToChooseSection })));
const ImplementationSection = lazy(() => import('@/components/landing/ImplementationSection').then(m => ({ default: m.ImplementationSection })));
const ROISection = lazy(() => import('@/components/landing/ROISection').then(m => ({ default: m.ROISection })));
const ToolCategoriesSection = lazy(() => import('@/components/landing/ToolCategoriesSection').then(m => ({ default: m.ToolCategoriesSection })));
const IntegrationsSection = lazy(() => import('@/components/landing/IntegrationsSection').then(m => ({ default: m.IntegrationsSection })));
const GovernanceSection = lazy(() => import('@/components/landing/GovernanceSection').then(m => ({ default: m.GovernanceSection })));
const FutureOutlookSection = lazy(() => import('@/components/landing/FutureOutlookSection').then(m => ({ default: m.FutureOutlookSection })));
const PracticalTipsSection = lazy(() => import('@/components/landing/PracticalTipsSection').then(m => ({ default: m.PracticalTipsSection })));
const FinalCTASection = lazy(() => import('@/components/landing/FinalCTASection').then(m => ({ default: m.FinalCTASection })));
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
      
      {/* Fixed Header */}
      <LandingHeader onStartTrialClick={() => handleStartTrial()} />

      {/* Hero Section */}
      <HeroSection 
        onStartTrialClick={() => handleStartTrial()} 
        onWatchDemoClick={() => setDemoModalOpen(true)} 
      />

      {/* Trusted By Section */}
      <section className="py-8 border-y border-border bg-card">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6 font-medium">
            Trusted by sales teams at
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

      {/* Content Sections */}
      <Suspense fallback={<SectionLoader />}>
        <IntroSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <WhatIsAISection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <BenefitsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <CoreFeaturesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <UseCasesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <HowToChooseSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <ImplementationSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <ROISection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <ToolCategoriesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <IntegrationsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <GovernanceSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <PracticalTipsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FutureOutlookSection />
      </Suspense>

      {/* Final CTA */}
      <Suspense fallback={<SectionLoader />}>
        <FinalCTASection 
          onStartTrialClick={() => handleStartTrial()} 
          loadingPlan={loadingPlan} 
        />
      </Suspense>

      {/* Footer */}
      <Suspense fallback={<SectionLoader />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}
