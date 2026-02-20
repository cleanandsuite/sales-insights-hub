import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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
  overall: { color: 'hsl(210, 100%, 50%)', label: 'Overall' },
  rapport: { color: 'hsl(280, 73%, 55%)', label: 'Rapport' },
  discovery: { color: 'hsl(177, 70%, 41%)', label: 'Discovery' },
  presentation: { color: 'hsl(38, 92%, 50%)', label: 'Presentation' },
  closing: { color: 'hsl(142, 76%, 36%)', label: 'Closing' },
  objectionHandling: { color: 'hsl(0, 84%, 60%)', label: 'Objection Handling' }
};

export function SkillTrendChart({ trends }: SkillTrendChartProps) {
  const [visibleSkills, setVisibleSkills] = useState<Set<string>>(new Set(['overall']));

  const toggleSkill = (skill: string) => {
    const newVisible = new Set(visibleSkills);
    if (newVisible.has(skill)) {
      newVisible.delete(skill);
    } else {
      newVisible.add(skill);
    }
    setVisibleSkills(newVisible);
  };

  const hasData = trends.length > 0;

  return (
    <Card className="relative overflow-hidden lg:col-span-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Skill Progression Over Time
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Track your improvement across all skill areas</p>
          </div>
        </div>
        
        {/* Skill toggles */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(skillConfig).map(([key, config]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => toggleSkill(key)}
              className={cn(
                "h-7 text-xs gap-1.5 transition-all",
                visibleSkills.has(key) 
                  ? "border-2" 
                  : "opacity-60 hover:opacity-100"
              )}
              style={visibleSkills.has(key) ? { borderColor: config.color } : {}}
            >
              {visibleSkills.has(key) ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: config.color }}
              />
              {config.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {hasData ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {Object.entries(skillConfig).map(([key, config]) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                />
                {Object.entries(skillConfig).map(([key, config]) => (
                  visibleSkills.has(key) && (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={config.label}
                      stroke={config.color}
                      fill={`url(#gradient-${key})`}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                  )
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Complete more calls over time to see your skill progression trends.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
