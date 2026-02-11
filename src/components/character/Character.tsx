import { useState, useEffect } from 'react';
import { PixelAvatar, CharacterConfig, AnimatedAvatarProps } from './Avatar';
import { cn } from '@/lib/utils';
import { CharacterClass, getVisualEffects } from '@/lib/evolution';

export interface CharacterProps {
  config: CharacterConfig;
  characterClass: CharacterClass | null;
  size?: number;
  state?: 'idle' | 'walk' | 'victory' | 'excited';
  showName?: boolean;
  name?: string;
  className?: string;
  // Position for dashboard floating character
  floating?: boolean;
}

// Visual effect components
function AuraEffect({ type, color, size }: { type: 'glow' | 'fire' | 'sparks' | 'particles' | 'electric' | 'rainbow'; color: string; size: number }) {
  switch (type) {
    case 'glow':
      return (
        <div
          className="absolute inset-0 rounded-full blur-xl animate-pulse"
          style={{
            backgroundColor: color,
            opacity: 0.4,
            animationDuration: '2s',
          }}
        />
      );
    
    case 'particles':
      return (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float-particle"
              style={{
                width: size * 0.15,
                height: size * 0.15,
                backgroundColor: color,
                left: `${50 + Math.cos((i * 45 * Math.PI) / 180) * 60}%`,
                top: `${50 + Math.sin((i * 45 * Math.PI) / 180) * 60}%`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.6,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '3s',
              }}
            />
          ))}
        </>
      );
    
    case 'electric':
      return (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-electric-pulse"
              style={{
                width: size * 0.1,
                height: size * 0.2,
                backgroundColor: color,
                left: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 55}%`,
                top: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 55}%`,
                transform: 'translate(-50%, -50%) rotate(45deg)',
                opacity: 0,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </>
      );
    
    case 'rainbow':
      return (
        <div
          className="absolute inset-0 rounded-full blur-xl animate-rainbow-aura"
          style={{
            background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
            backgroundSize: '400% 400%',
            opacity: 0.5,
          }}
        />
      );
    
    default:
      return null;
  }
}

function HandEffect({ type, color, size }: { type: 'fire' | 'electric' | 'rainbow' | 'none'; color: string; size: number }) {
  if (type === 'none') return null;

  switch (type) {
    case 'fire':
      return (
        <>
          <div
            className="absolute animate-fire-flicker"
            style={{
              width: size * 0.2,
              height: size * 0.3,
              background: `linear-gradient(to top, ${color}, transparent)`,
              left: '10%',
              bottom: '10%',
              filter: 'blur(2px)',
            }}
          />
          <div
            className="absolute animate-fire-flicker"
            style={{
              width: size * 0.2,
              height: size * 0.3,
              background: `linear-gradient(to top, ${color}, transparent)`,
              right: '10%',
              bottom: '10%',
              filter: 'blur(2px)',
              animationDelay: '0.2s',
            }}
          />
        </>
      );
    
    case 'electric':
      return (
        <>
          <svg
            className="absolute animate-electric-crack left-[10%] bottom-[10%]"
            width={size * 0.2}
            height={size * 0.3}
            viewBox="0 0 20 30"
            style={{ animationDelay: '0s' }}
          >
            <path
              d="M10 0 L5 15 L10 12 L5 30 L15 12 L10 15 Z"
              fill={color}
              opacity="0.8"
            />
          </svg>
          <svg
            className="absolute animate-electric-crack right-[10%] bottom-[10%]"
            width={size * 0.2}
            height={size * 0.3}
            viewBox="0 0 20 30"
            style={{ animationDelay: '0.5s' }}
          >
            <path
              d="M10 0 L5 15 L10 12 L5 30 L15 12 L10 15 Z"
              fill={color}
              opacity="0.8"
            />
          </svg>
        </>
      );
    
    case 'rainbow':
      return (
        <>
          <div
            className="absolute animate-fire-flicker"
            style={{
              width: size * 0.2,
              height: size * 0.3,
              background: 'linear-gradient(to top, #ff0000, #ffff00, #00ff00, transparent)',
              left: '10%',
              bottom: '10%',
              filter: 'blur(2px)',
            }}
          />
          <div
            className="absolute animate-fire-flicker"
            style={{
              width: size * 0.2,
              height: size * 0.3,
              background: 'linear-gradient(to top, #00ff00, #0000ff, #9400d3, transparent)',
              right: '10%',
              bottom: '10%',
              filter: 'blur(2px)',
              animationDelay: '0.2s',
            }}
          />
        </>
      );
    
    default:
      return null;
  }
}

function BodyEffect({ type, color, size }: { type: 'sparks' | 'electric' | 'glow' | 'none'; color: string; size: number }) {
  if (type === 'none') return null;

  switch (type) {
    case 'sparks':
      return (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-spark-pop"
              style={{
                width: size * 0.08,
                height: size * 0.08,
                backgroundColor: color,
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </>
      );
    
    case 'electric':
      return (
        <div
          className="absolute inset-0 rounded-full animate-electric-body"
          style={{
            border: `2px solid ${color}`,
            opacity: 0.5,
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          }}
        />
      );
    
    case 'glow':
      return (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          }}
        />
      );
    
    default:
      return null;
  }
}

// Wandering character for dashboard
export function WanderingCharacter({
  config,
  characterClass,
  size = 80,
  name,
}: {
  config: CharacterConfig;
  characterClass: CharacterClass | null;
  size?: number;
  name?: string;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [state, setState] = useState<AnimatedAvatarProps['state']>('idle');

  const effects = getVisualEffects(characterClass);
  const classColor = characterClass?.color.replace('bg-', '#') || '#3B82F6';

  // Constrain position to stay within viewport
  const clampedPosition = {
    x: Math.max(-200, Math.min(200, position.x)), // Keep within -200 to 200
    y: Math.max(-100, Math.min(0, position.y)),   // Keep within -100 to 0
  };

  // Random wandering behavior
  useEffect(() => {
    const wanderInterval = setInterval(() => {
      // 30% chance to start moving
      if (Math.random() < 0.3 && !isMoving) {
        setIsMoving(true);
        setState('walk');

        // Calculate random position within bounds
        // Character is positioned bottom-4 right-4 (16px from edges)
        // Viewport: X range is viewport width - character width, Y range is viewport height - character height
        const safePadding = size / 2;
        const maxMoveX = window.innerWidth / 2 - size - safePadding;
        const maxMoveY = window.innerHeight / 4 - size - safePadding;

        const newX = Math.random() * (maxMoveX * 2) - maxMoveX; // Constrain to safe bounds
        const newY = Math.random() * (maxMoveY * 2) - maxMoveY;

        setPosition({ x: newX, y: newY });

        // Stop moving after 2-4 seconds
        setTimeout(() => {
          setIsMoving(false);
          setState('idle');
        }, 2000 + Math.random() * 2000);
      }
    }, 3000);

    return () => clearInterval(wanderInterval);
  }, [isMoving, size]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 transition-all duration-1000',
        isMoving && 'ease-in-out'
      )}
      style={{
        transform: `translate(${clampedPosition.x}px, ${clampedPosition.y}px)`,
      }}
    >
      {/* Character container with effects */}
      <div
        className={cn(
          'relative inline-block cursor-pointer hover:scale-110 transition-transform',
          state === 'walk' && 'animate-walk-bounce',
          state === 'victory' && 'animate-victory-bounce',
          state === 'excited' && 'animate-excited-shake'
        )}
      >
        {/* Aura effect */}
        {effects.aura !== 'none' && (
          <AuraEffect
            type={effects.aura}
            color={classColor}
            size={size * 1.5}
          />
        )}

        {/* Body effect */}
        <BodyEffect type={effects.bodyEffect} color={classColor} size={size} />

        {/* Base avatar */}
        <PixelAvatar config={config} size={size} />

        {/* Hand effects */}
        <HandEffect type={effects.handEffect} color={classColor} size={size} />

        {/* Name badge */}
        {name && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-xs px-2 py-1 rounded">
            {name}
          </div>
        )}

        {/* Class badge */}
        {characterClass && (
          <div className="absolute -top-2 right-0 bg-primary text-white text-lg w-6 h-6 rounded-full flex items-center justify-center">
            {characterClass.emoji}
          </div>
        )}
      </div>
    </div>
  );
}

// Standard character component
export function Character({
  config,
  characterClass,
  size = 64,
  state = 'idle',
  showName,
  name,
  className,
}: CharacterProps) {
  const effects = getVisualEffects(characterClass);
  const classColor = characterClass?.color.replace('bg-', '#') || '#3B82F6';

  return (
    <div
      className={cn(
        'relative inline-block',
        className
      )}
    >
      {/* Aura effect */}
      {effects.aura !== 'none' && (
        <AuraEffect
          type={effects.aura}
          color={classColor}
          size={size * 1.5}
        />
      )}

      {/* Body effect */}
      <BodyEffect type={effects.bodyEffect} color={classColor} size={size} />

      {/* Base avatar */}
      <PixelAvatar config={config} size={size} />

      {/* Hand effects */}
      <HandEffect type={effects.handEffect} color={classColor} size={size} />

      {/* Name badge */}
      {showName && name && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-xs px-2 py-1 rounded">
          {name}
        </div>
      )}

      {/* Class badge */}
      {characterClass && (
        <div className="absolute -top-2 right-0 bg-primary text-white text-lg w-6 h-6 rounded-full flex items-center justify-center">
          {characterClass.emoji}
        </div>
      )}
    </div>
  );
}
