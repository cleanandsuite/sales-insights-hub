import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import confession sections
import { ConfessionHeader } from '@/components/landing/confession/ConfessionHeader';
import { HeroConfession } from '@/components/landing/confession/HeroConfession';
import { ConfessionSection } from '@/components/landing/confession/ConfessionSection';
import { ConductorSection } from '@/components/landing/confession/ConductorSection';
import { RedemptionSection } from '@/components/landing/confession/RedemptionSection';
import { CloseSequence } from '@/components/landing/confession/CloseSequence';
import { ConfessionFooter } from '@/components/landing/confession/ConfessionFooter';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Stripe payment link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu6oG1zi7O7euubi69k400';

export default function Landing() {
  const handleClaimRedemption = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
  };

  const handleStartTrialClick = () => {
    // TODO: Connect to signup flow
    handleClaimRedemption();
  };

  const handleWatchDemoClick = () => {
    // TODO: Connect to demo video
    console.log('Watch demo clicked');
  };

  // Initialize GSAP ScrollTrigger on mount
  useEffect(() => {
    ScrollTrigger.refresh();
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fixed Header */}
      <ConfessionHeader onClaimRedemption={handleClaimRedemption} />

      <main>
        {/* 1. Hero / Hook - Redesigned with new copy */}
        <HeroConfession onClaimRedemption={handleClaimRedemption} />

        {/* 2. Confession Section - Emotional surrender */}
        <ConfessionSection />

        {/* 3. Conductor Section - State control */}
        <ConductorSection />

        {/* 4. Redemption Section - Ministry moment */}
        <RedemptionSection />

        {/* 5. Close Sequence - 5-step pressure cascade */}
        <CloseSequence onClaimRedemption={handleClaimRedemption} />
      </main>

      {/* Footer */}
      <ConfessionFooter />
    </div>
  );
}
