import { useState, useMemo } from 'react';
import { Deal, HealthStatus, STAGE_LABELS, DealStage } from '@/types/deals';
import { DealCard } from './DealCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DealsTableProps {
  deals: Deal[];
  healthFilter: HealthStatus | 'all';
  onEditDeal?: (deal: Deal) => void;
}

type SortField = 'name' | 'value' | 'lastCallDate' | 'healthScore' | 'stage';
type SortDirection = 'asc' | 'desc';

export function DealsTable({ deals, healthFilter, onEditDeal }: DealsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('healthScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;

    // Apply health filter
    if (healthFilter !== 'all') {
      filtered = filtered.filter((d) => d.healthStatus === healthFilter);
    }

    // Apply stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter((d) => d.stage === stageFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.company.toLowerCase().includes(query) ||
          d.contactName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'lastCallDate':
          const aDate = a.lastCallDate?.getTime() || 0;
          const bDate = b.lastCallDate?.getTime() || 0;
          comparison = aDate - bDate;
          break;
        case 'healthScore':
          comparison = a.healthScore - b.healthScore;
          break;
        case 'stage':
          const stageOrder = ['lead', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
          comparison = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [deals, healthFilter, stageFilter, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? (
          <SortAsc className="h-3 w-3 ml-1" />
        ) : (
          <SortDesc className="h-3 w-3 ml-1" />
        )
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals, companies, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as DealStage | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-sm text-muted-foreground mr-2">Sort:</span>
          <SortButton field="healthScore" label="Health" />
          <SortButton field="value" label="Value" />
          <SortButton field="lastCallDate" label="Last Call" />
          <SortButton field="stage" label="Stage" />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedDeals.length} of {deals.length} deals
      </div>

      {/* Deal Cards */}
      <div className="space-y-3">
        {filteredAndSortedDeals.length > 0 ? (
          filteredAndSortedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onEdit={onEditDeal} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No deals found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
