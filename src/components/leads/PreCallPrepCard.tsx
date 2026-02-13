import { Phone, Clock, CheckCircle, AlertTriangle, MessageSquare, FileText, Play, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PreCallPrepProps {
  contactName: string;
  company?: string;
  scheduledTime?: string;
  lastCallDate?: string;
  lastCallSummary?: {
    outcome?: string;
    keyPoints?: string[];
    agreedNextSteps?: string[];
    pendingItems?: string[];
  };
  questionsToAsk?: string[];
  materialsNeeded?: string[];
  conversationStarters?: string[];
  warnings?: string[];
  onViewFullHistory: () => void;
  onPlayLastCall: () => void;
  onAddNote: () => void;
  onReschedule: () => void;
  onReady: () => void;
}

export function PreCallPrepCard({
  contactName,
  company,
  scheduledTime,
  lastCallDate,
  lastCallSummary,
  questionsToAsk,
  materialsNeeded,
  conversationStarters,
  warnings,
  onViewFullHistory,
  onPlayLastCall,
  onAddNote,
  onReschedule,
  onReady
}: PreCallPrepProps) {
  return (
    <div className="card-gradient rounded-xl border border-primary/30 overflow-hidden animate-fade-in">
      {/* Header with urgency indicator */}
      <div className="p-5 bg-primary/10 border-b border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{contactName}</h3>
              {company && <p className="text-sm text-muted-foreground">{company}</p>}
            </div>
          </div>
          {scheduledTime && (
            <div className="text-right">
              <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
                <Clock className="h-3 w-3" />
                {scheduledTime}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Upcoming call</p>
            </div>
          )}
        </div>
      </div>

      {/* Last Call Summary */}
      {lastCallSummary && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              📋 LAST CALL SUMMARY
            </span>
            {lastCallDate && (
              <span className="text-xs text-muted-foreground font-normal">
                {lastCallDate}
              </span>
            )}
          </h4>
          
          <div className="space-y-3">
            {lastCallSummary.outcome && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Outcome:</span> {lastCallSummary.outcome}
              </p>
            )}
            
            {lastCallSummary.agreedNextSteps && lastCallSummary.agreedNextSteps.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Agreed Next Steps:</p>
                <div className="space-y-1">
                  {lastCallSummary.agreedNextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lastCallSummary.pendingItems && lastCallSummary.pendingItems.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pending:</p>
                <div className="space-y-1">
                  {lastCallSummary.pendingItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full bg-warning/20 flex items-center justify-center text-xs text-warning">?</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions to Ask */}
      {questionsToAsk && questionsToAsk.length > 0 && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3">❓ QUESTIONS TO ASK</h4>
          <ol className="space-y-2">
            {questionsToAsk.map((question, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <span className="text-foreground">"{question}"</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Conversation Starters */}
      {conversationStarters && conversationStarters.length > 0 && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3">💬 CONVERSATION STARTERS</h4>
          <div className="space-y-2">
            {conversationStarters.map((starter, idx) => (
              <div key={idx} className="p-2 rounded bg-secondary/30 text-sm text-foreground italic">
                "{starter}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials Needed */}
      {materialsNeeded && materialsNeeded.length > 0 && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3">📎 MATERIALS READY</h4>
          <div className="flex flex-wrap gap-2">
            {materialsNeeded.map((material, idx) => (
              <Badge key={idx} variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-success" />
                {material}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="p-5 border-b border-border/30 bg-warning/5">
          <h4 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            WATCH FOR
          </h4>
          <ul className="space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-warning">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex flex-wrap gap-2">
        <Button onClick={onReady} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Ready
        </Button>
        <Button variant="outline" onClick={onViewFullHistory} className="gap-2">
          <FileText className="h-4 w-4" />
          View History
        </Button>
        <Button variant="outline" onClick={onPlayLastCall} className="gap-2">
          <Play className="h-4 w-4" />
          Play Last Call
        </Button>
        <Button variant="outline" onClick={onAddNote} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
        <Button variant="outline" onClick={onReschedule} className="gap-2">
          <Calendar className="h-4 w-4" />
          Reschedule
        </Button>
      </div>
    </div>
  );
}
