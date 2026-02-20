import { useState } from 'react';
import { 
  Trophy, BarChart3, Zap, Target, TrendingUp, TrendingDown, 
  ChevronDown, ChevronRight, Brain, Play, Sparkles, Calendar,
  Users, Flame, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillData {
  name: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
}

interface SubSkill {
  name: string;
  score: number;
  status: 'critical' | 'needs_work' | 'good' | 'excellent';
}

interface EnhancedSkill {
  name: string;
  icon: string;
  current: number;
  potential: number;
  teamAvg: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  aiInsight: string;
  quickAction: {
    title: string;
    xp: number;
    duration: string;
  };
  subSkills: SubSkill[];
}

interface QuickWin {
  action: string;
  impact: string;
  impactValue: number;
  skill: string;
}

interface EnhancedSkillsTabProps {
  overallScore: number;
  callsAnalyzed: number;
  skills: SkillData[];
}

// Mock enhanced data - in production this would come from AI analysis
const getEnhancedSkillsData = (skills: SkillData[]): EnhancedSkill[] => {
  const enhancedData: Record<string, Partial<EnhancedSkill>> = {
    'Rapport': {
      icon: '🤝',
      potential: 85,
      teamAvg: 72,
      trendValue: 8,
      aiInsight: "Your rapport builds slowly. You average 45 seconds of small talk vs. top performers at 90 seconds. Try asking about their weekend or recent company news before diving in.",
      quickAction: { title: "Practice warm opening phrases", xp: 50, duration: "5 min" },
      subSkills: [
        { name: 'Opening warmth', score: 62, status: 'needs_work' },
        { name: 'Active listening cues', score: 71, status: 'good' },
        { name: 'Personal connection', score: 58, status: 'needs_work' },
        { name: 'Mirroring & matching', score: 75, status: 'good' },
      ]
    },
    'Discovery': {
      icon: '🔍',
      potential: 78,
      teamAvg: 65,
      trendValue: -3,
      aiInsight: "You're asking only 2.3 open-ended questions per call vs team average of 6.1. You jump to pitching too quickly after hearing the first pain point.",
      quickAction: { title: "Discovery question drill", xp: 75, duration: "8 min" },
      subSkills: [
        { name: 'Open-ended questions', score: 38, status: 'critical' },
        { name: 'Pain point identification', score: 42, status: 'critical' },
        { name: 'Follow-up depth', score: 55, status: 'needs_work' },
        { name: 'Budget/timeline uncovering', score: 58, status: 'needs_work' },
      ]
    },
    'Presentation': {
      icon: '📊',
      potential: 88,
      teamAvg: 70,
      trendValue: 12,
      aiInsight: "Strong presentations! You're in the top 20% for demo clarity. Keep tailoring value props to specific pain points mentioned in discovery.",
      quickAction: { title: "Advanced storytelling module", xp: 60, duration: "10 min" },
      subSkills: [
        { name: 'Value proposition clarity', score: 82, status: 'excellent' },
        { name: 'Feature-benefit linking', score: 78, status: 'good' },
        { name: 'Customization to needs', score: 71, status: 'good' },
        { name: 'Visual aids usage', score: 68, status: 'needs_work' },
      ]
    },
    'Objection Handling': {
      icon: '🛡️',
      potential: 75,
      teamAvg: 68,
      trendValue: 5,
      aiInsight: "You struggle with pricing objections specifically. When prospects say 'too expensive', you discount immediately instead of reframing value first.",
      quickAction: { title: "Price objection roleplay", xp: 100, duration: "12 min" },
      subSkills: [
        { name: 'Price objections', score: 45, status: 'critical' },
        { name: 'Competitor comparisons', score: 62, status: 'needs_work' },
        { name: 'Timing concerns', score: 70, status: 'good' },
        { name: 'Authority stalls', score: 58, status: 'needs_work' },
      ]
    },
    'Closing': {
      icon: '🎯',
      potential: 82,
      teamAvg: 71,
      trendValue: 2,
      aiInsight: "You're missing closing opportunities. 3 of your last 5 calls had clear buying signals ('send me the contract') but you kept presenting instead of closing.",
      quickAction: { title: "Buying signals workshop", xp: 80, duration: "7 min" },
      subSkills: [
        { name: 'Buying signal recognition', score: 52, status: 'needs_work' },
        { name: 'Trial closes', score: 68, status: 'needs_work' },
        { name: 'Assumptive closing', score: 61, status: 'needs_work' },
        { name: 'Next steps clarity', score: 74, status: 'good' },
      ]
    },
  };

  return skills.map(skill => ({
    name: skill.name,
    current: skill.current,
    trend: skill.trend,
    ...enhancedData[skill.name],
  } as EnhancedSkill));
};

const quickWins: QuickWin[] = [
  { action: "Ask 2 more discovery questions per call", impact: "+8 pts", impactValue: 8, skill: "Discovery" },
  { action: "Reframe value before discounting", impact: "+5 pts", impactValue: 5, skill: "Objection Handling" },
  { action: "Set specific follow-up dates", impact: "+3 pts", impactValue: 3, skill: "Closing" },
  { action: "Use prospect's name 3x per call", impact: "+2 pts", impactValue: 2, skill: "Rapport" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'text-destructive';
    case 'needs_work': return 'text-warning';
    case 'good': return 'text-primary';
    case 'excellent': return 'text-success';
    default: return 'text-muted-foreground';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-destructive/20';
    case 'needs_work': return 'bg-warning/20';
    case 'good': return 'bg-primary/20';
    case 'excellent': return 'bg-success/20';
    default: return 'bg-muted';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

export function EnhancedSkillsTab({ overallScore, callsAnalyzed, skills }: EnhancedSkillsTabProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('30');
  
  const enhancedSkills = getEnhancedSkillsData(skills);
  
  // Calculate goal path
  const currentAvg = Math.round(enhancedSkills.reduce((acc, s) => acc + s.current, 0) / enhancedSkills.length);
  const potentialAvg = Math.round(enhancedSkills.reduce((acc, s) => acc + s.potential, 0) / enhancedSkills.length);
  const goalProgress = ((currentAvg - 50) / (potentialAvg - 50)) * 100;

  const toggleExpand = (skillName: string) => {
    setExpandedSkill(expandedSkill === skillName ? null : skillName);
  };

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="gap-1">
          <Flame className="h-3 w-3 text-warning" />
          7 day streak
        </Badge>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score with Potential */}
        <div className="card-gradient rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className={`h-5 w-5 ${getScoreColor(overallScore)}`} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Target className="h-3 w-3" />
                    {potentialAvg}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your AI-projected potential</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Overall Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={overallScore} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">{potentialAvg - overallScore} to go</span>
          </div>
        </div>

        {/* Calls Analyzed */}
        <div className="card-gradient rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs text-success gap-1">
              <TrendingUp className="h-3 w-3" />
              +12%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Calls Analyzed</p>
          <span className="text-3xl font-bold text-foreground">{callsAnalyzed}</span>
          <p className="text-xs text-muted-foreground mt-2">vs 18 last period</p>
        </div>

        {/* XP Earned */}
        <div className="card-gradient rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <Badge variant="outline" className="text-xs">Level 12</Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">XP Earned</p>
          <span className="text-3xl font-bold text-foreground">2,450</span>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={65} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">550 to L13</span>
          </div>
        </div>

        {/* Team Rank */}
        <div className="card-gradient rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
              <Users className="h-5 w-5 text-secondary-foreground" />
            </div>
            <Badge variant="outline" className="text-xs text-success gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +2
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team Rank</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">#4</span>
            <span className="text-sm text-muted-foreground">of 12</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Top 33% performer</p>
        </div>
      </div>

      {/* Goal Path Card */}
      <div className="card-gradient rounded-xl border border-border/50 p-5 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Growth Path</h3>
          </div>
          <span className="text-sm text-muted-foreground">ETA: March 10, 2026</span>
        </div>
        
        <div className="relative">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
          
          {/* Milestones */}
          <div className="absolute top-0 left-0 right-0 h-3 flex items-center">
            {[50, 60, 70, potentialAvg].map((milestone, i) => {
              const position = ((milestone - 50) / (potentialAvg - 50)) * 100;
              const achieved = currentAvg >= milestone;
              return (
                <div 
                  key={milestone}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2 -mt-0.5",
                    achieved ? "bg-success border-success" : "bg-muted border-border"
                  )}>
                    {achieved && <CheckCircle2 className="h-3 w-3 text-success-foreground m-auto" />}
                  </div>
                  <span className={cn(
                    "text-xs mt-1",
                    achieved ? "text-success font-medium" : "text-muted-foreground"
                  )}>
                    {milestone}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-8 text-sm">
          <span className="text-muted-foreground">Current: <span className="text-foreground font-medium">{currentAvg}</span></span>
          <span className="text-primary font-medium">Target: {potentialAvg}</span>
        </div>
      </div>

      {/* Main Grid: Skills + Quick Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Skills List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Skill Breakdown
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-foreground" />
                <span>You</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Potential</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span>Team</span>
              </div>
            </div>
          </div>

          {enhancedSkills.map((skill) => (
            <div 
              key={skill.name}
              className={cn(
                "card-gradient rounded-xl border transition-all duration-200",
                expandedSkill === skill.name 
                  ? "border-primary/50 shadow-lg shadow-primary/5" 
                  : "border-border/50 hover:border-border"
              )}
            >
              {/* Collapsed Header */}
              <button
                onClick={() => toggleExpand(skill.name)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <span className="text-2xl">{skill.icon}</span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{skill.name}</span>
                    <div className="flex items-center gap-3">
                      {skill.trend === 'up' ? (
                        <Badge variant="outline" className="text-xs text-success gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +{skill.trendValue}%
                        </Badge>
                      ) : skill.trend === 'down' ? (
                        <Badge variant="outline" className="text-xs text-destructive gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {skill.trendValue}%
                        </Badge>
                      ) : null}
                      <span className={cn("text-lg font-bold", getScoreColor(skill.current))}>
                        {skill.current}
                      </span>
                    </div>
                  </div>
                  
                  {/* Triple Comparison Bars */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground rounded-full transition-all"
                          style={{ width: `${skill.current}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{skill.current}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${skill.potential}%` }}
                        />
                      </div>
                      <span className="text-xs text-primary w-8">{skill.potential}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-muted-foreground/50 rounded-full transition-all"
                          style={{ width: `${skill.teamAvg}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{skill.teamAvg}</span>
                    </div>
                  </div>
                </div>

                {expandedSkill === skill.name ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedSkill === skill.name && (
                <div className="px-4 pb-4 pt-0 space-y-4 animate-fade-in">
                  <div className="h-px bg-border" />
                  
                  {/* AI Insight */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-primary mb-1">AI Insight</p>
                        <p className="text-sm text-foreground/90">{skill.aiInsight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Skills Breakdown */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Sub-skill Breakdown
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {skill.subSkills.map((sub) => (
                        <div 
                          key={sub.name}
                          className={cn(
                            "p-3 rounded-lg border flex items-center justify-between",
                            getStatusBg(sub.status),
                            "border-transparent"
                          )}
                        >
                          <span className="text-sm text-foreground">{sub.name}</span>
                          <span className={cn("text-sm font-semibold", getStatusColor(sub.status))}>
                            {sub.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{skill.quickAction.title}</p>
                        <p className="text-xs text-muted-foreground">{skill.quickAction.duration} • +{skill.quickAction.xp} XP</p>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1">
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Sidebar: Quick Wins + Radar */}
        <div className="space-y-4">
          {/* Quick Wins Panel */}
          <div className="card-gradient rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Quick Wins</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Highest-impact improvements for you
            </p>
            
            <div className="space-y-3">
              {quickWins.map((win, i) => (
                <div 
                  key={i}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {win.action}
                    </p>
                    <Badge 
                      className={cn(
                        "shrink-0 text-xs",
                        win.impactValue >= 5 ? "bg-success/20 text-success border-success/30" : "bg-primary/20 text-primary border-primary/30"
                      )}
                    >
                      {win.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{win.skill}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart Placeholder */}
          <div className="card-gradient rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Skill Radar</h3>
            </div>
            
            {/* Simple Radar Visualization */}
            <div className="relative aspect-square">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background grid */}
                {[20, 40, 60, 80, 100].map((r) => (
                  <circle
                    key={r}
                    cx="100"
                    cy="100"
                    r={r * 0.8}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    opacity={0.3}
                  />
                ))}
                
                {/* Axis lines */}
                {enhancedSkills.map((_, i) => {
                  const angle = (i * 360 / 5 - 90) * Math.PI / 180;
                  const x = 100 + Math.cos(angle) * 80;
                  const y = 100 + Math.sin(angle) * 80;
                  return (
                    <line
                      key={i}
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      opacity={0.3}
                    />
                  );
                })}

                {/* Team Average polygon */}
                <polygon
                  points={enhancedSkills.map((skill, i) => {
                    const angle = (i * 360 / 5 - 90) * Math.PI / 180;
                    const r = skill.teamAvg * 0.8;
                    return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
                  }).join(' ')}
                  fill="hsl(var(--muted-foreground) / 0.1)"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1"
                  opacity={0.5}
                />

                {/* Potential polygon */}
                <polygon
                  points={enhancedSkills.map((skill, i) => {
                    const angle = (i * 360 / 5 - 90) * Math.PI / 180;
                    const r = skill.potential * 0.8;
                    return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
                  }).join(' ')}
                  fill="hsl(var(--primary) / 0.1)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />

                {/* Current score polygon */}
                <polygon
                  points={enhancedSkills.map((skill, i) => {
                    const angle = (i * 360 / 5 - 90) * Math.PI / 180;
                    const r = skill.current * 0.8;
                    return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
                  }).join(' ')}
                  fill="hsl(var(--foreground) / 0.1)"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Skill labels */}
                {enhancedSkills.map((skill, i) => {
                  const angle = (i * 360 / 5 - 90) * Math.PI / 180;
                  const x = 100 + Math.cos(angle) * 95;
                  const y = 100 + Math.sin(angle) * 95;
                  return (
                    <text
                      key={skill.name}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-[8px]"
                    >
                      {skill.icon}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-foreground" />
                <span className="text-muted-foreground">You</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Potential</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
