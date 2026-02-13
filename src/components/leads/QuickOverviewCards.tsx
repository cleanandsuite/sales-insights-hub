import { Users, Clock, Flame, Phone } from 'lucide-react';

interface QuickOverviewCardsProps {
  newLeadsToday: number;
  pendingFollowups: number;
  hotLeads: number;
  recentCalls: number;
}

export function QuickOverviewCards({
  newLeadsToday,
  pendingFollowups,
  hotLeads,
  recentCalls
}: QuickOverviewCardsProps) {
  const cards = [
    {
      title: 'New Leads',
      value: newLeadsToday,
      subtitle: 'Today',
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Follow-ups',
      value: pendingFollowups,
      subtitle: 'Pending',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Hot Leads',
      value: hotLeads,
      subtitle: 'Priority',
      icon: Flame,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Recent Calls',
      value: recentCalls,
      subtitle: 'Last 24h',
      icon: Phone,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div 
          key={card.title}
          className="card-gradient rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`h-10 w-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{card.value}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-medium text-foreground">{card.title}</span>
            <span className="text-xs text-muted-foreground">({card.subtitle})</span>
          </div>
        </div>
      ))}
    </div>
  );
}
