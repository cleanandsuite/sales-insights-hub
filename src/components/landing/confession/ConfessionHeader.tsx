import { Button } from '@/components/ui/button';
import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { ArrowRight } from 'lucide-react';

interface ConfessionHeaderProps {
  onClaimRedemption: () => void;
}

export function ConfessionHeader({ onClaimRedemption }: ConfessionHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <SellSigLogo variant="light" size="md" showTagline={false} />

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
    </header>
  );
}
