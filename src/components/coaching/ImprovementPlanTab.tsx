import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, TrendingUp, Clock, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface ImprovementArea {
  area: string;
  current_score: number;
  target_score: number;
  tips: string[];
}

interface KeyMoment {
  timestamp: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  significance: string;
}

interface ImprovementPlanTabProps {
  areas: ImprovementArea[];
  keyMoments: KeyMoment[];
}

export function ImprovementPlanTab({ areas, keyMoments }: ImprovementPlanTabProps) {
  const getMomentIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMomentColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-l-green-500 bg-green-500/5';
      case 'negative': return 'border-l-red-500 bg-red-500/5';
      default: return 'border-l-muted bg-muted/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Skills to Improve */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Skills to Develop
        </h3>
        
        {areas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keep practicing! Improvement areas will appear after more analysis.
          </p>
        ) : (
          <div className="grid gap-4">
            {areas.map((area, index) => (
              <div key={index} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{area.area}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{area.current_score}</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-600">{area.target_score}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Current</span>
                    <span>Target</span>
                  </div>
                  <div className="relative">
                    <Progress value={area.current_score} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-green-500"
                      style={{ left: `${area.target_score}%` }}
                    />
                  </div>
                </div>
                
                {area.tips && area.tips.length > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Tips to improve:</p>
                    <ul className="space-y-1">
                      {area.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Moments Timeline */}
      {keyMoments.length > 0 && (
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            Key Moments
          </h3>
          
          <div className="space-y-3">
            {keyMoments.map((moment, index) => (
              <div 
                key={index} 
                className={`border-l-4 rounded-r-lg p-4 ${getMomentColor(moment.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getMomentIcon(moment.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {moment.timestamp}
                      </Badge>
                      <Badge variant={moment.type === 'positive' ? 'default' : moment.type === 'negative' ? 'destructive' : 'secondary'}>
                        {moment.type}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{moment.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{moment.significance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
