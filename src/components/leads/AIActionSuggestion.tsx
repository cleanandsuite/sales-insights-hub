import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, ChevronRight, Clock, Lightbulb, CheckCircle2 } from "lucide-react";

interface NextBestAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  timing: string;
}

interface AIActionSuggestionProps {
  actions: NextBestAction[];
  onApplyAction?: (action: NextBestAction, index: number) => void;
  onDismissAction?: (index: number) => void;
  appliedActions?: number[];
}

export const AIActionSuggestion = ({ 
  actions, 
  onApplyAction, 
  onDismissAction,
  appliedActions = []
}: AIActionSuggestionProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!actions || actions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm">No AI suggestions available yet</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">AI Recommended Actions</span>
      </div>

      {actions.slice(0, 3).map((action, index) => {
        const isApplied = appliedActions.includes(index);
        
        return (
          <Card 
            key={index} 
            className={`transition-all ${isApplied ? 'bg-green-50 border-green-200' : 'hover:border-primary/50'}`}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(action.priority)}`}
                    >
                      {action.priority}
                    </Badge>
                    {isApplied && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>
                  
                  <p className={`text-sm font-medium ${isApplied ? 'line-through text-muted-foreground' : ''}`}>
                    {action.action}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.reason}
                  </p>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{action.timing}</span>
                  </div>
                </div>

                {!isApplied && onApplyAction && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="flex-shrink-0"
                    onClick={() => onApplyAction(action, index)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {actions.length > 3 && (
        <p className="text-xs text-muted-foreground text-center">
          +{actions.length - 3} more suggestions
        </p>
      )}
    </div>
  );
};
