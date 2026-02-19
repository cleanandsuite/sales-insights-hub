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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          {redirectingToCheckout && (
            <p className="text-gray-500 text-sm">Preparing your account...</p>
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
    <div className="flex min-h-screen bg-white overflow-hidden">
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />

      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-blue-600 text-white px-12 py-10 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-800/40 to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <div className="[&_span]:!text-white [&_.text-blue-500]:!text-blue-200 [&_.text-blue-400]:!text-blue-200">
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
            <span className="ml-2 text-sm font-medium text-blue-100">4.8/5 from 127 teams</span>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight mb-4">
            Close 30% more deals with real-time AI coaching
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Join 100+ sales teams that use SellSig to detect buyer signals live — not after the deal's already cold.
          </p>

          <ul className="space-y-4">
            {valuePropItems.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-white">{text}</span>
              </li>
            ))}
          </ul>

          {startTrial && (
            <div className="mt-10 p-5 rounded-xl bg-white/10 border border-white/20">
              <p className="font-semibold text-white flex items-center gap-2">
                🎉 14-Day Free Trial
              </p>
              <p className="text-sm text-blue-100 mt-1">
                Full access, no credit card required. Cancel anytime.
              </p>
            </div>
          )}
        </div>

        {/* Trust footer */}
        <div className="relative z-10 flex items-center gap-6 text-blue-200 text-xs">
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
              <div className="inline-block [&_span]:!text-gray-900 [&_.text-white]:!text-gray-900 [&_.text-blue-500]:!text-blue-600 [&_.text-blue-400]:!text-blue-600">
                <SellSigLogo variant="default" size="md" showTagline={false} linkTo="" />
              </div>
            </Link>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {startTrial ? 'Activate your free trial' : 'Welcome back'}
            </h2>
            <p className="text-gray-500 text-sm">
              {startTrial
                ? 'Sign in to start your 14-day free trial'
                : 'Sign in to your SellSig account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 h-11 border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10 pr-10 h-11 border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
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

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Get started free
            </Link>
          </p>

          {startTrial && (
            <p className="mt-4 text-xs text-center text-gray-400">
              By continuing you agree to our Terms. No charge until day 15.
            </p>
          )}

          {/* Mobile trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-400 text-xs lg:hidden">
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
