import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RankBadge, getRankFromXP } from '@/components/ui/RankBadge';
import { 
  Phone, Flame, Trophy, Target, TrendingUp, 
  Calendar, BarChart3, ArrowRight, Zap,
  DollarSign, Users, Clock, Activity, ChevronRight
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// Clean stat card with subtle color indicator
function StatCard({ label, value, subtext, color = 'blue', icon: Icon, trend }: {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: number; up: boolean };
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    purple: 'bg-violet-500',
    orange: 'bg-amber-500',
    red: 'bg-rose-500',
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            {trend && (
              <p className={`text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.up ? '↑' : '↓'} {Math.abs(trend.value)}% vs last month
              </p>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg ${colors[color]} bg-opacity-10`}>
              <Icon className={`h-5 w-5 ${colors[color].replace('bg-', 'text-')}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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

// Recent activity items
const recentActivity = [
  { id: 1, type: 'call', title: 'Call with Apex Energy', time: '2 hours ago', score: 85, status: 'positive' },
  { id: 2, type: 'deal', title: 'Deal moved to Negotiation', time: '4 hours ago', value: '$45,000', status: 'neutral' },
  { id: 3, type: 'call', title: 'Call with TechCorp', time: 'Yesterday', score: 72, status: 'neutral' },
  { id: 4, type: 'lead', title: 'New lead: Sarah Johnson', time: 'Yesterday', company: 'DataSync Inc', status: 'positive' },
];

export default function Dashboard() {
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
          {/* Clean Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
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
            <TabsList className="grid w-full max-w-[300px] grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Level & Progress */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Quota Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold">{formatCurrency(stats.quota.current)}</span>
                      <span className="text-muted-foreground">of {formatCurrency(stats.quota.target)}</span>
                    </div>
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">{quotaPercent}% achieved</span>
                      <span className="text-emerald-600 font-medium">{formatCurrency(stats.quota.target - stats.quota.current)} to go</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Your Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                        <span className="text-2xl font-bold text-violet-600 dark:text-violet-300">{stats.level}</span>
                      </div>
                      <div>
                        <RankBadge rank={stats.rank} size="lg" />
                        <p className="text-sm text-muted-foreground">{stats.xp.toLocaleString()} XP</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Win Rate" 
                  value="78%" 
                  subtext="Last 30 days"
                  color="blue"
                  icon={Trophy}
                  trend={{ value: 5, up: true }}
                />
                <StatCard 
                  label="Close Rate" 
                  value="65%" 
                  subtext="42 of 65 deals"
                  color="green"
                  icon={Target}
                  trend={{ value: 3, up: true }}
                />
                <StatCard 
                  label="Total Calls" 
                  value="247" 
                  subtext="This month"
                  color="purple"
                  icon={Phone}
                />
                <StatCard 
                  label="Avg Deal Size" 
                  value="$45K" 
                  subtext="$3.2M pipeline"
                  color="orange"
                  icon={DollarSign}
                />
              </div>

              {/* Two Column: Skills & Pipeline */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sales Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillsData}>
                          <PolarGrid stroke="#E5E7EB" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: '#6B7280', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                          <Radar
                            name="Skills"
                            dataKey="value"
                            stroke="#8B5CF6"
                            fill="#8B5CF6"
                            fillOpacity={0.3}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pipeline by Stage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dealStageData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {dealStageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span>{stats.streak} Day Streak 🔥</span>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span>Log Call</span>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                      <Users className="h-4 w-4 text-violet-500" />
                      <span>Add Lead</span>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span>Schedule</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                        <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fill: '#6B7280' }} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#9CA3AF" 
                          strokeDasharray="5 5"
                          fill="none" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" tick={{ fill: '#6B7280' }} />
                        <YAxis tick={{ fill: '#6B7280' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calls" name="Calls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="deals" name="Deals" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'call' ? 'bg-blue-100 dark:bg-blue-900' :
                            item.type === 'deal' ? 'bg-emerald-100 dark:bg-emerald-900' :
                            'bg-violet-100 dark:bg-violet-900'
                          }`}>
                            {item.type === 'call' && <Phone className="h-4 w-4 text-blue-600 dark:text-blue-300" />}
                            {item.type === 'deal' && <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />}
                            {item.type === 'lead' && <Users className="h-4 w-4 text-violet-600 dark:text-violet-300" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-500" />
                      Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stats.streak}</p>
                    <p className="text-sm text-muted-foreground">days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-violet-500" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">8/10</p>
                    <p className="text-sm text-muted-foreground">calls completed</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
