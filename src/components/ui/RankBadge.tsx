import { cn } from '@/lib/utils';

export interface RankBadgeProps {
  rank: number | 'unranked';
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

// Rank data structure
interface RankInfo {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RANKS: Record<string, RankInfo> = {
  unranked: {
    name: 'Unranked',
    emoji: '🔷',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    borderColor: 'border-border',
  },
  wood: {
    name: 'Wood',
    emoji: '🪵',
    color: 'text-amber-700',
    bgColor: 'bg-amber-700/10',
    borderColor: 'border-amber-700/30',
  },
  iron: {
    name: 'Iron',
    emoji: '🔩',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
  },
  copper: {
    name: 'Copper',
    emoji: '🟤',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
    borderColor: 'border-orange-600/30',
  },
  bronze: {
    name: 'Bronze',
    emoji: '🥉',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    borderColor: 'border-amber-600/30',
  },
  sapphire: {
    name: 'Sapphire',
    emoji: '💎',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  ruby: {
    name: 'Ruby',
    emoji: '💎',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  emerald: {
    name: 'Emerald',
    emoji: '💎',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  silver: {
    name: 'Silver',
    emoji: '🥈',
    color: 'text-gray-300',
    bgColor: 'bg-gray-300/10',
    borderColor: 'border-gray-300/30',
  },
  gold: {
    name: 'Gold',
    emoji: '🥇',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  platinum: {
    name: 'Platinum',
    emoji: '💎',
    color: 'text-slate-200',
    bgColor: 'bg-slate-200/10',
    borderColor: 'border-slate-200/30',
  },
  titanium: {
    name: 'Titanium',
    emoji: '💎',
    color: 'text-slate-300',
    bgColor: 'bg-slate-300/10',
    borderColor: 'border-slate-300/30',
  },
  diamond: {
    name: 'Diamond',
    emoji: '💎',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    borderColor: 'border-slate-400/30',
  },
  master: {
    name: 'Master',
    emoji: '👑',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  grandmaster: {
    name: 'Grandmaster',
    emoji: '👑',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-600/10',
    borderColor: 'border-indigo-600/30',
  },
  legend: {
    name: 'Legend',
    emoji: '👑',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  champion: {
    name: 'Champion',
    emoji: '🏆',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
  overlord: {
    name: 'Overlord',
    emoji: '🏆',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  mythic: {
    name: 'Mythic',
    emoji: '👑',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  divine: {
    name: 'Divine',
    emoji: '👑',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
  },
  cosmic: {
    name: 'Cosmic',
    emoji: '🌟',
    color: 'text-transparent',
    background: 'linear-gradient(135deg, #FF6B6B, #FECFEA, #00B4D8, #FF6B6B)',
    color: 'text-white',
    borderColor: 'border-transparent',
  },
};

// Get rank info from XP - Adjusted progression
// Unranked Tier (XP < 500) - Easier progression: Wood → Bronze
// Bronze Tier (3,000 - 20,000) - More tiers available
// Silver Tier (20,000 - 50,000) - Still very achievable
// Gold Tier (50,000 - 100,000) - Significant achievement
// Platinum Tier (100,000 - 250,000) - God-like status
export function getRankFromXP(xp: number): string {
  if (!xp || xp < 0) return 'unranked';

  // Unranked Tier (XP < 500) - Easier progression
  if (xp < 250) return 'wood';
  if (xp < 500) return 'iron';
  if (xp < 1500) return 'copper';
  if (xp < 3000) return 'bronze';

  // Bronze Tier (3,000 - 20,000) - 5 tiers
  if (xp < 5000) return 'sapphire';
  if (xp < 7500) return 'ruby';
  if (xp < 10000) return 'emerald';
  if (xp < 12500) return 'silver';
  if (xp < 15000) return 'gold';

  // Silver Tier (20,000 - 50,000) - 4 tiers
  if (xp < 20000) return 'platinum';
  if (xp < 30000) return 'titanium';
  if (xp < 35000) return 'diamond';
  if (xp < 40000) return 'master';
  if (xp < 50000) return 'grandmaster';
  if (xp < 60000) return 'legend';
  if (xp < 70000) return 'champion';
  if (xp < 85000) return 'overlord';
  if (xp < 100000) return 'mythic';

  // Platinum Tier (100,000 - 250,000) - God-like status
  if (xp < 150000) return 'divine';
  return 'cosmic'; // Unlimited potential!
}

export function RankBadge({ rank, size = 'md', showNumber = true }: RankBadgeProps) {
  if (rank === 'unranked' || typeof rank === 'number' && rank === 0) {
    const rankInfo = RANKS.unranked;
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
      </div>
    );
  }

  if (rank === 'wood' || rank === 'iron' || rank === 'copper') {
    const rankInfo = RANKS[rank];
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
        {showNumber && <span className="ml-1 text-xs">#{rank}</span>}
      </div>
    );
  }

  if (rank === 'bronze' || rank === 'sapphire' || rank === 'ruby' || rank === 'emerald') {
    const rankInfo = RANKS[rank];
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
        {showNumber && <span className="ml-1 text-xs">#{rank}</span>}
      </div>
    );
  }

  if (rank === 'silver' || rank === 'gold' || rank === 'platinum' || rank === 'titanium' || rank === 'diamond') {
    const rankInfo = RANKS[rank];
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
        {showNumber && <span className="ml-1 text-xs">#{rank}</span>}
      </div>
    );
  }

  if (rank === 'master' || rank === 'grandmaster' || rank === 'legend') {
    const rankInfo = RANKS[rank];
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
        {showNumber && <span className="ml-1 text-xs">#{rank}</span>}
      </div>
    );
  }

  if (rank === 'champion' || rank === 'overlord') {
    const rankInfo = RANKS[rank];
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
        {showNumber && <span className="ml-1 text-xs">#{rank}</span>}
      </div>
    );
  }

  if (rank === 'mythic' || rank === 'divine') {
    const rankInfo = RANKS[rank];
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-semibold",
        rankInfo.color,
        "p-1 rounded-lg",
        rankInfo.bgColor,
        rankInfo.borderColor,
      )}>
        <span className="text-lg">{rankInfo.emoji}</span>
        <span className="font-medium">{rankInfo.name}</span>
        {showNumber && <span className="ml-1 text-xs">#{rank}</span>}
      </div>
    );
  }

  if (rank === 'cosmic') {
    const rankInfo = RANKS.cosmic;
    return (
      <div className={cn(
        "flex items-center gap-2",
        size === 'sm' ? "text-sm" : "text-md",
        "font-bold",
        "p-1 rounded-lg",
        "text-white",
        "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500",
        "border-2 border-white/20",
      )}>
        <span className="text-lg animate-pulse">🌟</span>
        <span className="font-medium">{rankInfo.name}</span>
      </div>
    );
  }

  // Fallback for any other rank
  const rankInfo = RANKS.wood;
  return (
    <div className={cn(
      "flex items-center gap-2",
      size === 'sm' ? "text-sm" : "text-md",
      "font-semibold",
      "text-muted-foreground",
      "p-1 rounded-lg",
      "bg-muted/10",
      "border-border",
    )}>
      <span className="text-lg">{rankInfo.emoji}</span>
      <span className="font-medium">{rankInfo.name}</span>
    </div>
  );
}
