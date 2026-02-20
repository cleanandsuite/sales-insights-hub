import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ListChecks, FileText } from 'lucide-react';

interface CoachingSummaryCardProps {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionItems: string[];
}

export function CoachingSummaryCard({ summary, strengths, weaknesses, actionItems }: CoachingSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Text */}
        <p className="text-muted-foreground leading-relaxed">{summary}</p>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium flex items-center gap-2 text-green-600 mb-3">
              <CheckCircle2 className="h-4 w-4" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
              {(!strengths || strengths.length === 0) && (
                <li className="text-sm text-muted-foreground">No strengths identified</li>
              )}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <h4 className="font-medium flex items-center gap-2 text-red-600 mb-3">
              <XCircle className="h-4 w-4" />
              Areas to Improve
            </h4>
            <ul className="space-y-2">
              {weaknesses?.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
              {(!weaknesses || weaknesses.length === 0) && (
                <li className="text-sm text-muted-foreground">No weaknesses identified</li>
              )}
            </ul>
          </div>
        </div>

        {/* Action Items */}
        {actionItems && actionItems.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium flex items-center gap-2 text-primary mb-3">
              <ListChecks className="h-4 w-4" />
              Action Items for Next Call
            </h4>
            <div className="flex flex-wrap gap-2">
              {actionItems.map((item, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-card text-foreground border-primary/30 px-3 py-1.5"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
