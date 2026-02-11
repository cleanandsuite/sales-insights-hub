import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { StationaryCharacter } from '@/components/character/StationaryCharacter';
import { RPG_CHARACTERS, getBadgeForCharacter } from '@/lib/rpgSprites';
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
import { MinecraftCard } from '@/components/ui/MinecraftCard';
import { MinecraftButton } from '@/components/ui/MinecraftButton';
import { MinecraftBadge } from '@/components/ui/MinecraftBadge';
import { MinecraftProgress } from '@/components/ui/MinecraftProgress';

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
          </div>

          {/* Tabs */}
          <div className="flex gap-2 items-center flex-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'charts', label: 'Charts' },
              { id: 'actions', label: 'Actions' },
            ].map((tab) => (
              <MinecraftButton
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'default'}
                className={`
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 hover:bg-blue-500 border-blue-800' 
                    : 'bg-gray-700 hover:bg-gray-600 border-gray-900'
                  }
                  min-w-[100px]
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="ml-2 inline-block w-2 h-4 bg-white animate-blink-cursor" />
                )}
              </MinecraftButton>
            ))}
            {/* Start Call Button - Next to Actions tab */}
            <div className="flex items-center gap-8 ml-6">
              <button
                onClick={() => setShowCallDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white font-bold border-b-4 border-red-600 rounded-none transition-all hover:translate-y-0.5 active:translate-y-0 active:border-b-2"
              >
                <Phone className="h-4 w-4" />
                Start Call
              </button>
              {/* Stationary Pixel Arcade Character - Next to button */}
              <StationaryCharacter
                config={RPG_CHARACTERS.soldier}
                size={60}
                name="Agent"
                badge="⚔️"
                state="idle"
                showName={false}
                className="cursor-default"
              />
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* XP & Quota Hero */}
              <div className="grid gap-4 md:grid-cols-3">
                <MinecraftCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-none bg-primary/10 flex items-center justify-center border-2 border-primary">
                      <span className="text-2xl font-black">{stats.level}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Level {stats.level}</p>
                      <MinecraftProgress value={stats.xp} max={14400} color="bg-primary" showLabel />
                      <p className="text-xs text-muted-foreground mt-1">{stats.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                </MinecraftCard>

                <MinecraftCard className="md:col-span-2 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Crosshair className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Quota Progress</span>
                    </div>
                    <MinecraftBadge>{quotaPercent}%</MinecraftBadge>
                  </div>
                  <MinecraftProgress 
                    label="" 
                    value={stats.quota.current} 
                    max={stats.quota.target} 
                    color="bg-green-600" 
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>{formatCurrency(stats.quota.current)}</span>
                    <span className="text-muted-foreground">{formatCurrency(stats.quota.target)}</span>
                  </div>
                </MinecraftCard>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Win Rate', value: '78%', icon: Trophy, color: 'text-warning' },
                  { label: 'Close Rate', value: '65%', icon: Target, color: 'text-success' },
                  { label: 'Calls', value: '247', icon: Phone, color: 'text-primary' },
                  { label: 'Avg Deal', value: '$45K', icon: DollarSign, color: 'text-secondary' },
                ].map((stat) => (
                  <MinecraftCard key={stat.label} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}/50`} />
                    </div>
                  </MinecraftCard>
                ))}
              </div>

              {/* Skills Radar & Deal Breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <MinecraftCard>
                  <div className="p-6 pb-0">
                    <h3 className="font-bold text-base">Skills Distribution</h3>
                  </div>
                  <div className="h-[250px] p-6 pt-2">
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
                </MinecraftCard>

                <MinecraftCard>
                  <div className="p-6 pb-0">
                    <h3 className="font-bold text-base">Deal Pipeline</h3>
                  </div>
                  <div className="h-[250px] p-6 pt-2">
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
                  <div className="px-6 pb-6 flex flex-wrap gap-2">
                    {dealStageData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1 text-xs">
                        <div className="h-2 w-2" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </MinecraftCard>
              </div>
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              {/* Revenue Trend */}
              <MinecraftCard>
                <div className="p-6 pb-0">
                  <h3 className="font-bold text-base">Revenue Trend</h3>
                </div>
                <div className="h-[300px] p-6 pt-2">
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
              </MinecraftCard>

              {/* Weekly Activity */}
              <MinecraftCard>
                <div className="p-6 pb-0">
                  <h3 className="font-bold text-base">Weekly Activity</h3>
                </div>
                <div className="h-[250px] p-6 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} />
                      <YAxis tick={{ fill: '#9CA3AF' }} />
                      <Tooltip />
                      <Bar dataKey="calls" fill="#3B82F6" />
                      <Bar dataKey="deals" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </MinecraftCard>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Consistency & Achievements */}
              <div className="grid gap-6 lg:grid-cols-2">
                <MinecraftCard className="p-6">
                  <h3 className="font-bold text-base flex items-center gap-2 mb-4">
                    <Flame className="h-4 w-4 text-warning" />
                    Consistency
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-warning/10 rounded-none border-2 border-warning/20">
                    <div className="h-12 w-12 rounded-none bg-warning/20 flex items-center justify-center border-2 border-warning">
                      <Flame className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.streak} day streak</p>
                      <p className="text-sm text-muted-foreground">Keep it up!</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <StatBar label="Weekly Goals" value={5} max={8} color="bg-primary" />
                    <StatBar label="Call Goal" value={8} max={10} unit="/day" color="bg-green-600" />
                  </div>
                </MinecraftCard>

                <MinecraftCard className="p-6">
                  <h3 className="font-bold text-base flex items-center gap-2 mb-4">
                    <Trophy className="h-4 w-4" />
                    Achievements
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Top Performer', icon: '🏆', desc: 'Week of Jan 15', color: 'warning' },
                      { name: 'Hot Streak', icon: '🔥', desc: '5 deals in 7 days', color: 'danger' },
                      { name: 'Iron Rep', icon: '💪', desc: '30 day streak', color: 'default' },
                      { name: 'Quick Closer', icon: '⚡', desc: 'Avg 12 days', color: 'success' },
                    ].map((ach) => (
                      <div 
                        key={ach.name} 
                        className="p-3 bg-gray-800 border-2 border-gray-600 border-b-4 hover:bg-gray-700 hover:-translate-y-0.5 cursor-pointer transition-all"
                      >
                        <div className="text-2xl mb-1">{ach.icon}</div>
                        <p className="text-sm font-medium text-white">{ach.name}</p>
                        <p className="text-xs text-gray-400">{ach.desc}</p>
                      </div>
                    ))}
                  </div>
                </MinecraftCard>
              </div>

              {/* Priority Actions */}
              <MinecraftCard className="p-6">
                <h3 className="font-bold text-base mb-4">Priority Actions</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { name: 'Enterprise License', company: 'Acme Corp', value: 125000, stage: 'Proposal' },
                    { name: 'Platform Migration', company: 'TechStart Inc', value: 89000, stage: 'Qualification' },
                    { name: 'Annual Renewal', company: 'Global Systems', value: 67000, stage: 'Negotiation' },
                    { name: 'Expansion Deal', company: 'MegaCorp', value: 156000, stage: 'Proposal' },
                  ].map((deal, i) => (
                    <div 
                      key={i} 
                      className="p-3 bg-gray-800 border-2 border-gray-600 border-b-4 hover:bg-gray-700 hover:-translate-y-0.5 cursor-pointer transition-all"
                      onClick={() => navigate('/enterprise')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <MinecraftBadge variant="default">{deal.stage}</MinecraftBadge>
                        <span className="text-sm font-bold text-amber-400">{formatCurrency(deal.value)}</span>
                      </div>
                      <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                      <p className="text-xs text-gray-400 truncate">{deal.company}</p>
                    </div>
                  ))}
                </div>
              </MinecraftCard>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
