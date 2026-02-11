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
    color: 'bg-gray-500',
    bgLight: 'bg-gray-500/10',
    border: 'border-gray-500/50',
    text: 'text-gray-500',
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
    bgLight: 'bg-amber-500/10',
    border: 'border-amber-500/50',
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
    color: 'bg-red-500',
    bgLight: 'bg-red-500/10',
    border: 'border-red-500/50',
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
    color: 'bg-green-500',
    bgLight: 'bg-green-500/10',
    border: 'border-green-500/50',
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
    color: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    border: 'border-blue-500/50',
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

export default function AgencyProfile() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('hunter');

  const role = ROLES[selectedRole as keyof typeof ROLES];

  const agent = {
    name: 'Your Agent',
    level: 12,
    xp: 12450,
    xpToNextLevel: 14400,
    totalRevenue: 1200000,
    dealsClosed: 89,
    agencyName: 'Team Alpha',
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Medal className="h-6 w-6 text-amber-500" />
                Agency Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                {agent.agencyName} • Level {agent.level} {role.emoji} {role.name}
              </p>
            </div>
            <Button onClick={() => setShowCallDialog(true)} className="gap-2">
              <Phone className="h-4 w-4" />
              Start Mission
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="team">Agency</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Agent Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`h-24 w-24 mx-auto rounded-full ${role.bgLight} flex items-center justify-center ${role.border} border-2`}>
                        <span className="text-4xl">{role.emoji}</span>
                      </div>
                      <h2 className="text-xl font-bold mt-4">{agent.name}</h2>
                      <p className="text-sm text-muted-foreground">{agent.agencyName}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="outline" className={role.border}>{role.name}</Badge>
                        <Badge>Level {agent.level}</Badge>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Experience</span>
                        <span>{agent.xp.toLocaleString()} / {agent.xpToNextLevel.toLocaleString()}</span>
                      </div>
                      <Progress value={xpProgress} className="h-3" />
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{formatCurrency(agent.totalRevenue)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{agent.dealsClosed}</p>
                        <p className="text-xs text-muted-foreground">Missions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Breakdown */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Funnel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Prospecting', value: role.stats.prospecting, icon: Search, color: 'bg-amber-500' },
                        { label: 'Discovery', value: role.stats.discovery, icon: Target, color: 'bg-blue-500' },
                        { label: 'Proposal', value: role.stats.proposal, icon: TrendingUp, color: 'bg-purple-500' },
                        { label: 'Negotiation', value: role.stats.negotiation, icon: Users, color: 'bg-orange-500' },
                        { label: 'Closing', value: role.stats.closing, icon: Trophy, color: 'bg-green-500' },
                      ].map((stat) => (
                        <div key={stat.label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <stat.icon className="h-4 w-4 text-muted-foreground" />
                              {stat.label}
                            </span>
                            <span className="font-medium">{stat.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${stat.color}`}
                              style={{ width: `${stat.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Core Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Core Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {role.skills.map((skill) => (
                      <div 
                        key={skill.name}
                        className={`p-3 rounded-lg ${role.bgLight} border ${role.border}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{skill.name}</span>
                          <Badge variant="outline" className="text-xs">Lv.{skill.level}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {role.primaryStat} +{skill.level * 5}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Metrics ({role.name})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {role.kpis.map((kpi) => (
                      <div key={kpi} className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground">{kpi}</p>
                        <p className="text-xl font-bold mt-1">Track</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Object.values(ROLES).map((r) => (
                  <Card 
                    key={r.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedRole === r.id ? `${r.border} ring-2 ring-offset-2` : ''
                    }`}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <CardContent className="pt-6">
                      <div className={`h-12 w-12 mx-auto rounded-lg ${r.bgLight} flex items-center justify-center`}>
                        <span className="text-3xl">{r.emoji}</span>
                      </div>
                      <h3 className="font-bold text-center mt-3">{r.name}</h3>
                      <Badge className="mt-2">{r.track}</Badge>
                      <p className="text-xs text-muted-foreground text-center mt-2">{r.bestFor}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Role Progression */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Career Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 overflow-x-auto pb-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="h-16 w-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto">
                        <span className="text-2xl">🔭</span>
                      </div>
                      <p className="text-sm font-medium mt-2">Recruit</p>
                      <p className="text-xs text-muted-foreground">Entry</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 text-center">
                      <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <p className="text-sm font-medium mt-2">Hunter</p>
                      <p className="text-xs text-muted-foreground">Front</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 text-center">
                      <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <span className="text-2xl">🌱</span>
                      </div>
                      <p className="text-sm font-medium mt-2">Cultivator</p>
                      <p className="text-xs text-muted-foreground">Middle</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 text-center">
                      <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                        <span className="text-2xl">👑</span>
                      </div>
                      <p className="text-sm font-medium mt-2">Champion</p>
                      <p className="text-xs text-muted-foreground">Post-Sale</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 text-center">
                      <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <p className="text-sm font-medium mt-2">Senior Agent</p>
                      <p className="text-xs text-muted-foreground">Leadership</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agency Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agency Composition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    {/* Recruit */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔭</span>
                        <h4 className="font-medium">Recruits</h4>
                        <Badge variant="outline">1</Badge>
                      </div>
                      {[
                        { name: 'New Hire Kim', level: 1, xp: 150 },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center text-sm font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">Level {member.level}</p>
                          </div>
                          <Badge variant="outline">{member.xp} XP</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Hunters */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <h4 className="font-medium">Hunters</h4>
                        <Badge variant="outline">2</Badge>
                      </div>
                      {[
                        { name: 'Sarah Chen', level: 15, xp: 15420 },
                        { name: 'Mike Johnson', level: 14, xp: 14890 },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">Level {member.level}</p>
                          </div>
                          <Badge variant="outline">{member.xp.toLocaleString()} XP</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Cultivators */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌱</span>
                        <h4 className="font-medium">Cultivators</h4>
                        <Badge variant="outline">2</Badge>
                      </div>
                      {[
                        { name: 'Amanda Foster', level: 13, xp: 13200 },
                        { name: 'David Lee', level: 12, xp: 12900 },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">Level {member.level}</p>
                          </div>
                          <Badge variant="outline">{member.xp.toLocaleString()} XP</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Champions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <h4 className="font-medium">Champions</h4>
                        <Badge variant="outline">1</Badge>
                      </div>
                      {[
                        { name: 'Emily Zhang', level: 11, xp: 11500 },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">Level {member.level}</p>
                          </div>
                          <Badge variant="outline">{member.xp.toLocaleString()} XP</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Senior Agents */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⭐</span>
                        <h4 className="font-medium">Senior</h4>
                        <Badge variant="outline">1</Badge>
                      </div>
                      {[
                        { name: 'Robert Kim', level: 18, xp: 22000 },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">Level {member.level}</p>
                          </div>
                          <Badge variant="outline">{member.xp.toLocaleString()} XP</Badge>
                        </div>
                      ))}
                    </div>
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
