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
      className={cn('transition-colors', className)}
      style={{
        shapeRendering: 'crispEdges',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// Yordle character (small, cute)
function YordleBody({ skinColor, hairColor }: { skinColor: string; hairColor: string }) {
  return (
    <g transform="translate(0, 0)">
      {/* Head */}
      <PixelPath d="M8 0h32v8h-32z" color={skinColor} />
      <PixelPath d="M12 0v-4h8v4" color={hairColor} />
      {/* Eyes */}
      <PixelPath d="M12 4h4v2h-4zM20 4h4v2h-4z" color="#000" />
      {/* Body */}
      <PixelPath d="M8 8h32v20h-32z" color={skinColor} />
      {/* Arms */}
      <PixelPath d="M4 12h4v8h-4zM36 12h4v8h-4z" color={skinColor} />
      {/* Legs */}
      <PixelPath d="M12 28h4v12h-4zM24 28h4v12h-4z" color={skinColor} />
    </g>
  );
}

// Medium character (balanced)
function MediumBody({ skinColor, hairColor }: { skinColor: string; hairColor: string }) {
  return (
    <g transform="translate(0, -4)">
      {/* Head */}
      <PixelPath d="M12 4h24v12h-24z" color={skinColor} />
      <PixelPath d="M16 4v-6h8v6M12 4v-4h4v4" color={hairColor} />
      {/* Eyes */}
      <PixelPath d="M16 10h4v3h-4zM24 10h4v3h-4z" color="#000" />
      {/* Body */}
      <PixelPath d="M8 16h32v28h-32z" color={skinColor} />
      {/* Arms */}
      <PixelPath d="M0 20h8v12h-8zM40 20h8v12h-8z" color={skinColor} />
      {/* Legs */}
      <PixelPath d="M16 44h8v12h-8zM24 44h8v12h-8z" color={skinColor} />
    </g>
  );
}

// Muscular character (large, strong)
function MuscularBody({ skinColor, hairColor }: { skinColor: string; hairColor: string }) {
  return (
    <g transform="translate(-4, -8)">
      {/* Head */}
      <PixelPath d="M16 8h24v14h-24z" color={skinColor} />
      <PixelPath d="M20 8v-6h8v6M16 8v-4h4v4" color={hairColor} />
      {/* Eyes */}
      <PixelPath d="M20 14h4v3h-4zM28 14h4v3h-4z" color="#000" />
      {/* Body - wider */}
      <PixelPath d="M4 22h48v36h-48z" color={skinColor} />
      {/* Arms - thicker */}
      <PixelPath d="M-4 28h8v16h-8zM52 28h8v16h-8z" color={skinColor} />
      {/* Legs - thicker */}
      <PixelPath d="M20 58h10v12h-10zM34 58h10v12h-10z" color={skinColor} />
    </g>
  );

export interface PixelAvatarProps {
  config: CharacterConfig;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function PixelAvatar({ config, size = 64, className, animated = false }: PixelAvatarProps) {
  const { build, gender, color, skinColor } = config;
  
  const skin = skinColor || SKIN_COLORS[0];
  const hair = color || HAIR_COLORS[0];

  // Animation classes
  const animationClass = animated ? 'animate-bounce' : '';

  // Render based on build type
  const BodyComponent = build === 'yordle' ? YordleBody 
    : build === 'muscular' ? MuscularBody 
    : MediumBody;

  // Scale based on size
  const scale = size / 64;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 80"
      className={cn(animationClass, className)}
      style={{ transform: `scale(${scale})` }}
    >
      <BodyComponent skinColor={skin} hairColor={hair} />
    </svg>
  );
}
