import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowUp, ArrowDown, Minus, Brain, Target, MessageSquare, Presentation, HandshakeIcon, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Tooltip, Legend
} from 'recharts';
import type { AnalyticsDataV2 } from '@/hooks/useAnalyticsV2';

interface PerformanceRadarChartProps {
  currentSkills: AnalyticsDataV2['currentSkills'];
  previousSkills: AnalyticsDataV2['previousSkills'];
}

type Band = 'needsWork' | 'developing' | 'solid' | 'elite';

const BAND_LABELS: Record<Band, string> = {
  needsWork: 'Needs Work',
  developing: 'Developing',
  solid: 'Solid',
  elite: 'Elite',
};

const BAND_COLORS: Record<Band, { border: string; badge: string; dot: string }> = {
  needsWork: { border: 'border-l-destructive', badge: 'bg-destructive/20 text-destructive', dot: 'bg-destructive' },
  developing: { border: 'border-l-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-500' },
  solid: { border: 'border-l-primary', badge: 'bg-primary/20 text-primary', dot: 'bg-primary' },
  elite: { border: 'border-l-green-500', badge: 'bg-green-500/20 text-green-400', dot: 'bg-green-500' },
};

interface SkillInsights {
  explanation: string;
  tip: string;
}

const SKILL_CONFIGS: {
  key: keyof AnalyticsDataV2['currentSkills'];
  label: string;
  icon: React.ElementType;
  insights: Record<Band, SkillInsights>;
}[] = [
  {
    key: 'rapport', label: 'Opening Hook', icon: Sparkles,
    insights: {
      needsWork: { explanation: "Your opening hooks aren't grabbing attention — prospects disengage early.", tip: "Lead with a specific observation about the prospect's company in your first 10 seconds." },
      developing: { explanation: 'Openers are functional but generic. Prospects stay but aren\'t hooked.', tip: 'Reference a recent trigger event (funding, hire, launch) to make it personal.' },
      solid: { explanation: 'Opening hooks land well — prospects engage quickly and stay curious.', tip: 'Experiment with a provocative question opener to push engagement higher.' },
      elite: { explanation: 'Your openers are magnetic. Prospects lean in from the first sentence.', tip: 'Mentor a teammate on your opener framework — teaching solidifies mastery.' },
    },
  },
  {
    key: 'objectionHandling', label: 'Objections', icon: MessageSquare,
    insights: {
      needsWork: { explanation: 'Objections derail your calls. You tend to get defensive or go silent.', tip: 'Practice "Feel, Felt, Found": acknowledge, relate, then redirect with evidence.' },
      developing: { explanation: 'Common objections handled okay, but unusual pushback throws you off.', tip: 'Build an objection bank from your last 10 calls and rehearse responses.' },
      solid: { explanation: 'You navigate objections smoothly and turn most into productive conversations.', tip: 'Try pre-empting the top objection before the prospect raises it.' },
      elite: { explanation: 'You treat objections as buying signals and reframe them into momentum.', tip: 'Track which objection-handling phrases lead to next-step commitments.' },
    },
  },
  {
    key: 'discovery', label: 'Discovery', icon: Target,
    insights: {
      needsWork: { explanation: 'Discovery is shallow — calls lack the depth to uncover real pain.', tip: 'Ask "Why is that important to you?" after every surface-level answer.' },
      developing: { explanation: 'Decent questions but you miss opportunities to follow up on emotional cues.', tip: 'When a prospect pauses, say "Tell me more about that" to unlock insight.' },
      solid: { explanation: 'Discovery uncovers genuine pain points and priorities consistently.', tip: 'Layer in quantification: "What does this problem cost you per month?"' },
      elite: { explanation: 'Discovery calls feel like strategy sessions — prospects thank you.', tip: 'Experiment with leading with questions only — no pitch until they ask.' },
    },
  },
  {
    key: 'presentation', label: 'Pitch Clarity', icon: Presentation,
    insights: {
      needsWork: { explanation: 'Pitch is unclear or too feature-heavy. Prospects struggle to see value.', tip: 'Restructure: one core problem, your solution, and a specific outcome.' },
      developing: { explanation: 'Pitch communicates value but lacks a compelling narrative arc.', tip: 'Add a "before and after" customer story mirroring the prospect\'s situation.' },
      solid: { explanation: 'Pitch is clear and value-driven. Prospects understand your positioning.', tip: 'Personalize one talking point per call to the prospect\'s use case.' },
      elite: { explanation: 'Pitch is razor-sharp. Prospects frequently say "that\'s exactly what we need."', tip: 'Test a shorter version — same impact in half the time means true mastery.' },
    },
  },
  {
    key: 'closing', label: 'Closing', icon: HandshakeIcon,
    insights: {
      needsWork: { explanation: 'Calls end without clear next steps. You hesitate to ask for commitment.', tip: '"Based on what we discussed, the next step would be X. Does that work?"' },
      developing: { explanation: 'You ask for next steps but don\'t create urgency or tie back to pain.', tip: '"You mentioned Q2 is critical — let\'s get this moving by…"' },
      solid: { explanation: 'You close confidently and secure concrete next steps on most calls.', tip: 'Try the assumptive close: "I\'ll send the proposal for Tuesday\'s review."' },
      elite: { explanation: 'Closes feel natural and inevitable. Value is obvious.', tip: 'Track your close-to-meeting ratio and improve it by 5% this quarter.' },
    },
  },
  {
    key: 'engagement', label: 'Engagement', icon: Brain,
    insights: {
      needsWork: { explanation: 'Prospects are passive — low interaction, short answers, early drop-offs.', tip: 'Ask an opinion question in the first 2 minutes: "What\'s your take on…?"' },
      developing: { explanation: 'Prospects engage when prompted but don\'t volunteer information freely.', tip: 'Use scaling questions: "On a scale of 1-10, how important is this?"' },
      solid: { explanation: 'Calls are two-way conversations. Prospects share openly and ask back.', tip: 'Introduce brief silences after key statements — gives space to engage deeper.' },
      elite: { explanation: 'Prospects drive the conversation forward. Your engagement is magnetic.', tip: 'Document your engagement patterns — they\'re a replicable asset for the team.' },
    },
  },
];

function getBand(score: number): Band {
  if (score < 50) return 'needsWork';
  if (score < 70) return 'developing';
  if (score < 85) return 'solid';
  return 'elite';
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const isUp = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-green-400' : 'text-destructive'}`}>
      {isUp ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(diff)}
    </span>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white font-semibold text-sm mb-1">{payload[0]?.payload?.skill}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function PerformanceRadarChart({ currentSkills, previousSkills }: PerformanceRadarChartProps) {
  const radarData = [
    { skill: 'Opening Hook', current: currentSkills.rapport, previous: previousSkills.rapport, fullMark: 100 },
    { skill: 'Objections', current: currentSkills.objectionHandling, previous: previousSkills.objectionHandling, fullMark: 100 },
    { skill: 'Discovery', current: currentSkills.discovery, previous: previousSkills.discovery, fullMark: 100 },
    { skill: 'Pitch Clarity', current: currentSkills.presentation, previous: previousSkills.presentation, fullMark: 100 },
    { skill: 'Closing', current: currentSkills.closing, previous: previousSkills.closing, fullMark: 100 },
    { skill: 'Engagement', current: currentSkills.engagement, previous: previousSkills.engagement, fullMark: 100 },
  ];

  const hasData = radarData.some(d => d.current > 0);

  const breakdowns = useMemo(() =>
    SKILL_CONFIGS.map(cfg => {
      const current = currentSkills[cfg.key];
      const previous = previousSkills[cfg.key];
      const band = getBand(current);
      return { ...cfg, current, previous, band, ...cfg.insights[band] };
    }),
    [currentSkills, previousSkills]
  );

  return (
    <Card className="relative overflow-hidden bg-[#0d0d1a] border border-indigo-500/20 h-full flex flex-col">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/10 pointer-events-none" />

      <CardHeader className="relative pb-2">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Cold Call Performance Radar
        </CardTitle>
        <p className="text-xs text-indigo-300/60">Current vs. previous period</p>
      </CardHeader>

      <CardContent className="relative flex-1 flex flex-col gap-4 pb-4">
        {hasData ? (
          <div className="h-[280px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 10, left: 30 }}>
                <defs>
                  <radialGradient id="radarCurrent" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                  </radialGradient>
                  <radialGradient id="radarPrev" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(99,102,241,0.15)" strokeWidth={1} gridType="polygon" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#a5b4fc', fontSize: 10, fontWeight: 600 }} tickLine={false} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(165,180,252,0.4)', fontSize: 9 }} axisLine={false} tickCount={5} />
                <Radar name="Previous" dataKey="previous" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#radarPrev)" fillOpacity={1} dot={false} />
                <Radar name="Current" dataKey="current" stroke="#6366f1" strokeWidth={2.5} fill="url(#radarCurrent)" fillOpacity={1} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value) => (
                    <span style={{ color: value === 'Current' ? '#a5b4fc' : '#fcd34d', fontSize: 11, fontWeight: 600 }}>{value}</span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center gap-4 shrink-0">
            <div className="relative w-32 h-32 opacity-30">
              <div className="absolute inset-0 rounded-full border border-indigo-500/40" />
              <div className="absolute inset-4 rounded-full border border-indigo-500/30" />
              <div className="absolute inset-8 rounded-full border border-indigo-500/20" />
            </div>
            <div className="text-center">
              <p className="text-indigo-300 text-sm font-medium">No skill data yet</p>
              <p className="text-indigo-400/50 text-xs mt-1">Complete more analyzed calls to see your radar</p>
            </div>
          </div>
        )}

        {/* Skill Breakdown - inside the card */}
        {hasData && (
          <div className="border-t border-indigo-500/15 pt-3">
            <p className="text-xs font-semibold text-indigo-300/70 uppercase tracking-wider mb-2 px-1">Skill Insights</p>
            
            {/* Desktop: compact rows */}
            <div className="hidden md:flex flex-col gap-1.5">
              {breakdowns.map(b => {
                const colors = BAND_COLORS[b.band];
                const Icon = b.icon;
                return (
                  <div key={b.key} className={`flex items-start gap-3 rounded-md border-l-3 ${colors.border} bg-white/[0.03] px-3 py-2`}>
                    <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
                      <Icon className="h-3.5 w-3.5 text-indigo-300/70" />
                      <span className="text-xs font-medium text-foreground">{b.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
                      <span className="text-sm font-bold text-foreground tabular-nums">{b.current}</span>
                      <ChangeIndicator current={b.current} previous={b.previous} />
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 border-0 ${colors.badge}`}>
                        {BAND_LABELS[b.band]}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{b.explanation}</p>
                      <p className="text-[11px] text-indigo-300/80 leading-relaxed mt-0.5">
                        <span className="font-semibold text-indigo-400">Tip:</span> {b.tip}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: accordion */}
            <Accordion type="multiple" className="md:hidden">
              {breakdowns.map(b => {
                const colors = BAND_COLORS[b.band];
                const Icon = b.icon;
                return (
                  <AccordionItem key={b.key} value={b.key} className={`border-l-3 ${colors.border} border-b-0 rounded-md bg-white/[0.03] mb-1.5 overflow-hidden`}>
                    <AccordionTrigger className="px-2.5 py-2 hover:no-underline">
                      <div className="flex items-center gap-1.5 flex-1">
                        <Icon className="h-3.5 w-3.5 text-indigo-300/70" />
                        <span className="text-xs font-medium text-foreground">{b.label}</span>
                        <span className="text-xs font-bold text-foreground ml-auto mr-1.5 tabular-nums">{b.current}</span>
                        <ChangeIndicator current={b.current} previous={b.previous} />
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 border-0 ml-0.5 ${colors.badge}`}>
                          {BAND_LABELS[b.band]}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2.5 pb-2.5 space-y-0.5">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{b.explanation}</p>
                      <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                        <span className="font-semibold text-indigo-400">Tip:</span> {b.tip}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
