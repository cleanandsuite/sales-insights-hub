import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, TrendingUp, Phone, Calendar, BarChart3, Sparkles } from 'lucide-react';

// Mock Data
import {
  mockMetrics,
  mockRevenueData,
  mockPriorityDeals,
  mockRecentCalls,
} from '@/data/dashboardMockData';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  const handleStartCall = (phoneNumber: string) => {
    setShowCallDialog(false);
    setActiveCall(phoneNumber);
  };

  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
      )}
      
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={handleStartCall}
      />
      
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <DashboardHeader
            title="Good morning!"
            subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            onStartCall={() => setShowCallDialog(true)}
          />

          {/* Today's Priorities */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Leads to Call Today */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Today's Priorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Leads to Call</p>
                    <p className="text-xs text-muted-foreground">Follow up today</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">3</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Follow-ups Due</p>
                    <p className="text-xs text-muted-foreground">Don't forget</p>
                  </div>
                  <p className="text-2xl font-bold text-warning">2</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Closing Soon</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                  <p className="text-2xl font-bold text-success">1</p>
                </div>
              </CardContent>
            </Card>

            {/* Big Action Button */}
            <Card className="border-border/50 bg-primary/5 md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center h-full py-4">
                  <Button
                    onClick={() => setShowCallDialog(true)}
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    Start Call
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    AI coaching ready • WinWords active
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Revenue"
              value={formatCurrency(mockMetrics.totalRevenue)}
              icon={DollarSign}
              iconColor="text-success"
              progress={{
                current: mockMetrics.totalRevenue,
                goal: mockMetrics.revenueGoal,
                label: 'of goal',
              }}
            />
            <MetricCard
              label="Win Rate"
              value={`${mockMetrics.winRate}%`}
              icon={Target}
              iconColor="text-primary"
            />
            <MetricCard
              label="Active Deals"
              value={mockMetrics.pipelineDeals}
              icon={TrendingUp}
              iconColor="text-secondary"
              subtitle="In pipeline"
            />
            <MetricCard
              label="Calls Today"
              value={mockMetrics.callsToday}
              icon={Phone}
              iconColor="text-warning"
              highlight={`${mockMetrics.hotLeads} hot leads`}
              highlightColor="warning"
            />
          </div>

          {/* Two Column: Today's Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Calls */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRecentCalls.slice(0, 3).map((call) => (
                  <div key={call.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{call.contactName}</p>
                        <Badge variant={call.score >= 85 ? 'default' : call.score >= 70 ? 'secondary' : 'destructive'}>
                          {call.score}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{call.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">{call.summary}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/recordings')}>
                  View All Calls
                </Button>
              </CardContent>
            </Card>

            {/* Priority Deals */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Priority Deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPriorityDeals.slice(0, 3).map((deal) => (
                  <div key={deal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{deal.name}</p>
                        <Badge variant={
                          deal.health === 'on_track' ? 'default' :
                          deal.health === 'monitor' ? 'secondary' : 'destructive'
                        }>
                          {deal.stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
                      <p className="text-sm font-medium mt-1">{formatCurrency(deal.value)}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/enterprise')}>
                  View All Deals
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Simple Nav Links */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
              <Target className="h-4 w-4 mr-2" />
              Leads
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/winwords')}>
              <Sparkles className="h-4 w-4 mr-2" />
              WinWords
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
