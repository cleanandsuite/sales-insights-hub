import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingCard } from '@/components/pricing/PricingCard';
import { CancelSubscriptionDialog } from '@/components/settings/CancelSubscriptionDialog';
import { useSubscription, PRICING_TIERS } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { CreditCard, Calendar, Users, Loader2, XCircle } from 'lucide-react';

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
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleStartCheckout = async (planKey: 'single_user') => {
    setCheckoutLoading(planKey);
    try {
      await startCheckout(planKey, 1);
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

  const handleCancelSubscription = async () => {
    try {
      await openCustomerPortal();
      toast.info('Redirecting to manage your subscription...');
    } catch (error) {
      toast.error('Failed to open subscription management');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTier = plan === 'single_user' ? PRICING_TIERS.single_user : null;

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
                <p className="font-medium">{currentTier?.name || plan}</p>
                <p className="text-sm text-muted-foreground">
                  ${currentTier?.price || 0}/month
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

            <div className="flex flex-wrap gap-3">
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
              <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            </div>
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

          <PricingCard
            name="Enterprise"
            price="custom"
            description="Custom pricing for scaling revenue orgs (10+ seats)"
            features={[
              'Everything in Starter & Pro',
              'Custom business-specific AI models',
              '5 Elite AI Coaching Systems',
              'Full-Transparency Manager Dashboard',
              'Gamified Performance Ranking',
              'SSO & compliance controls',
              'Dedicated Account Specialist',
              'Flexible seat scaling',
            ]}
            isCurrentPlan={plan === 'team'}
            isPopular
            onSelect={() => {
              window.location.href = 'mailto:sales@sellsig.com?subject=Enterprise%20Plan%20Inquiry';
            }}
            loading={false}
            disabled={false}
            ctaText="Schedule a Call"
          />
        </div>
      </div>

      {/* Cancel Membership — only show for subscribed users */}
      {subscribed && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCancelDialogOpen(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Cancel Membership
          </Button>
        </div>
      )}

      {/* Cancel Subscription Dialog */}
      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
}
