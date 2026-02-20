import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';

interface DealContext {
  stage: string;
  budget: string;
  timeline: string;
  competition: string;
  previousInteractions: string;
  knownObjections: string[];
}

interface DealContextFormProps {
  context: DealContext;
  onChange: (context: DealContext) => void;
  scenario?: string;
}

const dealStages = [
  { value: 'prospecting', label: 'Prospecting - First contact' },
  { value: 'qualification', label: 'Qualification - Assessing fit' },
  { value: 'discovery', label: 'Discovery - Understanding needs' },
  { value: 'demo', label: 'Demo/Proposal - Presenting solution' },
  { value: 'negotiation', label: 'Negotiation - Terms discussion' },
  { value: 'closing', label: 'Closing - Final decision' },
];

const timelines = [
  { value: 'immediate', label: 'Immediate (This week)' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'next_quarter', label: 'Next Quarter' },
  { value: 'next_year', label: 'Next Year' },
  { value: 'unknown', label: 'Unknown' },
];

// Scenario-specific field configurations
const scenarioFieldConfig: Record<string, {
  showStage: boolean;
  showBudget: boolean;
  showTimeline: boolean;
  showCompetition: boolean;
  showPreviousInteractions: boolean;
  showObjections: boolean;
  budgetLabel?: string;
  budgetPlaceholder?: string;
  previousInteractionsLabel?: string;
  previousInteractionsPlaceholder?: string;
  objectionsLabel?: string;
  description?: string;
}> = {
  cold_call: {
    showStage: false,
    showBudget: false,
    showTimeline: false,
    showCompetition: true,
    showPreviousInteractions: false,
    showObjections: false,
    description: 'For cold calls, focus on who else they might be talking to',
  },
  discovery: {
    showStage: true,
    showBudget: true,
    showTimeline: true,
    showCompetition: true,
    showPreviousInteractions: true,
    showObjections: true,
    description: 'Discovery calls need full context to ask the right questions',
  },
  demo: {
    showStage: false,
    showBudget: true,
    showTimeline: true,
    showCompetition: true,
    showPreviousInteractions: true,
    showObjections: true,
    previousInteractionsLabel: 'What did you learn in discovery?',
    previousInteractionsPlaceholder: 'Key pain points, requirements, stakeholders mentioned...',
    objectionsLabel: 'Objections to prepare for',
    description: 'Tailor your demo to what you learned in discovery',
  },
  negotiation: {
    showStage: false,
    showBudget: true,
    showTimeline: true,
    showCompetition: true,
    showPreviousInteractions: true,
    showObjections: true,
    budgetLabel: 'Their stated budget',
    budgetPlaceholder: 'e.g., $50k-100k, "limited budget", asking for discount',
    previousInteractionsLabel: 'Deal history & commitments made',
    previousInteractionsPlaceholder: 'What have they agreed to? Any verbal commitments?',
    objectionsLabel: 'Price/Terms objections',
    description: 'Negotiation requires knowing their position and leverage points',
  },
  renewal: {
    showStage: false,
    showBudget: false,
    showTimeline: false,
    showCompetition: false,
    showPreviousInteractions: true,
    showObjections: false,
    previousInteractionsLabel: 'Account summary',
    previousInteractionsPlaceholder: 'How long have they been a customer? Key wins? Any issues?',
    description: 'Renewals are straightforward - focus on value delivered',
  },
  objection_handling: {
    showStage: true,
    showBudget: false,
    showTimeline: false,
    showCompetition: true,
    showPreviousInteractions: true,
    showObjections: true,
    previousInteractionsLabel: 'Context when objection was raised',
    previousInteractionsPlaceholder: 'What were you discussing when the objection came up?',
    objectionsLabel: 'The exact objection(s)',
    description: 'Capture the objection verbatim for the best response',
  },
};

export function DealContextForm({ context, onChange, scenario = 'cold_call' }: DealContextFormProps) {
  const [newObjection, setNewObjection] = useState('');
  const config = scenarioFieldConfig[scenario] || scenarioFieldConfig.discovery;

  const addObjection = () => {
    if (newObjection.trim() && !context.knownObjections.includes(newObjection.trim())) {
      onChange({
        ...context,
        knownObjections: [...context.knownObjections, newObjection.trim()]
      });
      setNewObjection('');
    }
  };

  const removeObjection = (objection: string) => {
    onChange({
      ...context,
      knownObjections: context.knownObjections.filter(o => o !== objection)
    });
  };

  // Check if any fields are visible
  const hasVisibleFields = config.showStage || config.showBudget || config.showTimeline || 
    config.showCompetition || config.showPreviousInteractions || config.showObjections;

  if (!hasVisibleFields) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No additional context needed for this scenario.</p>
        <p className="text-sm mt-2">Click "Generate" to create your script!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {config.description && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 {config.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.showStage && (
          <div className="space-y-2">
            <Label htmlFor="stage">Deal Stage</Label>
            <Select
              value={context.stage}
              onValueChange={(value) => onChange({ ...context, stage: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deal stage" />
              </SelectTrigger>
              <SelectContent>
                {dealStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {config.showBudget && (
          <div className="space-y-2">
            <Label htmlFor="budget">{config.budgetLabel || 'Budget'}</Label>
            <Input
              id="budget"
              placeholder={config.budgetPlaceholder || 'e.g., $50k-100k, Unknown, No budget yet'}
              value={context.budget}
              onChange={(e) => onChange({ ...context, budget: e.target.value })}
            />
          </div>
        )}

        {config.showTimeline && (
          <div className="space-y-2">
            <Label htmlFor="timeline">Decision Timeline</Label>
            <Select
              value={context.timeline}
              onValueChange={(value) => onChange({ ...context, timeline: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {timelines.map((timeline) => (
                  <SelectItem key={timeline.value} value={timeline.value}>
                    {timeline.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {config.showCompetition && (
          <div className="space-y-2">
            <Label htmlFor="competition">Competition</Label>
            <Input
              id="competition"
              placeholder="e.g., Competitor X, Incumbent, None"
              value={context.competition}
              onChange={(e) => onChange({ ...context, competition: e.target.value })}
            />
          </div>
        )}
      </div>

      {config.showPreviousInteractions && (
        <div className="space-y-2">
          <Label htmlFor="previousInteractions">
            {config.previousInteractionsLabel || 'Previous Interactions'}
          </Label>
          <Textarea
            id="previousInteractions"
            placeholder={config.previousInteractionsPlaceholder || 'Summarize any previous calls, emails, or meetings...'}
            value={context.previousInteractions}
            onChange={(e) => onChange({ ...context, previousInteractions: e.target.value })}
            rows={3}
          />
        </div>
      )}

      {config.showObjections && (
        <div className="space-y-2">
          <Label>{config.objectionsLabel || 'Known Objections'}</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a known objection..."
              value={newObjection}
              onChange={(e) => setNewObjection(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjection())}
            />
            <button
              onClick={addObjection}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Add
            </button>
          </div>
          {context.knownObjections.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {context.knownObjections.map((objection) => (
                <Badge key={objection} variant="outline" className="gap-1 border-orange-500/30 text-orange-600">
                  {objection.length > 50 ? objection.substring(0, 50) + '...' : objection}
                  <button onClick={() => removeObjection(objection)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
