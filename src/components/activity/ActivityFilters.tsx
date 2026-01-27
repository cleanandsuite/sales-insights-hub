import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityFiltersProps {
  onFiltersChange: (filters: ActivityFiltersState) => void;
  teamMembers?: { id: string; name: string }[];
  deals?: { id: string; name: string }[];
}

export interface ActivityFiltersState {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  teamMember: string;
  deal: string;
  minScore: number;
  maxScore: number;
  hasBuyingSignals: boolean;
  hasObjections: boolean;
}

const defaultFilters: ActivityFiltersState = {
  search: '',
  dateFrom: undefined,
  dateTo: undefined,
  teamMember: 'all',
  deal: 'all',
  minScore: 0,
  maxScore: 100,
  hasBuyingSignals: false,
  hasObjections: false,
};

export function ActivityFilters({ onFiltersChange, teamMembers = [], deals = [] }: ActivityFiltersProps) {
  const [filters, setFilters] = useState<ActivityFiltersState>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (updates: Partial<ActivityFiltersState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.teamMember !== 'all' ||
    filters.deal !== 'all' ||
    filters.minScore > 0 ||
    filters.maxScore < 100 ||
    filters.hasBuyingSignals ||
    filters.hasObjections;

  return (
    <div className="space-y-4">
      {/* Primary Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calls, contacts, companies..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? (
                filters.dateTo ? (
                  <>
                    {format(filters.dateFrom, 'MMM d')} - {format(filters.dateTo, 'MMM d')}
                  </>
                ) : (
                  format(filters.dateFrom, 'MMM d, yyyy')
                )
              ) : (
                <span className="text-muted-foreground">Pick date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateFrom,
                to: filters.dateTo,
              }}
              onSelect={(range) =>
                updateFilters({
                  dateFrom: range?.from,
                  dateTo: range?.to,
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Team Member */}
        <Select
          value={filters.teamMember}
          onValueChange={(v) => updateFilters({ teamMember: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle Advanced */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(showAdvanced && 'bg-primary/10')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deal Filter */}
            <div className="space-y-2">
              <Label>Deal</Label>
              <Select value={filters.deal} onValueChange={(v) => updateFilters({ deal: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Score Range */}
            <div className="space-y-2">
              <Label>Call Score Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => updateFilters({ minScore: Number(e.target.value) })}
                  className="w-20"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxScore}
                  onChange={(e) => updateFilters({ maxScore: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <Label>Contains</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasBuyingSignals"
                    checked={filters.hasBuyingSignals}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasBuyingSignals: checked === true })
                    }
                  />
                  <label htmlFor="hasBuyingSignals" className="text-sm cursor-pointer">
                    Has Buying Signals
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasObjections"
                    checked={filters.hasObjections}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasObjections: checked === true })
                    }
                  />
                  <label htmlFor="hasObjections" className="text-sm cursor-pointer">
                    Has Objections
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
