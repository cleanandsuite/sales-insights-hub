import { useMemo, useState } from 'react';
import { CallActivity } from '@/types/deals';
import { CallActivityCard } from './CallActivityCard';
import { ActivityFilters, ActivityFiltersState } from './ActivityFilters';
import { format, isToday, isYesterday, startOfDay, isSameDay } from 'date-fns';
import { Phone, TrendingUp } from 'lucide-react';

interface ActivityFeedProps {
  activities: CallActivity[];
  teamMembers?: { id: string; name: string }[];
  deals?: { id: string; name: string }[];
  onViewAnalysis?: (id: string) => void;
  onLinkToDeal?: (id: string) => void;
}

const defaultTeamMembers = [
  { id: 'user-1', name: 'Alex Thompson' },
  { id: 'user-2', name: 'Sarah Miller' },
  { id: 'user-3', name: 'James Wilson' },
];

export function ActivityFeed({
  activities,
  teamMembers = defaultTeamMembers,
  deals = [],
  onViewAnalysis,
  onLinkToDeal,
}: ActivityFeedProps) {
  const [filters, setFilters] = useState<ActivityFiltersState>({
    search: '',
    dateFrom: undefined,
    dateTo: undefined,
    teamMember: 'all',
    deal: 'all',
    minScore: 0,
    maxScore: 100,
    hasBuyingSignals: false,
    hasObjections: false,
  });

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          activity.contactName.toLowerCase().includes(query) ||
          activity.company.toLowerCase().includes(query) ||
          activity.summary.toLowerCase().includes(query) ||
          activity.dealName?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Date range filter
      if (filters.dateFrom && activity.date < filters.dateFrom) return false;
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (activity.date > endOfDay) return false;
      }

      // Team member filter
      if (filters.teamMember !== 'all' && activity.userId !== filters.teamMember) return false;

      // Deal filter
      if (filters.deal !== 'all' && activity.dealId !== filters.deal) return false;

      // Score filter
      if (activity.score < filters.minScore || activity.score > filters.maxScore) return false;

      // Buying signals filter
      if (filters.hasBuyingSignals && activity.buyingSignals.length === 0) return false;

      // Objections filter
      if (filters.hasObjections && activity.objections.length === 0) return false;

      return true;
    });
  }, [activities, filters]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: { date: Date; label: string; activities: CallActivity[] }[] = [];
    let currentGroup: typeof groups[0] | null = null;

    filteredActivities.forEach((activity) => {
      const activityDate = startOfDay(activity.date);
      
      if (!currentGroup || !isSameDay(currentGroup.date, activityDate)) {
        let label = format(activityDate, 'EEEE, MMMM d, yyyy');
        if (isToday(activityDate)) label = 'Today';
        else if (isYesterday(activityDate)) label = 'Yesterday';

        currentGroup = { date: activityDate, label, activities: [] };
        groups.push(currentGroup);
      }

      currentGroup.activities.push(activity);
    });

    return groups;
  }, [filteredActivities]);

  // Stats
  const stats = useMemo(() => {
    const today = filteredActivities.filter((a) => isToday(a.date));
    const avgScore = filteredActivities.length
      ? Math.round(filteredActivities.reduce((sum, a) => sum + a.score, 0) / filteredActivities.length)
      : 0;

    return {
      totalCalls: filteredActivities.length,
      todayCalls: today.length,
      avgScore,
      totalBuyingSignals: filteredActivities.reduce((sum, a) => sum + a.buyingSignals.length, 0),
    };
  }, [filteredActivities]);

  // Generate deals list for filter
  const dealsList = useMemo(() => {
    const uniqueDeals = new Map<string, string>();
    activities.forEach((a) => {
      if (a.dealId && a.dealName) {
        uniqueDeals.set(a.dealId, a.dealName);
      }
    });
    return Array.from(uniqueDeals.entries()).map(([id, name]) => ({ id, name }));
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <div className="text-xs text-muted-foreground">Total Calls</div>
          </div>
        </div>
        <div className="h-10 w-px bg-border" />
        <div>
          <div className="text-2xl font-bold">{stats.todayCalls}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>
        <div className="h-10 w-px bg-border" />
        <div>
          <div className="text-2xl font-bold text-green-600">{stats.totalBuyingSignals}</div>
          <div className="text-xs text-muted-foreground">Buying Signals</div>
        </div>
      </div>

      {/* Filters */}
      <ActivityFilters
        onFiltersChange={setFilters}
        teamMembers={teamMembers}
        deals={dealsList}
      />

      {/* Activity Feed */}
      <div className="space-y-6">
        {groupedActivities.length > 0 ? (
          groupedActivities.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-2 z-10">
                {group.label}
              </h3>
              <div className="space-y-3">
                {group.activities.map((activity) => (
                  <CallActivityCard
                    key={activity.id}
                    activity={activity}
                    onViewAnalysis={onViewAnalysis}
                    onLinkToDeal={onLinkToDeal}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No call activities found</p>
            <p className="text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
