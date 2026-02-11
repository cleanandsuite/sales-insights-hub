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
    color: 'bg-gray-600',
    bgLight: 'bg-gray-600/10',
    border: 'border-gray-500',
    text: 'text-gray-400',
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
    color: 'bg-amber-600',
    bgLight: 'bg-amber-600/10',
    border: 'border-amber-500',
    text: 'text-amber-500',
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
    color: 'bg-red-600',
    bgLight: 'bg-red-600/10',
    border: 'border-red-500',
    text: 'text-red-500',
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
    color: 'bg-green-600',
    bgLight: 'bg-green-600/10',
    border: 'border-green-500',
    text: 'text-green-500',
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
    color: 'bg-blue-600',
    bgLight: 'bg-blue-600/10',
    border: 'border-blue-500',
    text: 'text-blue-500',
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

// Boxy stat bar (Minecraft style)
function BoxyStatBar({ label, value, max = 100, color = 'bg-amber-600' }: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const percent = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wide">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-6 bg-gray-800 border-2 border-gray-600 relative">
        <div 
          className={`h-full ${color} absolute top-0 left-0`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// Boxy card component
function BoxyCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-900 border-4 border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// Boxy badge
function BoxyBadge({ children, color = 'bg-gray-700' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-block px-3 py-1 ${color} text-white font-bold uppercase text-xs tracking-wider border-2 border-white/20`}>
      {children}
    </span>
  );
}

export default function AgencyProfile() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('hunter');

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
              <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                AGENCY PROFILE
              </h1>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                {agent.agencyName} // LVL {agent.level} {role.emoji}
              </p>
            </div>
            <button 
              onClick={() => setShowCallDialog(true)}
              className="bg-green-700 hover:bg-green-600 text-white font-bold uppercase px-6 py-3 border-b-4 border-green-900 active:border-b-0 active:translate-y-1 transition-all"
            >
              START MISSION
            </button>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="bg-gray-900 border-4 border-gray-700 p-1 gap-1">
              <TabsTrigger 
                value="profile" 
                className="font-bold uppercase px-6 py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-white"
              >
                PROFILE
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="font-bold uppercase px-6 py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-white"
              >
                ROLES
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="font-bold uppercase px-6 py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-white"
              >
                AGENCY
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Agent Card */}
                <BoxyCard className="p-6">
                  <div className="text-center">
                    <div className={`h-24 w-24 mx-auto border-4 border-gray-600 ${role.bgLight} flex items-center justify-center`}>
                      <span className="text-5xl">{role.emoji}</span>
                    </div>
                    <h2 className="text-xl font-black uppercase mt-4 text-white">{agent.name}</h2>
                    <p className="text-sm font-bold uppercase text-gray-500">{agent.agencyName}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <BoxyBadge color={role.color}>{role.name}</BoxyBadge>
                      <BoxyBadge color="bg-gray-700">LVL {agent.level}</BoxyBadge>
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm font-bold uppercase mb-1">
                      <span className="text-gray-400">EXPERIENCE</span>
                      <span className="text-amber-500">{agent.xp.toLocaleString()}</span>
                    </div>
                    <div className="h-6 bg-gray-800 border-2 border-gray-600 relative">
                      <div 
                        className="h-full bg-amber-600 absolute top-0 left-0"
                        style={{ width: `${xpProgress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                        {xpProgress}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1 uppercase">Next Level: {agent.xpToNextLevel.toLocaleString()} XP</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-gray-800 border-2 border-gray-600 p-3 text-center">
                      <p className="text-2xl font-black text-amber-500">{formatCurrency(agent.totalRevenue)}</p>
                      <p className="text-xs font-bold uppercase text-gray-500">Revenue</p>
                    </div>
                    <div className="bg-gray-800 border-2 border-gray-600 p-3 text-center">
                      <p className="text-2xl font-black text-green-500">{agent.dealsClosed}</p>
                      <p className="text-xs font-bold uppercase text-gray-500">Missions</p>
                    </div>
                  </div>
                </BoxyCard>

                {/* Stats Breakdown */}
                <BoxyCard className="lg:col-span-2 p-6">
                  <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    FUNNEL STATS
                  </h3>
                  <div className="space-y-3">
                    <BoxyStatBar label="Prospecting" value={role.stats.prospecting} color="bg-amber-600" />
                    <BoxyStatBar label="Discovery" value={role.stats.discovery} color="bg-blue-600" />
                    <BoxyStatBar label="Proposal" value={role.stats.proposal} color="bg-purple-600" />
                    <BoxyStatBar label="Negotiation" value={role.stats.negotiation} color="bg-orange-600" />
                    <BoxyStatBar label="Closing" value={role.stats.closing} color="bg-green-600" />
                  </div>
                </BoxyCard>
              </div>

              {/* Core Strengths */}
              <BoxyCard className="p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  CORE STRENGTHS
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {role.skills.map((skill) => (
                    <div 
                      key={skill.name}
                      className={`bg-gray-800 border-2 ${role.border} p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold uppercase text-sm text-white">{skill.name}</span>
                        <BoxyBadge color={role.color}>LVL {skill.level}</BoxyBadge>
                      </div>
                      <div className="h-4 bg-gray-900 border border-gray-600">
                        <div 
                          className={`h-full ${role.color}`}
                          style={{ width: `${skill.level * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </BoxyCard>

              {/* KPIs */}
              <BoxyCard className="p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  KEY METRICS // {role.name}
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {role.kpis.map((kpi) => (
                    <div key={kpi} className="bg-gray-800 border-2 border-gray-700 p-4 text-center">
                      <p className="text-sm font-bold uppercase text-gray-400">{kpi}</p>
                      <p className="text-xl font-black text-white mt-1">---</p>
                    </div>
                  ))}
                </div>
              </BoxyCard>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Object.values(ROLES).map((r) => (
                  <BoxyCard 
                    key={r.id}
                    className={`p-6 cursor-pointer transition-all hover:bg-gray-800 hover:border-amber-500 ${
                      selectedRole === r.id ? 'border-amber-500 bg-gray-800' : ''
                    }`}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <div className={`h-16 w-16 mx-auto border-4 border-gray-600 ${r.bgLight} flex items-center justify-center`}>
                      <span className="text-4xl">{r.emoji}</span>
                    </div>
                    <h3 className="font-black text-center mt-3 text-white uppercase">{r.name}</h3>
                    <div className="flex justify-center mt-2">
                      <BoxyBadge color={r.color}>{r.track}</BoxyBadge>
                    </div>
                    <p className="text-xs text-center mt-3 font-bold uppercase text-gray-500">{r.bestFor}</p>
                  </BoxyCard>
                ))}
              </div>

              {/* Role Progression */}
              <BoxyCard className="p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-amber-500" />
                  CAREER PATH
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <div className="flex-shrink-0 text-center">
                    <div className="h-16 w-16 mx-auto border-4 border-gray-600 bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">🔭</span>
                    </div>
                    <p className="text-sm font-bold mt-2 text-white uppercase">Recruit</p>
                    <p className="text-xs text-gray-500 uppercase">Entry</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-gray-600 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="h-16 w-16 mx-auto border-4 border-amber-600 bg-amber-900/20 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <p className="text-sm font-bold mt-2 text-white uppercase">Hunter</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-gray-600 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="h-16 w-16 mx-auto border-4 border-green-600 bg-green-900/20 flex items-center justify-center">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <p className="text-sm font-bold mt-2 text-white uppercase">Cultivator</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-gray-600 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="h-16 w-16 mx-auto border-4 border-blue-600 bg-blue-900/20 flex items-center justify-center">
                      <span className="text-2xl">👑</span>
                    </div>
                    <p className="text-sm font-bold mt-2 text-white uppercase">Champion</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-gray-600 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="h-16 w-16 mx-auto border-4 border-purple-600 bg-purple-900/20 flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <p className="text-sm font-bold mt-2 text-white uppercase">Senior</p>
                  </div>
                </div>
              </BoxyCard>
            </TabsContent>

            {/* Agency Tab */}
            <TabsContent value="team" className="space-y-4">
              <BoxyCard className="p-6">
                <h3 className="font-black uppercase text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  AGENCY COMPOSITION
                </h3>
                <div className="grid gap-4 md:grid-cols-5">
                  {/* Recruits */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔭</span>
                      <h4 className="font-bold uppercase text-gray-400">Recruits</h4>
                      <BoxyBadge color="bg-gray-700">1</BoxyBadge>
                    </div>
                    {[
                      { name: 'NEW KIM', level: 1, xp: 150 },
                    ].map((member) => (
                      <div key={member.name} className="bg-gray-800 border-2 border-gray-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-sm">
                            NK
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-white uppercase">{member.name}</p>
                            <p className="text-xs text-gray-500">LVL {member.level}</p>
                          </div>
                          <span className="text-xs font-bold text-amber-500">{member.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hunters */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <h4 className="font-bold uppercase text-amber-500">Hunters</h4>
                      <BoxyBadge color="bg-amber-700">2</BoxyBadge>
                    </div>
                    {[
                      { name: 'SARAH C', level: 15, xp: 15420 },
                      { name: 'MIKE J', level: 14, xp: 14890 },
                    ].map((member) => (
                      <div key={member.name} className="bg-gray-800 border-2 border-amber-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-amber-900/30 border-2 border-amber-600 flex items-center justify-center font-bold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-white uppercase">{member.name}</p>
                            <p className="text-xs text-gray-500">LVL {member.level}</p>
                          </div>
                          <span className="text-xs font-bold text-amber-500">{member.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cultivators */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌱</span>
                      <h4 className="font-bold uppercase text-green-500">Cultivators</h4>
                      <BoxyBadge color="bg-green-700">2</BoxyBadge>
                    </div>
                    {[
                      { name: 'AMANDA F', level: 13, xp: 13200 },
                      { name: 'DAVID L', level: 12, xp: 12900 },
                    ].map((member) => (
                      <div key={member.name} className="bg-gray-800 border-2 border-green-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-900/30 border-2 border-green-600 flex items-center justify-center font-bold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-white uppercase">{member.name}</p>
                            <p className="text-xs text-gray-500">LVL {member.level}</p>
                          </div>
                          <span className="text-xs font-bold text-green-500">{member.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Champions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👑</span>
                      <h4 className="font-bold uppercase text-blue-500">Champions</h4>
                      <BoxyBadge color="bg-blue-700">1</BoxyBadge>
                    </div>
                    {[
                      { name: 'EMILY Z', level: 11, xp: 11500 },
                    ].map((member) => (
                      <div key={member.name} className="bg-gray-800 border-2 border-blue-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-900/30 border-2 border-blue-600 flex items-center justify-center font-bold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-white uppercase">{member.name}</p>
                            <p className="text-xs text-gray-500">LVL {member.level}</p>
                          </div>
                          <span className="text-xs font-bold text-blue-500">{member.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Senior Agents */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      <h4 className="font-bold uppercase text-purple-500">Senior</h4>
                      <BoxyBadge color="bg-purple-700">1</BoxyBadge>
                    </div>
                    {[
                      { name: 'ROBERT K', level: 18, xp: 22000 },
                    ].map((member) => (
                      <div key={member.name} className="bg-gray-800 border-2 border-purple-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-purple-900/30 border-2 border-purple-600 flex items-center justify-center font-bold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-white uppercase">{member.name}</p>
                            <p className="text-xs text-gray-500">LVL {member.level}</p>
                          </div>
                          <span className="text-xs font-bold text-purple-500">{member.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BoxyCard>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
