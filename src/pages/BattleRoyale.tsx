import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, Trophy, Users, Clock, Gift, Star, Zap, 
  TrendingUp, Target, ArrowRight, Play, UserPlus, MessageSquare,
  ChevronRight, Flame, Medal, Crown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// Team data
const teams = [
  {
    id: 'alpha',
    name: 'Team Alpha',
    color: 'bg-blue-500',
    totalXP: 1250000,
    revenue: 450000,
    deals: 24,
    members: 4,
    rank: 1,
  },
  {
    id: 'beta',
    name: 'Team Beta',
    color: 'bg-green-500',
    totalXP: 1180000,
    revenue: 420000,
    deals: 21,
    members: 4,
    rank: 2,
  },
  {
    id: 'gamma',
    name: 'Team Gamma',
    color: 'bg-purple-500',
    totalXP: 980000,
    revenue: 380000,
    deals: 18,
    members: 4,
    rank: 3,
  },
  {
    id: 'delta',
    name: 'Team Delta',
    color: 'bg-orange-500',
    totalXP: 850000,
    revenue: 320000,
    deals: 15,
    members: 4,
    rank: 4,
  },
];

// Individual leaderboard
const individualData = [
  { id: 1, name: 'Sarah Chen', team: 'alpha', level: 15, xp: 15420, revenue: 125000, calls: 45, trend: 'up' },
  { id: 2, name: 'Mike Johnson', team: 'alpha', level: 14, xp: 14890, revenue: 118000, calls: 52, trend: 'up' },
  { id: 3, name: 'Amanda Foster', team: 'beta', level: 13, xp: 13200, revenue: 98000, calls: 48, trend: 'down' },
  { id: 4, name: 'David Lee', team: 'beta', level: 13, xp: 12900, revenue: 95000, calls: 41, trend: 'up' },
  { id: 5, name: 'Emily Zhang', team: 'gamma', level: 12, xp: 11800, revenue: 88000, calls: 55, trend: 'up' },
  { id: 6, name: 'Robert Kim', team: 'gamma', level: 12, xp: 11500, revenue: 85000, calls: 38, trend: 'stable' },
  { id: 7, name: 'Lisa Wang', team: 'delta', level: 11, xp: 10200, revenue: 72000, calls: 42, trend: 'down' },
  { id: 8, name: 'James Brown', team: 'delta', level: 11, xp: 9800, revenue: 68000, calls: 35, trend: 'stable' },
];

// Competition history
const competitionHistory = [
  { week: 'Week 1', alpha: 320000, beta: 290000, gamma: 250000, delta: 210000 },
  { week: 'Week 2', alpha: 380000, beta: 350000, gamma: 310000, delta: 280000 },
  { week: 'Week 3', alpha: 420000, beta: 400000, gamma: 350000, delta: 320000 },
  { week: 'Week 4', alpha: 450000, beta: 420000, gamma: 380000, delta: 360000 },
];

export default function BattleRoyale() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('teams');
  const [competitionDays] = useState(7);
  const [daysRemaining] = useState(3);
  const [prizePool] = useState(2500);

  const prizeDistribution = [
    { place: '1st', prize: '$1,000', team: 'Team Alpha' },
    { place: '2nd', prize: '$750', team: 'Team Beta' },
    { place: '3rd', prize: '$500', team: 'Team Gamma' },
    { place: '4th', prize: '$250', team: 'Team Delta' },
  ];

  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
      )}
      
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={(phone) => setActiveCall(phone)}
      />
      
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Trophy className="h-6 w-6 text-warning" />
                Battle Royale
              </h1>
              <p className="text-sm text-muted-foreground">
                Weekly Sales Competition • {daysRemaining} days remaining
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="text-xl font-bold text-warning">${prizePool}</p>
              </div>
              <Button onClick={() => setShowCallDialog(true)} className="gap-2">
                <Phone className="h-4 w-4" />
                Start Call
              </Button>
            </div>
          </div>

          {/* Countdown & Prize Pool */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Competition Ends In</p>
                      <p className="text-3xl font-bold">{daysRemaining} Days</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(1570000)}</p>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">78</p>
                      <p className="text-xs text-muted-foreground">Deals Closed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">211</p>
                      <p className="text-xs text-muted-foreground">Calls Made</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Prize Distribution</p>
                <div className="space-y-2">
                  {prizeDistribution.map((p) => (
                    <div key={p.place} className="flex items-center justify-between text-sm">
                      <span>{p.place}</span>
                      <span className="font-medium">{p.prize}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="teams">Team Rankings</TabsTrigger>
              <TabsTrigger value="individuals">Individual Leaderboard</TabsTrigger>
              <TabsTrigger value="coaching">Coaching</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Team Rankings Tab */}
            <TabsContent value="teams" className="space-y-6 mt-6">
              {/* Team Competition Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Competition Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={competitionHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="week" tick={{ fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="alpha" fill="#3B82F6" name="Team Alpha" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="beta" fill="#10B981" name="Team Beta" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="gamma" fill="#8B5CF6" name="Team Gamma" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="delta" fill="#F59E0B" name="Team Delta" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Team Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map((team) => (
                  <Card key={team.id} className={`relative overflow-hidden ${team.rank === 1 ? 'border-warning' : ''}`}>
                    {team.rank === 1 && (
                      <div className="absolute top-0 right-0 bg-warning text-warning-foreground px-3 py-1 rounded-bl-lg text-sm font-medium flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        Leader
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-lg ${team.color} flex items-center justify-center text-white font-bold`}>
                            {team.name.charAt(5)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{team.members} members</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">#{team.rank}</p>
                          <p className="text-xs text-muted-foreground">Team Rank</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total XP</p>
                          <p className="text-xl font-bold">{team.totalXP.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="text-xl font-bold">{formatCurrency(team.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Deals</p>
                          <p className="text-xl font-bold">{team.deals}</p>
                        </div>
                      </div>
                      <Progress value={(team.totalXP / teams[0].totalXP) * 100} className="mt-4 h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Individual Leaderboard Tab */}
            <TabsContent value="individuals" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Individual Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {individualData.map((person, index) => (
                      <div 
                        key={person.id} 
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate('/recordings')}
                      >
                        <div className="w-8 text-center font-bold text-muted-foreground">
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{person.name}</p>
                            <Badge variant="outline" className="text-xs">Lvl {person.level}</Badge>
                            <Badge className={`text-xs ${person.trend === 'up' ? 'bg-success' : person.trend === 'down' ? 'bg-destructive' : 'bg-muted'}`}>
                              {person.trend === 'up' ? '↑' : person.trend === 'down' ? '↓' : '→'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{person.calls} calls • {formatCurrency(person.revenue)} revenue</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{person.xp.toLocaleString()} XP</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coaching Tab */}
            <TabsContent value="coaching" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Need Coaching */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Needs Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {individualData.filter(p => p.trend === 'down' || p.calls < 40).slice(0, 4).map((person) => (
                      <div key={person.id} className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                        <Avatar>
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {person.trend === 'down' ? 'Performance declining' : 'Low activity'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate('/recordings')}>
                            <Play className="h-3 w-3" />
                            Review
                          </Button>
                          <Button size="sm" className="gap-1">
                            <UserPlus className="h-3 w-3" />
                            Pair
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Pairing Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Suggested Pairings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { mentor: 'Sarah Chen', mentee: 'Lisa Wang', focus: 'Closing techniques' },
                      { mentor: 'Mike Johnson', mentee: 'James Brown', focus: 'Call volume' },
                      { mentor: 'Emily Zhang', mentee: 'Robert Kim', focus: 'Discovery calls' },
                    ].map((pair, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{pair.mentor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{pair.mentee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{pair.mentor} → {pair.mentee}</p>
                          <p className="text-xs text-muted-foreground">{pair.focus}</p>
                        </div>
                        <Button size="sm">Pair Up</Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Manager Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Manager Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Gift className="h-6 w-6 text-warning" />
                    <span>Grant Bonus XP</span>
                    <span className="text-xs text-muted-foreground">Reward top performers</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Star className="h-6 w-6 text-primary" />
                    <span>Award Badge</span>
                    <span className="text-xs text-muted-foreground">Recognize achievements</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <MessageSquare className="h-6 w-6 text-success" />
                    <span>Send Feedback</span>
                    <span className="text-xs text-muted-foreground">Direct coaching notes</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Past Competitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { week: 'Week 4', winner: 'Team Alpha', prize: '$1,000', revenue: 450000 },
                      { week: 'Week 3', winner: 'Team Beta', prize: '$1,000', revenue: 420000 },
                      { week: 'Week 2', winner: 'Team Alpha', prize: '$1,000', revenue: 380000 },
                      { week: 'Week 1', winner: 'Team Gamma', prize: '$1,000', revenue: 350000 },
                    ].map((comp, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium">{comp.winner}</p>
                            <p className="text-sm text-muted-foreground">{comp.week}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(comp.revenue)}</p>
                          <p className="text-sm text-muted-foreground">{comp.prize}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
