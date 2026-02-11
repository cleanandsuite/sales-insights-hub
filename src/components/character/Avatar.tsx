import { cn } from '@/lib/utils';

export type CharacterBuild = 'yordle' | 'medium' | 'muscular';
export type CharacterGender = 'male' | 'female';

export interface CharacterConfig {
  build: CharacterBuild;
  gender: CharacterGender;
  color?: string;
  skinColor?: string;
}

const SKIN_COLORS = [
  '#FFDAB9', // Light
  '#F4C2A0', // Medium-light
  '#DEB887', // Medium
  '#C19A6B', // Medium-dark
  '#8B5A2B', // Dark
];

const HAIR_COLORS = [
  '#1a1a1a', // Black
  '#4a3728', // Brown
  '#c9a962', // Blonde
  '#d64161', // Red
  '#8e44ad', // Purple
];

// Pixel art helper - creates a blocky pixel effect
function PixelPath({ d, color, className }: { d: string; color: string; className?: string }) {
  return (
    <path
      d={d}
      fill={color}
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
    />
  );
}

// Body base paths
const BODIES = {
  yordle: {
    male: {
      width: 32,
      height: 40,
      body: 'M8 8h16v4h-2v4h-2v4h-2v4h-4v-4h-2v-4h-2v-4h-2z',
      head: 'M10 4h12v8h-2v2h-8v-2h-2z',
      eyes: 'M12 8h2v2h-2zM18 8h2v2h-2z',
      mouth: 'M14 14h4v2h-4z',
    },
    female: {
      width: 32,
      height: 40,
      body: 'M8 8h16v4h-2v4h-2v4h-2v4h-4v-4h-2v-4h-2v-4h-2z',
      head: 'M10 4h12v8h-2v2h-8v-2h-2z',
      hair: 'M8 4h16v4h-16z',
      eyes: 'M12 8h2v2h-2zM18 8h2v2h-2z',
      mouth: 'M14 14h2h2v2h-4z',
    },
  },
  medium: {
    male: {
      width: 40,
      height: 52,
      body: 'M8 12h24v6h-3v6h-3v6h-3v6h-6v-6h-3v-6h-3v-6h-3z',
      head: 'M12 4h16v10h-3v2h-10v-2h-3z',
      eyes: 'M14 10h3v3h-3zM23 10h3v3h-3z',
      mouth: 'M18 18h4v2h-4z',
    },
    female: {
      width: 40,
      height: 52,
      body: 'M8 12h24v6h-3v6h-3v6h-3v6h-6v-6h-3v-6h-3v-6h-3z',
      head: 'M12 4h16v10h-3v2h-10v-2h-3z',
      hair: 'M10 4h20v6h-20z',
      hairExtra: 'M10 10h4v6h-4zM26 10h4v6h-4z',
      eyes: 'M14 10h3v3h-3zM23 10h3v3h-3z',
      mouth: 'M18 18h4v2h-4z',
    },
  },
  muscular: {
    male: {
      width: 48,
      height: 64,
      body: 'M8 16h32v8h-4v8h-4v8h-4v8h-8v-8h-4v-8h-4v-8h-4z',
      head: 'M16 4h16v12h-4v2h-8v-2h-4z',
      eyes: 'M20 12h4v4h-4zM24 12h4v4h-4z',
      mouth: 'M22 20h4v2h-4z',
    },
    female: {
      width: 48,
      height: 64,
      body: 'M8 16h32v8h-4v8h-4v8h-4v8h-8v-8h-4v-8h-4v-8h-4z',
      head: 'M16 4h16v12h-4v2h-8v-2h-4z',
      hair: 'M14 4h20v8h-20z',
      hairExtra: 'M14 12h6v8h-6zM28 12h6v8h-6z',
      eyes: 'M20 12h4v4h-4zM24 12h4v4h-4z',
      mouth: 'M22 20h4v2h-4z',
    },
  },
};

interface AvatarProps {
  config: CharacterConfig;
  size?: number;
  className?: string;
}

export function PixelAvatar({ config, size = 64, className }: AvatarProps) {
  const { build, gender, color = '#3B82F6', skinColor = SKIN_COLORS[1] } = config;
  const body = BODIES[build][gender];

  const scale = size / body.width;

  return (
    <svg
      width={size}
      height={size * (body.height / body.width)}
      viewBox={`0 0 ${body.width} ${body.height}`}
      className={cn('inline-block', className)}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Head */}
      <PixelPath d={body.head} color={skinColor} />
      
      {/* Body */}
      <PixelPath d={body.body} color={color} />
      
      {/* Hair (female) */}
      {gender === 'female' && 'hair' in body && (body as any).hair && (
        <PixelPath d={(body as any).hair} color={HAIR_COLORS[1]} />
      )}
      {gender === 'female' && 'hairExtra' in body && (body as any).hairExtra && (
        <PixelPath d={(body as any).hairExtra} color={HAIR_COLORS[1]} />
      )}
      
      {/* Eyes */}
      <PixelPath d={body.eyes} color="#000" />
      
      {/* Mouth */}
      <PixelPath d={body.mouth} color="#000" />
    </svg>
  );
}

// Animated avatar component
export interface AnimatedAvatarProps {
  config: CharacterConfig;
  size?: number;
  state?: 'idle' | 'walk' | 'victory' | 'excited';
  className?: string;
}

export function AnimatedAvatar({
  config,
  size = 64,
  state = 'idle',
  className,
}: AnimatedAvatarProps) {
  const animations = {
    idle: 'animate-breathe',
    walk: 'animate-walk',
    victory: 'animate-victory',
    excited: 'animate-excited',
  };

  return (
    <div
      className={cn(
        'relative inline-block transition-all duration-300',
        animations[state],
        className
      )}
    >
      <PixelAvatar config={config} size={size} />
    </div>
  );
}

// Character selector component
export interface CharacterSelectorProps {
  selected: CharacterConfig;
  onSelect: (config: CharacterConfig) => void;
}

export function CharacterSelector({ selected, onSelect }: CharacterSelectorProps) {
  const builds: CharacterBuild[] = ['yordle', 'medium', 'muscular'];
  const genders: CharacterGender[] = ['male', 'female'];

  const isSelected = (build: CharacterBuild, gender: CharacterGender) =>
    selected.build === build && selected.gender === gender;

  return (
    <div className="grid grid-cols-3 gap-4">
      {builds.map((build) => (
        <div key={build} className="space-y-2">
          <p className="text-sm font-medium capitalize text-center">{build}</p>
          {genders.map((gender) => (
            <button
              key={gender}
              onClick={() => onSelect({ build, gender })}
              className={cn(
                'w-full p-4 rounded-lg border-2 transition-all hover:scale-105',
                isSelected(build, gender)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <PixelAvatar config={{ build, gender }} size={48} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
