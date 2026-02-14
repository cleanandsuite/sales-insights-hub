import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import new Hero Section (Week 1 Redesign)
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
    <div className="min-h-screen bg-[#0F172A]">
      {/* Week 1 Redesign - New Hero */}
      <HeroSection 
        onStartTrialClick={handleStartTrialClick}
        onWatchDemoClick={handleWatchDemoClick}
      />
    </div>
  );
}
