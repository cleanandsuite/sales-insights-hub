import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DealPriorityCard } from '@/components/dashboard/DealPriorityCard';
import { RecentCallCard } from '@/components/dashboard/RecentCallCard';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';
import { AIStatusBar } from '@/components/dashboard/AIStatusBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, DollarSign, Target, TrendingUp, BarChart3, ArrowRight
} from 'lucide-react';

const revenueData = [
  { month: 'Jul', revenue: 35000, target: 50000 },
  { month: 'Aug', revenue: 42000, target: 50000 },
  { month: 'Sep', revenue: 58000, target: 60000 },
  { month: 'Oct', revenue: 72000, target: 70000 },
  { month: 'Nov', revenue: 89000, target: 85000 },
  { month: 'Dec', revenue: 95000, target: 90000 },
  { month: 'Jan', revenue: 45000, target: 100000 },
];

const priorityDeals = [
  { name: 'Enterprise License', company: 'Acme Corp', value: 125000, stage: 'Proposal', health: 'at_risk' as const, alert: 'No contact in 8 days', nextAction: 'Schedule follow-up call' },
  { name: 'Platform Migration', company: 'TechStart Inc', value: 89000, stage: 'Qualification', health: 'on_track' as const, nextAction: 'Send proposal deck' },
  { name: 'Annual Renewal', company: 'Global Systems', value: 67000, stage: 'Negotiation', health: 'monitor' as const, alert: 'Competitor mentioned', nextAction: 'Prepare competitive analysis' },
  { name: 'Expansion Deal', company: 'MegaCorp', value: 156000, stage: 'Proposal', health: 'on_track' as const, nextAction: 'Demo scheduled Thursday' },
];

const recentCalls = [
  {
    contactName: 'John Smith',
    company: 'Apex Energy Solutions',
    score: 75,
    summary: 'High energy costs driving urgency. Budget approved for Q1. Need to address integration concerns.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    buyingSignals: ['Budget Confirmed', 'Timeline Q1'],
  },
  {
    contactName: 'Sarah Chen',
    company: 'YouTube Channel Growth',
    score: 95,
    summary: 'Excellent call — SEO strategy resonated well. Ready to move to proposal stage.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    buyingSignals: ['Budget', 'Timeline Q1', 'Decision Maker'],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
      )}
      
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={(phone) => setActiveCall(phone)}
      />
      
      <DashboardLayout>
        <div className="bg-dashboard-gradient -m-3 sm:-m-4 lg:-m-8 p-3 sm:p-4 lg:p-8 min-h-screen space-y-6 sm:space-y-8">
          {/* Header */}
          <DashboardHeader onStartCall={() => setShowCallDialog(true)} />

          {/* AI Status */}
          <AIStatusBar
            isActive={true}
            todayLeads={12}
            weekLeads={47}
            conversionRate={68}
            avgResponseTime="2.4 min"
          />

          {/* KPI Cards */}
          <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Revenue"
              value="$301K"
              icon={DollarSign}
              iconColor="text-success"
              progress={{ current: 301000, goal: 500000, label: '60% of annual goal' }}
              trend={{ value: 12.5, direction: 'up' }}
            />
            <MetricCard
              label="Pipeline"
              value="$2.1M"
              icon={BarChart3}
              iconColor="text-primary"
              subtitle="47 open deals"
              trend={{ value: 5.8, direction: 'up' }}
            />
            <MetricCard
              label="Win Rate"
              value="68%"
              icon={Target}
              iconColor="text-warning"
              subtitle="24 Won / 11 Lost"
              trend={{ value: 3, direction: 'up' }}
            />
            <MetricCard
              label="Calls Today"
              value="1"
              icon={Phone}
              iconColor="text-primary"
              highlight="4 hot leads 🔥"
              highlightColor="warning"
              action={{ label: 'View Queue', onClick: () => navigate('/leads') }}
            />
          </div>

          {/* Revenue Chart + Priority Deals */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RevenueTrendChart data={revenueData} goal={100000} />
            </div>
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Priority Deals
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => navigate('/enterprise')}
                  >
                    View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {priorityDeals.map((deal, i) => (
                  <DealPriorityCard
                    key={i}
                    {...deal}
                    onClick={() => navigate('/enterprise')}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Calls */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Recent Calls
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => navigate('/recordings')}
                >
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {recentCalls.map((call, i) => (
                  <RecentCallCard
                    key={i}
                    {...call}
                    onViewSummary={() => navigate('/recordings')}
                    onViewLead={() => navigate('/leads')}
                    onCall={() => setShowCallDialog(true)}
                    onSchedule={() => navigate('/schedule')}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Nav */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>Leads</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>Schedule</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/winwords')}>WinWords</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>Analytics</Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
