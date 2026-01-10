import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PaymentComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const email = searchParams.get('email');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        // Already authenticated, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard?subscription=success');
        }, 2000);
      }
    };
    checkAuth();
  }, [navigate]);

  // Auto-send magic link on mount if email is present and not authenticated
  useEffect(() => {
    if (email && !isAuthenticated && !magicLinkSent) {
      sendMagicLink();
    }
  }, [email, isAuthenticated]);

  // Countdown timer for redirect hint
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const sendMagicLink = async () => {
    if (!email || sending) return;
    
    setSending(true);
    try {
      const redirectTo = window.location.origin + '/dashboard?subscription=success';
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error('Magic link error:', error);
        toast.error('Failed to send login link. Please try again.');
      } else {
        setMagicLinkSent(true);
        toast.success('Login link sent! Check your email.');
      }
    } catch (err) {
      console.error('Magic link exception:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // If already authenticated, show quick redirect
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Payment Successful!
        </h1>
        
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <p className="text-lg text-foreground mb-2">
            Check your email for instant login
          </p>
          
          {email && (
            <p className="text-sm text-muted-foreground mb-4">
              We sent a magic link to <strong>{email}</strong>
            </p>
          )}
          
          <p className="text-sm text-muted-foreground">
            Click the link in your email to access your premium features instantly.
          </p>
        </div>

        {!magicLinkSent && email && (
          <Button 
            onClick={sendMagicLink} 
            disabled={sending}
            className="mb-4"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Login Link
              </>
            )}
          </Button>
        )}

        {magicLinkSent && (
          <div className="text-sm text-green-600 mb-4 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Magic link sent! Check your inbox.
          </div>
        )}

        <div className="border-t pt-6">
          <p className="text-sm text-muted-foreground mb-3">
            Already have the link? Or want to sign in with password?
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
