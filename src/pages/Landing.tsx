import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

// Stripe payment link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu6oG1zi7O7euubi69k400';

export default function Landing() {
  const handleStartTrialClick = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
  };

  const handleWatchDemoClick = () => {
    // Scroll to features section as demo placeholder
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <LandingHeader onStartTrialClick={handleStartTrialClick} />

      {/* ── 1. Hero: Positioning + Product Preview ── */}
      <HeroSection
        onStartTrialClick={handleStartTrialClick}
        onWatchDemoClick={handleWatchDemoClick}
      />

      {/* ── 2. Problem: Surface the pain ── */}
      <ProblemSection />

      {/* ── 3. Solution: Three pillars of the platform ── */}
      <SolutionSection onStartTrialClick={handleStartTrialClick} />

      {/* ── 4. Features: Detailed capabilities grid ── */}
      <FeaturesSection />

      {/* ── 5. Social Proof: Testimonials + Security ── */}
      <TestimonialsSection />

      {/* ── 6. Pricing: Premium tier structure ── */}
      <PricingSection onStartTrialClick={handleStartTrialClick} />

      {/* ── 7. FAQ: Objection handling ── */}
      <FAQSection />

      {/* ── 8. Final CTA: Executive-level close ── */}
      <FinalCTASection onStartTrialClick={handleStartTrialClick} />

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
