import { useState } from 'react';
import { Deal, STAGE_LABELS } from '@/types/deals';
import { cn } from '@/lib/utils';
import { HealthBadge } from './HealthBadge';
import { BuyingSignalChip } from './BuyingSignalChip';
import { ObjectionItem } from './ObjectionItem';
import { NextActionCard } from './NextActionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Building2,
  User,
  Mail,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  Edit,
  ExternalLink,
  Users,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface DealCardProps {
  deal: Deal;
  onEdit?: (deal: Deal) => void;
  onStageChange?: (dealId: string, stage: Deal['stage']) => void;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function DealCard({ deal, onEdit, onStageChange }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const unresolvedObjections = deal.objections.filter((o) => !o.resolved);

  return (
    <div className="bg-card rounded-lg border hover:shadow-md transition-shadow">
      {/* Collapsed Row View */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Deal Name & Company */}
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-semibold text-foreground truncate">{deal.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{deal.company}</span>
            </div>
          </div>

          {/* Value */}
          <div className="text-right min-w-[100px]">
            <div className="font-bold text-lg">{formatCurrency(deal.value, deal.currency)}</div>
          </div>

          {/* Stage */}
          <Badge variant="secondary" className="min-w-[90px] justify-center">
            {STAGE_LABELS[deal.stage]}
          </Badge>

          {/* Last Call */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[120px]">
            <Phone className="h-3.5 w-3.5" />
            {deal.lastCallDate ? (
              <span>{formatDistanceToNow(deal.lastCallDate, { addSuffix: true })}</span>
            ) : (
              <span className="text-muted-foreground/50">No calls</span>
            )}
          </div>

          {/* Health Badge */}
          <HealthBadge score={deal.healthScore} status={deal.healthStatus} size="sm" />

          {/* Next Action (truncated) */}
          <div className="hidden lg:block min-w-[200px] max-w-[250px]">
            {deal.nextAction && (
              <NextActionCard
                action={deal.nextAction}
                dueDate={deal.nextActionDueDate}
                compact
              />
            )}
          </div>

          {/* Expand Button */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Detail View */}
      {isExpanded && (
        <div className="border-t p-4 space-y-6 bg-muted/30">
          {/* Header with Actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span>{deal.contactName}</span>
                <span className="text-muted-foreground/50">•</span>
                <Mail className="h-4 w-4" />
                <span>{deal.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Owner: {deal.ownerName}</span>
                <span className="text-muted-foreground/50">•</span>
                <Calendar className="h-4 w-4" />
                <span>Created {format(deal.createdAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(deal)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </Button>
            )}
          </div>

          {/* Next Best Action */}
          {deal.nextAction && (
            <NextActionCard
              action={deal.nextAction}
              dueDate={deal.nextActionDueDate}
              onComplete={() => console.log('Complete action')}
              onReschedule={() => console.log('Reschedule')}
            />
          )}

          {/* Latest Call Summary */}
          {deal.lastCallSummary && (
            <div className="bg-background rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Latest Call Summary</span>
                {deal.lastCallDate && (
                  <span className="text-xs text-muted-foreground">
                    {format(deal.lastCallDate, 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{deal.lastCallSummary}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Buying Signals */}
            <div className="bg-background rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                🟢 Buying Signals ({deal.buyingSignals.length})
              </h4>
              {deal.buyingSignals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {deal.buyingSignals.map((signal) => (
                    <BuyingSignalChip key={signal.id} signal={signal} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No buying signals detected yet</p>
              )}
            </div>

            {/* Competitor Mentions */}
            <div className="bg-background rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                ⚔️ Competitor Mentions
              </h4>
              {deal.competitorMentions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {deal.competitorMentions.map((competitor, i) => (
                    <Badge key={i} variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                      {competitor}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No competitors mentioned</p>
              )}
            </div>
          </div>

          {/* Objections */}
          {deal.objections.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                ⚠️ Objections ({unresolvedObjections.length} unresolved)
              </h4>
              <div className="space-y-2">
                {deal.objections.map((objection) => (
                  <ObjectionItem key={objection.id} objection={objection} />
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity ({deal.calls.length} calls)
            </h4>
            <div className="space-y-2">
              {deal.calls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background border text-sm"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{format(call.date, 'MMM d')}</span>
                  <span className="flex-1 truncate">{call.summary}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      call.score >= 80
                        ? 'bg-green-500/10 text-green-600'
                        : call.score >= 60
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {call.score}/100
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
