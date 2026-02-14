import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validatePasswordStrength } from '@/lib/secureApiClient';

export default function PaymentComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id') || '';
  const magicLinkSentParam = searchParams.get('magic_link_sent') === 'true';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const magicLinkCheckedRef = useRef(false);

  const [emailFromParams, setEmailFromParams] = useState(() => searchParams.get('email') || '');

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  });

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();

    // Listen for auth state changes (magic link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Resolve email from Stripe Checkout Session (guest checkout + privacy-safe URLs)
  useEffect(() => {
    if (!sessionId || emailFromParams) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-checkout-session', {
          body: { session_id: sessionId },
        });

        if (cancelled) return;
        if (error) throw error;

        const email = (data as any)?.email as string | undefined;
        if (email) {
          setEmailFromParams(email);
          setFormData(prev => ({ ...prev, email }));
        }
      } catch (err) {
        // Non-blocking: user can still create an account manually
        console.error('Failed to load checkout session:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, emailFromParams]);

  // Keep form email in sync when it’s prefilled from purchase
  useEffect(() => {
    if (!emailFromParams) return;
    setFormData(prev => ({ ...prev, email: emailFromParams }));
  }, [emailFromParams]);

  // Track whether a magic link was already sent (server-side or client-side idempotency)
  useEffect(() => {
    if (magicLinkCheckedRef.current) return;

    const sentKey = sessionId ? `sellsig:magic_link_sent:${sessionId}` : null;
    const sentAlready = sentKey ? localStorage.getItem(sentKey) : null;

    if (magicLinkSentParam || sentAlready) {
      magicLinkCheckedRef.current = true;
      setMagicLinkSent(true);
    }
  }, [magicLinkSentParam, sessionId]);

  // Auto-send magic link for session-based flows (guest checkout)
  useEffect(() => {
    if (!sessionId) return;
    if (!emailFromParams) return;
    if (magicLinkSentParam || magicLinkSent) return;

    const sentKey = `sellsig:magic_link_sent:${sessionId}`;
    if (localStorage.getItem(sentKey)) {
      setMagicLinkSent(true);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: emailFromParams,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard?subscription=success&from_checkout=true`,
          },
        });

        if (cancelled) return;

        if (error) {
          console.error('Auto magic link send failed:', error);
          toast.error('Could not send login link automatically. Use "Resend Magic Link".');
          return;
        }

        localStorage.setItem(sentKey, new Date().toISOString());
        setMagicLinkSent(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, emailFromParams, magicLinkSentParam, magicLinkSent]);

  // Countdown for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard?subscription=success&from_checkout=true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendMagicLink = async () => {
    if (resendCooldown > 0 || !emailFromParams) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailFromParams,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard?subscription=success&from_checkout=true`,
        },
      });

      if (error) {
        toast.error('Failed to resend magic link. Please try again.');
      } else {
        toast.success('Magic link sent! Check your email.');
        setMagicLinkSent(true);
        if (sessionId) {
          localStorage.setItem(`sellsig:magic_link_sent:${sessionId}`, new Date().toISOString());
        }
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const strength = validatePasswordStrength(formData.password);
    if (!strength.isValid) {
      strength.errors.forEach(err => toast.error(err));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard?subscription=success&from_checkout=true`,
        },
      });

      if (error) {
        // If user already exists, try to sign in
        if (error.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            toast.error('Account exists. Please use correct password or reset it.');
            setIsLoading(false);
            return;
          }

          toast.success('Signed in successfully!');
          navigate('/dashboard?subscription=success&from_checkout=true');
          return;
        }

        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Account created! Redirecting to dashboard...');
        navigate('/dashboard?subscription=success&from_checkout=true');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Your subscription is now active. Redirecting to dashboard...
          </p>
          
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Redirecting in {countdown} seconds...</span>
          </div>

          <Button 
            onClick={() => navigate('/dashboard?subscription=success&from_checkout=true')} 
            className="mt-6"
            variant="outline"
          >
            Go to Dashboard Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          
          {magicLinkSent ? (
            <p className="text-muted-foreground">
              Check your email for an instant login link
            </p>
          ) : (
            <p className="text-muted-foreground">
              Create your account to access your subscription
            </p>
          )}
        </div>

        {/* Magic Link Section */}
        {emailFromParams && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Magic Link Sent!</h3>
                <p className="text-sm text-muted-foreground">{emailFromParams}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              We've sent a magic link to your email. Click it to log in instantly and access your premium features.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResendMagicLink}
              disabled={isLoading || resendCooldown > 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend Magic Link'
              )}
            </Button>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              {emailFromParams ? "Or create a password to sign in anytime:" : "Create your account:"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                disabled={!!emailFromParams}
                className={emailFromParams ? 'bg-muted' : ''}
              />
              {emailFromParams && (
                <p className="text-xs text-muted-foreground">
                  Email from your purchase
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Continue'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}