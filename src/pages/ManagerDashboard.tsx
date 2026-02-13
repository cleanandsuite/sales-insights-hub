import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { CompanyGoalsWidget } from '@/components/enterprise/CompanyGoalsWidget';
import { StaffPerformanceGrid } from '@/components/enterprise/StaffPerformanceGrid';
import { ProductsAppointmentsCard } from '@/components/enterprise/ProductsAppointmentsCard';
import { TeamLeadManagement } from '@/components/enterprise/TeamLeadManagement';
import { EnterpriseActivityFeed } from '@/components/enterprise/EnterpriseActivityFeed';
import { DealBriefPanel } from '@/components/enterprise/DealBriefPanel';
import { PipelineTrendChart } from '@/components/enterprise/PipelineTrendChart';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

interface TeamKPIs {
  teamWinRate: number;
  avgCallsPerRep: number;
  coachingCoveragePct: number;
  avgDiscoveryScore: number;
  avgCloserScore: number;
  forecastRiskPct: number;
  totalReps: number;
}

interface ManagerDashboardProps {
  teamId?: string;
}

export default function ManagerDashboard({ teamId = 'demo-team' }: ManagerDashboardProps) {
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<{ id: string; name: string; company: string } | null>(null);
  const [kpis] = useState<TeamKPIs | null>({
    teamWinRate: 72,
    avgCallsPerRep: 15,
    coachingCoveragePct: 85,
    avgDiscoveryScore: 78,
    avgCloserScore: 82,
    forecastRiskPct: 12,
    totalReps: 8,
  });

  const [pipelineKpis] = useState({
    bookingAttainment: 1245000,
    bookingTarget: 15000000,
    gapToTarget: 13755000,
    coverage: 2.8,
    openPipeline: 3200000,
    totalPipelineCreated: 4200000,
    pipelineTarget: 45000000,
    productsSold: 89,
    appointmentsSet: 67,
    appointmentTarget: 100,
  });

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
            title="Manager Dashboard"
            subtitle="Team performance, pipeline, and forecasting"
            onStartCall={() => setShowCallDialog(true)}
            showEnterpriseBadge
          />

          {/* Team KPI Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Revenue</p>
                    <p className="text-2xl font-bold">${formatCurrency(pipelineKpis.bookingAttainment)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((pipelineKpis.bookingAttainment / pipelineKpis.bookingTarget) * 100)}% of ${formatCurrency(pipelineKpis.bookingTarget)} target
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pipeline Coverage</p>
                    <p className="text-2xl font-bold">{pipelineKpis.coverage}x</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ${formatCurrency(pipelineKpis.openPipeline)} open
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Products Sold</p>
                    <p className="text-2xl font-bold">{pipelineKpis.productsSold}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {pipelineKpis.appointmentsSet} appointments set
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gap to Target</p>
                    <p className="text-2xl font-bold text-destructive">${formatCurrency(pipelineKpis.gapToTarget)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-destructive" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Remaining to close
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Trend Chart */}
          <PipelineTrendChart teamId={teamId} />

          {/* Two Column: Staff Performance & Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StaffPerformanceGrid 
                teamId={teamId} 
                onSelectStaff={(userId, name) => setSelectedDeal({ id: userId, name, company: 'View Details' })}
              />
            </div>
            <div className="space-y-6">
              <ProductsAppointmentsCard teamId={teamId} />
              <TeamLeadManagement teamId={teamId} />
            </div>
          </div>

          {/* Team Goals & Forecast */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CompanyGoalsWidget teamId={teamId} kpis={kpis} />
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                  <div>
                    <p className="text-sm font-medium">Best Case</p>
                    <p className="text-xs text-muted-foreground">High-confidence deals</p>
                  </div>
                  <p className="text-xl font-bold text-success">${formatCurrency(pipelineKpis.openPipeline * 0.6)}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm font-medium">Commit</p>
                    <p className="text-xs text-muted-foreground">Expected closure</p>
                  </div>
                  <p className="text-xl font-bold text-primary">${formatCurrency(pipelineKpis.openPipeline * 0.4)}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <div>
                    <p className="text-sm font-medium">Worst Case</p>
                    <p className="text-xs text-muted-foreground">Conservative outlook</p>
                  </div>
                  <p className="text-xl font-bold text-warning">${formatCurrency(pipelineKpis.openPipeline * 0.2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <EnterpriseActivityFeed teamId={teamId} />

          {selectedDeal && (
            <DealBriefPanel
              dealId={selectedDeal.id}
              dealName={selectedDeal.name}
              companyName={selectedDeal.company}
              onClose={() => setSelectedDeal(null)}
              teamId={teamId}
            />
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
