import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  plan: 'single_user' | 'team' | 'enterprise' | null;
  className?: string;
}

const planConfig: Record<string, { label: string; className: string }> = {
  single_user: { label: 'Starter', className: 'bg-primary/10 text-primary border-primary/20' },
  team: { label: 'Pro', className: 'bg-[hsl(267,83%,60%)]/10 text-[hsl(267,83%,60%)] border-[hsl(267,83%,60%)]/20' },
  enterprise: { label: 'Enterprise', className: 'bg-warning/10 text-warning border-warning/20' },
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (!plan) {
    return (
      <span className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
        'bg-muted/50 text-muted-foreground border-border',
        className
      )}>
        Free
      </span>
    );
  }

  const config = planConfig[plan] || planConfig.single_user;

  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
