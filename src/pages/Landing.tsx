import { CinematicNavbar } from '@/components/landing/CinematicNavbar';
import { CinematicHero } from '@/components/landing/CinematicHero';
import { CinematicFeatures } from '@/components/landing/CinematicFeatures';
import { CinematicPhilosophy } from '@/components/landing/CinematicPhilosophy';
import { CinematicProtocol } from '@/components/landing/CinematicProtocol';
import { CinematicPricing } from '@/components/landing/CinematicPricing';
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
        <CinematicFeatures />
        <CinematicPhilosophy />
        <CinematicProtocol />
        <CinematicPricing onStartTrialClick={handleStartTrialClick} />
      </main>

      <CinematicFooter />
    </div>
  );
}