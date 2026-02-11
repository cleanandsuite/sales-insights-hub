import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MinecraftButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// Minecraft 3D Button Component
export const MinecraftButton = forwardRef<HTMLButtonElement, MinecraftButtonProps>(
  ({ className, variant = 'default', size = 'md', children, disabled, ...props }, ref) => {
    const { isMinecraft } = useTheme();

    const variants = {
      default: 'bg-gray-700 hover:bg-gray-600 border-gray-600 border-b-gray-900 active:border-b-gray-700',
      success: 'bg-green-700 hover:bg-green-600 border-green-600 border-b-green-900 active:border-b-green-700',
      warning: 'bg-amber-700 hover:bg-amber-600 border-amber-600 border-b-amber-900 active:border-b-amber-700',
      danger: 'bg-red-700 hover:bg-red-600 border-red-600 border-b-red-900 active:border-b-red-700',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    if (!isMinecraft) {
      return (
        <button
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            'bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2',
            className
          )}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(
          'relative font-black uppercase tracking-wider text-white transition-all',
          'border-b-4 border-r-2 border-black/30 active:border-b-0 active:mt-1 active:border-b-4',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MinecraftButton.displayName = 'MinecraftButton';
