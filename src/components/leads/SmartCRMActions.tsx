import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Bot, 
  ChevronDown,
  Sparkles,
  Clock,
  MessageSquare,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface AIActionSuggestion {
  label: string;
  description: string;
  timing?: string;
}

interface SmartCRMActionsProps {
  leadId: string;
  leadName: string;
  leadEmail?: string | null;
  onCall?: () => void;
  onEmail?: () => void;
  onSchedule?: () => void;
  aiSuggestions?: {
    emailTemplates?: AIActionSuggestion[];
    callTimes?: AIActionSuggestion[];
    proposalTweaks?: AIActionSuggestion[];
  };
}

export const SmartCRMActions = ({
  leadId,
  leadName,
  leadEmail,
  onCall,
  onEmail,
  onSchedule,
  aiSuggestions
}: SmartCRMActionsProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleEmailWithTemplate = async (template: AIActionSuggestion) => {
    setIsLoading('email');
    // Simulate applying template
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(`Email template "${template.label}" applied`);
    setIsLoading(null);
    onEmail?.();
  };

  const handleScheduleWithTime = async (time: AIActionSuggestion) => {
    setIsLoading('schedule');
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(`Meeting scheduled for ${time.label}`);
    setIsLoading(null);
    onSchedule?.();
  };

  const handleSendProposal = async (tweak: AIActionSuggestion) => {
    setIsLoading('proposal');
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(`Proposal with "${tweak.label}" sent`);
    setIsLoading(null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Call Action */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCall}
        className="gap-1"
      >
        <Phone className="h-3.5 w-3.5" />
        Call
      </Button>

      {/* Smart Email Action */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={isLoading === 'email'}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
            {aiSuggestions?.emailTemplates && aiSuggestions.emailTemplates.length > 0 && (
              <Sparkles className="h-3 w-3 text-primary ml-1" />
            )}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={onEmail}>
            <Send className="h-4 w-4 mr-2" />
            Compose New Email
          </DropdownMenuItem>
          
          {aiSuggestions?.emailTemplates && aiSuggestions.emailTemplates.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Suggested Templates
              </DropdownMenuLabel>
              {aiSuggestions.emailTemplates.map((template, i) => (
                <DropdownMenuItem 
                  key={i}
                  onClick={() => handleEmailWithTemplate(template)}
                  className="flex-col items-start"
                >
                  <span className="font-medium">{template.label}</span>
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Smart Schedule Action */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={isLoading === 'schedule'}
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule
            {aiSuggestions?.callTimes && aiSuggestions.callTimes.length > 0 && (
              <Sparkles className="h-3 w-3 text-primary ml-1" />
            )}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={onSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Pick a Time
          </DropdownMenuItem>
          
          {aiSuggestions?.callTimes && aiSuggestions.callTimes.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Optimal Times
              </DropdownMenuLabel>
              {aiSuggestions.callTimes.map((time, i) => (
                <DropdownMenuItem 
                  key={i}
                  onClick={() => handleScheduleWithTime(time)}
                  className="flex-col items-start"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{time.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{time.description}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Smart Proposal Action */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={isLoading === 'proposal'}
          >
            <FileText className="h-3.5 w-3.5" />
            Proposal
            {aiSuggestions?.proposalTweaks && aiSuggestions.proposalTweaks.length > 0 && (
              <Sparkles className="h-3 w-3 text-primary ml-1" />
            )}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            Create Standard Proposal
          </DropdownMenuItem>
          
          {aiSuggestions?.proposalTweaks && aiSuggestions.proposalTweaks.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Suggested Adjustments
              </DropdownMenuLabel>
              {aiSuggestions.proposalTweaks.map((tweak, i) => (
                <DropdownMenuItem 
                  key={i}
                  onClick={() => handleSendProposal(tweak)}
                  className="flex-col items-start"
                >
                  <span className="font-medium">{tweak.label}</span>
                  <span className="text-xs text-muted-foreground">{tweak.description}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Message */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Note
      </Button>
    </div>
  );
};
