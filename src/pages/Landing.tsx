import { LandingHeader } from '@/components/landing/LandingHeader';
import { CopilotHero } from '@/components/landing/CopilotHero';
import { LogoBar } from '@/components/landing/LogoBar';
import { WhySellSig } from '@/components/landing/WhySellSig';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { TestimonialBanner } from '@/components/landing/TestimonialBanner';
import { ResourceCards } from '@/components/landing/ResourceCards';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  const handleStartTrialClick = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <LandingHeader onStartTrialClick={handleStartTrialClick} />

      <main>
        <CopilotHero onStartTrialClick={handleStartTrialClick} />
        <LogoBar />
        <WhySellSig />
        <FeatureShowcase onStartTrialClick={handleStartTrialClick} />
        <TestimonialBanner />
        <ResourceCards />
        <FinalCTA onStartTrialClick={handleStartTrialClick} />
      </main>

      <LandingFooter />
    </div>
  );
}
