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
  Phone, Flame, Trophy, Target, TrendingUp, 
  Calendar, BarChart3, Sparkles, ArrowRight, Zap,
  DollarSign, Users, Clock, Crosshair
} from 'lucide-react';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// Stat bar component
function StatBar({ label, value, max = 100, unit = '', color = 'bg-primary', icon: Icon }: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const percent = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold">{value}{unit}</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  const stats = {
    xp: 12450,
    level: 12,
    quota: { current: 1200000, target: 1500000 },
    streak: 5,
  };

  const quotaPercent = Math.round((stats.quota.current / stats.quota.target) * 100);

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

          {/* XP & Quota Hero */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* XP Level */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.level}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Level {stats.level}</p>
                    <StatBar label="" value={stats.xp} max={14400} color="bg-primary" />
                    <p className="text-xs text-muted-foreground mt-1">{stats.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quota */}
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Quota Progress</span>
                  </div>
                  <Badge variant="outline">{quotaPercent}%</Badge>
                </div>
                <StatBar 
                  label="" 
                  value={stats.quota.current} 
                  max={stats.quota.target} 
                  unit={''} 
                  color="bg-success" 
                />
                <div className="flex justify-between text-sm mt-2">
                  <span>{formatCurrency(stats.quota.current)}</span>
                  <span className="text-muted-foreground">{formatCurrency(stats.quota.target)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatBar label="Total Revenue" value={stats.quota.current} max={stats.quota.target} color="bg-success" />
                <StatBar label="Average Deal" value={45000} max={100000} unit="€" color="bg-primary" />
              </CardContent>
            </Card>

            {/* Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatBar label="Win Rate" value={78} max={100} unit="%" color="bg-warning" />
                <StatBar label="Close Rate" value={65} max={100} unit="%" color="bg-primary" />
                <StatBar label="Active Deals" value={47} max={100} color="bg-secondary" />
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatBar label="Calls Today" value={1} max={10} color="bg-primary" />
                <StatBar label="Hot Leads" value={4} max={20} color="bg-destructive" />
                <StatBar label="Follow-up Rate" value={89} max={100} unit="%" color="bg-success" />
              </CardContent>
            </Card>

            {/* Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatBar label="Deal Speed" value={18} max={60} unit="d" color="bg-primary" />
                <StatBar label="Response Time" value={72} max={120} unit="m" color="bg-warning" />
                <StatBar label="Lead Conversion" value={52} max={100} unit="%" color="bg-success" />
              </CardContent>
            </Card>

            {/* Consistency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-warning" />
                  Consistency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatBar label="Day Streak" value={stats.streak} max={30} color="bg-warning" />
                <StatBar label="Weekly Goals" value={5} max={8} color="bg-primary" />
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
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">
                    🏆 Top Performer
                  </Badge>
                  <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                    🔥 Hot Streak
                  </Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                    💪 Iron Rep
                  </Badge>
                  <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20">
                    ⚡ Quick Closer
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Priority Actions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/enterprise')}>
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: 'Enterprise License', company: 'Acme Corp', value: 125000, stage: 'Proposal', health: 'at_risk' },
                  { name: 'Platform Migration', company: 'TechStart Inc', value: 89000, stage: 'Qualification', health: 'monitor' },
                  { name: 'Annual Renewal', company: 'Global Systems', value: 67000, stage: 'Negotiation', health: 'on_track' },
                  { name: 'Expansion Deal', company: 'MegaCorp', value: 156000, stage: 'Proposal', health: 'on_track' },
                ].map((deal, i) => (
                  <div 
                    key={i} 
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate('/enterprise')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline" 
                        className={
                          deal.health === 'on_track' ? 'border-success/50 text-success' :
                          deal.health === 'monitor' ? 'border-warning/50 text-warning' :
                          'border-destructive/50 text-destructive'
                        }
                      >
                        {deal.stage}
                      </Badge>
                      <span className="text-sm font-semibold">{formatCurrency(deal.value)}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{deal.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
