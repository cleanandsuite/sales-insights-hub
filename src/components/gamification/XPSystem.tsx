import { useMemo } from 'react';

// XP level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000,
  7000, 9500, 12500, 16000, 20000, 25000, 31000, 38000, 46000, 55000,
];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function getXPForNextLevel(xp: number): { current: number; required: number; progress: number } {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 5000;
  const xpInLevel = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  return {
    current: xpInLevel,
    required: xpNeeded,
    progress: Math.min((xpInLevel / xpNeeded) * 100, 100),
  };
}

// XP award values
export const XP_VALUES = {
  CALL_COMPLETED: 10,
  DEAL_CLOSED: 50,
  ACTIVITY_LOGGED: 25,
  RECORDING_ANALYZED: 15,
  COACHING_SESSION: 30,
} as const;

export function useXPSystem(totalXP: number) {
  return useMemo(() => ({
    level: getLevel(totalXP),
    totalXP,
    ...getXPForNextLevel(totalXP),
  }), [totalXP]);
}
