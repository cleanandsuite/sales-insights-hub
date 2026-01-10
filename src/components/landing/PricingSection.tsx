import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const pricingTiers = [
  {
    name: 'Single User',
    description: 'Perfect for individual sales reps',
    price: 19,
    afterTrialPrice: 39,
    features: [
      'Unlimited call recordings',
      'AI transcription & analysis',
      'Lead intelligence',
      'Deal coaching insights',
      'Email support',
    ],
    popular: false,
    planKey: 'single_user',
  },
  {
    name: 'Team',
    description: 'For growing sales teams',
    price: 79,
    afterTrialPrice: 99,
    perUser: true,
    features: [
      'Everything in Single User',
      'Team performance analytics',
      'Manager dashboard',
      'Lead assignment & routing',
      'Custom playbooks',
      'Priority support',
    ],
    popular: true,
    planKey: 'team',
  },
];

export function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleStartTrial = async (planKey: string) => {
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

  return (
    <section className="py-20 bg-background" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Start with a 14-day free trial. No charge until you see the value.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`card-enterprise relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-foreground">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">${tier.price}</span>
                    <span className="text-muted-foreground">
                      {tier.perUser ? '/user/mo' : '/mo'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    then ${tier.afterTrialPrice}{tier.perUser ? '/user' : ''}/mo (grandfathered)
                  </p>
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
                  className="w-full font-semibold"
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleStartTrial(tier.planKey)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === tier.planKey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start 14-Day Free Trial'
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
