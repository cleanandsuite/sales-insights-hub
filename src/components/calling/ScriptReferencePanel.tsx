import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScriptLine {
  section: string;
  text: string;
  order: number;
}

interface ScriptReferencePanelProps {
  lines: ScriptLine[];
  onClear: () => void;
}

export function ScriptReferencePanel({ lines, onClear }: ScriptReferencePanelProps) {
  const [delivered, setDelivered] = useState<Set<number>>(new Set());

  const toggleDelivered = (order: number) => {
    setDelivered(prev => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  };

  const deliveredCount = delivered.size;
  const totalCount = lines.length;
  const progressPct = totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0;

  // Group by section
  const grouped = lines.reduce<Record<string, ScriptLine[]>>((acc, line) => {
    if (!acc[line.section]) acc[line.section] = [];
    acc[line.section].push(line);
    return acc;
  }, {});

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <CardHeader className="py-3 px-4 space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Script
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{deliveredCount} of {totalCount} delivered</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-4">
            {Object.entries(grouped).map(([section, sectionLines]) => (
              <div key={section}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {section.replace(/_/g, ' ')}
                </p>
                <div className="space-y-1.5">
                  {sectionLines.map((line) => {
                    const isDone = delivered.has(line.order);
                    return (
                      <button
                        key={line.order}
                        onClick={() => toggleDelivered(line.order)}
                        className={cn(
                          'w-full text-left flex items-start gap-2 p-2 rounded-lg text-xs transition-all',
                          isDone
                            ? 'bg-primary/5 line-through text-muted-foreground'
                            : 'bg-muted/40 hover:bg-muted/70 text-foreground'
                        )}
                      >
                        <div className={cn(
                          'mt-0.5 h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors',
                          isDone ? 'bg-primary border-primary' : 'border-border'
                        )}>
                          {isDone && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span>{line.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
