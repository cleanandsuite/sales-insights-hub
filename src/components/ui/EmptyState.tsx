import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  tip?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, actions, tip, className, children }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-dashed border-border/60 bg-muted/20",
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>

      {actions && actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actions.map((action, i) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={i}
                variant={action.variant || (i === 0 ? 'default' : 'outline')}
                onClick={action.onClick}
                className="gap-2"
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}

      {tip && (
        <p className="text-xs text-muted-foreground/70 mt-6 max-w-sm italic">
          💡 {tip}
        </p>
      )}

      {children}
    </div>
  );
}
