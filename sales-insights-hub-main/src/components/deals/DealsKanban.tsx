import { useState } from 'react';
import { Deal, DealStage, STAGE_LABELS, STAGE_ORDER } from '@/types/deals';
import { HealthBadge } from './HealthBadge';
import { cn } from '@/lib/utils';
import { Building2, Phone, GripVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DealsKanbanProps {
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
  onStageChange?: (dealId: string, newStage: DealStage) => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const stageColumns: DealStage[] = ['lead', 'qualified', 'demo', 'proposal', 'negotiation'];

export function DealsKanban({ deals, onDealClick, onStageChange }: DealsKanbanProps) {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const getDealsForStage = (stage: DealStage) =>
    deals.filter((d) => d.stage === stage && d.stage !== 'closed_won' && d.stage !== 'closed_lost');

  const getStageValue = (stage: DealStage) =>
    getDealsForStage(stage).reduce((sum, d) => sum + d.value, 0);

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (draggedDeal && onStageChange && draggedDeal.stage !== stage) {
      onStageChange(draggedDeal.id, stage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stageColumns.map((stage) => {
        const stageDeals = getDealsForStage(stage);
        const stageValue = getStageValue(stage);
        const isDragOver = dragOverStage === stage;

        return (
          <div
            key={stage}
            className={cn(
              'flex-shrink-0 w-72 rounded-lg border bg-muted/30 transition-colors',
              isDragOver && 'border-primary bg-primary/5'
            )}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column Header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{STAGE_LABELS[stage]}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stageValue)}
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onDealClick?.(deal)}
                  className={cn(
                    'bg-card rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all',
                    draggedDeal?.id === deal.id && 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{deal.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{deal.company}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-sm">{formatCurrency(deal.value)}</span>
                    <HealthBadge score={deal.healthScore} status={deal.healthStatus} size="sm" showScore={false} />
                  </div>

                  {deal.lastCallDate && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{formatDistanceToNow(deal.lastCallDate, { addSuffix: true })}</span>
                    </div>
                  )}
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No deals
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Closed Columns (smaller) */}
      <div className="flex-shrink-0 w-48 space-y-4">
        <div className="rounded-lg border bg-green-500/10">
          <div className="p-3 border-b border-green-500/20">
            <h3 className="font-semibold text-sm text-green-600">Closed Won</h3>
            <span className="text-xs text-green-600/70">
              {deals.filter((d) => d.stage === 'closed_won').length} deals
            </span>
          </div>
        </div>
        <div className="rounded-lg border bg-destructive/10">
          <div className="p-3 border-b border-destructive/20">
            <h3 className="font-semibold text-sm text-destructive">Closed Lost</h3>
            <span className="text-xs text-destructive/70">
              {deals.filter((d) => d.stage === 'closed_lost').length} deals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
