import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage } from '@/lib/errorSanitizer';
import { supabase } from '@/integrations/supabase/client';
import { PRICING_TIERS } from '@/hooks/useSubscription';
import gritcallIcon from '@/assets/gritcall-icon.png';

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const startTrial = searchParams.get('trial') === 'true';
  const planKey = (searchParams.get('plan') as 'single_user' | 'team') || 'single_user';

  // Handle post-signup redirect to Stripe checkout with trial
  useEffect(() => {
    const handleTrialRedirect = async () => {
      if (user && startTrial && !redirectingToCheckout) {
        setRedirectingToCheckout(true);
        try {
          const { data: session } = await supabase.auth.getSession();
          if (!session.session) return;

          const priceId = PRICING_TIERS[planKey].priceId;
          
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { priceId, quantity: 1, trial: true },
            headers: {
              Authorization: `Bearer ${session.session.access_token}`,
            },
          });

          if (error) throw error;
          if (data.url) {
            window.location.href = data.url;
          }
        } catch (error) {
          console.error('Trial checkout error:', error);
          toast({
            title: 'Checkout error',
            description: 'Could not start trial. Please try again from settings.',
            variant: 'destructive',
          });
          setRedirectingToCheckout(false);
        }
      }
    };

    handleTrialRedirect();
  }, [user, startTrial, planKey, redirectingToCheckout, toast]);

  if (authLoading || redirectingToCheckout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          {redirectingToCheckout && (
            <p className="text-muted-foreground">Setting up your 14-day trial...</p>
          )}
        </div>
      </div>
    );
  }

  if (user && !startTrial) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: getSafeErrorMessage(error, 'Invalid email or password'),
            variant: 'destructive',
          });
        }
      } else {
        if (!formData.fullName.trim()) {
          toast({
            title: 'Name required',
            description: 'Please enter your full name',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: getSafeErrorMessage(error, 'Unable to create account'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: startTrial 
              ? 'Redirecting to start your 14-day trial...'
              : 'You can now sign in with your credentials.',
          });
          if (!startTrial) {
            setIsLogin(true);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 glow-effect overflow-hidden">
              <img src={gritcallIcon} alt="GritCall" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">GritCall</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            AI-powered sales coaching to transform your calls into closed deals.
          </p>
          {startTrial && (
            <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-primary font-medium">🎉 14-Day Free Trial</p>
              <p className="text-sm text-muted-foreground mt-1">
                No charge until day 15. Cancel anytime.
              </p>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="text-center lg:hidden mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 overflow-hidden">
                <img src={gritcallIcon} alt="GritCall" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-2xl font-bold">GritCall</span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {startTrial 
                ? 'Start Your 14-Day Trial' 
                : isLogin 
                  ? 'Welcome back' 
                  : 'Create an account'}
            </h2>
            <p className="text-muted-foreground">
              {startTrial
                ? 'No charge until value proven—cancel anytime'
                : isLogin
                  ? 'Enter your credentials to access your dashboard'
                  : 'Start analyzing your sales calls today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(!isLogin || startTrial) && !isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 bg-input border-border focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 bg-input border-border focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10 bg-input border-border focus:border-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {startTrial 
                ? (isLogin ? 'Sign In & Start Trial' : 'Create Account & Start Trial')
                : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {startTrial && (
            <p className="text-xs text-center text-muted-foreground">
              By starting a trial, you agree to provide payment details. 
              You won't be charged until day 15.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
