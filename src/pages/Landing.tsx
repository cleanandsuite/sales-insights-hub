import { useState } from 'react';

// Import professional landing components
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { ROISection } from '@/components/landing/ROISection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

// Demo video modal
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';

export default function Landing() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleStartTrialClick = () => {
    window.location.href = '/signup';
  };

  const handleWatchDemoClick = () => {
    setIsDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <LandingHeader onStartTrialClick={handleStartTrialClick} />

      <main>
        {/* Hero Section - Professional headline from Design Brain */}
        <HeroSection 
          onStartTrialClick={handleStartTrialClick}
          onWatchDemoClick={handleWatchDemoClick}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* ROI Section */}
        <ROISection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Demo Video Modal */}
      <DemoVideoModal 
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
