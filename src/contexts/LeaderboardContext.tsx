import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const LEADERBOARD_DATA_KEY = 'sellsig_leaderboard';
const CHALLENGES_DATA_KEY = 'sellsig_team_challenges';

export interface LeaderboardEntry {
  id: string; // user id or name
  name: string;
  xp: number;
  quota: number;
  calls: number;
  wins: number;
}

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  metric: 'calls' | 'quota' | 'wins' | 'deals';
  currentLeader: string;
  bestScore: number;
  period: 'weekly' | 'monthly' | 'all-time';
  endsAt: string; // ISO timestamp
}

export interface LeaderboardData {
  enabled: boolean;
  entries: LeaderboardEntry[];
  challenges: TeamChallenge[];
  currentChallenge: TeamChallenge | null;
}

const DEFAULT_CHALLENGES: TeamChallenge[] = [
  {
    id: 'weekly-calls',
    title: 'Most Calls This Week',
    description: 'Make the most outbound calls this week',
    metric: 'calls',
    currentLeader: 'You',
    bestScore: 0,
    period: 'weekly',
    endsAt: getNextWeekEnd(),
  },
  {
    id: 'monthly-quota',
    title: 'Monthly Quota Champion',
    description: 'Highest quota achievement this month',
    metric: 'quota',
    currentLeader: 'You',
    bestScore: 0,
    period: 'monthly',
    endsAt: getNextMonthEnd(),
  },
  {
    id: 'all-time-wins',
    title: 'Hall of Fame',
    description: 'Most closed deals of all time',
    metric: 'wins',
    currentLeader: 'You',
    bestScore: 0,
    period: 'all-time',
    endsAt: getNextMonthEnd(),
  },
];

function getNextWeekEnd(): string {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + (7 - now.getDay()));
  return end.toISOString();
}

function getNextMonthEnd(): string {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.toISOString();
}

interface LeaderboardContextType {
  data: LeaderboardData;
  toggleEnabled: () => void;
  updateEntry: (entry: LeaderboardEntry) => void;
  updateChallengeScore: (challengeId: string, score: number) => void;
  resetChallenges: () => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LeaderboardData>({
    enabled: false,
    entries: [],
    challenges: DEFAULT_CHALLENGES,
    currentChallenge: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(prev => ({
          ...prev,
          ...parsed,
          enabled: parsed.enabled ?? false,
        }));
      }
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(LEADERBOARD_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save leaderboard data:', error);
    }
  }, [data]);

  const toggleEnabled = () => {
    setData(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateEntry = (entry: LeaderboardEntry) => {
    setData(prev => {
      const existingIndex = prev.entries.findIndex(e => e.id === entry.id);
      if (existingIndex >= 0) {
        // Update existing entry
        const newEntries = [...prev.entries];
        newEntries[existingIndex] = { ...newEntries[existingIndex], ...entry };
        return { ...prev, entries: newEntries };
      }
      // Add new entry
      return { ...prev, entries: [...prev.entries, entry] };
    });
  };

  const updateChallengeScore = (challengeId: string, score: number) => {
    setData(prev => {
      const newChallenges = prev.challenges.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, bestScore: Math.max(challenge.bestScore, score) }
          : challenge
      );
      return { ...prev, challenges: newChallenges };
    });
  };

  const resetChallenges = () => {
    setData(prev => ({
      ...prev,
      challenges: DEFAULT_CHALLENGES.map(ch => ({
        ...ch,
        bestScore: 0,
        currentLeader: 'You',
      })),
    }));
  };

  return (
    <LeaderboardContext.Provider
      value={{
        data,
        toggleEnabled,
        updateEntry,
        updateChallengeScore,
        resetChallenges,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within LeaderboardProvider');
  }
  return context;
}
