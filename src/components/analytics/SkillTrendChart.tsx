import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillTrend {
  date: string;
  overall: number;
  rapport: number;
  discovery: number;
  presentation: number;
  closing: number;
  objectionHandling: number;
}

interface SkillTrendChartProps {
  trends: SkillTrend[];
}

const skillConfig = {
  overall:           { color: '#6366f1', label: 'Overall',           gradient: ['#6366f180', '#6366f108'] },
  rapport:           { color: '#a855f7', label: 'Opening Hook',      gradient: ['#a855f780', '#a855f708'] },
  discovery:         { color: '#06b6d4', label: 'Discovery',         gradient: ['#06b6d480', '#06b6d408'] },
  presentation:      { color: '#f59e0b', label: 'Pitch Clarity',     gradient: ['#f59e0b80', '#f59e0b08'] },
  closing:           { color: '#22c55e', label: 'Closing',           gradient: ['#22c55e80', '#22c55e08'] },
  objectionHandling: { color: '#f43f5e', label: 'Objections',        gradient: ['#f43f5e80', '#f43f5e08'] },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
      <p className="text-indigo-300 text-xs font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 text-xs mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-400">{p.name}</span>
          </div>
          <span className="text-white font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SkillTrendChart({ trends }: SkillTrendChartProps) {
  const [visibleSkills, setVisibleSkills] = useState<Set<string>>(new Set(['overall', 'closing', 'discovery']));

  const toggleSkill = (skill: string) => {
    const next = new Set(visibleSkills);
    if (next.has(skill)) { next.delete(skill); } else { next.add(skill); }
    setVisibleSkills(next);
  };

  const hasData = trends.length > 0;

  return (
    <Card className="relative overflow-hidden lg:col-span-2 bg-[#0d0d1a] border border-indigo-500/20">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-purple-900/10 pointer-events-none" />

      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <CardTitle className="text-base font-bold text-white">
            Skill Progression Over Time
          </CardTitle>
        </div>
        <p className="text-xs text-indigo-300/60 mb-3">Track your improvement across all cold-call skill areas</p>

        {/* Skill pill toggles */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {(Object.entries(skillConfig) as [keyof typeof skillConfig, typeof skillConfig[keyof typeof skillConfig]][]).map(([key, cfg]) => {
            const active = visibleSkills.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleSkill(key)}
                className={cn(
                  'h-6 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-semibold transition-all border',
                  active
                    ? 'opacity-100 text-white'
                    : 'opacity-40 hover:opacity-70 text-gray-400 border-transparent'
                )}
                style={active ? { borderColor: cfg.color, backgroundColor: cfg.color + '22' } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="relative pt-2">
        {hasData ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {(Object.entries(skillConfig) as [string, any][]).map(([key, cfg]) => (
                    <linearGradient key={key} id={`sg-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={cfg.gradient[0]} />
                      <stop offset="95%" stopColor={cfg.gradient[1]} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(99,102,241,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(165,180,252,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(165,180,252,0.5)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="rgba(165,180,252,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(165,180,252,0.4)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {(Object.entries(skillConfig) as [string, any][]).map(([key, cfg]) =>
                  visibleSkills.has(key) ? (
                    <Area
                      key={key}
                      type="monotoneX"
                      dataKey={key}
                      name={cfg.label}
                      stroke={cfg.color}
                      strokeWidth={2}
                      fill={`url(#sg-${key})`}
                      dot={false}
                      activeDot={{ r: 4, fill: cfg.color, strokeWidth: 2, stroke: '#fff' }}
                    />
                  ) : null
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center gap-3 opacity-60">
            <TrendingUp className="h-10 w-10 text-indigo-400" />
            <div className="text-center">
              <p className="text-indigo-300 text-sm font-medium">No trend data yet</p>
              <p className="text-indigo-400/50 text-xs mt-1">Complete more calls over time to see skill progression.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
