import { useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Critical above-the-fold components loaded eagerly
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';

// Below-the-fold components lazy loaded for faster initial paint
const IntroSection = lazy(() => import('@/components/landing/IntroSection').then(m => ({ default: m.IntroSection })));
const WhatIsAISection = lazy(() => import('@/components/landing/WhatIsAISection').then(m => ({ default: m.WhatIsAISection })));
const BenefitsSection = lazy(() => import('@/components/landing/BenefitsSection').then(m => ({ default: m.BenefitsSection })));
const CoreFeaturesSection = lazy(() => import('@/components/landing/CoreFeaturesSection').then(m => ({ default: m.CoreFeaturesSection })));
const UseCasesSection = lazy(() => import('@/components/landing/UseCasesSection').then(m => ({ default: m.UseCasesSection })));
const ROISection = lazy(() => import('@/components/landing/ROISection').then(m => ({ default: m.ROISection })));
const GovernanceSection = lazy(() => import('@/components/landing/GovernanceSection').then(m => ({ default: m.GovernanceSection })));
const FutureOutlookSection = lazy(() => import('@/components/landing/FutureOutlookSection').then(m => ({ default: m.FutureOutlookSection })));
const FinalCTASection = lazy(() => import('@/components/landing/FinalCTASection').then(m => ({ default: m.FinalCTASection })));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter').then(m => ({ default: m.LandingFooter })));
const DemoVideoModal = lazy(() => import('@/components/landing/DemoVideoModal').then(m => ({ default: m.DemoVideoModal })));

// Stripe payment link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu6oG1zi7O7euubi69k400';

// Minimal section loading placeholder
const SectionLoader = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const TRUSTED_BY = ['TechFlow', 'CloudScale', 'DataSync', 'SalesForge', 'RevHub'];

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleStartTrial = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
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
      <section className="py-8 border-y border-border/50 bg-card/80 backdrop-blur-sm">
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

      {/* Content Sections - Streamlined for ~1100 words total */}
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
        <ROISection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <GovernanceSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FutureOutlookSection />
      </Suspense>

      {/* Final CTA */}
      <Suspense fallback={<SectionLoader />}>
        <FinalCTASection onStartTrialClick={handleStartTrial} />
      </Suspense>

      {/* Footer */}
      <Suspense fallback={<SectionLoader />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}
