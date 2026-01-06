import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PricingCard } from '@/components/pricing/PricingCard';
import { useSubscription, PRICING_TIERS } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { CreditCard, Calendar, Users, Loader2 } from 'lucide-react';

export function BillingTab() {
  const { 
    subscribed, 
    plan, 
    subscriptionEnd, 
    quantity,
    loading,
    startCheckout, 
    openCustomerPortal,
    checkSubscription
  } = useSubscription();
  
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [teamSize, setTeamSize] = useState(1);

  const handleStartCheckout = async (planKey: 'single_user' | 'team') => {
    setCheckoutLoading(planKey);
    try {
      await startCheckout(planKey, planKey === 'team' ? teamSize : 1);
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error('Failed to open customer portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      {subscribed && plan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{PRICING_TIERS[plan]?.name || plan}</p>
                <p className="text-sm text-muted-foreground">
                  ${PRICING_TIERS[plan]?.price || 0}/month
                  {quantity > 1 && ` × ${quantity} users`}
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            {subscriptionEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Next billing: {new Date(subscriptionEnd).toLocaleDateString()}
              </div>
            )}

            {quantity > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {quantity} team members
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={handleOpenPortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {subscribed ? 'Change Plan' : 'Choose a Plan'}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <PricingCard
            name={PRICING_TIERS.single_user.name}
            price={PRICING_TIERS.single_user.price}
            description="Perfect for individual sales reps"
            features={PRICING_TIERS.single_user.features}
            isCurrentPlan={plan === 'single_user'}
            onSelect={() => handleStartCheckout('single_user')}
            loading={checkoutLoading === 'single_user'}
            disabled={!!checkoutLoading}
            ctaText={subscribed ? 'Switch to Single' : 'Start Free Trial'}
          />

          <div className="space-y-4">
            <PricingCard
              name={PRICING_TIERS.team.name}
              price={PRICING_TIERS.team.price}
              description="For sales teams up to 10 users (per user)"
              features={PRICING_TIERS.team.features}
              isCurrentPlan={plan === 'team'}
              isPopular
              onSelect={() => handleStartCheckout('team')}
              loading={checkoutLoading === 'team'}
              disabled={!!checkoutLoading}
              ctaText={subscribed ? 'Switch to Team' : 'Start Free Trial'}
            />

            {plan !== 'team' && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <Label htmlFor="teamSize" className="text-sm">Team Size</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="teamSize"
                    type="number"
                    min={1}
                    max={10}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    users × ${PRICING_TIERS.team.price} = <strong>${teamSize * PRICING_TIERS.team.price}/mo</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Status */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => checkSubscription()}
          className="text-muted-foreground"
        >
          Refresh subscription status
        </Button>
      </div>
    </div>
  );
}
