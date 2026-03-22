import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COUPON_ID = 'tOgDmJNp';

const FEATURES = [
  '1,500 call minutes/month (+1,000 bonus)',
  'Dedicated US business phone number',
  'Unlimited AI call scripts',
  'Call recording & transcription',
  'Basic post-call scoring',
  'Real-time live coaching',
];

export default function CostOfLunch() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-trial-checkout', {
        body: { plan: 'single_user', coupon: COUPON_ID },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      const newWindow = window.open(data.url, '_blank');
      if (!newWindow) {
        window.location.href = data.url;
      }
      setLoading(false);
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        {/* Eyebrow */}
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary border border-primary/30 rounded-full px-4 py-1">
          Limited Promo
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          For the price of lunch,
          <br />
          <span className="text-primary">test your next sales weapon.</span>
        </h1>

        {/* Price block */}
        <div className="flex items-baseline justify-center gap-3">
          <span className="text-5xl font-black text-primary">$10.99</span>
          <span className="text-muted-foreground line-through text-xl">$79</span>
          <span className="text-muted-foreground text-sm">/first month</span>
        </div>

        {/* Features */}
        <ul className="text-left mx-auto max-w-sm space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full max-w-sm text-lg font-bold h-14 gap-2"
        >
          {loading ? 'Redirecting…' : 'Try It for $10.99'}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </Button>

        {/* Fine print */}
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Then $79.99/mo after the first month. Cancel anytime. No contracts. Full Starter plan access from day one.
        </p>
      </div>
    </div>
  );
}
