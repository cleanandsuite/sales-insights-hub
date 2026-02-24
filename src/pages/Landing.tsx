import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { LogoBarSection } from '@/components/landing/LogoBarSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PhoneLineSection } from '@/components/landing/PhoneLineSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BuiltBySalesSection } from '@/components/landing/BuiltBySalesSection';

export default function Landing() {
  const handleStartTrialClick = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-jakarta landing-grid-bg overflow-x-hidden">
      <LandingHeader onStartTrialClick={handleStartTrialClick} />

      <main>
        <HeroSection onStartTrialClick={handleStartTrialClick} />
        <LogoBarSection />
        <StatsSection />
        <PlatformSection />
        <FeaturesSection />
        <PhoneLineSection onStartTrialClick={handleStartTrialClick} />
        <SocialProofSection />
        <PricingSection />
        <FAQSection />
        <BuiltBySalesSection />
        <CTASection onStartTrialClick={handleStartTrialClick} />
      </main>

      <LandingFooter />
    </div>
  );
}
