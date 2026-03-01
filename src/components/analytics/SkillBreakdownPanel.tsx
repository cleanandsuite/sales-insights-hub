import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowUp, ArrowDown, Minus, Brain, Target, MessageSquare, Presentation, HandshakeIcon, Sparkles } from 'lucide-react';
import type { AnalyticsDataV2 } from '@/hooks/useAnalyticsV2';

interface SkillBreakdownPanelProps {
  currentSkills: AnalyticsDataV2['currentSkills'];
  previousSkills: AnalyticsDataV2['previousSkills'];
}

type Band = 'needsWork' | 'developing' | 'solid' | 'elite';

interface SkillConfig {
  key: keyof AnalyticsDataV2['currentSkills'];
  label: string;
  icon: React.ElementType;
  insights: Record<Band, { explanation: string; tip: string }>;
}

const SKILL_CONFIGS: SkillConfig[] = [
  {
    key: 'rapport',
    label: 'Opening Hook',
    icon: Sparkles,
    insights: {
      needsWork: {
        explanation: "Your opening hooks aren't grabbing attention \u2014 prospects disengage early in the call.",
        tip: "Lead with a specific observation about the prospect's company or role in your first 10 seconds.",
      },
      developing: {
        explanation: 'Your openers are functional but generic. Prospects stay on the line but are not hooked yet.',
        tip: 'Reference a recent trigger event (funding round, hire, product launch) to make your opener feel personal.',
      },
      solid: {
        explanation: 'Your opening hooks land well \u2014 prospects engage quickly and stay curious.',
        tip: 'Experiment with a provocative question opener to push engagement even higher.',
      },
      elite: {
        explanation: 'Your openers are magnetic. Prospects are leaning in from the first sentence.',
        tip: 'Mentor a teammate on your opener framework \u2014 teaching solidifies mastery.',
      },
    },
  },
  {
    key: 'objectionHandling',
    label: 'Objections',
    icon: MessageSquare,
    insights: {
      needsWork: {
        explanation: 'Objections are derailing your calls. You tend to get defensive or go silent.',
        tip: 'Practice the "Feel, Felt, Found" framework: acknowledge, relate, then redirect with evidence.',
      },
      developing: {
        explanation: 'You handle common objections okay, but unusual pushback throws you off.',
        tip: 'Build an objection bank from your last 10 calls and rehearse responses for each.',
      },
      solid: {
        explanation: 'You navigate objections smoothly and turn most into productive conversations.',
        tip: 'Try pre-empting the top objection before the prospect raises it \u2014 it builds credibility.',
      },
      elite: {
        explanation: 'You treat objections as buying signals and consistently reframe them into momentum.',
        tip: 'Start tracking which objection-handling phrases lead to next-step commitments.',
      },
    },
  },
  {
    key: 'discovery',
    label: 'Discovery',
    icon: Target,
    insights: {
      needsWork: {
        explanation: 'Your discovery is shallow \u2014 calls lack the depth needed to uncover real pain.',
        tip: 'Ask "Why is that important to you?" after every surface-level answer to dig deeper.',
      },
      developing: {
        explanation: 'You ask decent questions but miss opportunities to follow up on emotional cues.',
        tip: 'When a prospect sighs or pauses, say "Tell me more about that" \u2014 it unlocks real insight.',
      },
      solid: {
        explanation: 'Your discovery uncovers genuine pain points and priorities consistently.',
        tip: 'Layer in quantification questions: "What does this problem cost you per month?"',
      },
      elite: {
        explanation: 'Your discovery calls feel like strategy sessions \u2014 prospects thank you for the conversation.',
        tip: 'Experiment with starting discovery before the pitch entirely \u2014 lead with questions only.',
      },
    },
  },
  {
    key: 'presentation',
    label: 'Pitch Clarity',
    icon: Presentation,
    insights: {
      needsWork: {
        explanation: 'Your pitch is unclear or too feature-heavy. Prospects struggle to see the value.',
        tip: 'Restructure around one core problem, your solution, and a specific outcome with numbers.',
      },
      developing: {
        explanation: 'Your pitch communicates value but lacks a compelling narrative arc.',
        tip: "Add a \"before and after\" customer story that mirrors the prospect's situation.",
      },
      solid: {
        explanation: 'Your pitch is clear and value-driven. Prospects understand and remember your positioning.',
        tip: "Personalize one slide or talking point per call to the prospect's specific use case.",
      },
      elite: {
        explanation: 'Your pitch is razor-sharp. Prospects frequently say "that is exactly what we need."',
        tip: "Test a shorter version \u2014 if you can deliver the same impact in half the time, you are elite.",
      },
    },
  },
  {
    key: 'closing',
    label: 'Closing',
    icon: HandshakeIcon,
    insights: {
      needsWork: {
        explanation: 'Calls end without clear next steps. You hesitate to ask for commitment.',
        tip: 'End every call with: "Based on what we discussed, the next step would be X. Does that work?"',
      },
      developing: {
        explanation: "You ask for next steps but don't create urgency or tie back to their pain.",
        tip: 'Tie the close to their timeline: "You mentioned Q2 is critical \u2014 let us get this moving by..."',
      },
      solid: {
        explanation: 'You close confidently and secure concrete next steps on most calls.',
        tip: "Try the assumptive close more often: \"I'll send the proposal for Tuesday's review.\"",
      },
      elite: {
        explanation: 'Your closes feel natural and inevitable. Prospects agree because the value is obvious.',
        tip: 'Track your close-to-meeting ratio and aim to improve it by 5% this quarter.',
      },
    },
  },
  {
    key: 'engagement',
    label: 'Engagement',
    icon: Brain,
    insights: {
      needsWork: {
        explanation: 'Prospects are passive on your calls \u2014 low interaction, short answers, early drop-offs.',
        tip: 'Ask an opinion question in the first 2 minutes: "What is your take on...?" to activate them.',
      },
      developing: {
        explanation: "Prospects engage when prompted but don't volunteer information freely.",
        tip: 'Use the "scaling question" technique: "On a scale of 1-10, how important is this?"',
      },
      solid: {
        explanation: 'Your calls are two-way conversations. Prospects share openly and ask questions back.',
        tip: 'Introduce brief silences after key statements \u2014 it gives prospects space to engage deeper.',
      },
      elite: {
        explanation: 'Prospects drive the conversation forward themselves. Your engagement is magnetic.',
        tip: 'Document your engagement patterns \u2014 they are a replicable asset for the team.',
      },
    },
  },
];

function getBand(score: number): Band {
  if (score < 50) return 'needsWork';
  if (score < 70) return 'developing';
  if (score < 85) return 'solid';
  return 'elite';
}

const BAND_LABELS: Record<Band, string> = {
  needsWork: 'Needs Work',
  developing: 'Developing',
  solid: 'Solid',
  elite: 'Elite',
};

const BAND_COLORS: Record<Band, { border: string; badge: string }> = {
  needsWork: { border: 'border-l-destructive', badge: 'bg-destructive/20 text-destructive' },
  developing: { border: 'border-l-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400' },
  solid: { border: 'border-l-primary', badge: 'bg-primary/20 text-primary' },
  elite: { border: 'border-l-green-500', badge: 'bg-green-500/20 text-green-400' },
};

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  const isUp = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-400' : 'text-destructive'}`}>
      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(diff)}
    </span>
  );
}

export function SkillBreakdownPanel({ currentSkills, previousSkills }: SkillBreakdownPanelProps) {
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
    <Card className="bg-[#0d0d1a] border-indigo-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-4.5 w-4.5 text-indigo-400" />
          Skill Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {/* Desktop: stacked rows */}
        <div className="hidden md:flex flex-col gap-2">
          {breakdowns.map(b => {
            const colors = BAND_COLORS[b.band];
            const Icon = b.icon;
            return (
              <div
                key={b.key}
                className={`flex items-start gap-4 rounded-lg border-l-4 ${colors.border} bg-white/[0.03] px-4 py-3`}
              >
                <div className="flex items-center gap-2 w-36 shrink-0 pt-0.5">
                  <Icon className="h-4 w-4 text-indigo-300" />
                  <span className="text-sm font-medium text-foreground">{b.label}</span>
                </div>
                <div className="flex items-center gap-2.5 w-40 shrink-0 pt-0.5">
                  <span className="text-lg font-bold text-foreground tabular-nums">{b.current}</span>
                  <ChangeIndicator current={b.current} previous={b.previous} />
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${colors.badge}`}>
                    {BAND_LABELS[b.band]}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.explanation}</p>
                  <p className="text-xs text-indigo-300 leading-relaxed">
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
              <AccordionItem key={b.key} value={b.key} className={`border-l-4 ${colors.border} border-b-0 rounded-lg bg-white/[0.03] mb-2 overflow-hidden`}>
                <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className="h-4 w-4 text-indigo-300" />
                    <span className="text-sm font-medium text-foreground">{b.label}</span>
                    <span className="text-sm font-bold text-foreground ml-auto mr-2 tabular-nums">{b.current}</span>
                    <ChangeIndicator current={b.current} previous={b.previous} />
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ml-1 ${colors.badge}`}>
                      {BAND_LABELS[b.band]}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.explanation}</p>
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    <span className="font-semibold text-indigo-400">Tip:</span> {b.tip}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
