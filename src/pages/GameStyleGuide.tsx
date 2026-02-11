import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, Target, Trophy, TrendingUp, Users, Star,
  Zap, Crown, Sparkles, Crosshair
} from 'lucide-react';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// Minimal Dark Theme (Option 1)
function MinimalDarkPreview() {
  return (
    <div className="bg-gray-950 p-6 rounded-lg border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">MINIMAL DARK</h3>
        <Badge variant="outline" className="border-gray-700 text-gray-400">Clean & Modern</Badge>
      </div>
      
      {/* Minimal Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Revenue', value: '$1.2M', color: 'text-emerald-400' },
          { label: 'Deals', value: '89', color: 'text-blue-400' },
          { label: 'Win Rate', value: '78%', color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 p-4 rounded-lg text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Minimal Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Quota Progress</span>
          <span className="text-white">80%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-4/5" />
        </div>
      </div>
      
      {/* Minimal Button */}
      <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
        <Phone className="h-4 w-4 mr-2" />
        Start Call
      </Button>
    </div>
  );
}

// Minecraft Blocky Theme (Option 2)
function MinecraftBlockyPreview() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border-4 border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black uppercase text-white tracking-wider">MINECRAFT 3D</h3>
        <span className="px-3 py-1 bg-amber-600 text-white font-black uppercase text-xs border-b-4 border-amber-800">Boxy & Retro</span>
      </div>
      
      {/* 3D Block Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Revenue', value: '$1.2M', color: 'text-amber-400' },
          { label: 'Deals', value: '89', color: 'text-green-400' },
          { label: 'Win Rate', value: '78%', color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-950 border-2 border-gray-600 border-b-4 p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-bold uppercase text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* 3D Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm font-bold uppercase text-gray-300">
          <span>Quota Progress</span>
          <span>80%</span>
        </div>
        <div className="h-8 bg-gray-950 border-2 border-gray-600 border-b-4">
          <div className="h-full bg-amber-500 border-r-2 border-black/30" style={{ width: '80%' }} />
        </div>
      </div>
      
      {/* 3D Block Button */}
      <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-wider border-b-4 border-green-800 active:border-b-0 active:mt-1 transition-all">
        <Phone className="h-4 w-4 inline mr-2" />
        Start Mission
      </button>
    </div>
  );
}

// Sci-Fi Cyberpunk Theme (Option 3)
function CyberpunkPreview() {
  return (
    <div className="bg-slate-950 p-6 rounded-lg border border-cyan-500/30 space-y-4 relative overflow-hidden">
      {/* Cyberpunk Glow Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-lg font-bold text-cyan-400 tracking-widest">CYBERPUNK</h3>
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 font-mono text-xs border border-cyan-500/50">NEON MODE</span>
      </div>
      
      {/* Neon Stat Cards */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {[
          { label: 'Revenue', value: '$1.2M', color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
          { label: 'Deals', value: '89', color: 'text-pink-400', glow: 'shadow-pink-500/20' },
          { label: 'Win Rate', value: '78%', color: 'text-amber-400', glow: 'shadow-amber-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-slate-900/80 p-4 rounded-lg text-center border border-slate-700 ${stat.glow} shadow-lg`}>
            <p className={`text-2xl font-bold ${stat.color} drop-shadow-lg`}>{stat.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Glowing Progress Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-sm">
          <span className="text-cyan-400 font-mono">QUOTA_PROGRESS</span>
          <span className="text-cyan-400 font-mono">80%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 w-4/5 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
        </div>
      </div>
      
      {/* Neon Button */}
      <Button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
        <Zap className="h-4 w-4 mr-2" />
        INITIATE_CALL
      </Button>
    </div>
  );
}

// RPG Adventure Theme (Option 4)
function RPGAdventurePreview() {
  return (
    <div className="bg-stone-900 p-6 rounded-lg border-2 border-stone-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif text-amber-400">RPG ADVENTURE</h3>
        <span className="px-3 py-1 bg-amber-900/50 text-amber-400 font-serif text-xs border border-amber-700">Quest Mode</span>
      </div>
      
      {/* RPG Character Card */}
      <div className="flex gap-4 p-4 bg-stone-800/50 rounded-lg border border-stone-700">
        <div className="h-16 w-16 rounded-lg bg-amber-900/30 border-2 border-amber-600 flex items-center justify-center text-3xl">
          🎯
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-lg text-amber-100">AGENT</h4>
            <Badge className="bg-amber-700 text-amber-100">LVL 12</Badge>
          </div>
          <p className="text-sm text-stone-400">Team Alpha • Hunter Class</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-2 flex-1 bg-stone-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-4/5" />
            </div>
            <span className="text-xs text-amber-400">12,450 / 14,400 XP</span>
          </div>
        </div>
      </div>
      
      {/* Quest Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Revenue', value: '$1.2M', color: 'text-amber-400' },
          { label: 'Quests', value: '89', color: 'text-green-400' },
          { label: 'Win Rate', value: '78%', color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-stone-800/50 rounded-lg text-center border border-stone-700">
            <p className={`text-2xl font-serif ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-stone-500 uppercase">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Quest Button */}
      <Button className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif border border-amber-500">
        <Target className="h-4 w-4 mr-2" />
        Accept Quest
      </Button>
    </div>
  );
}

// Retro Arcade Theme (Option 5)
function RetroArcadePreview() {
  return (
    <div className="bg-black p-6 rounded-lg border-4 border-red-600 space-y-4 relative">
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-lg font-bold text-red-500 tracking-widest" style={{ textShadow: '2px 2px 0 #ff0000' }}>ARCADE</h3>
        <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs animate-pulse">HIGH SCORE</span>
      </div>
      
      {/* Arcade Stats */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {[
          { label: 'SCORE', value: '1.2M', color: 'text-yellow-400' },
          { label: 'BONUS', value: '89', color: 'text-cyan-400' },
          { label: 'LEVEL', value: '12', color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 p-4 rounded text-center border-2 border-gray-600">
            <p className={`text-xl font-bold ${stat.color}`} style={{ textShadow: stat.label === 'SCORE' ? '2px 2px 0 #000' : 'none' }}>{stat.value}</p>
            <p className="text-xs text-gray-500 font-bold">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Arcade Progress */}
      <div className="space-y-1 relative z-10">
        <div className="flex justify-between text-sm font-bold text-yellow-400">
          <span>QUOTA</span>
          <span>80%</span>
        </div>
        <div className="h-6 bg-gray-900 border-2 border-gray-600">
          <div className="h-full bg-yellow-500 animate-pulse" style={{ width: '80%' }} />
        </div>
      </div>
      
      {/* Arcade Button */}
      <Button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-lg border-4 border-red-800 uppercase tracking-widest relative z-10">
        <Crown className="h-5 w-5 mr-2" />
        INSERT COIN
      </Button>
    </div>
  );
}

const styles = [
  {
    id: 'minimal',
    name: 'Minimal Dark',
    description: 'Clean, modern interface with subtle accents',
    preview: <MinimalDarkPreview />,
    features: ['Clean typography', 'Subtle animations', 'Professional look', 'Low visual noise'],
    bestFor: 'Enterprise & Professional Services',
  },
  {
    id: 'minecraft',
    name: 'Minecraft 3D',
    description: 'Blocky, voxel-style interface with 3D depth',
    preview: <MinecraftBlockyPreview />,
    features: ['Raised 3D buttons', 'Beveled edges', 'Blocky aesthetic', 'Retro gaming feel'],
    bestFor: 'Casual teams & Gamification-focused orgs',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon glow effects with futuristic HUD design',
    preview: <CyberpunkPreview />,
    features: ['Neon glow effects', 'Glowing borders', 'Futuristic HUD', 'Tech-forward look'],
    bestFor: 'Tech companies & Startups',
  },
  {
    id: 'rpg',
    name: 'RPG Adventure',
    description: 'Character-focused with quest/mission framing',
    preview: <RPGAdventurePreview />,
    features: ['Character cards', 'Quest framing', 'Class system', 'Adventure theme'],
    bestFor: 'Sales teams & Competitive orgs',
  },
  {
    id: 'arcade',
    name: 'Retro Arcade',
    description: 'Pixel fonts, scanlines, and high-score energy',
    preview: <RetroArcadePreview />,
    features: ['Pixel fonts', 'Scanline effects', 'Score tracking', '80s arcade vibes'],
    bestFor: 'High-energy teams & Contests',
  },
];

export default function GameStyleGuide() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Choose Your Game Style
          </h1>
          <p className="text-muted-foreground">
            Select an interface style that matches your company culture. 
            Each style can be applied across the entire SellSig platform.
          </p>
        </div>

        {/* Style Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {styles.map((style) => (
            <Card key={style.id} className="overflow-hidden">
              {/* Preview */}
              <div className="aspect-video">
                {style.preview}
              </div>
              
              {/* Info */}
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">{style.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{style.description}</p>
                
                {/* Features */}
                <div className="space-y-2 mb-4">
                  {style.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Best For */}
                <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                  <span className="font-medium text-white">Best for:</span> {style.bestFor}
                </p>
                
                {/* Select Button */}
                <Button className="w-full mt-4" variant="outline">
                  Select This Style
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Style</th>
                    <th className="text-center py-3 px-4 font-medium">Visual Complexity</th>
                    <th className="text-center py-3 px-4 font-medium">Gamification</th>
                    <th className="text-center py-3 px-4 font-medium">Professional</th>
                    <th className="text-center py-3 px-4 font-medium">Fun Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {styles.map((style) => (
                    <tr key={style.id} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{style.name}</td>
                      <td className="text-center py-3 px-4">
                        {style.id === 'minimal' && '⬤○○○○'}
                        {style.id === 'minecraft' && '●●○○○'}
                        {style.id === 'cyberpunk' && '●●●○○'}
                        {style.id === 'rpg' && '●●○○○'}
                        {style.id === 'arcade' && '●●●●○'}
                      </td>
                      <td className="text-center py-3 px-4">
                        {style.id === 'minimal' && '○○○○○'}
                        {style.id === 'minecraft' && '●●●●●'}
                        {style.id === 'cyberpunk' && '●●●●○'}
                        {style.id === 'rpg' && '●●●●●'}
                        {style.id === 'arcade' && '●●●●●'}
                      </td>
                      <td className="text-center py-3 px-4">
                        {style.id === 'minimal' && '●●●●●'}
                        {style.id === 'minecraft' && '●●●○○'}
                        {style.id === 'cyberpunk' && '●●●○○'}
                        {style.id === 'rpg' && '●●●○○'}
                        {style.id === 'arcade' && '●●○○○'}
                      </td>
                      <td className="text-center py-3 px-4">
                        {style.id === 'minimal' && '○○○○○'}
                        {style.id === 'minecraft' && '●●●●●'}
                        {style.id === 'cyberpunk' && '●●●●○'}
                        {style.id === 'rpg' && '●●●●●'}
                        {style.id === 'arcade' && '●●●●●'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center p-8 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/25">
          <h3 className="text-lg font-semibold text-white mb-2">Ready to choose?</h3>
          <p className="text-muted-foreground mb-4">
            Select a style above and we'll apply it across the entire SellSig platform.
          </p>
          <Button size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Apply Selected Style
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
