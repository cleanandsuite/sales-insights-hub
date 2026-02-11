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
import { Character, CharacterConfig } from '@/components/character/Character';
import { PixelAvatar, CharacterSelector } from '@/components/character/Avatar';
import {
  Phone, Users, TrendingUp, Target, Zap, Trophy,
  Search, Star, ArrowRight, Sparkles, Crown
} from 'lucide-react';
import {
  SalesStats,
  calculateClass,
  getEvolutionProgress,
  CLASSES,
  calculatePowerLevel
} from '@/lib/evolution';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export default function AgencyProfile() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
    build: 'medium',
    gender: 'male',
  });

  // Mock stats (will come from database)
  const [stats, setStats] = useState<SalesStats>({
    prospecting: 85,
    discovery: 78,
    presentation: 72,
    negotiation: 65,
    closing: 82,
  });

  const character = {
    name: 'John Doe',
    level: 12,
    xp: 12450,
    xpToNextLevel: 14400,
    totalRevenue: 1200000,
    dealsClosed: 89,
    teamName: 'Team Alpha',
  };

  const characterClass = calculateClass(stats);
  const evolutionProgress = getEvolutionProgress(stats);
  const powerLevel = calculatePowerLevel(stats);

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
                <Trophy className="h-6 w-6 text-primary" />
                The Agency
              </h1>
              <p className="text-sm text-muted-foreground">
                {character.teamName} • Level {character.level} • Power Level {powerLevel}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-muted-foreground">Current Class</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  {characterClass?.emoji || '🔭'} {characterClass?.name || 'Recruit'}
                </p>
              </div>
              <Button onClick={() => setShowCallDialog(true)} className="gap-2">
                <Phone className="h-4 w-4" />
                Start Call
              </Button>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="evolution">Evolution</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="character">Character</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Character Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Character
                        config={characterConfig}
                        characterClass={characterClass}
                        size={96}
                        state="idle"
                        showName
                        name={character.name}
                      />
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

                    {/* Class Info */}
                    {characterClass && (
                      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold flex items-center gap-1">
                            {characterClass.emoji} {characterClass.name}
                          </span>
                          <Badge>Tier {characterClass.tier}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{characterClass.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Breakdown */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Sales Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Prospecting', value: stats.prospecting, icon: Search, color: 'bg-amber-500' },
                        { label: 'Discovery', value: stats.discovery, icon: Target, color: 'bg-blue-500' },
                        { label: 'Presentation', value: stats.presentation, icon: TrendingUp, color: 'bg-purple-500' },
                        { label: 'Negotiation', value: stats.negotiation, icon: Users, color: 'bg-orange-500' },
                        { label: 'Closing', value: stats.closing, icon: Trophy, color: 'bg-green-500' },
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
            </TabsContent>

            {/* Evolution Tab */}
            <TabsContent value="evolution" className="space-y-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Evolution Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Current Class */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Current Class</h3>
                      {characterClass ? (
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-4xl">{characterClass.emoji}</div>
                          <div>
                            <p className="text-xl font-bold">{characterClass.name}</p>
                            <p className="text-sm text-muted-foreground">Tier {characterClass.tier}</p>
                            <p className="text-xs text-muted-foreground mt-1">{characterClass.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                          <div className="text-4xl">🔭</div>
                          <div>
                            <p className="text-xl font-bold">Recruit</p>
                            <p className="text-sm text-muted-foreground">Training in progress...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Evolution Progress */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Evolution Progress</h3>
                      {evolutionProgress.nextClass ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Next: {evolutionProgress.nextClass.emoji} {evolutionProgress.nextClass.name}</span>
                            <span className="font-bold">{evolutionProgress.progress}%</span>
                          </div>
                          <Progress value={evolutionProgress.progress} className="h-3" />
                          {evolutionProgress.missingStats.length > 0 && (
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Improve these stats to evolve:</p>
                              {evolutionProgress.missingStats.map((req) => (
                                <div key={req.stat} className="flex items-center gap-2">
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="capitalize">{req.stat}: {stats[req.stat]} / {req.threshold}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <Crown className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium text-amber-500">Maximum Class Reached!</p>
                            <p className="text-sm text-muted-foreground">You're a legend!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Class Tree */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Evolution Tree</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Tier 1 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>Tier 1</Badge>
                        <span className="text-sm text-muted-foreground">Specialists</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        {CLASSES.filter(c => c.tier === 1).map((cls) => {
                          const meets = cls.requirements.every(req => stats[req.stat] >= req.threshold);
                          const isCurrent = characterClass?.id === cls.id;
                          return (
                            <div
                              key={cls.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isCurrent ? 'border-primary bg-primary/10' :
                                meets ? 'border-green-500/50 bg-green-500/5' :
                                'border-border'
                              }`}
                            >
                              <div className="text-2xl mb-1">{cls.emoji}</div>
                              <p className="font-medium text-sm">{cls.name}</p>
                              <p className="text-xs text-muted-foreground">{cls.description}</p>
                              {!meets && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {cls.requirements.map(req => {
                                    const current = stats[req.stat];
                                    const needed = req.threshold;
                                    return current < needed ? `${req.stat} ${current}/${needed}` : null;
                                  }).filter(Boolean).join(', ')}
                                </p>
                              )}
                              {isCurrent && <Badge className="mt-2">Current</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tier 2 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>Tier 2</Badge>
                        <span className="text-sm text-muted-foreground">Hybrids</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        {CLASSES.filter(c => c.tier === 2).map((cls) => {
                          const meets = cls.requirements.every(req => stats[req.stat] >= req.threshold);
                          const isCurrent = characterClass?.id === cls.id;
                          return (
                            <div
                              key={cls.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isCurrent ? 'border-primary bg-primary/10' :
                                meets ? 'border-green-500/50 bg-green-500/5' :
                                'border-border'
                              }`}
                            >
                              <div className="text-2xl mb-1">{cls.emoji}</div>
                              <p className="font-medium text-sm">{cls.name}</p>
                              <p className="text-xs text-muted-foreground">{cls.description}</p>
                              {!meets && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {cls.requirements.map(req => {
                                    const current = stats[req.stat];
                                    const needed = req.threshold;
                                    return current < needed ? `${req.stat} ${current}/${needed}` : null;
                                  }).filter(Boolean).join(', ')}
                                </p>
                              )}
                              {isCurrent && <Badge className="mt-2">Current</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tier 3+ */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>Tier 3-4</Badge>
                        <span className="text-sm text-muted-foreground">Masters & Legends</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        {CLASSES.filter(c => c.tier >= 3).map((cls) => {
                          const meets = cls.requirements.every(req => stats[req.stat] >= req.threshold);
                          const isCurrent = characterClass?.id === cls.id;
                          return (
                            <div
                              key={cls.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isCurrent ? 'border-primary bg-primary/10' :
                                meets ? 'border-green-500/50 bg-green-500/5' :
                                'border-border'
                              }`}
                            >
                              <div className="text-2xl mb-1">{cls.emoji}</div>
                              <p className="font-medium text-sm">{cls.name}</p>
                              <p className="text-xs text-muted-foreground">{cls.description}</p>
                              {!meets && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {cls.requirements.map(req => {
                                    const current = stats[req.stat];
                                    const needed = req.threshold;
                                    return current < needed ? `${req.stat} ${current}/${needed}` : null;
                                  }).filter(Boolean).join(', ')}
                                </p>
                              )}
                              {isCurrent && <Badge className="mt-2">Current</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stat Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{key}</span>
                          <span className="text-2xl font-bold">{value}</span>
                        </div>
                        <Progress value={value} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          {value >= 90 ? 'Godlike' :
                           value >= 80 ? 'Elite' :
                           value >= 70 ? 'Expert' :
                           value >= 60 ? 'Skilled' :
                           value >= 50 ? 'Competent' : 'Developing'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Character Tab */}
            <TabsContent value="character" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customize Your Character</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Character Preview */}
                    <div className="flex justify-center p-8 rounded-lg bg-muted/50">
                      <Character
                        config={characterConfig}
                        characterClass={characterClass}
                        size={128}
                        state="idle"
                      />
                    </div>

                    {/* Character Selector */}
                    <div>
                      <h3 className="font-medium mb-3">Choose Your Build</h3>
                      <CharacterSelector
                        selected={characterConfig}
                        onSelect={setCharacterConfig}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Sarah Chen', class: 'Hunter', level: 15, xp: 15420, color: '#10B981' },
                      { name: 'Mike Johnson', class: 'Striker', level: 14, xp: 14890, color: '#F97316' },
                      { name: 'Amanda Foster', class: 'Cultivator', level: 13, xp: 13200, color: '#3B82F6' },
                      { name: 'David Lee', class: 'Closer', level: 13, xp: 12900, color: '#EF4444' },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <div className="text-3xl">{member.class === 'Hunter' ? '🎯' : member.class === 'Striker' ? '⚔️' : member.class === 'Cultivator' ? '🌱' : '🗝️'}</div>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">Level {member.level} • {member.class}</p>
                        </div>
                        <Badge variant="outline">{member.xp.toLocaleString()} XP</Badge>
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
