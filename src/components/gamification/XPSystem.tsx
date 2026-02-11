// XP System - Visual Experience Tracker

export const XP_LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 5, xpRequired: 100 },
  { level: 10, xpRequired: 500 },
  { level: 15, xpRequired: 1500 },
  { level: 20, xpRequired: 5000 },
  { level: 25, xpRequired: 25000 },
];

export const XP_SOURCES = {
  call: 10,
  deal: 50,
  activity: 25,
};

export function getLevelForXP(xp: number): number {
  let level = 1;
  for (const entry of XP_LEVELS) {
    if (xp >= entry.xpRequired) {
      level = entry.level;
    }
  }
  return level;
}

export function getXPProgress(xp: number): { current: number; next: number; percent: number } {
  let current = 0;
  let next = 100;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].xpRequired) {
      current = XP_LEVELS[i].xpRequired;
      next = XP_LEVELS[i + 1]?.xpRequired ?? current + 1000;
    }
  }
  const percent = Math.min(((xp - current) / (next - current)) * 100, 100);
  return { current, next, percent };
}
