import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, TrendingUp, Target, Shield, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage } from '@/lib/errorSanitizer';
import { supabase } from '@/integrations/supabase/client';
import { PRICING_TIERS } from '@/hooks/useSubscription';
import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

export default function Auth() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const startTrial = searchParams.get('trial') === 'true';
  const planKey = searchParams.get('plan') as 'single_user' | 'team' || 'single_user';

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
            headers: { Authorization: `Bearer ${session.session.access_token}` }
          });
          if (error) throw error;
          if (data.url) window.location.href = data.url;
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
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'hsl(215 56% 10%)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(168,76%,40%)] mx-auto mb-4" />
          {redirectingToCheckout && (
            <p className="text-white/50 text-sm">Preparing your account...</p>
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
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: 'Sign in failed',
          description: getSafeErrorMessage(error, 'Invalid credentials'),
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const valuePropItems = [
    { icon: TrendingUp, text: 'Real-time buyer signal detection' },
    { icon: CheckCircle2, text: 'Live AI coaching during every call' },
    { icon: Target, text: 'Personalized playbooks that improve over time' },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: 'hsl(215 56% 10%)' }}>
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />

      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col px-12 py-10 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, hsl(215 56% 12%) 0%, hsl(215 56% 8%) 100%)' }}>
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        
        {/* Teal glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'hsl(168 76% 40% / 0.08)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'hsl(263 83% 57% / 0.06)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <div className="[&_span]:!text-white [&_.text-blue-500]:!text-[hsl(168,76%,40%)] [&_.text-blue-400]:!text-[hsl(168,76%,40%)]">
              <SellSigLogo variant="light" size="md" showTagline={false} linkTo="" />
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-amber-300 text-amber-300" />
            ))}
            <span className="ml-2 text-sm font-medium text-white/50">4.8/5 from 127 teams</span>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight mb-4 text-white">
            Close 30% more deals with real-time AI coaching
          </h1>
          <p className="text-white/40 text-lg leading-relaxed mb-10">
            Join 100+ sales teams that use SellSig to detect buyer signals live — not after the deal's already cold.
          </p>

          <ul className="space-y-4">
            {valuePropItems.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(168 76% 40% / 0.12)', border: '1px solid hsl(168 76% 40% / 0.2)' }}>
                  <Icon className="h-4 w-4 text-[hsl(168,76%,40%)]" />
                </div>
                <span className="font-medium text-white/80">{text}</span>
              </li>
            ))}
          </ul>

           {startTrial && (
            <div className="mt-10 p-5 rounded-xl border" style={{ background: 'hsl(168 76% 40% / 0.08)', borderColor: 'hsl(168 76% 40% / 0.2)' }}>
              <p className="font-semibold text-white flex items-center gap-2">
                🚀 Get Started
              </p>
              <p className="text-sm text-white/40 mt-1">
                Sign in to activate your subscription. Cancel anytime.
              </p>
            </div>
          )}
        </div>

        {/* Trust footer */}
        <div className="relative z-10 flex items-center gap-6 text-white/30 text-xs">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>256-bit Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>SOC 2 Compliant</span>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center lg:hidden mb-8">
            <Link to="/">
              <div className="inline-block [&_span]:!text-white [&_.text-blue-500]:!text-[hsl(168,76%,40%)] [&_.text-blue-400]:!text-[hsl(168,76%,40%)]">
                <SellSigLogo variant="light" size="md" showTagline={false} linkTo="" />
              </div>
            </Link>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {startTrial ? 'Get started' : 'Welcome back'}
            </h2>
            <p className="text-white/40 text-sm">
              {startTrial
                ? 'Sign in to activate your plan'
                : 'Sign in to your SellSig account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-white/60">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[hsl(168,76%,40%)] focus:ring-[hsl(168,76%,40%)]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-white/60">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-xs text-[hsl(168,76%,40%)] hover:text-[hsl(168,76%,50%)] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10 pr-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[hsl(168,76%,40%)] focus:ring-[hsl(168,76%,40%)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold rounded-lg shadow-sm transition-all text-[hsl(215,56%,10%)]"
              style={{ background: 'hsl(168 76% 40%)', }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : startTrial ? (
                'Activate Free Trial'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/" className="text-[hsl(168,76%,40%)] hover:text-[hsl(168,76%,50%)] font-semibold transition-colors">
              Get started free
            </Link>
          </p>

          {startTrial && (
            <p className="mt-4 text-xs text-center text-white/25">
              By continuing you agree to our Terms. No charge until day 15.
            </p>
          )}

          {/* Mobile trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-white/30 text-xs lg:hidden">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
