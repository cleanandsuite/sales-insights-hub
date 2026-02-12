import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feature flag - OFF by default (security)
const GAMIFICATION_ENABLED_KEY = 'sellsig_gamification_enabled';
const GAMIFICATION_DATA_KEY = 'sellsig_gamification_data';

export type CharacterBuild = 'yordle' | 'medium' | 'muscular';
export type CharacterGender = 'male' | 'female';

export interface CharacterConfig {
  build: CharacterBuild;
  gender: CharacterGender;
  name: string;
  color?: string;
  skinColor?: string;
}

export interface CharacterStats {
  prospecting: number;
  discovery: number;
  presentation: number;
  negotiation: number;
  closing: number;
}

export interface GamificationData {
  enabled: boolean;
  character: CharacterConfig;
  stats: CharacterStats;
  xp: number;
  level: number;
}

const DEFAULT_CHARACTER: CharacterConfig = {
  build: 'medium',
  gender: 'male',
  name: 'Recruit',
};

const DEFAULT_STATS: CharacterStats = {
  prospecting: 50,
  discovery: 50,
  presentation: 50,
  negotiation: 50,
  closing: 50,
};

const DEFAULT_DATA: GamificationData = {
  enabled: false,
  character: DEFAULT_CHARACTER,
  stats: DEFAULT_STATS,
  xp: 0,
  level: 1,
};

interface GamificationContextType {
  data: GamificationData;
  isEnabled: boolean;
  toggleEnabled: () => void;
  updateCharacter: (character: Partial<CharacterConfig>) => void;
  updateStats: (stats: Partial<CharacterStats>) => void;
  addXP: (amount: number) => void;
  resetData: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GamificationData>(DEFAULT_DATA);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GAMIFICATION_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData({
          ...DEFAULT_DATA,
          ...parsed,
          enabled: parsed.enabled ?? false, // Default to false
        });
      }
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(GAMIFICATION_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save gamification data:', error);
    }
  }, [data]);

  const toggleEnabled = () => {
    setData(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateCharacter = (character: Partial<CharacterConfig>) => {
    setData(prev => ({
      ...prev,
      character: { ...prev.character, ...character }
    }));
  };

  const updateStats = (stats: Partial<CharacterStats>) => {
    setData(prev => ({
      ...prev,
      stats: { ...prev.stats, ...stats }
    }));
  };

  const addXP = (amount: number) => {
    setData(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1; // 1000 XP per level
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const resetData = () => {
    setData(DEFAULT_DATA);
  };

  return (
    <GamificationContext.Provider
      value={{
        data,
        isEnabled: data.enabled,
        toggleEnabled,
        updateCharacter,
        updateStats,
        addXP,
        resetData,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}
