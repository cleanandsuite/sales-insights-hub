import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MinecraftProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

// Minecraft 3D Progress/Stat Bar Component
export function MinecraftProgress({ 
  value, 
  max = 100, 
  className, 
  color = 'bg-amber-500',
  showLabel = false,
  label 
}: MinecraftProgressProps) {
  const { isMinecraft } = useTheme();

  const percent = Math.min((value / max) * 100, 100);

  if (!isMinecraft) {
    return (
      <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
        <div
          className={cn('h-full transition-all', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wide text-gray-300">
          <span>{label || 'Progress'}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className="h-8 bg-gray-950 border-2 border-gray-600 border-b-4 border-r-4">
        <div
          className={cn('h-full border-r-2 border-black/30', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
