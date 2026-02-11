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
import { 
  Target, Users, TrendingUp, Phone, ArrowRight,
  Search, Sprout, UserCheck, Star, Trophy, Binoculars, Medal
} from 'lucide-react';

// Agency Roles
const ROLES = {
  recruit: {
    id: 'recruit',
    name: 'Recruit',
    icon: Binoculars,
    color: 'bg-gray-400',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-300',
    emoji: '🔭',
    primaryStat: 'Training Progress',
    secondaryStat: 'Shadowing Hours',
    stats: { prospecting: 40, discovery: 30, proposal: 20, negotiation: 20, closing: 30 },
    skills: [
      { name: 'Learning Basics', level: 5 },
      { name: 'Shadowing', level: 5 },
      { name: 'Process Master', level: 5 },
      { name: 'Ready to Graduate', level: 5 },
    ],
    bestFor: 'Entry Level - New Agents',
    kpis: ['Training Complete', 'Shadowing Hours', 'Certification'],
    track: 'Entry',
  },
  hunter: {
    id: 'hunter',
    name: 'Hunter',
    icon: Search,
    color: 'bg-amber-500',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-400',
    emoji: '🎯',
    primaryStat: 'Pipeline Created',
    secondaryStat: 'Discovery Calls',
    stats: { prospecting: 100, discovery: 60, proposal: 50, negotiation: 40, closing: 70 },
    skills: [
      { name: 'Cold Outreach', level: 9 },
      { name: 'Quick Qualify', level: 8 },
      { name: 'Pipeline Gen', level: 7 },
      { name: 'Lead Finder', level: 10 },
    ],
    bestFor: 'Front of Funnel',
    kpis: ['Calls Made', 'Leads Found', 'Pipeline Created'],
    track: 'Agent',
  },
  closer: {
    id: 'closer',
    name: 'Closer',
    icon: Target,
    color: 'bg-red-500',
    borderColor: 'border-red-600',
    textColor: 'text-red-400',
    emoji: '🎯',
    primaryStat: 'Deals Closed',
    secondaryStat: 'Revenue Generated',
    stats: { prospecting: 50, discovery: 70, proposal: 60, negotiation: 100, closing: 100 },
    skills: [
      { name: 'Negotiation', level: 10 },
      { name: 'Objection Handling', level: 9 },
      { name: 'Deal Maker', level: 8 },
      { name: 'Revenue Driver', level: 9 },
    ],
    bestFor: 'Bottom of Funnel',
    kpis: ['Deals Closed', 'Revenue', 'Win Rate'],
    track: 'Agent',
  },
  cultivator: {
    id: 'cultivator',
    name: 'Cultivator',
    icon: Sprout,
    color: 'bg-green-500',
    borderColor: 'border-green-600',
    textColor: 'text-green-400',
    emoji: '🌱',
    primaryStat: 'Win Rate',
    secondaryStat: 'Proposals Sent',
    stats: { prospecting: 50, discovery: 100, proposal: 80, negotiation: 70, closing: 60 },
    skills: [
      { name: 'Lead Nurture', level: 9 },
      { name: 'Demo Master', level: 8 },
      { name: 'Solution Design', level: 7 },
      { name: 'Proposal Win', level: 8 },
    ],
    bestFor: 'Middle of Funnel',
    kpis: ['Demos Delivered', 'Proposals Sent', 'Win Rate'],
    track: 'Agent',
  },
  champion: {
    id: 'champion',
    name: 'Champion',
    icon: UserCheck,
    color: 'bg-blue-500',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-400',
    emoji: '👑',
    primaryStat: 'Retention Rate',
    secondaryStat: 'Expansion Revenue',
    stats: { prospecting: 30, discovery: 60, proposal: 50, negotiation: 80, closing: 100 },
    skills: [
      { name: 'Relationship Builder', level: 10 },
      { name: 'Customer Success', level: 9 },
      { name: 'Upsell Engine', level: 8 },
      { name: 'Renewal Master', level: 9 },
    ],
    bestFor: 'Post-Sale',
    kpis: ['Retention Rate', 'NPS Score', 'Expansion Revenue'],
    track: 'Agent',
  },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// 3D Block Button
function BlockButton({ 
  children, 
  onClick, 
  color = 'bg-green-600 hover:bg-green-500',
  className = '',
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  color?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 font-black uppercase tracking-wider text-white
        border-b-4 border-r-2 border-black/30 active:border-b-0 active:mt-1 active:border-b-4
        disabled:opacity-50 disabled:cursor-not-allowed transition-all
        ${color} ${className}
      `}
    >
      {children}
    </button>
  );
}

// 3D Block Card
function BlockCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-gray-800 border-b-4 border-r-2 border-gray-950 ${className}`}>
      {/* Inner bevel effect */}
      <div className="border border-gray-700/50">
        {children}
      </div>
    </div>
  );
}

// 3D Block Panel (inset)
function BlockPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-950 border-2 border-gray-800 border-b-4 border-r-4 border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// 3D Stat Bar
function BlockStatBar({ label, value, max = 100, color = 'bg-amber-500' }: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const percent = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wide text-gray-300">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-8 bg-gray-950 border-2 border-gray-700 border-b-4 border-r-4">
        <div 
          className={`h-full ${color} border-r-2 border-black/30`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// 3D Badge
function BlockBadge({ children, color = 'bg-gray-600' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-block px-3 py-1 ${color} text-white font-black uppercase text-xs tracking-wider border-b-2 border-black/40`}>
      {children}
    </span>
  );
}

// 3D Avatar Block
function AvatarBlock({ emoji, size = 'md' }: { emoji: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-12 w-12 text-2xl',
    md: 'h-20 w-20 text-4xl',
    lg: 'h-24 w-24 text-5xl',
  };
  
  return (
    <div className={`
      relative bg-gray-700 border-2 border-gray-600 border-b-4 border-r-4
      flex items-center justify-center ${sizes[size]}
    `}>
      <span className="relative z-10">{emoji}</span>
      {/* Highlight */}
      <div className="absolute top-1 left-1 right-4 h-2 bg-white/20" />
    </div>
  );
}

export default function AgencyProfile() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('hunter');
  const [activeTab, setActiveTab] = useState('profile');

  const role = ROLES[selectedRole as keyof typeof ROLES];

  const agent = {
    name: 'AGENT',
    level: 12,
    xp: 12450,
    xpToNextLevel: 14400,
    totalRevenue: 1200000,
    dealsClosed: 89,
    agencyName: 'TEAM ALPHA',
  };

  const xpProgress = Math.round((agent.xp / agent.xpToNextLevel) * 100);

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'roles', label: 'Roles' },
    { id: 'team', label: 'Agency' },
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
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-wider text-white drop-shadow-lg">
                AGENCY PROFILE
              </h1>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mt-1">
                {agent.agencyName} // LVL {agent.level} {role.emoji}
              </p>
            </div>
            <BlockButton 
              onClick={() => setShowCallDialog(true)}
              color="bg-green-600 hover:bg-green-500"
            >
              <Phone className="h-4 w-4 inline mr-2" />
              START MISSION
            </BlockButton>
          </div>

          {/* 3D Tab Navigation */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 font-black uppercase tracking-wider text-white
                  border-b-4 border-r-2 border-black/40 transition-all
                  ${activeTab === tab.id 
                    ? 'bg-amber-500 border-amber-700 translate-y-0' 
                    : 'bg-gray-700 border-gray-900 hover:bg-gray-600'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Agent Card */}
              <BlockCard className="p-6">
                <div className="text-center">
                  <AvatarBlock emoji={role.emoji} size="lg" />
                  <h2 className="text-xl font-black uppercase mt-4 text-white">{agent.name}</h2>
                  <p className="text-sm font-bold uppercase text-gray-400">{agent.agencyName}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <BlockBadge color={role.color}>{role.name}</BlockBadge>
                    <BlockBadge color="bg-gray-600">LVL {agent.level}</BlockBadge>
                  </div>
                </div>

                {/* XP Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm font-bold uppercase mb-1">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-amber-400">{agent.xp.toLocaleString()}</span>
                  </div>
                  <div className="h-8 bg-gray-950 border-2 border-gray-600 border-b-4">
                    <div 
                      className="h-full bg-amber-500 border-r-2 border-black/30"
                      style={{ width: `${xpProgress}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-md">
                      {xpProgress}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1 uppercase">
                    Next: {agent.xpToNextLevel.toLocaleString()} XP
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <BlockPanel className="p-3 text-center">
                    <p className="text-2xl font-black text-amber-400">{formatCurrency(agent.totalRevenue)}</p>
                    <p className="text-xs font-bold uppercase text-gray-500">Revenue</p>
                  </BlockPanel>
                  <BlockPanel className="p-3 text-center">
                    <p className="text-2xl font-black text-green-400">{agent.dealsClosed}</p>
                    <p className="text-xs font-bold uppercase text-gray-500">Missions</p>
                  </BlockPanel>
                </div>
              </BlockCard>

              {/* Stats Breakdown */}
              <BlockCard className="lg:col-span-2 p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  FUNNEL STATS
                </h3>
                <div className="space-y-3">
                  <BlockStatBar label="Prospecting" value={role.stats.prospecting} color="bg-amber-500" />
                  <BlockStatBar label="Discovery" value={role.stats.discovery} color="bg-blue-500" />
                  <BlockStatBar label="Proposal" value={role.stats.proposal} color="bg-purple-500" />
                  <BlockStatBar label="Negotiation" value={role.stats.negotiation} color="bg-orange-500" />
                  <BlockStatBar label="Closing" value={role.stats.closing} color="bg-green-500" />
                </div>
              </BlockCard>

              {/* Core Strengths */}
              <BlockCard className="lg:col-span-3 p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  CORE STRENGTHS
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {role.skills.map((skill) => (
                    <BlockPanel key={skill.name} className={`p-4 border-${role.borderColor.split('-')[1]}-600`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold uppercase text-sm text-white">{skill.name}</span>
                        <BlockBadge color={role.color}>LVL {skill.level}</BlockBadge>
                      </div>
                      <div className="h-6 bg-gray-950 border-2 border-gray-700">
                        <div 
                          className={`h-full ${role.color} border-r-2 border-black/30`}
                          style={{ width: `${skill.level * 10}%` }}
                        />
                      </div>
                    </BlockPanel>
                  ))}
                </div>
              </BlockCard>

              {/* KPIs */}
              <BlockCard className="lg:col-span-3 p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  KEY METRICS // {role.name}
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {role.kpis.map((kpi) => (
                    <BlockPanel key={kpi} className="p-4 text-center">
                      <p className="text-sm font-bold uppercase text-gray-400">{kpi}</p>
                      <p className="text-xl font-black text-white mt-1">---</p>
                    </BlockPanel>
                  ))}
                </div>
              </BlockCard>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Object.values(ROLES).map((r) => (
                  <BlockCard 
                    key={r.id}
                    className={`p-6 cursor-pointer transition-all hover:-translate-y-1 ${
                      selectedRole === r.id ? `border-b-8 border-${r.borderColor.split('-')[1]}-700` : ''
                    }`}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <div className={`h-16 w-16 mx-auto bg-gray-700 border-2 border-gray-600 border-b-4 flex items-center justify-center`}>
                      <span className="text-4xl">{r.emoji}</span>
                    </div>
                    <h3 className="font-black text-center mt-3 text-white uppercase">{r.name}</h3>
                    <div className="flex justify-center mt-2">
                      <BlockBadge color={r.color}>{r.track}</BlockBadge>
                    </div>
                    <p className="text-xs text-center mt-3 font-bold uppercase text-gray-500">{r.bestFor}</p>
                  </BlockCard>
                ))}
              </div>

              {/* Career Path */}
              <BlockCard className="p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-amber-400" />
                  CAREER PATH
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <AvatarBlock emoji="🔭" size="sm" />
                  <ArrowRight className="h-8 w-8 text-gray-600" />
                  <AvatarBlock emoji="🎯" size="sm" />
                  <ArrowRight className="h-8 w-8 text-gray-600" />
                  <AvatarBlock emoji="🌱" size="sm" />
                  <ArrowRight className="h-8 w-8 text-gray-600" />
                  <AvatarBlock emoji="👑" size="sm" />
                  <ArrowRight className="h-8 w-8 text-gray-600" />
                  <AvatarBlock emoji="⭐" size="sm" />
                </div>
                <div className="flex justify-between mt-2 text-xs font-bold uppercase text-gray-500 px-2">
                  <span>Recruit</span>
                  <span>Hunter</span>
                  <span>Cultivator</span>
                  <span>Champion</span>
                  <span>Senior</span>
                </div>
              </BlockCard>
            </div>
          )}

          {/* Agency Tab */}
          {activeTab === 'team' && (
            <BlockCard className="p-6">
              <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                AGENCY COMPOSITION
              </h3>
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { emoji: '🔭', color: 'bg-gray-600', label: 'Recruits', members: [{ name: 'NEW KIM', level: 1, xp: 150 }] },
                  { emoji: '🎯', color: 'bg-amber-600', label: 'Hunters', members: [{ name: 'SARAH C', level: 15, xp: 15420 }, { name: 'MIKE J', level: 14, xp: 14890 }] },
                  { emoji: '🌱', color: 'bg-green-600', label: 'Cultivators', members: [{ name: 'AMANDA F', level: 13, xp: 13200 }, { name: 'DAVID L', level: 12, xp: 12900 }] },
                  { emoji: '👑', color: 'bg-blue-600', label: 'Champions', members: [{ name: 'EMILY Z', level: 11, xp: 11500 }] },
                  { emoji: '⭐', color: 'bg-purple-600', label: 'Senior', members: [{ name: 'ROBERT K', level: 18, xp: 22000 }] },
                ].map((group) => (
                  <div key={group.label} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{group.emoji}</span>
                      <h4 className="font-bold uppercase text-gray-300">{group.label}</h4>
                      <BlockBadge color={group.color}>{group.members.length}</BlockBadge>
                    </div>
                    {group.members.map((member) => (
                      <BlockPanel key={member.name} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 ${group.color} border-2 border-gray-500 border-b-4 flex items-center justify-center font-bold text-sm text-white`}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-white uppercase">{member.name}</p>
                            <p className="text-xs text-gray-500">LVL {member.level}</p>
                          </div>
                          <span className="text-xs font-bold text-amber-400">{member.xp.toLocaleString()} XP</span>
                        </div>
                      </BlockPanel>
                    ))}
                  </div>
                ))}
              </div>
            </BlockCard>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
