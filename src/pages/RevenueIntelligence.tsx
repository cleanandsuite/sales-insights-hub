import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { KPICards } from '@/components/enterprise/KPICards';
import { RepPerformanceTable } from '@/components/enterprise/RepPerformanceTable';
import { AIActionCards } from '@/components/enterprise/AIActionCards';
import { RiskAlertsWidget } from '@/components/enterprise/RiskAlertsWidget';
import { TeamTrendsHeatmap } from '@/components/enterprise/TeamTrendsHeatmap';
import { PredictiveScoreCard } from '@/components/enterprise/PredictiveScoreCard';
import { EnterpriseExportPanel } from '@/components/enterprise/EnterpriseExportPanel';
import { AlertPreferencesDialog } from '@/components/enterprise/AlertPreferencesDialog';
import { 
  BarChart3, TrendingUp, Download, RefreshCw, Crown, AlertTriangle, Zap, Bell, Brain
} from 'lucide-react';

interface TeamKPIs {
  teamWinRate: number;
  avgCallsPerRep: number;
  coachingCoveragePct: number;
  avgDiscoveryScore: number;
  avgCloserScore: number;
  forecastRiskPct: number;
  totalReps: number;
}

export default function RevenueIntelligence() {
  const { user } = useAuth();
  const { isManager, loading: roleLoading, teamId } = useUserRole();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<TeamKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertPrefsOpen, setAlertPrefsOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isManager) {
      toast.error('Access denied. Manager role required.');
      navigate('/dashboard');
    }
  }, [isManager, roleLoading, navigate]);

  useEffect(() => {
    if (isManager && teamId) {
      fetchKPIs();
    }
  }, [isManager, teamId]);

  const fetchKPIs = async () => {
    if (!teamId) return;
    
    try {
      const { data, error } = await (supabase.rpc as any)('get_team_kpis', { p_team_id: teamId });
      if (error) throw error;
      setKpis(data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Use fallback data if RPC fails
      setKpis({
        teamWinRate: 0,
        avgCallsPerRep: 0,
        coachingCoveragePct: 0,
        avgDiscoveryScore: 0,
        avgCloserScore: 0,
        forecastRiskPct: 0,
        totalReps: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPIs();
    toast.success('Data refreshed');
    setRefreshing(false);
  };


  if (roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isManager) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Revenue Intelligence</h1>
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium gap-1">
                <Crown className="h-3 w-3" />
                Enterprise
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">AI-powered insights to drive team performance</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAlertPrefsOpen(true)}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && <KPICards kpis={kpis} />}

        {/* Main Content Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="bg-muted grid w-full grid-cols-5">
            <TabsTrigger value="performance" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1.5">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">AI Actions</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Risks</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-1.5">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            {teamId && <RepPerformanceTable teamId={teamId} />}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {teamId && <AIActionCards teamId={teamId} />}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {teamId && <RiskAlertsWidget teamId={teamId} />}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {teamId && <PredictiveScoreCard teamId={teamId} />}
              {teamId && <TeamTrendsHeatmap teamId={teamId} />}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {teamId && <EnterpriseExportPanel teamId={teamId} kpis={kpis} />}
          </TabsContent>
        </Tabs>

        {/* Alert Preferences Dialog */}
        {teamId && (
          <AlertPreferencesDialog 
            open={alertPrefsOpen} 
            onOpenChange={setAlertPrefsOpen} 
            teamId={teamId} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
