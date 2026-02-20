import { cn } from '@/lib/utils';
import { BuyingSignal, BUYING_SIGNAL_LABELS } from '@/types/deals';
import { 
  DollarSign, 
  Calendar, 
  UserCheck, 
  Users, 
  Target, 
  Trophy, 
  Crown,
  Shield
} from 'lucide-react';

interface BuyingSignalChipProps {
  signal: BuyingSignal | string;
  size?: 'sm' | 'md';
}

const signalIcons: Record<string, typeof DollarSign> = {
  budget_confirmed: DollarSign,
  timeline_set: Calendar,
  decision_maker_engaged: UserCheck,
  champion_identified: Users,
  pain_point_validated: Target,
  competitor_displaced: Trophy,
  executive_sponsor: Crown,
  technical_approval: Shield,
};

export function BuyingSignalChip({ signal, size = 'sm' }: BuyingSignalChipProps) {
  const isObject = typeof signal === 'object';
  const type = isObject ? signal.type : signal.toLowerCase().replace(/ /g, '_');
  const label = isObject ? signal.label : BUYING_SIGNAL_LABELS[type] || signal;
  
  const Icon = signalIcons[type] || Target;
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      <span className="truncate max-w-[150px]">{label}</span>
    </div>
  );
}
