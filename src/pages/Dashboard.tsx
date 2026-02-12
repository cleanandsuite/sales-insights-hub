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
import { RankBadge, getRankFromXP } from '@/components/ui/RankBadge';
import { 
  Phone, Flame, Trophy, Target, TrendingUp, 
  Calendar, BarChart3, ArrowRight, Zap,
  DollarSign, Users, Clock, Crosshair, Activity
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

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
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// Chart data
const revenueData = [
  { month: 'Jul', revenue: 35000, target: 50000 },
  { month: 'Aug', revenue: 42000, target: 50000 },
  { month: 'Sep', revenue: 58000, target: 60000 },
  { month: 'Oct', revenue: 72000, target: 70000 },
  { month: 'Nov', revenue: 89000, target: 85000 },
  { month: 'Dec', revenue: 95000, target: 90000 },
  { month: 'Jan', revenue: 45000, target: 100000 },
];

const skillsData = [
  { skill: 'Discovery', value: 85, fullMark: 100 },
  { skill: 'Presentation', value: 72, fullMark: 100 },
  { skill: 'Objection Handling', value: 90, fullMark: 100 },
  { skill: 'Closing', value: 78, fullMark: 100 },
  { skill: 'Negotiation', value: 65, fullMark: 100 },
  { skill: 'Relationship', value: 88, fullMark: 100 },
];

const dealStageData = [
  { name: 'Prospecting', value: 25, color: '#6B7280' },
  { name: 'Qualification', value: 35, color: '#8B5CF6' },
  { name: 'Proposal', value: 45, color: '#3B82F6' },
  { name: 'Negotiation', value: 30, color: '#F59E0B' },
  { name: 'Closed Won', value: 24, color: '#10B981' },
];

const weeklyActivityData = [
  { day: 'Mon', calls: 8, deals: 1 },
  { day: 'Tue', calls: 12, deals: 2 },
  { day: 'Wed', calls: 10, deals: 1 },
  { day: 'Thu', calls: 15, deals: 3 },
  { day: 'Fri', calls: 6, deals: 1 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    xp: 12450,
    level: 12,
    rank: getRankFromXP(12450),
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* XP & Quota Hero */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold">{stats.level}</span>
                      </div>
                      <RankBadge rank={stats.rank} size="lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Level {stats.level}</p>
                      <StatBar label="" value={stats.xp} max={14400} color="bg-primary" />
                      <p className="text-xs text-muted-foreground mt-1">{stats.xp.toLocaleString()} XP</p>
                    </div>
                  </CardContent>
                </Card>

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
                      color="bg-success" 
                    />
                    <div className="flex justify-between text-sm mt-2">
                      <span>{formatCurrency(stats.quota.current)}</span>
                      <span className="text-muted-foreground">{formatCurrency(stats.quota.target)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-2xl font-bold">78%</p>
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
                        <p className="text-2xl font-bold">65%</p>
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
                        <p className="text-2xl font-bold">247</p>
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

              {/* Skills Radar & Deal Breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillsData}>
                          <PolarGrid stroke="#374151" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                          <Radar
                            name="Skills"
                            dataKey="value"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.5}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Deal Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dealStageData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {dealStageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {dealStageData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1 text-xs">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6 mt-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} />
                        <YAxis tick={{ fill: '#9CA3AF' }} />
                        <Tooltip />
                        <Bar dataKey="calls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="deals" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="space-y-6 mt-6">
              {/* Consistency & Achievements */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-4 w-4 text-warning" />
                      Consistency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-warning/5 rounded-lg border border-warning/20">
                      <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                        <Flame className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.streak} day streak</p>
                        <p className="text-sm text-muted-foreground">Keep it up!</p>
                      </div>
                    </div>
                    <StatBar label="Weekly Goals" value={5} max={8} color="bg-primary" />
                    <StatBar label="Call Goal" value={8} max={10} unit="/day" color="bg-success" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Top Performer', icon: '🏆', desc: 'Week of Jan 15', color: 'warning' },
                        { name: 'Hot Streak', icon: '🔥', desc: '5 deals in 7 days', color: 'destructive' },
                        { name: 'Iron Rep', icon: '💪', desc: '30 day streak', color: 'primary' },
                        { name: 'Quick Closer', icon: '⚡', desc: 'Avg 12 days', color: 'success' },
                      ].map((ach) => (
                        <div key={ach.name} className={`p-3 rounded-lg border bg-${ach.color}/5 border-${ach.color}/20`}>
                          <div className="text-2xl mb-1">{ach.icon}</div>
                          <p className="text-sm font-medium">{ach.name}</p>
                          <p className="text-xs text-muted-foreground">{ach.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Priority Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Priority Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      { name: 'Enterprise License', company: 'Acme Corp', value: 125000, stage: 'Proposal' },
                      { name: 'Platform Migration', company: 'TechStart Inc', value: 89000, stage: 'Qualification' },
                      { name: 'Annual Renewal', company: 'Global Systems', value: 67000, stage: 'Negotiation' },
                      { name: 'Expansion Deal', company: 'MegaCorp', value: 156000, stage: 'Proposal' },
                    ].map((deal, i) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate('/enterprise')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{deal.stage}</Badge>
                          <span className="text-sm font-semibold">{formatCurrency(deal.value)}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{deal.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
