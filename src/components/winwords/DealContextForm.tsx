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

export function DealContextForm({ context, onChange }: DealContextFormProps) {
  const [newObjection, setNewObjection] = useState('');

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            placeholder="e.g., $50k-100k, Unknown, No budget yet"
            value={context.budget}
            onChange={(e) => onChange({ ...context, budget: e.target.value })}
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="competition">Competition</Label>
          <Input
            id="competition"
            placeholder="e.g., Competitor X, Incumbent, None"
            value={context.competition}
            onChange={(e) => onChange({ ...context, competition: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousInteractions">Previous Interactions</Label>
        <Textarea
          id="previousInteractions"
          placeholder="Summarize any previous calls, emails, or meetings..."
          value={context.previousInteractions}
          onChange={(e) => onChange({ ...context, previousInteractions: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Known Objections</Label>
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
                {objection}
                <button onClick={() => removeObjection(objection)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
