import { CinematicNavbar } from '@/components/landing/CinematicNavbar';
import { CinematicHero } from '@/components/landing/CinematicHero';
import { CinematicLogoBanner } from '@/components/landing/CinematicLogoBanner';
import { CinematicFeatures } from '@/components/landing/CinematicFeatures';
import { CinematicPhilosophy } from '@/components/landing/CinematicPhilosophy';
import { CinematicProtocol } from '@/components/landing/CinematicProtocol';
import { CinematicPhoneLine } from '@/components/landing/CinematicPhoneLine';
import { CinematicTestimonials } from '@/components/landing/CinematicTestimonials';
import { CinematicPricing } from '@/components/landing/CinematicPricing';
import { CinematicFAQ } from '@/components/landing/CinematicFAQ';
import { CinematicBuiltBySales } from '@/components/landing/CinematicBuiltBySales';
import { CinematicFinalCTA } from '@/components/landing/CinematicFinalCTA';
import { CinematicFooter } from '@/components/landing/CinematicFooter';

export default function Landing() {
  const handleStartTrialClick = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--cin-bg))] cinematic-noise overflow-x-hidden">
      <CinematicNavbar onStartTrialClick={handleStartTrialClick} />

      <main>
        <CinematicHero onStartTrialClick={handleStartTrialClick} />
        <CinematicLogoBanner />
        <CinematicFeatures />
        <CinematicPhilosophy />
        <CinematicProtocol />
        <CinematicPhoneLine />
        <CinematicTestimonials />
        <CinematicPricing onStartTrialClick={handleStartTrialClick} />
        <CinematicFAQ />
        <CinematicBuiltBySales />
        <CinematicFinalCTA onStartTrialClick={handleStartTrialClick} />
      </main>

      <CinematicFooter />
    </div>
  );
}
