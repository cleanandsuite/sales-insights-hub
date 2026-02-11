import { CharacterClass } from '@/lib/evolution';
import { useState, useEffect } from 'react';

export interface EvolutionAnimationProps {
  previousClass: CharacterClass | null;
  newClass: CharacterClass;
  onComplete: () => void;
  size?: number;
}

const EVOLUTION_STAGES = {
  1: { type: 'glow', duration: 2000, label: 'Evolving...' },
  2: { type: 'glow-bright', duration: 2000, label: 'Power Up!' },
  3: { type: 'fire', duration: 2500, label: 'Igniting!' },
  4: { type: 'thunder', duration: 3000, label: 'Unleashed!' },
  5: { type: 'explosion', duration: 3500, label: 'LEGENDARY!' },
};

export function EvolutionAnimation({
  previousClass,
  newClass,
  onComplete,
  size = 128,
}: EvolutionAnimationProps) {
  const [stage, setStage] = useState(1);
  const [showOldCharacter, setShowOldCharacter] = useState(true);
  const [showNewCharacter, setShowNewCharacter] = useState(false);
  const [explosionRadius, setExplosionRadius] = useState(0);

  const totalStages = newClass.tier + 1;
  const currentStageData = EVOLUTION_STAGES[stage as keyof typeof EVOLUTION_STAGES];

  useEffect(() => {
    // Evolution sequence
    const timeline = async () => {
      // Stage 1-2: Glow effects
      if (stage <= 2) {
        setTimeout(() => {
          if (stage < totalStages) {
            setStage(s => s + 1);
          } else {
            // Transition to new character
            setShowOldCharacter(false);
            setShowNewCharacter(true);
          }
        }, currentStageData.duration);
      }
      // Stage 3: Fire
      else if (stage === 3) {
        setTimeout(() => {
          setShowOldCharacter(false);
          setShowNewCharacter(true);
        }, 1500);
        setTimeout(() => {
          if (stage < totalStages) setStage(s => s + 1);
        }, currentStageData.duration);
      }
      // Stage 4: Thunder
      else if (stage === 4) {
        setTimeout(() => {
          setShowOldCharacter(false);
          setShowNewCharacter(true);
        }, 1500);
        setTimeout(() => {
          if (stage < totalStages) setStage(s => s + 1);
        }, currentStageData.duration);
      }
      // Stage 5: Explosion
      else if (stage === 5) {
        setTimeout(() => {
          setShowOldCharacter(false);
          setShowNewCharacter(true);
          setExplosionRadius(1);
        }, 1000);

        // Animate explosion
        setTimeout(() => {
          setExplosionRadius(1.5);
        }, 100);
        setTimeout(() => {
          setExplosionRadius(2);
        }, 200);
        setTimeout(() => {
          setExplosionRadius(2.5);
        }, 300);
        setTimeout(() => {
          setExplosionRadius(3);
        }, 400);

        setTimeout(() => {
          if (stage < totalStages) setStage(s => s + 1);
        }, currentStageData.duration);
      }

      // All stages complete
      if (stage >= totalStages || totalStages > 5) {
        setTimeout(onComplete, 1000);
      }
    };

    timeline();
  }, [stage, totalStages, onComplete]);

  const getEffectColor = () => {
    if (newClass.id === 'demigod' || newClass.id === 'titan') {
      return '#FFD700'; // Gold for legends
    }
    return newClass.color.replace('bg-', '#');
  };

  const renderStageEffect = () => {
    const effectColor = getEffectColor();

    switch (currentStageData.type) {
      case 'glow':
        return (
          <div
            className="absolute inset-0 rounded-full animate-evolution-glow"
            style={{
              background: `radial-gradient(circle, ${effectColor}40 0%, transparent 70%)`,
            }}
          />
        );

      case 'glow-bright':
        return (
          <>
            <div
              className="absolute inset-0 rounded-full animate-evolution-glow"
              style={{
                background: `radial-gradient(circle, ${effectColor}60 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute inset-[-20%] rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${effectColor}30 0%, transparent 60%)`,
                animationDuration: '0.5s',
              }}
            />
          </>
        );

      case 'fire':
        return (
          <div className="absolute inset-0">
            <div className="absolute inset-0 animate-fire-rise" style={{
              background: 'conic-gradient(from 0deg, transparent, #ff6b35, #ff0000, #ff6b35, transparent)',
              opacity: 0.8,
            }} />
            <div className="absolute inset-[10%] animate-fire-rise" style={{
              background: 'conic-gradient(from 180deg, transparent, #ffa500, #ff4500, #ffa500, transparent)',
              animationDelay: '0.2s',
              opacity: 0.6,
            }} />
            <div className="absolute inset-[20%] animate-fire-rise" style={{
              background: 'conic-gradient(from 90deg, transparent, #ffff00, #ff6b35, #ffff00, transparent)',
              animationDelay: '0.4s',
              opacity: 0.4,
            }} />
          </div>
        );

      case 'thunder':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="absolute animate-thunder-flash"
                viewBox="0 0 100 100"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 80}%`,
                  width: size * 0.4,
                  height: size * 0.4,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                <path
                  d={`M50 0 L${30 + Math.random() * 40} ${50 + Math.random() * 50} L${20 + Math.random() * 30} ${80 + Math.random() * 20} L${40 + Math.random() * 40} ${50 + Math.random() * 30} L${30 + Math.random() * 30} 100`}
                  stroke={effectColor}
                  strokeWidth={3}
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            ))}
            <div
              className="absolute inset-0 bg-white/10 animate-pulse"
              style={{ animationDuration: '0.1s' }}
            />
          </div>
        );

      case 'explosion':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Shockwave */}
            <div
              className="absolute rounded-full border-4 animate-shockwave"
              style={{
                borderColor: effectColor,
                width: `${size * explosionRadius}px`,
                height: `${size * explosionRadius}px`,
                opacity: Math.max(0, 1 - (explosionRadius - 1) / 2),
              }}
            />

            {/* Explosion core */}
            <div
              className="absolute rounded-full animate-explosion-core"
              style={{
                background: `radial-gradient(circle, ${effectColor} 0%, transparent 70%)`,
                width: `${size * explosionRadius * 0.8}px`,
                height: `${size * explosionRadius * 0.8}px`,
                opacity: Math.max(0, 1 - (explosionRadius - 1) / 2.5),
              }}
            />

            {/* Ground blast */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-ground-blast"
              style={{
                background: `linear-gradient(to top, ${effectColor}60 0%, transparent 100%)`,
                width: `${size * explosionRadius * 2}px`,
                height: `${size * 0.5}px`,
                opacity: Math.max(0, 1 - (explosionRadius - 1) / 2),
              }}
            />

            {/* Debris particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-debris"
                style={{
                  width: '4px',
                  height: '4px',
                  backgroundColor: effectColor,
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(${size * explosionRadius * 0.4}px)`,
                  opacity: Math.max(0, 1 - (explosionRadius - 1) / 2),
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Stage effects */}
      {renderStageEffect()}

      {/* Old character (fading out) */}
      {showOldCharacter && (
        <div className="absolute inset-0 flex items-center justify-center animate-evolution-fade-out">
          <div className="text-4xl">
            {previousClass?.emoji || '🔭'}
          </div>
        </div>
      )}

      {/* New character (fading in) */}
      {showNewCharacter && (
        <div className="absolute inset-0 flex items-center justify-center animate-evolution-fade-in">
          <div className="text-4xl">
            {newClass.emoji}
          </div>
        </div>
      )}

      {/* Stage label */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-sm font-bold text-white bg-black/70 px-3 py-1 rounded-full">
          {currentStageData.label}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="absolute -right-4 top-0 flex flex-col gap-1">
        {Array.from({ length: totalStages }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < stage ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
