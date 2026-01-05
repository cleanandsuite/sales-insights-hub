import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, Shield } from 'lucide-react';

interface DealRisk {
  risk: string;
  severity: 'critical' | 'warning' | 'info';
  recommendation: string;
}

interface DealRisksTabProps {
  risks: DealRisk[];
}

export function DealRisksTab({ risks }: DealRisksTabProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          badge: 'bg-red-500 text-white'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badge: 'bg-amber-500 text-white'
        };
      case 'info':
      default:
        return {
          icon: Info,
          color: 'text-blue-600',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          badge: 'bg-blue-500 text-white'
        };
    }
  };

  // Sort by severity
  const sortedRisks = [...risks].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  if (risks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
        <p className="font-medium text-green-600">Looking good!</p>
        <p className="text-sm">No significant deal risks detected in this conversation.</p>
      </div>
    );
  }

  const criticalCount = risks.filter(r => r.severity === 'critical').length;

  return (
    <div className="space-y-4">
      {criticalCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-600">
              {criticalCount} critical {criticalCount === 1 ? 'risk' : 'risks'} detected
            </p>
            <p className="text-sm text-red-600/80">
              Address these immediately to prevent deal loss.
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {sortedRisks.map((risk, index) => {
          const config = getSeverityConfig(risk.severity);
          const Icon = config.icon;

          return (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium ${config.color}`}>{risk.risk}</p>
                    <Badge className={config.badge}>
                      {risk.severity}
                    </Badge>
                  </div>
                  <div className="bg-card/80 rounded-md p-3 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation</p>
                    <p className="text-sm">{risk.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
