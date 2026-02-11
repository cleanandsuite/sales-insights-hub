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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Target, Users, TrendingUp, Clock, Star, Trophy,
  Phone, ArrowRight, Zap, Crown, Heart, Search, 
  Globe, BookOpen, ChevronRight
} from 'lucide-react';

// Sales Roles
const ROLES = {
  closer: {
    id: 'closer',
    name: 'Closer',
    icon: Target,
    color: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    text: 'text-blue-500',
    emoji: '🛡️',
    primaryStat: 'Objection Handling',
    secondaryStat: 'Negotiation',
    stats: { prospecting: 30, discovery: 60, presentation: 70, negotiation: 90, closing: 95 },
    skills: [
      { name: 'Objection Shield', level: 8 },
      { name: 'Deal Captain', level: 6 },
      { name: 'Negotiation Master', level: 9 },
      { name: 'Close Force', level: 7 },
    ],
    synergies: ['Prospector', 'Strategist'],
    bestFor: 'Enterprise & Complex B2B',
    description: 'Handles the tough stuff so deals get done.',
  },
  nurturer: {
    id: 'nurturer',
    name: 'Nurturer',
    icon: Heart,
    color: 'bg-green-500',
    bgLight: 'bg-green-500/10',
    border: 'border-green-500/50',
    text: 'text-green-500',
    emoji: '💚',
    primaryStat: 'Customer Success',
    secondaryStat: 'Retention',
    stats: { prospecting: 40, discovery: 70, presentation: 50, negotiation: 60, closing: 70 },
    skills: [
      { name: 'Relationship Builder', level: 9 },
      { name: 'Retention Hero', level: 8 },
      { name: 'Upsell Finder', level: 7 },
      { name: 'Trust Creator', level: 9 },
    ],
    synergies: ['Networker', 'Mentor'],
    bestFor: 'Account Management & Renewals',
    description: 'Builds relationships that last.',
  },
  hunter: {
    id: 'hunter',
    name: 'Hunter',
    icon: Zap,
    color: 'bg-red-500',
    bgLight: 'bg-red-500/10',
    border: 'border-red-500/50',
    text: 'text-red-500',
    emoji: '🎯',
    primaryStat: 'Closing Rate',
    secondaryStat: 'Speed',
    stats: { prospecting: 50, discovery: 50, presentation: 50, negotiation: 80, closing: 100 },
    skills: [
      { name: 'Close Force', level: 10 },
      { name: 'Speed Demon', level: 8 },
      { name: 'Volume King', level: 7 },
      { name: 'Competitive Edge', level: 6 },
    ],
    synergies: ['Prospector', 'Closer'],
    bestFor: 'High-Volume Sales',
    description: 'Closes deals. Fast.',
  },
  strategist: {
    id: 'strategist',
    name: 'Strategist',
    icon: TrendingUp,
    color: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    border: 'border-purple-500/50',
    text: 'text-purple-500',
    emoji: '🧠',
    primaryStat: 'Enterprise Deals',
    secondaryStat: 'Multi-Stakeholder',
    stats: { prospecting: 30, discovery: 90, presentation: 100, negotiation: 80, closing: 50 },
    skills: [
      { name: 'C-Suite Talk', level: 7 },
      { name: 'Solution Design', level: 9 },
      { name: 'Committee Navigator', level: 8 },
      { name: 'Long Game', level: 8 },
    ],
    synergies: ['Closer', 'Networker'],
    bestFor: 'Enterprise & Strategic Accounts',
    description: 'Sees the big picture.',
  },
  prospector: {
    id: 'prospector',
    name: 'Prospector',
    icon: Search,
    color: 'bg-yellow-500',
    bgLight: 'bg-yellow-500/10',
    border: 'border-yellow-500/50',
    text: 'text-yellow-500',
    emoji: '🔍',
    primaryStat: 'Finding Opportunities',
    secondaryStat: 'Qualification',
    stats: { prospecting: 100, discovery: 50, presentation: 30, negotiation: 40, closing: 60 },
    skills: [
      { name: 'Opportunity Finder', level: 10 },
      { name: 'Quick Qualify', level: 9 },
      { name: 'Lead Hunter', level: 8 },
      { name: 'Pipeline Builder', level: 7 },
    ],
    synergies: ['Hunter', 'Strategist'],
    bestFor: 'SDR & Outbound Teams',
    description: 'Finds the hidden gems.',
  },
  networker: {
    id: 'networker',
    name: 'Networker',
    icon: Globe,
    color: 'bg-pink-500',
    bgLight: 'bg-pink-500/10',
    border: 'border-pink-500/50',
    text: 'text-pink-500',
    emoji: '🌐',
    primaryStat: 'Referrals',
    secondaryStat: 'Partnerships',
    stats: { prospecting: 70, discovery: 80, presentation: 70, negotiation: 30, closing: 50 },
    skills: [
      { name: 'Referral Engine', level: 9 },
      { name: 'Partnership Builder', level: 8 },
      { name: 'Warm Introductions', level: 10 },
      { name: 'Relationship Web', level: 7 },
    ],
    synergies: ['Nurturer', 'Strategist'],
    bestFor: 'BD & Partnerships',
    description: 'Connects people and opens doors.',
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    icon: BookOpen,
    color: 'bg-cyan-500',
    bgLight: 'bg-cyan-500/10',
    border: 'border-cyan-500/50',
    text: 'text-cyan-500',
    emoji: '🏆',
    primaryStat: 'Team Training',
    secondaryStat: 'Coaching',
    stats: { prospecting: 50, discovery: 70, presentation: 70, negotiation: 50, closing: 60 },
    skills: [
      { name: 'Team Trainer', level: 9 },
      { name: 'Rep Developer', level: 8 },
      { name: 'Technique Share', level: 10 },
      { name: 'Culture Builder', level: 7 },
    ],
    synergies: ['Everyone'],
    bestFor: 'Team Leads & Senior Reps',
    description: 'Makes the team better.',
  },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export default function SalesGuildProfile() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('closer');

  const role = ROLES[selectedRole as keyof typeof ROLES];

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
                <Users className="h-6 w-6 text-primary" />
                Sales Guild Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                {character.teamName} • Level {character.level} {role.emoji} {role.name}
              </p>
            </div>
            <Button onClick={() => setShowCallDialog(true)} className="gap-2">
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Character Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`h-24 w-24 mx-auto rounded-full ${role.bgLight} flex items-center justify-center ${role.border} border-2`}>
                        <span className="text-4xl">{role.emoji}</span>
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
                        <p className="text-xs text-muted-foreground">Deals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Breakdown */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Skill Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Prospecting', value: role.stats.prospecting, icon: Search },
                        { label: 'Discovery', value: role.stats.discovery, icon: Target },
                        { label: 'Presentation', value: role.stats.presentation, icon: TrendingUp },
                        { label: 'Negotiation', value: role.stats.negotiation, icon: Users },
                        { label: 'Closing', value: role.stats.closing, icon: Trophy },
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

              {/* Core Skills */}
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
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <span className="text-2xl">{r.emoji}</span>
                      </div>
                      <h3 className="font-bold text-center mt-3">{r.name}</h3>
                      <p className="text-xs text-muted-foreground text-center mt-1">{r.description}</p>
                      <div className="mt-4 p-3 rounded bg-muted/50">
                        <p className="text-xs">
                          <span className="font-medium">Best for:</span><br />
                          {r.bestFor}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Role Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {role.emoji} {role.name} Details
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
                        Pair with these roles for better results!
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

            {/* Team Tab */}
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
                        { combo: 'Prospector + Hunter', effect: 'Find → Close pipeline', bonus: '+25% Win Rate' },
                        { combo: 'Nurturer + Networker', effect: 'Retain → Grow accounts', bonus: '+30% Retention' },
                        { combo: 'Strategist + Closer', effect: 'Complex → Close deals', bonus: '+40% Enterprise' },
                        { combo: 'Mentor + All', effect: 'Team training', bonus: '+15% All Stats' },
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
                      Team {character.teamName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Sarah Chen', role: 'Closer', level: 15, xp: 15420 },
                        { name: 'Mike Johnson', role: 'Hunter', level: 14, xp: 14890 },
                        { name: 'Amanda Foster', role: 'Nurturer', level: 13, xp: 13200 },
                        { name: 'David Lee', role: 'Strategist', level: 13, xp: 12900 },
                      ].map((member, i) => {
                        const memberRole = ROLES[member.role.toLowerCase() as keyof typeof ROLES];
                        return (
                          <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-center w-8 font-bold text-muted-foreground">
                              {i + 1}
                            </div>
                            <div className={`h-10 w-10 rounded-full ${memberRole?.bgLight} flex items-center justify-center text-xl`}>
                              {memberRole?.emoji}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">Level {member.level} {memberRole?.name}</p>
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
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
