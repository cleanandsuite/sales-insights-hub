import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MinecraftCardProps {
  children: ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
}

// Minecraft 3D Card Component
export function MinecraftCard({ children, className, elevation = 'medium' }: MinecraftCardProps) {
  const { isMinecraft } = useTheme();

  if (!isMinecraft) {
    return (
      <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
        {children}
      </div>
    );
  }

  const elevations = {
    low: 'bg-gray-800 border-2 border-gray-600 border-b-4 border-r-4',
    medium: 'bg-gray-800 border-2 border-gray-600 border-b-4 border-r-4 shadow-lg',
    high: 'bg-gray-800 border-2 border-gray-600 border-b-6 border-r-6 shadow-xl',
  };

  return (
    <div className={cn('relative', elevations[elevation], className)}>
      {/* Inner bevel effect */}
      <div className="border border-gray-700/50">
        {children}
      </div>
    </div>
  );
}
