import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  const handleStartTrialClick = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader onStartTrialClick={handleStartTrialClick} />

      <main>
        <HeroSection onStartTrialClick={handleStartTrialClick} />
        <ProblemSection />
        <FeaturesSection />
        <ComparisonSection />
        <SocialProofSection />
        <TestimonialsSection />
        <CTASection onStartTrialClick={handleStartTrialClick} />
      </main>

      <LandingFooter />
    </div>
  );
}
