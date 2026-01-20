import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { KPICards } from '@/components/enterprise/KPICards';
import { RepPerformanceTable } from '@/components/enterprise/RepPerformanceTable';
import { AIActionCards } from '@/components/enterprise/AIActionCards';
import { RiskAlertsWidget } from '@/components/enterprise/RiskAlertsWidget';
import { TeamTrendsHeatmap } from '@/components/enterprise/TeamTrendsHeatmap';
import { 
  BarChart3, Users, TrendingUp, Download, RefreshCw, Crown, AlertTriangle, Zap
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

  const handleExport = () => {
    if (!kpis) return;
    
    const csvContent = `Team Revenue Intelligence Report
Generated: ${new Date().toLocaleString()}

Key Performance Indicators
Team Win Rate,${kpis.teamWinRate}%
Calls/Rep/Week,${kpis.avgCallsPerRep}
Coaching Coverage,${kpis.coachingCoveragePct}%
Avg Discovery Score,${kpis.avgDiscoveryScore}
Avg Closer Score,${kpis.avgCloserScore}
Forecast Risk,${kpis.forecastRiskPct}%
Total Reps,${kpis.totalReps}
`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-intelligence-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
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
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && <KPICards kpis={kpis} />}

        {/* Main Content Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="bg-muted grid w-full grid-cols-4">
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
              <span className="hidden sm:inline">Risk Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
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

          <TabsContent value="trends" className="space-y-4">
            {teamId && <TeamTrendsHeatmap teamId={teamId} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
