import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, AlertCircle } from 'lucide-react';

interface MissedOpportunity {
  moment: string;
  what_happened: string;
  what_should_have_said: string;
  impact: 'high' | 'medium' | 'low';
  reasoning?: string;
}

interface MissedOpportunitiesTabProps {
  opportunities: MissedOpportunity[];
}

export function MissedOpportunitiesTab({ opportunities }: MissedOpportunitiesTabProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Great job!</p>
        <p className="text-sm">No significant missed opportunities detected in this call.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        These are moments where a different approach could have moved the deal forward significantly.
      </p>
      
      {opportunities.map((opp, index) => (
        <div 
          key={index} 
          className="border rounded-lg p-4 bg-card hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{opp.moment}</p>
              </div>
            </div>
            <Badge className={getImpactColor(opp.impact)}>
              {opp.impact} impact
            </Badge>
          </div>

          <div className="space-y-3 ml-10">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium mb-1">
                <AlertCircle className="h-3 w-3" />
                What happened
              </div>
              <p className="text-sm">{opp.what_happened}</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-1">
                <Target className="h-3 w-3" />
                What you should have said
              </div>
              <p className="text-sm italic">"{opp.what_should_have_said}"</p>
            </div>

            {opp.reasoning && (
              <p className="text-xs text-muted-foreground pl-3 border-l-2 border-muted">
                <strong>Why this matters:</strong> {opp.reasoning}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
