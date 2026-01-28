import { Button } from '@/components/ui/button';
import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { ArrowRight, LogIn, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConfessionHeaderProps {
  onClaimRedemption: () => void;
}

// Phone number for the business
const PHONE_NUMBER = '+1 (855) 503-0497';

export function ConfessionHeader({ onClaimRedemption }: ConfessionHeaderProps) {
  const navigate = useNavigate();

  const handleCallNow = () => {
    window.location.href = 'tel:+18555030497';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo + Phone */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <SellSigLogo variant="light" size="md" showTagline={false} />
            
            {/* Phone number - visible on larger screens */}
            <a 
              href="tel:+18555030497"
              className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{PHONE_NUMBER}</span>
            </a>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {/* Call for Demo Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCallNow}
              className="gap-2 text-white border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call for Demo</span>
            </Button>

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
              className="hidden lg:flex gap-2 font-bold bg-emerald-500 hover:bg-emerald-400 text-white border-0"
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
