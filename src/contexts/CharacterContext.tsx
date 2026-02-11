import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CharacterConfig, SalesStats } from '@/lib/evolution';

export interface CharacterState {
  config: CharacterConfig;
  stats: SalesStats;
  name: string;
  updateConfig: (config: CharacterConfig) => void;
  updateStats: (stats: SalesStats) => void;
  updateName: (name: string) => void;
}

const CharacterContext = createContext<CharacterState | undefined>(undefined);

// Default character config
const DEFAULT_CONFIG: CharacterConfig = {
  build: 'medium',
  gender: 'male',
  color: '#3B82F6',
  skinColor: '#F4C2A0',
};

// Default stats (all 0 - Recruit level)
const DEFAULT_STATS: SalesStats = {
  prospecting: 0,
  discovery: 0,
  presentation: 0,
  negotiation: 0,
  closing: 0,
};

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<SalesStats>(DEFAULT_STATS);
  const [name, setName] = useState('Recruit');

  // Load from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('character_config');
    const savedStats = localStorage.getItem('character_stats');
    const savedName = localStorage.getItem('character_name');

    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedName) setName(savedName);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('character_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('character_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('character_name', name);
  }, [name]);

  const updateConfig = (newConfig: CharacterConfig) => setConfig(newConfig);
  const updateStats = (newStats: SalesStats) => setStats(newStats);
  const updateName = (newName: string) => setName(newName);

  return (
    <CharacterContext.Provider
      value={{
        config,
        stats,
        name,
        updateConfig,
        updateStats,
        updateName,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
