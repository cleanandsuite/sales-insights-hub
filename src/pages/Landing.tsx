import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import all new sections (Week 2 Redesign - Team's Design)
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Stripe payment link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu6oG1zi7O7euubi69k400';

export default function Landing() {
  const handleClaimRedemption = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
  };

  const handleStartTrialClick = () => {
    handleClaimRedemption();
  };

  const handleWatchDemoClick = () => {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection 
        onStartTrialClick={handleStartTrialClick}
        onWatchDemoClick={handleWatchDemoClick}
      />

      {/* Problem Section - Pain → Solution */}
      <ProblemSection />

      {/* How It Works - 3 Step Cards */}
      <HowItWorksSection />

      {/* Features Section - 2x2 Grid */}
      <FeaturesSection />

      {/* Social Proof - Logos + Testimonials */}
      <SocialProofSection />

      {/* Pricing Section - 3-Tier */}
      <PricingSection onStartTrialClick={handleStartTrialClick} />

      {/* Final CTA Section */}
      <FinalCTASection onStartTrialClick={handleStartTrialClick} />
    </div>
  );
}
