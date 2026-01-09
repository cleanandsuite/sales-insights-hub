import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CreditCard, Mail } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

export default function AccountBlocked() {
  const { openCustomerPortal, checkSubscription, loading } = useSubscription();
  const { signOut, user } = useAuth();

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error("Error opening customer portal:", error);
    }
  };

  const handleRefresh = async () => {
    await checkSubscription();
    // Reload to re-check status
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription className="text-base">
            Your subscription has expired or payment failed. Please update your payment method to restore access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Account:</strong> {user?.email}
            </p>
            <p>
              Your data is safe. Once you reactivate your subscription, you'll have full access to your recordings, leads, and coaching insights.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleManageSubscription} 
              className="w-full"
              disabled={loading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>

            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="w-full"
              disabled={loading}
            >
              I've Updated My Payment - Refresh
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Mail className="h-4 w-4" />
              <span>Need help? Contact support@sellsig.com</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={signOut}
              className="w-full text-muted-foreground"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
