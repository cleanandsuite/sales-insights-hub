import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallsByHour {
  hour: number;
  day: string;
  count: number;
  successRate: number;
}

interface TimeHeatmapProps {
  data: CallsByHour[];
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export function TimeHeatmap({ data }: TimeHeatmapProps) {
  const getDataForCell = (day: string, hour: number) => {
    return data.find(d => d.day === day && d.hour === hour);
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    return Math.min(1, count / maxCount);
  };

  const getCellColor = (count: number, successRate: number) => {
    const intensity = getIntensity(count);
    if (intensity === 0) return 'bg-muted/30';
    
    // Blend between primary (low success) and emerald (high success)
    if (successRate >= 70) {
      return intensity > 0.7 ? 'bg-emerald-500' : intensity > 0.3 ? 'bg-emerald-400' : 'bg-emerald-300';
    } else if (successRate >= 40) {
      return intensity > 0.7 ? 'bg-primary' : intensity > 0.3 ? 'bg-primary/80' : 'bg-primary/60';
    } else {
      return intensity > 0.7 ? 'bg-amber-500' : intensity > 0.3 ? 'bg-amber-400' : 'bg-amber-300';
    }
  };

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${suffix}`;
  };

  const hasData = data.length > 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-5 w-5 text-accent" />
          Best Call Times
        </CardTitle>
        <p className="text-xs text-muted-foreground">Darker cells indicate higher activity and success</p>
      </CardHeader>
      <CardContent className="relative">
        {hasData ? (
          <TooltipProvider>
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Hour labels */}
                <div className="flex mb-2 ml-10">
                  {hours.map(hour => (
                    <div 
                      key={hour} 
                      className="flex-1 text-center text-xs text-muted-foreground font-medium"
                    >
                      {formatHour(hour)}
                    </div>
                  ))}
                </div>
                
                {/* Grid */}
                <div className="space-y-1">
                  {days.map(day => (
                    <div key={day} className="flex items-center gap-2">
                      <div className="w-8 text-xs text-muted-foreground font-medium text-right">
                        {day}
                      </div>
                      <div className="flex flex-1 gap-1">
                        {hours.map(hour => {
                          const cellData = getDataForCell(day, hour);
                          const count = cellData?.count || 0;
                          const successRate = cellData?.successRate || 0;
                          
                          return (
                            <Tooltip key={`${day}-${hour}`}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex-1 h-8 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                                    getCellColor(count, successRate)
                                  )}
                                  style={{ 
                                    opacity: count > 0 ? 0.4 + (getIntensity(count) * 0.6) : 0.3 
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent className="bg-card border border-border shadow-lg">
                                <div className="text-sm">
                                  <p className="font-semibold">{day} {formatHour(hour)}</p>
                                  {count > 0 ? (
                                    <>
                                      <p className="text-muted-foreground">
                                        {count} call{count !== 1 ? 's' : ''}
                                      </p>
                                      <p className={cn(
                                        "font-medium",
                                        successRate >= 70 ? "text-emerald-500" : 
                                        successRate >= 40 ? "text-primary" : "text-amber-500"
                                      )}>
                                        {successRate}% success rate
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-muted-foreground">No calls recorded</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-xs text-muted-foreground">High Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span className="text-xs text-muted-foreground">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-400" />
                <span className="text-xs text-muted-foreground">Needs Attention</span>
              </div>
            </div>
          </TooltipProvider>
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Make calls at different times to discover your optimal call windows.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
