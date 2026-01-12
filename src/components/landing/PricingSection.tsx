import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePricingAvailability } from '@/hooks/usePricingAvailability';
import { useExperiment } from '@/hooks/useExperiment';
import { useExperimentTracking } from '@/hooks/useExperimentTracking';

// Countdown timer component
function CountdownTimer({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = deadline.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="flex items-center justify-center gap-2 text-sm font-bold">
      <Clock className="h-4 w-4 text-destructive animate-pulse" />
      <div className="flex gap-1">
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded">{timeLeft.days}d</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded">{timeLeft.hours}h</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded">{timeLeft.minutes}m</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded">{timeLeft.seconds}s</span>
      </div>
    </div>
  );
}

export function PricingSection() {
  const { availability, loading: availabilityLoading } = usePricingAvailability();
  const { assignment, config, isControl } = useExperiment('pricing_cta_test');
  const { trackClick } = useExperimentTracking();

  // Get variant-specific content from experiment config
  const ctaButtonText = (config?.buttonText as string) || 'Start Free 14-Day Trial Now';
  const ctaUrgencyText = (config?.urgencyText as string) || 'Limited: First 100 Spots at This Price';
  const isAnimatedStyle = (config?.buttonStyle as string) === 'animated';

  const handleStartTrial = (planKey: string) => {
    // Track A/B test click if in experiment
    if (assignment) {
      trackClick(assignment.experimentId, assignment.variantId, `pricing_cta_${planKey}`);
    }

    // Use direct Stripe checkout link
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  const handleJoinWaitlist = async (planKey: string) => {
    toast.info('You\'ve been added to our waitlist! We\'ll notify you when spots open up.');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const singleUserAvailable = availability?.singleUser.available ?? true;
  const deadline = availability?.deadline ?? new Date('2026-01-31');

  const pricingTiers = [
    {
      name: 'Single User',
      headline: 'Perfect for individual sales reps',
      priceDisplay: '$0 for 14 Days',
      lockInPrice: '$29/mo Forever',
      afterTrialText: singleUserAvailable 
        ? `Lock in $29/mo — Grandfathered for Life`
        : `Then $${availability?.singleUser.regularPrice ?? 49}/mo`,
      regularPriceNote: singleUserAvailable ? '(Reg. $49/mo — Save 40%)' : null,
      urgencyBadge: singleUserAvailable ? '🔥 LAUNCH SPECIAL' : 'Waitlist Open',
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
      lockInPrice: null,
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
          
          {/* Hybrid Scarcity Banner */}
          {!availability?.isDeadlinePassed && singleUserAvailable && (
            <div className="mt-8 inline-block">
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white px-8 py-4 rounded-xl shadow-lg">
                <p className="text-xl md:text-2xl font-black mb-2">
                  ⏰ First {availability?.singleUser.spotsRemaining ?? 100} Users OR Until {formatDate(deadline)}
                </p>
                <p className="text-base font-medium opacity-90">Whichever Comes First — Spots Filling Fast!</p>
                <div className="mt-3">
                  <CountdownTimer deadline={deadline} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`card-enterprise relative rounded-2xl ${tier.popular ? 'border-2 border-primary shadow-xl' : 'shadow-lg'}`}
            >
              {/* Red Urgency Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge 
                  variant={tier.available ? "destructive" : "secondary"}
                  className={`font-black whitespace-nowrap px-5 py-2 text-sm ${tier.available ? 'animate-pulse bg-red-600 hover:bg-red-700' : ''}`}
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
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl md:text-5xl font-black text-foreground">{tier.priceDisplay}</span>
                    {tier.regularPriceNote && (
                      <span className="text-base text-muted-foreground line-through font-medium">{tier.regularPriceNote}</span>
                    )}
                  </div>
                  
                  {/* Lock-in price highlight */}
                  {tier.lockInPrice && tier.available && (
                    <div className="mt-3 inline-block bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg">
                      <p className="font-bold text-lg">→ Then {tier.lockInPrice}</p>
                    </div>
                  )}
                  
                  <p className="text-base text-muted-foreground mt-2 font-medium">
                    {tier.afterTrialText}
                  </p>
                  
                  {/* Spots remaining with urgency */}
                  {tier.available && tier.spotsRemaining <= 50 && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400 font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 animate-pulse" />
                        Only {tier.spotsRemaining} spots remaining at this price!
                      </p>
                    </div>
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
                  className={`w-full font-bold text-lg py-7 rounded-xl ${
                    tier.available 
                      ? `bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl ${isAnimatedStyle ? 'animate-cta-pulse' : ''}` 
                      : ''
                  }`}
                  variant={tier.available ? 'default' : 'outline'}
                  onClick={() => tier.available ? handleStartTrial(tier.planKey) : handleJoinWaitlist(tier.planKey)}
                  disabled={tier.comingSoon}
                >
                  {tier.comingSoon ? (
                    'Coming Soon'
                  ) : tier.available ? (
                    ctaButtonText
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