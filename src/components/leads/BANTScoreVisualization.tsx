import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, UserCheck, Target, Clock } from "lucide-react";

interface BANTScores {
  budget: number;
  authority: number;
  need: number;
  timeline: number;
}

interface BANTScoreVisualizationProps {
  scores: BANTScores;
  compact?: boolean;
}

export const BANTScoreVisualization = ({ scores, compact = false }: BANTScoreVisualizationProps) => {
  const bantItems = [
    { key: 'budget', label: 'Budget', icon: DollarSign, score: scores.budget, description: 'How clearly budget has been discussed' },
    { key: 'authority', label: 'Authority', icon: UserCheck, score: scores.authority, description: 'Decision-making power level' },
    { key: 'need', label: 'Need', icon: Target, score: scores.need, description: 'Pain point urgency and clarity' },
    { key: 'timeline', label: 'Timeline', icon: Clock, score: scores.timeline, description: 'How defined is buying timeline' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const totalScore = Math.round((scores.budget + scores.authority + scores.need + scores.timeline) / 4);

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {bantItems.map((item) => (
            <Tooltip key={item.key}>
              <TooltipTrigger>
                <div 
                  className={`w-2 h-6 rounded-sm ${getScoreColor(item.score)}`}
                  style={{ opacity: 0.3 + (item.score / 100) * 0.7 }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{item.label}: {item.score}%</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <span className={`text-xs font-bold ml-1 ${getTextColor(totalScore)}`}>
            {totalScore}%
          </span>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3 p-3 bg-card rounded-lg border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">BANT Score</h4>
          <span className={`text-lg font-bold ${getTextColor(totalScore)}`}>
            {totalScore}%
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {bantItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Icon className={`h-4 w-4 ${getTextColor(item.score)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className={`text-xs font-medium ${getTextColor(item.score)}`}>
                          {item.score}
                        </span>
                      </div>
                      <Progress 
                        value={item.score} 
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
