import { Button } from '@/components/ui/button';
import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConfessionHeaderProps {
  onClaimRedemption: () => void;
}

export function ConfessionHeader({ onClaimRedemption }: ConfessionHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <SellSigLogo variant="light" size="md" showTagline={false} />

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {/* Sign In Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>

            {/* CTA */}
            <Button
              size="sm"
              onClick={onClaimRedemption}
              className="hidden sm:flex gap-2 font-bold bg-emerald-500 hover:bg-emerald-400 text-white border-0"
            >
              Claim Redemption
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
