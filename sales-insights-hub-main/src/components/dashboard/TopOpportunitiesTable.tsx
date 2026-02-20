import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Opportunity {
  id: string;
  name: string;
  account: string;
  amount: number;
  probability: number;
  stage: string;
  closeDate: string;
}

interface TopOpportunitiesTableProps {
  opportunities: Opportunity[];
  onViewDetails?: (id: string) => void;
}

export function TopOpportunitiesTable({ opportunities, onViewDetails }: TopOpportunitiesTableProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Prospecting': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Qualification': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Proposal': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Negotiation': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Closed Won': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Closed Lost': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    return colors[stage] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-emerald-400';
    if (prob >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            Top Open Opportunities
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
            View All <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-medium text-slate-400 pb-2">Opportunity</th>
                <th className="text-right text-xs font-medium text-slate-400 pb-2">Amount</th>
                <th className="text-center text-xs font-medium text-slate-400 pb-2">Prob</th>
                <th className="text-right text-xs font-medium text-slate-400 pb-2">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {opportunities.map((opp) => (
                <tr 
                  key={opp.id}
                  className="group hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => onViewDetails?.(opp.id)}
                >
                  <td className="py-3">
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {opp.name}
                      </div>
                      <div className="text-xs text-slate-400">{opp.account}</div>
                    </div>
                  </td>
                  <td className="text-right py-3">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(opp.amount)}
                    </span>
                  </td>
                  <td className="text-center py-3">
                    <span className={`text-sm font-bold ${getProbabilityColor(opp.probability)}`}>
                      {opp.probability}%
                    </span>
                  </td>
                  <td className="text-right py-3">
                    <Badge className={`${getStageColor(opp.stage)} border text-xs`}>
                      {opp.stage}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
