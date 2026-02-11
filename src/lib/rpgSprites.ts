import { SpriteConfig } from '@/components/character/AnimatedSprite';

// RPG Character Sprite Configurations
// Based on Tiny RPG Character Asset Pack (100x100 tiles)

// Placeholder sprite URLs - replace with actual sprite sheets
const BASE_SPRITE_URL = '/sprites/rpg-characters.png';

export const RPG_CHARACTERS: Record<string, SpriteConfig> = {
  // ============ HUNTER CLASSES ============
  
  'soldier': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6, // idle, walk, attack, block, hurt, death
    currentRow: 0,
    frameRate: 150,
  },
  
  'archer': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'lancer': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  // ============ CLOSER CLASSES ============
  
  'knight': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },
  
  'knight-templar': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },
  
  'swordsman': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'armored-axeman': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  // ============ CULTIVATOR CLASSES ============
  
  'priest': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  // ============ CHAMPION CLASSES ============
  
  'armored': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  // ============ ENEMY/OPPONENT CLASSES ============
  
  'orc': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },
  
  'armored-orc': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },
  
  'elite-orc': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'skeleton': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'armored-skeleton': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'greatsword-skeleton': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'skeleton-archer': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'slime': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  // ============ SPECIAL CLASSES ============
  
  'wizard': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'werewolf': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'werebear': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },

  'orc-rider': {
    src: BASE_SPRITE_URL,
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  },
};

// Character class to sprite mapping for SellSig roles
export function getSpriteForRole(role: string): string {
  const roleMap: Record<string, string> = {
    'recruit': 'soldier',
    'hunter': 'archer',
    'closer': 'knight',
    'cultivator': 'priest',
    'champion': 'armored',
    'senior': 'knight-templar',
    'lead': 'swordsman',
    // Opponents for battles
    'enemy': 'orc',
    'boss': 'elite-orc',
  };
  
  return roleMap[role] || 'soldier';
}

// Badge emoji for each character type
export function getBadgeForCharacter(characterType: string): string {
  const badgeMap: Record<string, string> = {
    'soldier': '⚔️',
    'knight': '🛡️',
    'archer': '🏹',
    'lancer': '🔱',
    'priest': '✨',
    'wizard': '🔮',
    'armored': '👑',
    'orc': '👹',
    'skeleton': '💀',
    'slime': '🟢',
    'werewolf': '🐺',
    'werebear': '🐻',
  };
  
  return badgeMap[characterType] || '⚔️';
}
