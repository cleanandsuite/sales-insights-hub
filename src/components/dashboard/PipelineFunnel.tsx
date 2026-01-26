import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface FunnelStage {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface PipelineFunnelProps {
  stages: FunnelStage[];
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  const maxValue = Math.max(...stages.map(s => s.value));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-400" />
          Opportunity Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const widthPercent = (stage.value / maxValue) * 100;
            return (
              <div key={stage.name} className="group relative">
                <div 
                  className="relative h-10 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{ 
                    width: `${Math.max(widthPercent, 30)}%`,
                    marginLeft: `${(100 - Math.max(widthPercent, 30)) / 2}%`
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ 
                      background: `linear-gradient(135deg, ${stage.color}dd, ${stage.color}88)`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-xs font-medium text-white truncate">
                      {stage.name}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(stage.value)}
                    </span>
                  </div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-slate-700">
                    {stage.count} deals • {formatCurrency(stage.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-700/50">
          {stages.map(stage => (
            <div key={stage.name} className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-xs text-slate-400">{stage.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
