import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import header with login button
import { LandingHeader } from '@/components/landing/LandingHeader';

// Import hero section
import { HeroSection } from '@/components/landing/HeroSection';

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
    <div className="min-h-screen bg-slate-900">
      {/* Header with Login */}
      <LandingHeader onStartTrialClick={handleStartTrialClick} />

      {/* Hero Section with Phone Interface */}
      <HeroSection 
        onStartTrialClick={handleStartTrialClick}
        onWatchDemoClick={handleWatchDemoClick}
      />
    </div>
  );
}
