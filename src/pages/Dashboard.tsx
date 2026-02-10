import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Target, TrendingUp, Phone, Calendar, BarChart3, Sparkles, ArrowRight, Clock, Users, Zap } from 'lucide-react';

// Mock Data
import {
  mockMetrics,
  mockPriorityDeals,
  mockRecentCalls,
} from '@/data/dashboardMockData';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  const progressPercent = Math.round((mockMetrics.totalRevenue / mockMetrics.revenueGoal) * 100);

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button 
              onClick={() => setShowCallDialog(true)}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Revenue Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockMetrics.totalRevenue)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={progressPercent} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">{progressPercent}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {formatCurrency(mockMetrics.revenueGoal)} goal
                </p>
              </CardContent>
            </Card>

            {/* Win Rate Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockMetrics.winRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockMetrics.wonDeals} won / {mockMetrics.lostDeals} lost
                </p>
              </CardContent>
            </Card>

            {/* Active Deals Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockMetrics.pipelineDeals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In pipeline
                </p>
              </CardContent>
            </Card>

            {/* Calls Today Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockMetrics.callsToday}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockMetrics.hotLeads} hot leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Priority Actions - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              {/* Today's Priorities */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Today's Priorities</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/leads')}>
                      View all <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">Leads to Call</span>
                      </div>
                      <div className="mt-2 text-2xl font-semibold">3</div>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        <span className="text-sm font-medium">Follow-ups Due</span>
                      </div>
                      <div className="mt-2 text-2xl font-semibold">2</div>
                    </div>
                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-sm font-medium">Closing Soon</span>
                      </div>
                      <div className="mt-2 text-2xl font-semibold">1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority Deals */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Priority Deals</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/enterprise')}>
                      View all <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockPriorityDeals.slice(0, 4).map((deal) => (
                    <div 
                      key={deal.id} 
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/enterprise')}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-medium">
                          {deal.company.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{deal.name}</p>
                          <Badge variant="outline" className="ml-2">
                            {deal.stage}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(deal.value)}</p>
                        {deal.alert && (
                          <p className="text-xs text-warning">{deal.alert}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="space-y-4">
              {/* Start Call CTA */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex items-center justify-center mb-4">
                      <Phone className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Ready to make calls?</h3>
                    <p className="text-sm text-primary-foreground/80 mb-4">
                      AI coaching is ready to assist
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full gap-2"
                      onClick={() => setShowCallDialog(true)}
                    >
                      <Zap className="h-4 w-4" />
                      Start Call
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Calls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Calls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockRecentCalls.slice(0, 4).map((call) => (
                    <div key={call.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {call.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{call.contactName}</p>
                          <Badge 
                            variant={call.score >= 85 ? 'default' : call.score >= 70 ? 'secondary' : 'destructive'}
                            className="ml-2 text-xs"
                          >
                            {call.score}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{call.company}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/recordings')}>
                    View all calls
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => navigate('/leads')}>
                    <Target className="h-3 w-3" />
                    Leads
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => navigate('/schedule')}>
                    <Calendar className="h-3 w-3" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => navigate('/winwords')}>
                    <Sparkles className="h-3 w-3" />
                    WinWords
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => navigate('/analytics')}>
                    <BarChart3 className="h-3 w-3" />
                    Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
