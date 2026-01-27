import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Objection } from '@/types/deals';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface ObjectionItemProps {
  objection: Objection;
  onResolve?: (id: string) => void;
}

export function ObjectionItem({ objection, onResolve }: ObjectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all',
        objection.resolved
          ? 'bg-muted/30 border-muted'
          : 'bg-destructive/5 border-destructive/20'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          {objection.resolved ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium', objection.resolved && 'line-through opacity-60')}>
              "{objection.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Detected {new Date(objection.detectedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 w-7 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-primary mb-1">AI Suggested Response:</p>
              <p className="text-sm text-muted-foreground">{objection.suggestedResponse}</p>
            </div>
          </div>
          {!objection.resolved && onResolve && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => onResolve(objection.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
