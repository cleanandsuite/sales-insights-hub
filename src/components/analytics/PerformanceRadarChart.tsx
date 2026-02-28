import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Tooltip, Legend
} from 'recharts';
import type { AnalyticsDataV2 } from '@/hooks/useAnalyticsV2';

interface PerformanceRadarChartProps {
  currentSkills: AnalyticsDataV2['currentSkills'];
  previousSkills: AnalyticsDataV2['previousSkills'];
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
  const data = [
    { skill: 'Opening Hook', current: currentSkills.rapport, previous: previousSkills.rapport, fullMark: 100 },
    { skill: 'Objections', current: currentSkills.objectionHandling, previous: previousSkills.objectionHandling, fullMark: 100 },
    { skill: 'Discovery', current: currentSkills.discovery, previous: previousSkills.discovery, fullMark: 100 },
    { skill: 'Pitch Clarity', current: currentSkills.presentation, previous: previousSkills.presentation, fullMark: 100 },
    { skill: 'Closing', current: currentSkills.closing, previous: previousSkills.closing, fullMark: 100 },
    { skill: 'Engagement', current: currentSkills.engagement, previous: previousSkills.engagement, fullMark: 100 },
  ];

  const hasData = data.some(d => d.current > 0);

  return (
    <Card className="relative overflow-hidden bg-[#0d0d1a] border border-indigo-500/20 h-full">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/10 pointer-events-none" />

      <CardHeader className="relative pb-2">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Cold Call Performance Radar
        </CardTitle>
        <p className="text-xs text-indigo-300/60">Current vs. previous period</p>
      </CardHeader>

      <CardContent className="relative pb-4">
        {hasData ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
                <PolarGrid
                  stroke="rgba(99,102,241,0.15)"
                  strokeWidth={1}
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: '#a5b4fc', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(165,180,252,0.4)', fontSize: 9 }}
                  axisLine={false}
                  tickCount={5}
                />
                {/* Previous period — amber dashed */}
                <Radar
                  name="Previous"
                  dataKey="previous"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill="url(#radarPrev)"
                  fillOpacity={1}
                  dot={false}
                />
                {/* Current period — indigo solid */}
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#radarCurrent)"
                  fillOpacity={1}
                  dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => (
                    <span style={{ color: value === 'Current' ? '#a5b4fc' : '#fcd34d', fontSize: 11, fontWeight: 600 }}>
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[320px] flex flex-col items-center justify-center gap-4">
            {/* Decorative empty radar */}
            <div className="relative w-40 h-40 opacity-30">
              <div className="absolute inset-0 rounded-full border border-indigo-500/40" />
              <div className="absolute inset-4 rounded-full border border-indigo-500/30" />
              <div className="absolute inset-8 rounded-full border border-indigo-500/20" />
              <div className="absolute inset-12 rounded-full border border-indigo-500/10" />
            </div>
            <div className="text-center">
              <p className="text-indigo-300 text-sm font-medium">No skill data yet</p>
              <p className="text-indigo-400/50 text-xs mt-1">Complete more analyzed calls to see your radar</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
