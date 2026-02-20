import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Eye, EyeOff, Crown, Sparkles, Shield } from 'lucide-react';
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
          const { data: session } = await supabase.auth.getSession();
          if (!session.session) return;
          const priceId = PRICING_TIERS[planKey].priceId;
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { priceId, quantity: 1, trial: true },
            headers: { Authorization: `Bearer ${session.session.access_token}` }
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050510]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          {redirectingToCheckout && (
            <p className="text-cyan-300/70">Preparing your exclusive access...</p>
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
          title: 'Access Denied',
          description: getSafeErrorMessage(error, 'Invalid credentials'),
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050510] overflow-hidden relative">
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />

      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial gradient glow */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Left Side - Prestige Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
        <div className="relative z-10 text-center px-12 max-w-lg flex flex-col items-center">
          {/* Logo */}
          <Link to="/" className="block mb-8 hover:opacity-90 transition-opacity">
            <SellSigLogo size="lg" variant="light" showTagline={false} linkTo="" />
          </Link>

          {/* Exclusive Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6 backdrop-blur-sm">
            <Crown className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide uppercase">Members Only</span>
          </div>

          {/* Prestige Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Welcome to the
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Inner Circle
            </span>
          </h1>

          {/* Exclusive Value Props */}
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            You've earned your place among the elite. Access the intelligence that separates closers from the competition.
          </p>

          {/* Authority Markers */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Elite AI Coaching</p>
                <p className="text-sm text-slate-500">Real-time insights that close deals</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Exclusive Intelligence</p>
                <p className="text-sm text-slate-500">Insights your competitors will never see</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Top 1% Performance</p>
                <p className="text-sm text-slate-500">Join the sales elite who never lose</p>
              </div>
            </div>
          </div>

          {startTrial && (
            <div className="mt-10 p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm">
              <p className="text-cyan-300 font-semibold flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                14-Day Elite Access
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Experience the full power. No charge until day 15.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Crown className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300 uppercase tracking-wide">Members Only</span>
            </div>
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <SellSigLogo size="md" variant="light" showTagline={false} linkTo="" />
            </Link>
          </div>

          {/* Form Card */}
          <div className="relative">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative bg-[#0a0a1a]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 shadow-2xl">
              <div className="space-y-2 text-center mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {startTrial ? 'Claim Your Access' : 'Enter the Circle'}
                </h2>
                <p className="text-slate-400">
                  {startTrial 
                    ? 'Sign in to activate your elite membership' 
                    : 'Your exclusive dashboard awaits'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="elite@yourcompany.com" 
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      required 
                      className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                    <button 
                      type="button" 
                      onClick={() => setForgotPasswordOpen(true)} 
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={e => setFormData({ ...formData, password: e.target.value })} 
                      required 
                      minLength={6} 
                      className="pl-10 pr-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying Access...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      {startTrial ? 'Activate Membership' : 'Access Dashboard'}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Not a member yet?{' '}
                  <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    Join the Elite
                  </Link>
                </p>
              </div>

              {startTrial && (
                <p className="mt-6 text-xs text-center text-slate-500">
                  By activating, you agree to provide payment details. 
                  <br />You won't be charged until day 15.
                </p>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-slate-600 text-xs">
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
