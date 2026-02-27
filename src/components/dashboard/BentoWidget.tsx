import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BentoWidgetProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export function BentoWidget({
  label, value, icon: Icon, iconColor = 'text-primary', subtitle, onClick, children, className,
}: BentoWidgetProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-2 p-4 rounded-xl',
        'bg-card border border-border/50 shadow-sm',
        'hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5',
        'transition-all duration-200 text-left w-full',
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center bg-muted/50', iconColor)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <span className="text-2xl font-bold text-foreground animate-count-up">{value}</span>
      {subtitle && <span className="text-[11px] text-muted-foreground -mt-1">{subtitle}</span>}
      {children}
    </button>
  );
}
