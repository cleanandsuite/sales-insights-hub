import { AnimatedSprite, SpriteConfig } from './AnimatedSprite';
import { cn } from '@/lib/utils';

export interface StationaryCharacterProps {
  config: SpriteConfig;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'inline';
  className?: string;
  name?: string;
  badge?: string; // Emoji badge for class
  state?: 'idle' | 'walk' | 'attack' | 'block' | 'hurt' | 'death';
  onClick?: () => void;
  showName?: boolean;
}

export function StationaryCharacter({
  config,
  size = 100,
  position = 'bottom-right',
  className,
  name,
  badge,
  state = 'idle',
  onClick,
  showName = true,
}: StationaryCharacterProps) {
  const positionClasses = {
    'top-left': 'fixed top-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'inline': 'inline-block', // For positioning inline with other elements
  };

  return (
    <div
      className={cn(
        'relative inline-block',
        positionClasses[position],
        className
      )}
      onClick={onClick}
    >
      {/* Name badge above character */}
      {name && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
          {name}
        </div>
      )}

      {/* Character sprite (stationary, idle animation only) */}
      <div className="relative">
        <AnimatedSprite
          config={config}
          size={size}
          state={state}
        />

        {/* Class badge */}
        {badge && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-lg w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {badge}
          </div>
        )}
      </div>

      {/* Shadow beneath character */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/30 rounded-full blur-md"
        style={{ width: size * 0.75 }}
      />
    </div>
  );
}
