import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage } from '@/lib/errorSanitizer';
import { supabase } from '@/integrations/supabase/client';
import { PRICING_TIERS } from '@/hooks/useSubscription';
import sellsigLogo from '@/assets/sellsig-logo.png';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

export default function Auth() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const startTrial = searchParams.get('trial') === 'true';
  const planKey = searchParams.get('plan') as 'single_user' | 'team' || 'single_user';
  useEffect(() => {
    const handleTrialRedirect = async () => {
      if (user && startTrial && !redirectingToCheckout) {
        setRedirectingToCheckout(true);
        try {
          const {
            data: session
          } = await supabase.auth.getSession();
          if (!session.session) return;
          const priceId = PRICING_TIERS[planKey].priceId;
          const {
            data,
            error
          } = await supabase.functions.invoke('create-checkout', {
            body: {
              priceId,
              quantity: 1,
              trial: true
            },
            headers: {
              Authorization: `Bearer ${session.session.access_token}`
            }
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
            variant: 'destructive'
          });
          setRedirectingToCheckout(false);
        }
      }
    };
    handleTrialRedirect();
  }, [user, startTrial, planKey, redirectingToCheckout, toast]);
  if (authLoading || redirectingToCheckout) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          {redirectingToCheckout && <p className="text-muted-foreground">Setting up your 14-day trial...</p>}
        </div>
      </div>;
  }
  if (user && !startTrial) {
    return <Navigate to="/dashboard" replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: 'Sign in failed',
          description: getSafeErrorMessage(error, 'Invalid email or password'),
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return <div className="flex min-h-screen bg-background">
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-muted/30">
        <div className="relative z-10 text-center px-12 animate-fade-in">
          <Link to="/" className="flex items-center justify-center gap-4 mb-8 hover:opacity-80 transition-opacity">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden shadow-md">
              <img src={sellsigLogo} alt="SellSig" className="h-10 w-10 object-contain" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold mb-4 gradient-text">SellSig</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            AI-powered sales coaching to transform your calls into closed deals.
          </p>
          {startTrial && <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-primary font-medium">🎉 14-Day Free Trial</p>
              <p className="text-sm text-muted-foreground mt-1">
                No charge until day 15. Cancel anytime.
              </p>
            </div>}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="text-center lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 overflow-hidden">
                <img src={sellsigLogo} alt="SellSig" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-2xl font-bold text-foreground">SellSig</span>
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {startTrial ? 'Sign In to Start Your Trial' : 'Welcome back'}
            </h2>
            <p className="text-muted-foreground">
              {startTrial ? 'Sign in to activate your 14-day free trial' : 'Enter your credentials to access your dashboard'}
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} required className="pl-10 bg-background border-border focus:border-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <button type="button" onClick={() => setForgotPasswordOpen(true)} className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} required minLength={6} className="pl-10 pr-10 bg-background border-border focus:border-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full font-semibold shadow-md">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {startTrial ? 'Sign In & Start Trial' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Start your free trial
            </Link>
          </div>

          {startTrial && <p className="text-xs text-center text-muted-foreground">
              By starting a trial, you agree to provide payment details. 
              You won't be charged until day 15.
            </p>}
        </div>
      </div>
    </div>;
}