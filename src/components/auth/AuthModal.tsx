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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form and return whether it's valid
  const validation = useMemo(() => {
    const schema = isLogin ? loginSchema : signupSchema;
    const data = isLogin 
      ? { email, password } 
      : { email, password, fullName };
    
    const result = schema.safeParse(data);
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
  }, [email, password, fullName, isLogin]);

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
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        onOpenChange(false);
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success('Account created! Please check your email to confirm.');
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrors({});
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  // Show errors only after user has typed something
  const showError = (field: string) => {
    return errors[field] || (validation.errors[field] && (
      (field === 'email' && email.length > 0) ||
      (field === 'password' && password.length > 0) ||
      (field === 'fullName' && fullName.length > 0)
    ) ? validation.errors[field] : '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                disabled={loading}
                className={showError('fullName') ? 'border-destructive' : ''}
              />
              {showError('fullName') && (
                <p className="text-xs text-destructive">{showError('fullName')}</p>
              )}
            </div>
          )}
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
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
