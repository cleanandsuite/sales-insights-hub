import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface TeamProtectedRouteProps {
  children: React.ReactNode;
}

export function TeamProtectedRoute({ children }: TeamProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: statusLoading } = useAccountStatus();
  const { plan, loading: subLoading } = useSubscription();

  const loading = authLoading || statusLoading || subLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if account is blocked due to subscription issues
  if (!isActive) {
    return <Navigate to="/account-blocked" replace />;
  }

  // Check if user has Team plan
  if (plan !== 'team') {
    return <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
}
