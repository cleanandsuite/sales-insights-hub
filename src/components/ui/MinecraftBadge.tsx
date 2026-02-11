import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MinecraftBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

// Minecraft 3D Badge Component
export function MinecraftBadge({ children, className, variant = 'default' }: MinecraftBadgeProps) {
  const { isMinecraft } = useTheme();

  const variants = {
    default: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  };

  if (!isMinecraft) {
    return (
      <span className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'border-transparent bg-primary text-primary-foreground shadow',
        className
      )}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-block px-3 py-1 text-white font-black uppercase text-xs tracking-wider border-b-2 border-black/40',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
