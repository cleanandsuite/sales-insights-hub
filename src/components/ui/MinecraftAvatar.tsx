import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MinecraftAvatarProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Minecraft 3D Avatar/Block Component
export function MinecraftAvatar({ emoji, size = 'md', className }: MinecraftAvatarProps) {
  const { isMinecraft } = useTheme();

  const sizes = {
    sm: 'h-12 w-12 text-2xl',
    md: 'h-20 w-20 text-4xl',
    lg: 'h-24 w-24 text-5xl',
  };

  if (!isMinecraft) {
    return (
      <div className={cn(
        'rounded-full bg-muted flex items-center justify-center text-2xl',
        sizes[size],
        className
      )}>
        {emoji}
      </div>
    );
  }

  return (
    <div className={cn(
      'relative bg-gray-700 border-2 border-gray-600 border-b-4 border-r-4 flex items-center justify-center',
      sizes[size],
      className
    )}>
      <span className="relative z-10">{emoji}</span>
      {/* Highlight effect */}
      <div className="absolute top-1 left-1 right-4 h-2 bg-white/20" />
    </div>
  );
}
