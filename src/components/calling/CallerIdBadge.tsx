import { Shield, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type AttestationLevel = 'A' | 'B' | 'C' | 'unknown';

interface CallerIdBadgeProps {
  attestationLevel: AttestationLevel;
  className?: string;
}

const attestationConfig = {
  A: {
    icon: ShieldCheck,
    label: 'Verified',
    color: 'text-green-600 bg-green-500/10 border-green-500/20',
    description: 'Full attestation: Carrier verified you have the right to use this number. Calls display as verified to recipients.',
  },
  B: {
    icon: Shield,
    label: 'Partial',
    color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20',
    description: 'Partial attestation: Call origin verified but number ownership not fully confirmed.',
  },
  C: {
    icon: ShieldAlert,
    label: 'Gateway',
    color: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
    description: 'Gateway attestation: Call received from gateway without full verification. May appear as potential spam.',
  },
  unknown: {
    icon: ShieldQuestion,
    label: 'Unknown',
    color: 'text-muted-foreground bg-muted border-muted',
    description: 'Attestation level not available for this call.',
  },
};

export function CallerIdBadge({ attestationLevel, className }: CallerIdBadgeProps) {
  const config = attestationConfig[attestationLevel];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 font-medium cursor-help border',
              config.color,
              className
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label} ({attestationLevel})
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
