import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, X, UserCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileSetupBannerProps {
  variant?: 'full' | 'compact';
  onDismiss?: () => void;
}

export function ProfileSetupBanner({ variant = 'full', onDismiss }: ProfileSetupBannerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company, company_strengths')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Check if profile is complete
        const hasCompany = !!data?.company;
        const hasStrengths = data?.company_strengths && data.company_strengths.length > 0;
        setIsComplete(hasCompany && hasStrengths);
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  if (loading || isComplete || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">
            Complete your profile for personalized AI coaching
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/profile')}
            className="h-7 text-xs"
          >
            Set up
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-primary/10 rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Complete Your Profile
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Add your company details and strengths to unlock personalized AI coaching that speaks your language and knows your value propositions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/profile')}
            className="gap-2 flex-1 sm:flex-none"
          >
            <UserCircle className="h-4 w-4" />
            Set Up Profile
          </Button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
