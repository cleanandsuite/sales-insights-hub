import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy, Target, Phone, Flame, TrendingUp,
  Medal, Crown, Users, RefreshCw, Settings
} from 'lucide-react';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded">
        <Crown className="h-4 w-4" />
        <span className="font-bold">#1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-1 bg-gray-300/20 text-gray-300 border border-gray-300/30 px-2 py-1 rounded">
        <Medal className="h-4 w-4" />
        <span className="font-bold">#2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-1 bg-amber-600/20 text-amber-600 border border-amber-600/30 px-2 py-1 rounded">
        <Medal className="h-4 w-4" />
        <span className="font-bold">#3</span>
      </div>
    );
  }
  return <Badge variant="outline">#{rank}</Badge>;
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { data, toggleEnabled, resetChallenges } = useLeaderboard();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [showSettings, setShowSettings] = useState(false);

  // Mock leaderboard data (in real app, this comes from DB)
  const mockEntries = [
    { id: 'user-1', name: 'Sarah Chen', xp: 25000, quota: 180000, calls: 342, wins: 28 },
    { id: 'user-2', name: 'You', xp: 12450, quota: 120000, calls: 247, wins: 24 },
    { id: 'user-3', name: 'Mike Johnson', xp: 18500, quota: 150000, calls: 289, wins: 22 },
    { id: 'user-4', name: 'Lisa Park', xp: 31000, quota: 210000, calls: 398, wins: 35 },
    { id: 'user-5', name: 'David Kim', xp: 42000, quota: 250000, calls: 456, wins: 42 },
  ].sort((a, b) => b.xp - a.xp);

  const yourRank = mockEntries.findIndex(e => e.name === 'You') + 1;
  const periodOptions = ['weekly', 'monthly', 'all-time'] as const;

  return (
    <>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => navigate('/settings')}>
                Settings
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Leaderboard Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable to participate in team rankings
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={data.enabled ? 'default' : 'outline'}>
                      {data.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Button
                      variant={data.enabled ? 'destructive' : 'default'}
                      size="sm"
                      onClick={toggleEnabled}
                    >
                      {data.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {data.enabled ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="leaderboard" className="flex-1 sm:flex-none">Leaderboard</TabsTrigger>
                <TabsTrigger value="challenges" className="flex-1 sm:flex-none">Team Challenges</TabsTrigger>
              </TabsList>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6 mt-6">
                {/* Your Rank Card */}
                <Card className="border-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Your Rank</p>
                        <p className="text-3xl font-bold">{yourRank}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {yourRank === 1 ? '👑 Top Performer!' : `of ${mockEntries.length} team members`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Leaderboard Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-warning" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockEntries.map((entry, index) => (
                        <div
                          key={entry.id}
                          className={cn(
                            "flex flex-col xs:flex-row xs:items-center gap-3 p-3 sm:p-4 rounded-lg border transition-colors",
                            entry.name === 'You'
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/30 hover:bg-muted/50'
                          )}
                        >
                          {/* Rank + Name row */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 xs:w-12 text-center shrink-0">
                              {getRankBadge(index + 1)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{entry.name}</p>
                              {entry.name === 'You' && (
                                <Badge variant="secondary" className="text-xs">You</Badge>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-sm ml-13 xs:ml-0">
                            <div>
                              <p className="text-muted-foreground text-xs">XP</p>
                              <p className="font-semibold text-xs sm:text-sm">{entry.xp.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Quota</p>
                              <p className="font-semibold text-xs sm:text-sm">{formatCurrency(entry.quota)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Wins</p>
                              <p className="font-semibold text-xs sm:text-sm">{entry.wins}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Challenges Tab */}
              <TabsContent value="challenges" className="space-y-6 mt-6">
                {data.challenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {challenge.title}
                      </CardTitle>
                      <Badge variant="outline">{challenge.period}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {challenge.description}
                      </p>

                      {/* Current Leader */}
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Flame className="h-6 w-6 text-warning" />
                          <div>
                            <p className="text-sm text-muted-foreground">Current Leader</p>
                            <p className="font-bold text-lg">{challenge.currentLeader}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Best Score</p>
                          <p className="text-2xl font-bold text-primary">
                            {challenge.metric === 'calls' ? `${challenge.bestScore} calls` :
                             challenge.metric === 'quota' ? formatCurrency(challenge.bestScore) :
                             `${challenge.bestScore} wins`}
                          </p>
                        </div>
                      </div>

                      {/* Time Remaining */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Time Remaining</p>
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Challenge resets on {new Date(challenge.endsAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* CTA */}
                      <Button className="w-full gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Check Your Progress
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Reset Button */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Reset Challenges</p>
                        <p className="text-sm text-muted-foreground">
                          Start fresh week/month? This clears all challenge scores.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={resetChallenges}>
                        <RefreshCw className="h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Disabled State
            <Card>
              <CardContent className="py-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Leaderboard Disabled</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Enable leaderboards to see team rankings and participate in challenges.
                </p>
                <Button onClick={toggleEnabled} size="lg">
                  <Users className="h-5 w-5" />
                  Enable Leaderboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
