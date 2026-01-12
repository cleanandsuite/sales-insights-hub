import { useState, useEffect } from 'react';
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
  const enterpriseAvailable = availability?.enterprise.available ?? true;

  const pricingTiers = [
    {
      name: 'Single User',
      headline: 'Perfect for individual sales reps',
      priceDisplay: '$0 for 14 Days',
      afterTrialText: singleUserAvailable 
        ? `Then Lock in $${availability?.singleUser.grandfatheredPrice ?? 29}/mo Forever`
        : `Then $${availability?.singleUser.regularPrice ?? 49}/mo`,
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
    },
    {
      name: 'Enterprise',
      headline: 'For scaling sales organizations',
      priceDisplay: '$0 for 14 Days',
      afterTrialText: enterpriseAvailable 
        ? `Then Lock in $${availability?.enterprise.grandfatheredPrice ?? 79}/user/mo Forever`
        : `Then $${availability?.enterprise.regularPrice ?? 99}/user/mo`,
      urgencyBadge: enterpriseAvailable ? 'Spots Filling Fast!' : 'Waitlist Open',
      spotsRemaining: availability?.enterprise.spotsRemaining ?? 100,
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
      available: enterpriseAvailable,
    },
  ];

  if (availabilityLoading) {
    return (
      <section className="py-20 bg-background" id="pricing">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Start with a 14-day free trial. No charge until you see the value.
          </p>
          {!availability?.isDeadlinePassed && (
            <p className="text-sm text-destructive font-medium mt-2">
              ⏰ Limited Time: First 100 Users or Until {formatDate(availability?.deadline ?? new Date('2026-01-31'))}, Whichever Comes First—Spots Filling Fast!
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`card-enterprise relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {/* Urgency Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge 
                  variant={tier.available ? "destructive" : "secondary"}
                  className="font-semibold whitespace-nowrap"
                >
                  {tier.urgencyBadge}
                </Badge>
              </div>

              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl text-foreground">{tier.name}</CardTitle>
                <CardDescription>{tier.headline}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{tier.priceDisplay}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tier.afterTrialText}
                  </p>
                  {tier.available && tier.spotsRemaining <= 20 && (
                    <p className="text-xs text-destructive font-medium mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Only {tier.spotsRemaining} spots remaining!
                    </p>
                  )}
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full font-semibold ${tier.available ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
                  variant={tier.available ? 'default' : 'outline'}
                  onClick={() => tier.available ? handleStartTrial(tier.planKey) : handleJoinWaitlist(tier.planKey)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === tier.planKey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
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

        <p className="text-center text-sm text-muted-foreground mt-8">
          Card required upfront — no charge until day 15. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
