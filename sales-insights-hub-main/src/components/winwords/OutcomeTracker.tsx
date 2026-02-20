import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, XCircle, Calendar, Clock, 
  TrendingUp, MessageSquare, DollarSign 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const outcomes = [
  { id: 'booked_meeting', label: 'Booked Meeting', icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'demo_scheduled', label: 'Demo Scheduled', icon: Clock, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'proposal_sent', label: 'Proposal Sent', icon: MessageSquare, color: 'text-orange-500 bg-orange-500/10' },
  { id: 'closed_won', label: 'Closed Won! 🎉', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
  { id: 'closed_lost', label: 'Closed Lost', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
  { id: 'no_response', label: 'No Response', icon: Clock, color: 'text-gray-500 bg-gray-500/10' },
];

interface OutcomeTrackerProps {
  scriptId: string;
  onSubmit: (data: {
    outcome: string;
    feedback: string;
    dealSize?: number;
    callDuration?: number;
  }) => void;
  isSubmitting?: boolean;
}

export function OutcomeTracker({ scriptId, onSubmit, isSubmitting }: OutcomeTrackerProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [dealSize, setDealSize] = useState<string>('');
  const [callDuration, setCallDuration] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedOutcome) return;
    
    onSubmit({
      outcome: selectedOutcome,
      feedback,
      dealSize: dealSize ? parseFloat(dealSize) : undefined,
      callDuration: callDuration ? parseInt(callDuration) * 60 : undefined, // Convert to seconds
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          How did it go?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outcome Selection */}
        <div className="space-y-3">
          <Label>Outcome</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {outcomes.map((outcome) => {
              const Icon = outcome.icon;
              const isSelected = selectedOutcome === outcome.id;
              
              return (
                <button
                  key={outcome.id}
                  onClick={() => setSelectedOutcome(outcome.id)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn('p-1.5 rounded', outcome.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{outcome.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Details */}
        {selectedOutcome && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-4">
              {selectedOutcome === 'closed_won' && (
                <div className="space-y-2">
                  <Label htmlFor="dealSize" className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Deal Size
                  </Label>
                  <Input
                    id="dealSize"
                    type="number"
                    placeholder="50000"
                    value={dealSize}
                    onChange={(e) => setDealSize(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="callDuration" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Call Duration (minutes)
                </Label>
                <Input
                  id="callDuration"
                  type="number"
                  placeholder="30"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">What worked? What didn't?</Label>
              <Textarea
                id="feedback"
                placeholder="The opening really resonated... The objection handler for pricing needs work..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Submit Outcome'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
