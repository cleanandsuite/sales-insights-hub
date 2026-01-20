import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, Medal, Award, Flame, TrendingUp, TrendingDown, Minus,
  Phone, Target, Star, Crown, Zap
} from 'lucide-react';

interface RepLeaderboardProps {
  teamId: string;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  rank: number;
  score: number;
  previousRank: number;
  totalCalls: number;
  winRate: number;
  streak: number;
  badges: string[];
}

type MetricType = 'overall' | 'calls' | 'win_rate' | 'closing' | 'discovery';

const METRIC_OPTIONS = [
  { value: 'overall', label: 'Overall Score' },
  { value: 'calls', label: 'Total Calls' },
  { value: 'win_rate', label: 'Win Rate' },
  { value: 'closing', label: 'Closing Score' },
  { value: 'discovery', label: 'Discovery Score' },
];

const BADGES = {
  top_performer: { icon: Crown, label: 'Top Performer', color: 'text-primary' },
  rising_star: { icon: TrendingUp, label: 'Rising Star', color: 'text-primary' },
  call_champion: { icon: Phone, label: 'Call Champion', color: 'text-primary' },
  closer: { icon: Target, label: 'Master Closer', color: 'text-primary' },
  consistent: { icon: Star, label: 'Consistent', color: 'text-primary' },
  hot_streak: { icon: Flame, label: 'Hot Streak', color: 'text-destructive' },
};

export function RepLeaderboard({ teamId }: RepLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<MetricType>('overall');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchLeaderboard();
  }, [teamId, metric, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      // Sort by selected metric
      const sorted = [...(data || [])].sort((a, b) => {
        switch (metric) {
          case 'overall': return (Number(b.avg_overall_score) || 0) - (Number(a.avg_overall_score) || 0);
          case 'calls': return (Number(b.total_calls) || 0) - (Number(a.total_calls) || 0);
          case 'win_rate': return (Number(b.win_rate) || 0) - (Number(a.win_rate) || 0);
          case 'closing': return (Number(b.avg_closing_score) || 0) - (Number(a.avg_closing_score) || 0);
          case 'discovery': return (Number(b.avg_discovery_score) || 0) - (Number(a.avg_discovery_score) || 0);
          default: return 0;
        }
      });

      // Calculate badges and streaks
      const leaderboard: LeaderboardEntry[] = sorted.map((rep, index) => {
        const badges: string[] = [];
        const score = getScoreForMetric(rep, metric);
        const calls = Number(rep.total_calls) || 0;
        const winRate = Number(rep.win_rate) || 0;
        const closingScore = Number(rep.avg_closing_score) || 0;

        // Award badges based on performance
        if (index === 0) badges.push('top_performer');
        if (calls > 50) badges.push('call_champion');
        if (closingScore > 85) badges.push('closer');
        if (winRate > 70) badges.push('consistent');
        
        // Simulate streak (in production, calculate from call history)
        const streak = Math.floor(Math.random() * 7);
        if (streak >= 3) badges.push('hot_streak');

        return {
          user_id: rep.user_id,
          full_name: rep.full_name || 'Unknown',
          rank: index + 1,
          score,
          previousRank: index + 1 + Math.floor(Math.random() * 3) - 1, // Simulated
          totalCalls: calls,
          winRate,
          streak,
          badges,
        };
      });

      setEntries(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreForMetric = (rep: any, metric: MetricType): number => {
    switch (metric) {
      case 'overall': return Number(rep.avg_overall_score) || 0;
      case 'calls': return Number(rep.total_calls) || 0;
      case 'win_rate': return Number(rep.win_rate) || 0;
      case 'closing': return Number(rep.avg_closing_score) || 0;
      case 'discovery': return Number(rep.avg_discovery_score) || 0;
      default: return 0;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-primary" />;
      case 2: return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3: return <Award className="h-5 w-5 text-primary/60" />;
      default: return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) return <Badge variant="outline" className="text-primary border-primary/50 text-xs gap-0.5"><TrendingUp className="h-3 w-3" />+{diff}</Badge>;
    if (diff < 0) return <Badge variant="outline" className="text-destructive border-destructive/50 text-xs gap-0.5"><TrendingDown className="h-3 w-3" />{diff}</Badge>;
    return <Badge variant="outline" className="text-muted-foreground text-xs gap-0.5"><Minus className="h-3 w-3" />0</Badge>;
  };

  const formatScore = (score: number, metric: MetricType) => {
    if (metric === 'win_rate') return `${score.toFixed(0)}%`;
    if (metric === 'calls') return score.toString();
    return score.toFixed(1);
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Rep Leaderboard
          </CardTitle>
          <div className="flex gap-2">
            <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <div className="flex items-end justify-center gap-2 pb-4 border-b border-border/50">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 border-2 border-muted-foreground">
                    <AvatarFallback className="bg-muted text-sm">
                      {entries[1].full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Medal className="h-5 w-5 text-muted-foreground -mt-2" />
                  <p className="text-xs font-medium mt-1">{entries[1].full_name.split(' ')[0]}</p>
                  <p className="text-sm font-bold">{formatScore(entries[1].score, metric)}</p>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -mt-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {entries[0].full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Crown className="h-5 w-5 text-primary absolute -top-2 left-1/2 -translate-x-1/2" />
                  </div>
                  <Trophy className="h-6 w-6 text-primary -mt-2" />
                  <p className="text-sm font-medium mt-1">{entries[0].full_name.split(' ')[0]}</p>
                  <p className="text-lg font-bold text-primary">{formatScore(entries[0].score, metric)}</p>
                  {entries[0].streak >= 3 && (
                    <Badge variant="outline" className="text-destructive border-destructive/50 text-xs gap-1 mt-1">
                      <Flame className="h-3 w-3" /> {entries[0].streak} day streak
                    </Badge>
                  )}
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 border-2 border-primary/60">
                    <AvatarFallback className="bg-muted text-sm">
                      {entries[2].full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Award className="h-5 w-5 text-primary/60 -mt-2" />
                  <p className="text-xs font-medium mt-1">{entries[2].full_name.split(' ')[0]}</p>
                  <p className="text-sm font-bold">{formatScore(entries[2].score, metric)}</p>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {entries.map((entry) => (
                <div 
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.rank <= 3 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{entry.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {entry.badges.slice(0, 3).map((badge) => {
                          const BadgeIcon = BADGES[badge as keyof typeof BADGES]?.icon;
                          const color = BADGES[badge as keyof typeof BADGES]?.color || 'text-muted-foreground';
                          return BadgeIcon ? (
                            <BadgeIcon key={badge} className={`h-3 w-3 ${color}`} />
                          ) : null;
                        })}
                        {entry.badges.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{entry.badges.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{formatScore(entry.score, metric)}</p>
                      <p className="text-xs text-muted-foreground">{entry.totalCalls} calls</p>
                    </div>
                    {getRankChange(entry.rank, entry.previousRank)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
