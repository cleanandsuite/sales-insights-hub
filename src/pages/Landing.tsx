import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Landing() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleStartTrialClick = async (plan: 'single_user' | 'team' = 'single_user') => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-trial-checkout', {
        body: { plan },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      // Same-tab redirect so the success_url brings the user back properly
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Could not start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--cin-bg))] cinematic-noise overflow-x-hidden">
      <CinematicNavbar onStartTrialClick={() => handleStartTrialClick('single_user')} />

      <main>
        <CinematicHero onStartTrialClick={() => handleStartTrialClick('single_user')} />
        <CinematicLogoBanner />
        <CinematicFeatures />
        <CinematicPhilosophy />
        <CinematicProtocol />
        <CinematicPhoneLine />
        <CinematicTestimonials />
        <CinematicPricing onStartTrialClick={handleStartTrialClick} />
        <CinematicFAQ />
        <CinematicBuiltBySales />
        <CinematicFinalCTA onStartTrialClick={() => handleStartTrialClick('single_user')} />
      </main>

      <CinematicFooter />
    </div>
  );
}
