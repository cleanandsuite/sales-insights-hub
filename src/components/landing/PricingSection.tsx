import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePricingAvailability } from '@/hooks/usePricingAvailability';
import { useExperiment } from '@/hooks/useExperiment';
import { useExperimentTracking } from '@/hooks/useExperimentTracking';

export function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { availability, loading: availabilityLoading } = usePricingAvailability();
  const { assignment } = useExperiment('pricing_cta_test');
  const { trackClick } = useExperimentTracking();

  const handleStartTrial = async (planKey: string) => {
    // Track A/B test click if in experiment
    if (assignment) {
      trackClick(assignment.experimentId, assignment.variantId, `pricing_cta_${planKey}`);
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-trial-checkout', {
        body: { plan: planKey },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleJoinWaitlist = async (planKey: string) => {
    toast.info('You\'ve been added to our waitlist! We\'ll notify you when spots open up.');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const singleUserAvailable = availability?.singleUser.available ?? true;

  const pricingTiers = [
    {
      name: 'Single User',
      headline: 'Perfect for individual sales reps',
      priceDisplay: '$0 for 14 Days',
      afterTrialText: singleUserAvailable 
        ? `Then $29/mo Grandfathered`
        : `Then $${availability?.singleUser.regularPrice ?? 49}/mo`,
      regularPriceNote: singleUserAvailable ? '(Reg. $49/mo)' : null,
      urgencyBadge: singleUserAvailable ? `Limited: First 100 Spots—Ends ${formatDate(availability?.deadline ?? new Date('2026-01-31'))}!` : 'Waitlist Open',
      spotsRemaining: availability?.singleUser.spotsRemaining ?? 100,
      features: [
        'No Setup Fees—Ever',
        'Unlimited call recordings',
        'AI transcription & analysis',
        'Lead intelligence',
        'Deal coaching insights',
        'Email support',
      ],
      popular: false,
      planKey: 'single_user',
      available: singleUserAvailable,
      comingSoon: false,
    },
    {
      name: 'Enterprise',
      headline: 'For scaling sales organizations',
      priceDisplay: '$99/mo',
      afterTrialText: 'Per user',
      regularPriceNote: null,
      urgencyBadge: 'Coming Soon',
      spotsRemaining: 0,
      features: [
        'Everything in Single User',
        'Team performance analytics',
        'Manager dashboard',
        'Lead assignment & routing',
        'Custom playbooks',
        'Priority support',
      ],
      popular: true,
      planKey: 'enterprise',
      available: false,
      comingSoon: true,
    },
  ];

  if (availabilityLoading) {
    return (
      <section className="py-24 bg-background" id="pricing">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-pricing-gradient overflow-hidden" id="pricing">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Start with a 14-day free trial. No charge until you see the value.
          </p>
          {!availability?.isDeadlinePassed && (
            <p className="text-base text-destructive font-bold mt-4">
              ⏰ Limited Time: First 100 Users or Until {formatDate(availability?.deadline ?? new Date('2026-01-31'))}, Whichever Comes First—Spots Filling Fast!
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`card-enterprise relative rounded-2xl ${tier.popular ? 'border-2 border-primary shadow-xl' : 'shadow-lg'}`}
            >
              {/* Urgency Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge 
                  variant={tier.available ? "destructive" : "secondary"}
                  className="font-bold whitespace-nowrap px-4 py-1.5 text-sm"
                >
                  {tier.urgencyBadge}
                </Badge>
              </div>

              <CardHeader className="pb-4 pt-10">
                <CardTitle className="text-2xl font-bold text-foreground">{tier.name}</CardTitle>
                <CardDescription className="text-base">{tier.headline}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-black text-foreground">{tier.priceDisplay}</span>
                    {tier.regularPriceNote && (
                      <span className="text-base text-muted-foreground line-through font-medium">{tier.regularPriceNote}</span>
                    )}
                  </div>
                  <p className="text-base text-muted-foreground mt-2 font-medium">
                    {tier.afterTrialText}
                  </p>
                  {tier.available && tier.spotsRemaining <= 20 && (
                    <p className="text-sm text-destructive font-bold mt-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Only {tier.spotsRemaining} spots remaining!
                    </p>
                  )}
                </div>

                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-base text-foreground font-medium">
                      <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-8">
                <Button
                  className={`w-full font-bold text-lg py-7 rounded-xl ${tier.available ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl' : ''}`}
                  variant={tier.available ? 'default' : 'outline'}
                  onClick={() => tier.available ? handleStartTrial(tier.planKey) : handleJoinWaitlist(tier.planKey)}
                  disabled={loadingPlan !== null || tier.comingSoon}
                >
                  {loadingPlan === tier.planKey ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : tier.comingSoon ? (
                    'Coming Soon'
                  ) : tier.available ? (
                    'Start Free 14-Day Trial Now'
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-base text-muted-foreground mt-10 font-medium">
          Card required upfront — no charge until day 15. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
