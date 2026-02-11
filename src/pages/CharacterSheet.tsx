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
  Shield, Heart, Sword, Wand, BookOpen, Music, Star, 
  Trophy, Users, Zap, Target, TrendingUp, ArrowRight,
  ChevronRight, Sparkles, Flame, Crown, Brain, Search, Presentation
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Role definitions
const ROLES = {
  tank: {
    id: 'tank',
    name: 'Tank',
    icon: Shield,
    color: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    text: 'text-blue-500',
    description: 'Handles objections and holds the deal',
    primaryStat: 'Objection Handling',
    secondaryStat: 'Resilience',
    stats: { prospecting: 30, discovery: 60, presentation: 70, negotiation: 90, closing: 40 },
    skills: [
      { name: 'Objection Shield', icon: Shield, level: 8 },
      { name: 'Counter-Strike', icon: Sword, level: 6 },
      { name: 'Thick Skin', icon: Shield, level: 10 },
      { name: 'Stand Ground', icon: Target, level: 5 },
    ],
    synergies: ['DPS', 'Mage'],
    bestFor: 'Enterprise & Complex B2B',
  },
  healer: {
    id: 'healer',
    name: 'Healer',
    icon: Heart,
    color: 'bg-green-500',
    bgLight: 'bg-green-500/10',
    border: 'border-green-500/50',
    text: 'text-green-500',
    description: 'Nurtures relationships and retains customers',
    primaryStat: 'Customer Success',
    secondaryStat: 'Retention',
    stats: { prospecting: 40, discovery: 70, presentation: 50, negotiation: 60, closing: 70 },
    skills: [
      { name: 'Relationship Cure', icon: Heart, level: 9 },
      { name: 'Nurture Growth', icon: Star, level: 7 },
      { name: 'Trust Boost', icon: Heart, level: 8 },
      { name: 'Surprise Gift', icon: Sparkles, level: 6 },
    ],
    synergies: ['Bard', 'Support'],
    bestFor: 'Account Management & Renewals',
  },
  dps: {
    id: 'dps',
    name: 'Damage Dealer',
    icon: Sword,
    color: 'bg-red-500',
    bgLight: 'bg-red-500/10',
    border: 'border-red-500/50',
    text: 'text-red-500',
    description: 'Closes deals fast and drives revenue',
    primaryStat: 'Closing Rate',
    secondaryStat: 'Speed',
    stats: { prospecting: 50, discovery: 50, presentation: 50, negotiation: 80, closing: 100 },
    skills: [
      { name: 'Deal Strike', icon: Sword, level: 10 },
      { name: 'Closing Flame', icon: Flame, level: 8 },
      { name: 'Power Close', icon: Zap, level: 7 },
      { name: 'Time Attack', icon: Target, level: 6 },
    ],
    synergies: ['Tank', 'Rogue'],
    bestFor: 'High-Volume Sales',
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    icon: Wand,
    color: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    border: 'border-purple-500/50',
    text: 'text-purple-500',
    description: 'Strategic enterprise and complex solutions',
    primaryStat: 'Enterprise Deals',
    secondaryStat: 'Strategic Planning',
    stats: { prospecting: 30, discovery: 90, presentation: 100, negotiation: 80, closing: 50 },
    skills: [
      { name: 'Future Sight', icon: Wand, level: 7 },
      { name: 'Strategic Mind', icon: Brain, level: 8 },
      { name: 'Network Web', icon: Users, level: 6 },
      { name: 'Magic Touch', icon: Sparkles, level: 5 },
    ],
    synergies: ['Tank', 'Bard'],
    bestFor: 'Enterprise & C-Suite',
  },
  rogue: {
    id: 'rogue',
    name: 'Rogue',
    icon: Sword,
    color: 'bg-yellow-500',
    bgLight: 'bg-yellow-500/10',
    border: 'border-yellow-500/50',
    text: 'text-yellow-500',
    description: 'Finds hidden deals and moves fast',
    primaryStat: 'Prospecting',
    secondaryStat: 'Speed',
    stats: { prospecting: 100, discovery: 50, presentation: 30, negotiation: 40, closing: 60 },
    skills: [
      { name: 'Ambush', icon: Sword, level: 9 },
      { name: 'Fast Move', icon: Zap, level: 8 },
      { name: 'Spot Weakness', icon: Target, level: 7 },
      { name: 'Precision Strike', icon: Sword, level: 6 },
    ],
    synergies: ['DPS', 'Mage'],
    bestFor: 'SDR & Outbound',
  },
  bard: {
    id: 'bard',
    name: 'Bard',
    icon: Music,
    color: 'bg-pink-500',
    bgLight: 'bg-pink-500/10',
    border: 'border-pink-500/50',
    text: 'text-pink-500',
    description: 'Connects people and builds networks',
    primaryStat: 'Networking',
    secondaryStat: 'Referrals',
    stats: { prospecting: 70, discovery: 80, presentation: 70, negotiation: 30, closing: 50 },
    skills: [
      { name: 'Charisma', icon: Music, level: 10 },
      { name: 'Storyteller', icon: Music, level: 8 },
      { name: 'Spotlight', icon: Star, level: 7 },
      { name: 'Bridge Builder', icon: Users, level: 6 },
    ],
    synergies: ['Healer', 'Mage'],
    bestFor: 'Partnerships & Referrals',
  },
  support: {
    id: 'support',
    name: 'Support',
    icon: Heart,
    color: 'bg-cyan-500',
    bgLight: 'bg-cyan-500/10',
    border: 'border-cyan-500/50',
    text: 'text-cyan-500',
    description: 'Enables the team to succeed',
    primaryStat: 'Team Success',
    secondaryStat: 'Training',
    stats: { prospecting: 50, discovery: 70, presentation: 70, negotiation: 50, closing: 60 },
    skills: [
      { name: 'Team Buff', icon: Star, level: 8 },
      { name: 'Knowledge Share', icon: BookOpen, level: 9 },
      { name: 'Backup', icon: Shield, level: 7 },
      { name: 'Morale Boost', icon: Sparkles, level: 6 },
    ],
    synergies: ['Everyone'],
    bestFor: 'Team Leads & Mentors',
  },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// Radar chart data
const RADAR_DATA = [
  { stat: 'Prospecting', A: 0, fullMark: 100 },
  { stat: 'Discovery', A: 0, fullMark: 100 },
  { stat: 'Presentation', A: 0, fullMark: 100 },
  { stat: 'Negotiation', A: 0, fullMark: 100 },
  { stat: 'Closing', A: 0, fullMark: 100 },
];

export default function CharacterSheet() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('tank');

  const role = ROLES[selectedRole as keyof typeof ROLES];
  const radarData = RADAR_DATA.map(d => ({ ...d, A: role.stats[d.stat.toLowerCase() as keyof typeof role.stats] }));

  // Current character data
  const character = {
    name: 'Your Rep',
    level: 12,
    xp: 12450,
    xpToNextLevel: 14400,
    totalRevenue: 1200000,
    dealsClosed: 89,
    teamName: 'Team Alpha',
  };

  const xpProgress = Math.round((character.xp / character.xpToNextLevel) * 100);

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
                <Shield className="h-6 w-6 text-primary" />
                Character Sheet
              </h1>
              <p className="text-sm text-muted-foreground">
                {character.teamName} • Level {character.level} {role.name}
              </p>
            </div>
            <Button onClick={() => setShowCallDialog(true)} className="gap-2">
              <Sword className="h-4 w-4" />
              Start Quest
            </Button>
          </div>

          <Tabs defaultValue="character" className="space-y-6">
            <TabsList>
              <TabsTrigger value="character">Character</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="team">Team Synergy</TabsTrigger>
              <TabsTrigger value="skills">Skill Tree</TabsTrigger>
            </TabsList>

            {/* Character Sheet */}
            <TabsContent value="character" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Character Card */}
                <Card className="lg:col-span-1">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`h-24 w-24 mx-auto rounded-full ${role.bgLight} flex items-center justify-center ${role.border} border-2`}>
                        <role.icon className={`h-12 w-12 ${role.text}`} />
                      </div>
                      <h2 className="text-xl font-bold mt-4">{character.name}</h2>
                      <p className="text-sm text-muted-foreground">{character.teamName}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="outline" className={role.border}>{role.name}</Badge>
                        <Badge>Level {character.level}</Badge>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Experience</span>
                        <span>{character.xp.toLocaleString()} / {character.xpToNextLevel.toLocaleString()}</span>
                      </div>
                      <Progress value={xpProgress} className="h-3" />
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{formatCurrency(character.totalRevenue)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{character.dealsClosed}</p>
                        <p className="text-xs text-muted-foreground">Deals Closed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Breakdown */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Stat Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Prospecting', value: role.stats.prospecting, icon: Target },
                        { label: 'Discovery', value: role.stats.discovery, icon: Search },
                        { label: 'Presentation', value: role.stats.presentation, icon: Presentation },
                        { label: 'Negotiation', value: role.stats.negotiation, icon: Users },
                        { label: 'Closing', value: role.stats.closing, icon: Sword },
                      ].map((stat) => (
                        <div key={stat.label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <stat.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{stat.label}</span>
                            </div>
                            <span className="font-medium">{stat.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${role.color}`}
                              style={{ width: `${stat.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Active Skills
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
                          <skill.icon className={`h-5 w-5 ${role.text}`} />
                          <Badge variant="outline" className="text-xs">Lv.{skill.level}</Badge>
                        </div>
                        <p className="font-medium mt-2">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{role.primaryStat} +{skill.level * 5}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Role Selection */}
            <TabsContent value="roles" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.values(ROLES).map((r) => (
                  <Card 
                    key={r.id}
                    className={cn(
                      'cursor-pointer transition-all hover:scale-105',
                      selectedRole === r.id ? `${r.border} ring-2 ring-offset-2` : ''
                    )}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <CardContent className="pt-6">
                      <div className={`h-12 w-12 mx-auto rounded-lg ${r.bgLight} flex items-center justify-center`}>
                        <r.icon className={`h-6 w-6 ${r.text}`} />
                      </div>
                      <h3 className="font-bold text-center mt-3">{r.name}</h3>
                      <p className="text-xs text-muted-foreground text-center mt-1">{r.description}</p>
                      <div className="mt-4 space-y-1">
                        <p className="text-xs">
                          <span className="text-muted-foreground">Best:</span> {r.bestFor}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Role Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <role.icon className={`h-5 w-5 ${role.text}`} />
                    {role.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Synergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.synergies.map((synergy) => (
                          <Badge key={synergy} variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {synergy}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Work with these roles for bonus XP and combo attacks!
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Role Bonus</h4>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">
                          <span className="font-medium">{role.primaryStat}</span>
                          <span className="text-muted-foreground"> +20% effectiveness</span>
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{role.secondaryStat}</span>
                          <span className="text-muted-foreground"> +10% effectiveness</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Synergy */}
            <TabsContent value="team" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Team Composition */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Synergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { combo: 'Tank + DPS', effect: 'Objection → Close pipeline', bonus: '+25% Win Rate' },
                        { combo: 'Healer + Bard', effect: 'Loyalty + Referrals = Growth', bonus: '+30% Retention' },
                        { combo: 'Mage + Rogue', effect: 'Enterprise + Prospecting', bonus: '+40% Pipeline' },
                        { combo: 'Support + All', effect: 'Team XP Boost', bonus: '+15% All Stats' },
                      ].map((synergy) => (
                        <div key={synergy.combo} className="flex items-center gap-4 p-3 rounded-lg border">
                          <Badge variant="outline">{synergy.combo}</Badge>
                          <div className="flex-1">
                            <p className="text-sm">{synergy.effect}</p>
                            <p className="text-xs text-success font-medium">{synergy.bonus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Team Composition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Sarah Chen', role: 'Tank', level: 15, xp: 15420 },
                        { name: 'Mike Johnson', role: 'DPS', level: 14, xp: 14890 },
                        { name: 'Amanda Foster', role: 'Healer', level: 13, xp: 13200 },
                        { name: 'David Lee', role: 'Mage', level: 13, xp: 12900 },
                      ].map((member, i) => {
                        const memberRole = ROLES[member.role.toLowerCase() as keyof typeof ROLES];
                        return (
                          <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-center w-8 font-bold text-muted-foreground">
                              {i + 1}
                            </div>
                            <div className={`h-10 w-10 rounded-full ${memberRole?.bgLight || 'bg-muted'} flex items-center justify-center`}>
                              {memberRole ? (
                                <memberRole.icon className={`h-5 w-5 ${memberRole.text}`} />
                              ) : (
                                <Users className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">Level {member.level} {member.role}</p>
                            </div>
                            <Badge variant="outline">{member.xp.toLocaleString()} XP</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Skill Tree */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {role.name} Skill Tree
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {role.skills.map((skill, i) => (
                      <div key={skill.name} className="relative">
                        {/* Connector line */}
                        {i < role.skills.length - 1 && (
                          <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-muted" />
                        )}
                        <div className="flex flex-col items-center text-center">
                          <div className={`h-16 w-16 rounded-full ${role.bgLight} border-2 ${role.border} flex items-center justify-center z-10`}>
                            <skill.icon className={`h-8 w-8 ${role.text}`} />
                          </div>
                          <p className="font-medium mt-2">{skill.name}</p>
                          <Badge variant="outline" className="mt-1">Level {skill.level}</Badge>
                          <p className="text-xs text-muted-foreground mt-2 px-4">
                            {skill.level === 10 ? '✨ Mastered!' : `${5 - (skill.level % 5)} levels to upgrade`}
                          </p>
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
