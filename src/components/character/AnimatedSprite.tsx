import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SpriteConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  rows: number; // Number of animation rows (idle, walk, attack, etc.)
  currentRow: number; // Which animation row to play
  frameRate?: number; // Milliseconds per frame (default: 150)
}

export interface AnimatedSpriteProps {
  config: SpriteConfig;
  size?: number;
  className?: string;
  state?: 'idle' | 'walk' | 'attack' | 'block' | 'hurt' | 'death';
  playOnce?: boolean; // For non-looping animations like attack/death
  onAnimationComplete?: () => void;
}

export function AnimatedSprite({
  config,
  size = 100,
  className,
  state = 'idle',
  playOnce = false,
  onAnimationComplete,
}: AnimatedSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentState, setCurrentState] = useState(state);
  const frameIntervalRef = useRef<NodeJS.Timeout>();
  const isPlayingRef = useRef(true);

  // Map animation state to sprite sheet row
  const getRowForState = (animationState: string): number => {
    switch (animationState) {
      case 'idle': return 0;
      case 'walk': return 1;
      case 'attack': return 2;
      case 'block': return 3;
      case 'hurt': return 4;
      case 'death': return 5;
      default: return 0;
    }
  };

  // Animation loop
  useEffect(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    const targetRow = getRowForState(state);
    setCurrentState(state);
    setCurrentFrame(0);

    const frameRate = config.frameRate || 150;

    frameIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      setCurrentFrame((prev) => {
        const nextFrame = prev + 1;
        
        // Check if animation complete
        if (nextFrame >= config.frames) {
          if (playOnce) {
            isPlayingRef.current = false;
            onAnimationComplete?.();
            return prev; // Stay on last frame
          }
          return 0; // Loop back to first frame
        }
        
        return nextFrame;
      });
    }, frameRate);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [state, config, playOnce, onAnimationComplete]);

  // Reset animation when state changes externally
  useEffect(() => {
    isPlayingRef.current = true;
    setCurrentFrame(0);
  }, [state]);

  // Calculate sprite position
  const spriteX = currentFrame * config.frameWidth;
  const spriteY = getRowForState(currentState) * config.frameHeight;

  return (
    <div
      className={cn('relative inline-block', className)}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src={config.src}
        alt="Animated Character"
        style={{
          width: size * config.frames,
          height: size * config.rows,
          position: 'absolute',
          top: 0,
          left: 0,
          objectFit: 'none',
          transform: `translate(-${spriteX}px, -${spriteY}px)`,
          imageRendering: 'pixelated', // Crisp pixel art look
        }}
      />
    </div>
  );
}
