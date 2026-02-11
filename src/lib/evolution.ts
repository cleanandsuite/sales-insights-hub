// Sales Stats
export interface SalesStats {
  prospecting: number;    // 0-100
  discovery: number;      // 0-100
  presentation: number;   // 0-100
  negotiation: number;    // 0-100
  closing: number;        // 0-100
}

// Character Evolution Classes
export interface CharacterClass {
  id: string;
  name: string;
  emoji: string;
  tier: number;
  description: string;
  requirements: StatRequirement[];
  primaryStats: string[];
  secondaryStats: string[];
  color: string;
}

export interface StatRequirement {
  stat: keyof SalesStats;
  threshold: number;
}

// Class Definitions by Tier
export const CLASSES: CharacterClass[] = [
  // Tier 1: Specialists (1-2 stats >70)
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🦅',
    tier: 1,
    description: 'Pure lead generation master',
    requirements: [{ stat: 'prospecting', threshold: 80 }],
    primaryStats: ['prospecting'],
    secondaryStats: [],
    color: 'bg-amber-500',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    emoji: '🎯',
    tier: 1,
    description: 'Pipeline monster with closing power',
    requirements: [
      { stat: 'prospecting', threshold: 80 },
      { stat: 'closing', threshold: 70 },
    ],
    primaryStats: ['prospecting', 'closing'],
    secondaryStats: [],
    color: 'bg-green-500',
  },
  {
    id: 'cultivator',
    name: 'Cultivator',
    emoji: '🌱',
    tier: 1,
    description: 'Demo master of discovery',
    requirements: [
      { stat: 'discovery', threshold: 80 },
      { stat: 'presentation', threshold: 70 },
    ],
    primaryStats: ['discovery', 'presentation'],
    secondaryStats: [],
    color: 'bg-blue-500',
  },
  {
    id: 'closer',
    name: 'Closer',
    emoji: '🗝️',
    tier: 1,
    description: 'Deal shark in negotiations',
    requirements: [
      { stat: 'negotiation', threshold: 80 },
      { stat: 'closing', threshold: 80 },
    ],
    primaryStats: ['negotiation', 'closing'],
    secondaryStats: [],
    color: 'bg-red-500',
  },

  // Tier 2: Hybrids (3 stats >70)
  {
    id: 'striker',
    name: 'Striker',
    emoji: '⚔️',
    tier: 2,
    description: 'Front-to-back killer',
    requirements: [
      { stat: 'prospecting', threshold: 70 },
      { stat: 'discovery', threshold: 70 },
      { stat: 'closing', threshold: 70 },
    ],
    primaryStats: ['prospecting', 'discovery', 'closing'],
    secondaryStats: [],
    color: 'bg-orange-500',
  },
  {
    id: 'warlord',
    name: 'Warlord',
    emoji: '👑',
    tier: 2,
    description: 'Deal commander',
    requirements: [
      { stat: 'presentation', threshold: 70 },
      { stat: 'negotiation', threshold: 70 },
      { stat: 'closing', threshold: 70 },
    ],
    primaryStats: ['presentation', 'negotiation', 'closing'],
    secondaryStats: [],
    color: 'bg-yellow-500',
  },
  {
    id: 'architect',
    name: 'Architect',
    emoji: '🏗️',
    tier: 2,
    description: 'Solution builder',
    requirements: [
      { stat: 'discovery', threshold: 70 },
      { stat: 'presentation', threshold: 70 },
      { stat: 'negotiation', threshold: 70 },
    ],
    primaryStats: ['discovery', 'presentation', 'negotiation'],
    secondaryStats: [],
    color: 'bg-purple-500',
  },
  {
    id: 'commander',
    name: 'Commander',
    emoji: '🎖️',
    tier: 2,
    description: 'Team anchor and funnel master',
    requirements: [
      { stat: 'discovery', threshold: 70 },
      { stat: 'presentation', threshold: 70 },
      { stat: 'negotiation', threshold: 70 },
    ],
    primaryStats: ['discovery', 'presentation', 'negotiation'],
    secondaryStats: ['prospecting', 'closing'],
    color: 'bg-cyan-500',
  },

  // Tier 3: Masters (4-5 stats >80)
  {
    id: 'elite',
    name: 'Elite Agent',
    emoji: '⭐',
    tier: 3,
    description: 'Consistent elite performer',
    requirements: [
      { stat: 'prospecting', threshold: 80 },
      { stat: 'discovery', threshold: 80 },
      { stat: 'presentation', threshold: 80 },
      { stat: 'negotiation', threshold: 80 },
    ],
    primaryStats: ['prospecting', 'discovery', 'presentation', 'negotiation', 'closing'],
    secondaryStats: [],
    color: 'bg-indigo-500',
  },
  {
    id: 'archon',
    name: 'Archon',
    emoji: '🔮',
    tier: 3,
    description: 'Pure dominance across all stats',
    requirements: [
      { stat: 'prospecting', threshold: 85 },
      { stat: 'discovery', threshold: 85 },
      { stat: 'presentation', threshold: 85 },
      { stat: 'negotiation', threshold: 85 },
      { stat: 'closing', threshold: 85 },
    ],
    primaryStats: ['prospecting', 'discovery', 'presentation', 'negotiation', 'closing'],
    secondaryStats: [],
    color: 'bg-pink-500',
  },

  // Tier 4: Legends (Sustained godlike performance)
  {
    id: 'demigod',
    name: 'Demigod',
    emoji: '⚡',
    tier: 4,
    description: 'Otherworldly sales mastery',
    requirements: [
      { stat: 'prospecting', threshold: 90 },
      { stat: 'discovery', threshold: 90 },
      { stat: 'presentation', threshold: 90 },
      { stat: 'negotiation', threshold: 90 },
      { stat: 'closing', threshold: 90 },
    ],
    primaryStats: ['prospecting', 'discovery', 'presentation', 'negotiation', 'closing'],
    secondaryStats: [],
    color: 'bg-amber-400',
  },
  {
    id: 'titan',
    name: 'Titan',
    emoji: '🌍',
    tier: 4,
    description: 'Unstoppable sales force',
    requirements: [
      { stat: 'prospecting', threshold: 95 },
      { stat: 'discovery', threshold: 95 },
      { stat: 'presentation', threshold: 95 },
      { stat: 'negotiation', threshold: 95 },
      { stat: 'closing', threshold: 95 },
    ],
    primaryStats: ['prospecting', 'discovery', 'presentation', 'negotiation', 'closing'],
    secondaryStats: [],
    color: 'bg-emerald-400',
  },
];

// Calculate current class based on stats
export function calculateClass(stats: SalesStats): CharacterClass | null {
  // Sort classes by tier (descending) - check highest tier first
  const sortedClasses = [...CLASSES].sort((a, b) => b.tier - a.tier);

  for (const cls of sortedClasses) {
    if (meetsRequirements(stats, cls.requirements)) {
      return cls;
    }
  }

  // No class matched - they're a Recruit
  return null;
}

// Check if stats meet class requirements
function meetsRequirements(stats: SalesStats, requirements: StatRequirement[]): boolean {
  return requirements.every(req => stats[req.stat] >= req.threshold);
}

// Get evolution progress to next class
export function getEvolutionProgress(stats: SalesStats): {
  currentClass: CharacterClass | null;
  nextClass: CharacterClass | null;
  progress: number;
  missingStats: StatRequirement[];
} {
  const currentClass = calculateClass(stats);
  const nextClass = getNextClass(stats);

  if (!nextClass) {
    return {
      currentClass,
      nextClass: null,
      progress: 100,
      missingStats: [],
    };
  }

  // Calculate progress (average of how close each requirement is)
  const progressValues = nextClass.requirements.map(req => {
    const current = stats[req.stat];
    const required = req.threshold;
    return Math.min(current / required, 1);
  });

  const progress = progressValues.length > 0
    ? Math.round((progressValues.reduce((a, b) => a + b, 0) / progressValues.length) * 100)
    : 0;

  // Find missing stats
  const missingStats = nextClass.requirements.filter(
    req => stats[req.stat] < req.threshold
  );

  return {
    currentClass,
    nextClass,
    progress,
    missingStats,
  };
}

// Get next achievable class
function getNextClass(stats: SalesStats): CharacterClass | null {
  const sortedClasses = [...CLASSES]
    .sort((a, b) => a.tier - b.tier) // Ascending by tier
    .filter(cls => !meetsRequirements(stats, cls.requirements));

  // Find first class we're closest to
  for (const cls of sortedClasses) {
    const progress = cls.requirements.reduce((acc, req) => {
      return acc + Math.min(stats[req.stat] / req.threshold, 1);
    }, 0) / cls.requirements.length;

    if (progress >= 0.5) {
      return cls;
    }
  }

  return sortedClasses[0] || null;
}

// Calculate overall power level
export function calculatePowerLevel(stats: SalesStats): number {
  const avgStat = Object.values(stats).reduce((a, b) => a + b, 0) / 5;
  return Math.round(avgStat);
}

// Get visual effects based on class
export function getVisualEffects(cls: CharacterClass | null): {
  aura: 'none' | 'glow' | 'fire' | 'sparks' | 'particles' | 'electric' | 'rainbow';
  handEffect: 'none' | 'fire' | 'electric' | 'rainbow';
  bodyEffect: 'none' | 'sparks' | 'electric' | 'glow';
} {
  if (!cls) {
    return { aura: 'none', handEffect: 'none', bodyEffect: 'none' };
  }

  switch (cls.tier) {
    case 1:
      return { aura: 'glow', handEffect: 'none', bodyEffect: 'none' };
    case 2:
      return { aura: 'glow', handEffect: 'fire', bodyEffect: 'none' };
    case 3:
      return { aura: 'particles', handEffect: 'electric', bodyEffect: 'sparks' };
    case 4:
      if (cls.id === 'demigod') {
        return { aura: 'electric', handEffect: 'electric', bodyEffect: 'electric' };
      }
      if (cls.id === 'titan') {
        return { aura: 'rainbow', handEffect: 'rainbow', bodyEffect: 'glow' };
      }
      return { aura: 'particles', handEffect: 'electric', bodyEffect: 'sparks' };
    default:
      return { aura: 'none', handEffect: 'none', bodyEffect: 'none' };
  }
}
