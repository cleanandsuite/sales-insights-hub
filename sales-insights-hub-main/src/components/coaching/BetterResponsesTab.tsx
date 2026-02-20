import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowRight, Zap } from 'lucide-react';

interface BetterResponse {
  original: string;
  suggested: string;
  reasoning: string;
  expected_impact: string;
}

interface BetterResponsesTabProps {
  responses: BetterResponse[];
}

export function BetterResponsesTab({ responses }: BetterResponsesTabProps) {
  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Excellent communication!</p>
        <p className="text-sm">Your responses were well-crafted for this conversation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Alternative responses that could have driven better outcomes. Practice these for future calls.
      </p>
      
      {responses.map((resp, index) => (
        <div 
          key={index} 
          className="border rounded-lg overflow-hidden bg-card hover:border-primary/30 transition-colors"
        >
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Original */}
            <div className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                <MessageSquare className="h-3 w-3" />
                Original Response
              </div>
              <p className="text-sm">"{resp.original}"</p>
            </div>

            {/* Suggested */}
            <div className="p-4 bg-primary/5">
              <div className="flex items-center gap-2 text-primary text-xs font-medium mb-2">
                <Zap className="h-3 w-3" />
                Better Alternative
              </div>
              <p className="text-sm font-medium">"{resp.suggested}"</p>
            </div>
          </div>

          <div className="border-t bg-card p-3">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex-1 min-w-[200px]">
                <span className="text-muted-foreground font-medium">Why this works: </span>
                <span>{resp.reasoning}</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                {resp.expected_impact}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
