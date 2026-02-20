import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { ForgotPasswordModal } from './ForgotPasswordModal';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const validation = useMemo(() => {
    const data = { email, password };
    const result = loginSchema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: {} };
    }
    
    const fieldErrors: Record<string, string> = {};
    result.error.errors.forEach(err => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as string] = err.message;
      }
    });
    return { isValid: false, errors: fieldErrors };
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast.success('Welcome back!');
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: string) => {
    return errors[field] || (validation.errors[field] && (
      (field === 'email' && email.length > 0) ||
      (field === 'password' && password.length > 0)
    ) ? validation.errors[field] : '');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Welcome Back
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={showError('email') ? 'border-destructive' : ''}
              />
              {showError('email') && (
                <p className="text-xs text-destructive">{showError('email')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className={showError('password') ? 'border-destructive' : ''}
              />
              {showError('password') && (
                <p className="text-xs text-destructive">{showError('password')}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !validation.isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                setForgotPasswordOpen(true);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  );
}
