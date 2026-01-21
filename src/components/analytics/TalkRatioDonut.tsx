import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TalkRatioDonutProps {
  you: number;
  them: number;
  isOptimal: boolean;
}

export function TalkRatioDonut({ you, them, isOptimal }: TalkRatioDonutProps) {
  const data = [
    { name: 'You', value: you },
    { name: 'Prospect', value: them }
  ];

  const COLORS = [
    isOptimal ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)', // Your talk time
    'hsl(210, 100%, 50%)' // Their talk time
  ];

  const targetYou = 40;
  const deviation = Math.abs(you - targetYou);

  return (
    <Card className="relative overflow-hidden">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        isOptimal 
          ? "from-emerald-500/5 via-transparent to-primary/5" 
          : "from-amber-500/5 via-transparent to-primary/5"
      )} />
      <CardHeader className="relative pb-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="h-5 w-5 text-primary" />
          Talk/Listen Ratio
        </CardTitle>
      </CardHeader>
      <CardContent className="relative pt-2">
        <div className="flex items-center gap-4">
          <div className="relative h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={cn(
                  "text-2xl font-bold",
                  isOptimal ? "text-emerald-600" : "text-amber-600"
                )}>
                  {you}%
                </p>
                <p className="text-xs text-muted-foreground">You talking</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {/* Status */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              isOptimal ? "bg-emerald-500/10" : "bg-amber-500/10"
            )}>
              {isOptimal ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isOptimal ? "text-emerald-700" : "text-amber-700"
              )}>
                {isOptimal ? 'Optimal Balance' : `${deviation}% off target`}
              </span>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[0] }}
                  />
                  <span className="text-sm text-muted-foreground">You</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{you}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[1] }}
                  />
                  <span className="text-sm text-muted-foreground">Prospect</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{them}%</span>
              </div>
            </div>

            {/* Target indicator */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Target: <span className="font-medium">40% you / 60% them</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
