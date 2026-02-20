import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarPlus, 
  Sparkles, 
  X, 
  Clock,
  User,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface FollowUpPromptProps {
  recordingId: string;
  recordingName: string;
  contactName?: string;
  suggestedDate?: string;
  onSchedule: (recordingId: string) => void;
  onDismiss: () => void;
}

export function FollowUpPrompt({
  recordingId,
  recordingName,
  contactName,
  suggestedDate,
  onSchedule,
  onDismiss
}: FollowUpPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  return (
    <Card className="border-primary/30 bg-primary/5 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Schedule Follow-Up
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-2"
            onClick={handleDismiss}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Your call "{recordingName}" has ended. Would you like to schedule a follow-up?
        </p>

        <div className="flex flex-wrap gap-2">
          {contactName && (
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {contactName}
            </Badge>
          )}
          {suggestedDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Suggested: {format(new Date(suggestedDate), 'MMM d')}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSchedule(recordingId)}
          >
            <CalendarPlus className="h-4 w-4 mr-1.5" />
            Schedule with AI
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
