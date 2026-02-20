import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { Radar as RadarIcon } from 'lucide-react';
import type { AnalyticsDataV2 } from '@/hooks/useAnalyticsV2';

interface PerformanceRadarChartProps {
  currentSkills: AnalyticsDataV2['currentSkills'];
  previousSkills: AnalyticsDataV2['previousSkills'];
}

export function PerformanceRadarChart({ currentSkills, previousSkills }: PerformanceRadarChartProps) {
  const data = [
    { skill: 'Rapport', current: currentSkills.rapport, previous: previousSkills.rapport, fullMark: 100 },
    { skill: 'Discovery', current: currentSkills.discovery, previous: previousSkills.discovery, fullMark: 100 },
    { skill: 'Presentation', current: currentSkills.presentation, previous: previousSkills.presentation, fullMark: 100 },
    { skill: 'Closing', current: currentSkills.closing, previous: previousSkills.closing, fullMark: 100 },
    { skill: 'Objection Handling', current: currentSkills.objectionHandling, previous: previousSkills.objectionHandling, fullMark: 100 },
    { skill: 'Engagement', current: currentSkills.engagement, previous: previousSkills.engagement, fullMark: 100 }
  ];

  const hasData = data.some(d => d.current > 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <RadarIcon className="h-5 w-5 text-primary" />
          Performance Radar
        </CardTitle>
        <p className="text-xs text-muted-foreground">Current period vs. previous period</p>
      </CardHeader>
      <CardContent className="relative">
        {hasData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.5}
                />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ 
                    fill: 'hsl(var(--muted-foreground))', 
                    fontSize: 11,
                    fontWeight: 500
                  }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Previous Period"
                  dataKey="previous"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Radar
                  name="Current Period"
                  dataKey="current"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: 12 }}>{value}</span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <RadarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No skill data yet. Complete more calls to see your performance radar.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
