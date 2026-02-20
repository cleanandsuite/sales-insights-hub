import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

interface AIRiskTimelineProps {
  riskLevel: string;
  predictedCloseDate: string | null;
  predictedDealValue: number | null;
  dealVelocityDays: number | null;
}

export const AIRiskTimeline = ({
  riskLevel,
  predictedCloseDate,
  predictedDealValue,
  dealVelocityDays
}: AIRiskTimelineProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDaysUntilClose = () => {
    if (!predictedCloseDate) return null;
    try {
      const closeDate = parseISO(predictedCloseDate);
      return differenceInDays(closeDate, new Date());
    } catch {
      return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const daysUntilClose = getDaysUntilClose();
  const velocityProgress = dealVelocityDays 
    ? Math.min(100, Math.max(0, 100 - (dealVelocityDays / 90) * 100))
    : 50;

  return (
    <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Deal Predictions</span>
        <Badge variant="outline" className={getRiskColor(riskLevel)}>
          {riskLevel === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {riskLevel} risk
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Predicted Close Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Close Date</p>
            <p className="text-sm font-medium truncate">
              {predictedCloseDate 
                ? format(parseISO(predictedCloseDate), 'MMM d, yyyy')
                : 'Unknown'
              }
            </p>
            {daysUntilClose !== null && (
              <p className={`text-xs ${daysUntilClose < 7 ? 'text-green-600' : daysUntilClose < 30 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                {daysUntilClose < 0 ? 'Overdue' : `${daysUntilClose} days left`}
              </p>
            )}
          </div>
        </div>

        {/* Predicted Deal Value */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Deal Value</p>
            <p className="text-sm font-medium truncate">
              {predictedDealValue ? formatCurrency(predictedDealValue) : 'TBD'}
            </p>
          </div>
        </div>
      </div>

      {/* Deal Velocity */}
      {dealVelocityDays !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Deal Velocity</span>
            </div>
            <span className="text-xs font-medium">{dealVelocityDays} days</span>
          </div>
          <Progress value={velocityProgress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {dealVelocityDays < 14 ? 'Fast moving' : dealVelocityDays < 30 ? 'Normal pace' : 'Slow - needs attention'}
          </p>
        </div>
      )}
    </div>
  );
};
