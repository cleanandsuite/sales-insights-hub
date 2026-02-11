import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Target, TrendingUp, Phone, Zap, Flame, 
  Calendar, BarChart3, Sparkles, ArrowRight, DollarSign,
  Activity, Clock, Users, Star
} from 'lucide-react';

// Mock Data
import {
  mockMetrics,
  mockPriorityDeals,
  mockRecentCalls,
} from '@/data/dashboardMockData';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// XP to level calculation
const getLevelFromXP = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
const getProgressToNextLevel = (xp: number) => {
  const level = getLevelFromXP(xp);
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  // Gamified stats
  const stats = {
    xp: 12450,
    level: 12,
    quota: { current: 1200000, target: 1500000 },
    calls: { made: 247, followUpRate: 89 },
    winRate: 78,
    closeRate: 65,
    leadConv: 52,
    dealVelocity: 18,
    avgDealSize: 45000,
    responseTime: 1.2,
    streak: 5,
    weeklyGoal: { completed: 5, total: 8 },
  };

  const levelProgress = getProgressToNextLevel(stats.xp);
  const quotaProgress = Math.round((stats.quota.current / stats.quota.target) * 100);

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
          {/* Header with XP */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Stats</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button onClick={() => setShowCallDialog(true)} className="gap-2">
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          </div>

          {/* Level & Quota Hero */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* XP Level Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-3xl font-bold">{stats.level}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Star className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Level {stats.level}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={levelProgress} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{Math.round(levelProgress)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.xp.toLocaleString()} XP total</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-warning">
                      <Flame className="h-5 w-5" />
                      <span className="text-xl font-bold">{stats.streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">day streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quota Progress */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quota Progress</span>
                  <Badge variant="outline">{quotaProgress}%</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {formatCurrency(stats.quota.current)}
                  <span className="text-lg font-normal text-muted-foreground">
                    / {formatCurrency(stats.quota.target)}
                  </span>
                </div>
                <Progress value={quotaProgress} className="h-3" />
              </CardContent>
            </Card>
          </div>

          {/* Core Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Calls */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.calls.made}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-primary" 
                      style={{ width: `${Math.min(stats.calls.made / 3, 100)}%` }} 
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">daily avg</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.calls.followUpRate}% follow-up rate</p>
              </CardContent>
            </Card>

            {/* Win Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.winRate}%</div>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map((i) => (
                    <div 
                      key={i}
                      className={`h-2 flex-1 rounded-sm ${
                        i <= Math.ceil(stats.winRate / 20) ? 'bg-warning' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">vs {100 - stats.winRate}% loss rate</p>
              </CardContent>
            </Card>

            {/* Close Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-success" />
                  Close Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.closeRate}%</div>
                <Progress value={stats.closeRate} className="mt-2 h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Lead to close</p>
              </CardContent>
            </Card>

            {/* Deal Velocity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  Deal Speed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dealVelocity} days</div>
                <p className="text-xs text-muted-foreground mt-1">Average to close</p>
                <p className="text-xs text-success mt-1">↓ 2 days vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Efficiency Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Efficiency Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lead Conversion</p>
                    <p className="text-2xl font-bold">{stats.leadConv}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avg Deal Size</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.avgDealSize)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold">{stats.responseTime}h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Goals & Achievements */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Goals Completed</span>
                  <Badge>{stats.weeklyGoal.completed}/{stats.weeklyGoal.total}</Badge>
                </div>
                <Progress value={(stats.weeklyGoal.completed / stats.weeklyGoal.total) * 100} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground">Calls Made</p>
                    <p className="font-medium">18 / 20</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground">Leads Added</p>
                    <p className="font-medium">12 / 15</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground">Deals Closed</p>
                    <p className="font-medium">3 / 5</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground">Follow-ups</p>
                    <p className="font-medium">25 / 30</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-warning/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Top Performer</p>
                      <p className="text-xs text-muted-foreground">Week of Jan 15</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-destructive/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hot Streak</p>
                      <p className="text-xs text-muted-foreground">5 deals in 7 days</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-primary/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Iron Rep</p>
                      <p className="text-xs text-muted-foreground">30 day streak</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-success/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quick Closer</p>
                      <p className="text-xs text-muted-foreground">Avg 12 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Priority Actions</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/enterprise')}>
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {mockPriorityDeals.slice(0, 4).map((deal) => (
                <div 
                  key={deal.id} 
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/enterprise')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{deal.stage}</Badge>
                    <span className="text-sm font-semibold">{formatCurrency(deal.value)}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{deal.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
                  {deal.alert && (
                    <p className="text-xs text-warning mt-1">{deal.alert}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/leads')}>
              <Target className="h-3 w-3" />
              Leads
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/schedule')}>
              <Calendar className="h-3 w-3" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/winwords')}>
              <Sparkles className="h-3 w-3" />
              WinWords
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/analytics')}>
              <BarChart3 className="h-3 w-3" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/enterprise')}>
              <TrendingUp className="h-3 w-3" />
              Deals
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
