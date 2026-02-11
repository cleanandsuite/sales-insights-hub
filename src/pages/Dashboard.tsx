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
  Trophy, Target, TrendingUp, Phone, Flame, 
  Calendar, BarChart3, Sparkles, ArrowRight, DollarSign,
  Clock, Users, Star, Zap
} from 'lucide-react';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  // Core stats
  const stats = {
    xp: 12450,
    level: 12,
    quota: { current: 1200000, target: 1500000 },
    calls: { made: 247, daily: 8 },
    winRate: 78,
    closeRate: 65,
    streak: 5,
  };

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
          {/* Header */}
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

          {/* Top Row: Level, Quota, Streak */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Level */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.level}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Level {stats.level}</p>
                    <Progress value={68} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{stats.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quota */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quota</span>
                  <Badge variant="outline">{quotaProgress}%</Badge>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.quota.current)}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {formatCurrency(stats.quota.target)}
                  </span>
                </div>
                <Progress value={quotaProgress} className="mt-3 h-2" />
              </CardContent>
            </Card>

            {/* Streak */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                    <Flame className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.streak} day</p>
                    <p className="text-sm text-muted-foreground">activity streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold">{stats.winRate}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Close Rate</p>
                    <p className="text-2xl font-bold">{stats.closeRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-success/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Calls</p>
                    <p className="text-2xl font-bold">{stats.calls.made}</p>
                  </div>
                  <Phone className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Deal</p>
                    <p className="text-2xl font-bold">$45K</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-secondary/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Goals, Achievements, Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <Badge>5/8 goals</Badge>
                </div>
                <Progress value={62} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-muted-foreground">Calls</p>
                    <p className="font-medium">18/20</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-muted-foreground">Deals</p>
                    <p className="font-medium">3/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-warning/5 rounded">
                  <Trophy className="h-5 w-5 text-warning" />
                  <span className="text-sm">Top Performer</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-destructive/5 rounded">
                  <Flame className="h-5 w-5 text-destructive" />
                  <span className="text-sm">5-Day Streak</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm">Quick Closer</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-success/5 rounded">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span className="text-sm">78% Win Rate</span>
                </div>
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Priority Deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'Fleet Order', company: 'Twin Cities Construction', value: 485000, stage: 'Negotiation' },
                  { name: 'School District', company: 'District 181', value: 320000, stage: 'Proposal' },
                  { name: 'Corporate Fleet', company: 'Target Regional', value: 725000, stage: 'Proposal' },
                ].map((deal, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium truncate">{deal.name}</p>
                      <p className="text-xs text-muted-foreground">{deal.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(deal.value)}</p>
                      <Badge variant="outline" className="text-xs">{deal.stage}</Badge>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/enterprise')}>
                  View all deals
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Nav */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>Leads</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>Schedule</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/winwords')}>WinWords</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>Analytics</Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
