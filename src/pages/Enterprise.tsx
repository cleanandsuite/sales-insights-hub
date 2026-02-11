import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { Navigate } from 'react-router-dom';
import { Loader2, Building2, Crown, Calendar, FileText, Shield, Users, TrendingUp, Phone, LayoutGrid, List, Plus, Palette, Zap, Sparkles, Check, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnterpriseSeatManagement } from '@/components/enterprise/EnterpriseSeatManagement';
import { EnterpriseActivityLog } from '@/components/enterprise/EnterpriseActivityLog';
import { OrganizationSSOConfig } from '@/components/enterprise/OrganizationSSOConfig';
import { OrganizationBilling } from '@/components/enterprise/OrganizationBilling';
import { OrganizationDataExport } from '@/components/enterprise/OrganizationDataExport';
import { OrganizationSecurityCompliance } from '@/components/enterprise/OrganizationSecurityCompliance';
import { OrganizationIntegrations } from '@/components/enterprise/OrganizationIntegrations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Deal components
import { PipelineSummaryBar } from '@/components/deals/PipelineSummaryBar';
import { DealsTable } from '@/components/deals/DealsTable';
import { DealsKanban } from '@/components/deals/DealsKanban';
import { DealModal } from '@/components/deals/DealModal';
import { DealDetailDrawer } from '@/components/deals/DealDetailDrawer';
import { Deal, HealthStatus, DealStage } from '@/types/deals';
import { mockDeals, mockCallActivities, calculatePipelineSummary } from '@/data/mockDeals';

// Activity components
import { ActivityFeed } from '@/components/activity/ActivityFeed';

export default function Enterprise() {
  const { user, loading: authLoading } = useAuth();
  const { isEnterprise, tier, loading: enterpriseLoading } = useEnterpriseSubscription();
  const { teamId, loading: roleLoading } = useUserRole();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { theme, setTheme } = useTheme();

  // Deals state
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'all'>('all');
  const [dealsViewMode, setDealsViewMode] = useState<'table' | 'kanban'>('table');
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGameStyle, setSelectedGameStyle] = useState<ThemeMode>(theme);

  // Sync with theme context
  useEffect(() => {
    setSelectedGameStyle(theme);
  }, [theme]);

  // Apply selected theme
  const handleApplyTheme = () => {
    setTheme(selectedGameStyle);
    toast.success(
      selectedGameStyle === 'minecraft' 
        ? '🎮 Minecraft 3D theme activated!' 
        : '✓ Default theme applied',
      { duration: 3000 }
    );
  };

  const loading = authLoading || enterpriseLoading || roleLoading || adminLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Require enterprise subscription OR admin role
  if (!isEnterprise && !isAdmin) {
    return <Navigate to="/upgrade" replace />;
  }

  // Mock organization data - in production, fetch from organizations table
  const organization = {
    id: 'org_1',
    name: 'Acme Corporation',
    contractStartDate: '2025-01-01',
    contractEndDate: '2026-12-31',
    maxSeats: 50,
    usedSeats: 45,
    customPricePerSeat: 79,
    defaultPricePerSeat: 99,
    tier: tier || 'executive',
  };

  const contractDaysRemaining = Math.ceil(
    (new Date(organization.contractEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Pipeline summary calculations
  const pipelineSummary = calculatePipelineSummary(deals);

  // Deal handlers
  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setDrawerOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealModalOpen(true);
  };

  const handleAddDeal = () => {
    setEditingDeal(null);
    setDealModalOpen(true);
  };

  const handleSaveDeal = (dealData: Partial<Deal>) => {
    if (dealData.id) {
      // Update existing deal
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealData.id ? { ...d, ...dealData, updatedAt: new Date() } : d
        )
      );
      toast.success('Deal updated successfully');
    } else {
      // Create new deal
      const newDeal: Deal = {
        id: `deal-${Date.now()}`,
        name: dealData.name || '',
        company: dealData.company || '',
        contactName: dealData.contactName || '',
        contactEmail: dealData.contactEmail || '',
        value: dealData.value || 0,
        currency: 'USD',
        stage: dealData.stage || 'lead',
        healthScore: 65,
        healthStatus: 'on_track',
        owner: dealData.owner || 'user-1',
        ownerName: dealData.ownerName || 'Alex Thompson',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCallDate: null,
        lastCallSummary: null,
        daysSinceLastCall: 0,
        nextAction: 'Schedule initial discovery call',
        nextActionDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        buyingSignals: [],
        objections: [],
        competitorMentions: [],
        calls: [],
      };
      setDeals((prev) => [newDeal, ...prev]);
      toast.success('Deal created successfully');
    }
    setDealModalOpen(false);
  };

  const handleStageChange = (dealId: string, newStage: DealStage) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: newStage, updatedAt: new Date() } : d
      )
    );
    toast.success('Deal stage updated');
  };

  return (
    <DashboardLayout>
      {/* Dark gradient background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#111133] to-[#0a0a1f] -z-10" />
      
      <div className="space-y-8 animate-fade-in relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Enterprise Dashboard
                </h1>
                <p className="text-muted-foreground mt-0.5">
                  Revenue intelligence, deals, and organization management
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium gap-1 ml-2">
                <Crown className="h-3 w-3" />
                {tier === 'executive' ? 'Executive' : 'Staff'}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 p-4 rounded-xl bg-card/30 backdrop-blur-xl border border-white/[0.08]">
            <span className="text-lg font-semibold text-foreground">{organization.name}</span>
            <span className="text-sm text-muted-foreground font-mono">ID: {organization.id}</span>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="deals" className="space-y-6">
          <TabsList className="bg-card/30 backdrop-blur-xl border border-white/[0.08] p-1 h-auto flex-wrap">
            <TabsTrigger 
              value="deals" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Phone className="h-4 w-4" />
              Call Activity
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Users className="h-4 w-4" />
              Users & Seats
            </TabsTrigger>
            <TabsTrigger 
              value="gamemode" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Palette className="h-4 w-4" />
              Game Mode
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Shield className="h-4 w-4" />
              Organization Settings
            </TabsTrigger>
            <TabsTrigger 
              value="log" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <FileText className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>
          
          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6 animate-fade-in">
            {/* Pipeline Summary */}
            <PipelineSummaryBar
              atRiskCount={pipelineSummary.atRiskCount}
              atRiskValue={pipelineSummary.atRiskValue}
              monitorCount={pipelineSummary.monitorCount}
              monitorValue={pipelineSummary.monitorValue}
              onTrackCount={pipelineSummary.onTrackCount}
              onTrackValue={pipelineSummary.onTrackValue}
              totalValue={pipelineSummary.totalValue}
              activeFilter={healthFilter}
              onFilterChange={setHealthFilter}
            />

            {/* View Toggle & Add Deal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-card rounded-lg border p-1">
                <Button
                  variant={dealsViewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDealsViewMode('table')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Table
                </Button>
                <Button
                  variant={dealsViewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDealsViewMode('kanban')}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Board
                </Button>
              </div>
              <Button onClick={handleAddDeal}>
                + Add Deal
              </Button>
            </div>

            {/* Deals View */}
            {dealsViewMode === 'table' ? (
              <DealsTable
                deals={deals}
                healthFilter={healthFilter}
                onEditDeal={handleViewDeal}
              />
            ) : (
              <DealsKanban
                deals={deals.filter(
                  (d) => healthFilter === 'all' || d.healthStatus === healthFilter
                )}
                onDealClick={handleViewDeal}
                onStageChange={handleStageChange}
              />
            )}

            {/* Deal Detail Drawer */}
            <DealDetailDrawer
              deal={selectedDeal}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            />

            {/* Deal Modal */}
            <DealModal
              open={dealModalOpen}
              onOpenChange={setDealModalOpen}
              deal={editingDeal}
              onSave={handleSaveDeal}
            />
          </TabsContent>

          {/* Call Activity Tab */}
          <TabsContent value="activity" className="space-y-6 animate-fade-in">
            <ActivityFeed
              activities={mockCallActivities}
              onViewAnalysis={(id) => {
                toast.info('Opening call analysis...');
                // Navigate to /recordings/{id} or open modal
              }}
              onLinkToDeal={(id) => {
                toast.info('Link to deal dialog would open');
              }}
            />
          </TabsContent>

          {/* Users & Seats Tab */}
          <TabsContent value="users" className="space-y-6 animate-fade-in">
            {/* Contract Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] border-t-4 border-t-primary shadow-xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 relative">
                  <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Contract Period
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(organization.contractStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {new Date(organization.contractEndDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {contractDaysRemaining > 0 
                      ? `${contractDaysRemaining} days remaining`
                      : 'Contract expired'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] border-t-4 border-t-green-500 shadow-xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 relative">
                  <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Contracted Seats
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg font-semibold text-foreground">{organization.maxSeats} seats</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${organization.customPricePerSeat}/seat/month
                    <span className="line-through ml-1 text-muted-foreground/60">${organization.defaultPricePerSeat}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] border-t-4 border-t-cyan-500 shadow-xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 relative">
                  <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Active Users
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg font-semibold text-foreground">
                    <span className="text-cyan-400">{organization.usedSeats}</span> / {organization.maxSeats}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{organization.maxSeats - organization.usedSeats} seats available</p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] border-t-4 border-t-purple-500 shadow-xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 relative">
                  <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Monthly Cost
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg font-semibold text-foreground">
                    ${(organization.usedSeats * organization.customPricePerSeat).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    Saving ${((organization.defaultPricePerSeat - organization.customPricePerSeat) * organization.usedSeats).toLocaleString()}/mo
                  </p>
                </CardContent>
              </Card>
            </div>

            <EnterpriseSeatManagement teamId={teamId || undefined} />
          </TabsContent>

          {/* Game Mode Tab */}
          <TabsContent value="gamemode" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Default (Original) */}
              <Card 
                className={`bg-card/30 backdrop-blur-xl border-2 overflow-hidden cursor-pointer transition-all ${
                  selectedGameStyle === 'default' 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}
                onClick={() => setSelectedGameStyle('default')}
              >
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Default</h3>
                    {selectedGameStyle === 'default' && (
                      <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800/50 p-2 rounded text-center">
                      <p className="text-xs text-gray-300">$1.2M</p>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded text-center">
                      <p className="text-xs text-gray-300">89</p>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded text-center">
                      <p className="text-xs text-gray-300">78%</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 w-4/5" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Original SellSig interface - clean and professional</p>
                </CardContent>
              </Card>

              {/* Minecraft 3D */}
              <Card 
                className={`bg-card/30 backdrop-blur-xl border-2 overflow-hidden cursor-pointer transition-all ${
                  selectedGameStyle === 'minecraft' 
                    ? 'border-amber-500 shadow-lg shadow-amber-500/20' 
                    : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}
                onClick={() => setSelectedGameStyle('minecraft')}
              >
                <div className="aspect-video bg-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase text-white tracking-wider">Minecraft 3D</h3>
                    {selectedGameStyle === 'minecraft' && (
                      <span className="px-2 py-0.5 bg-amber-600 text-white font-black text-xs border-b-2 border-amber-800">Selected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-950 border-2 border-gray-600 p-2 text-center">
                      <p className="text-xs font-black text-amber-400">$1.2M</p>
                    </div>
                    <div className="bg-gray-950 border-2 border-gray-600 p-2 text-center">
                      <p className="text-xs font-black text-green-400">89</p>
                    </div>
                    <div className="bg-gray-950 border-2 border-gray-600 p-2 text-center">
                      <p className="text-xs font-black text-blue-400">78%</p>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-950 border-2 border-gray-600">
                    <div className="h-full bg-amber-500" style={{ width: '80%' }} />
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Blocky, voxel-style with 3D depth and beveled edges</p>
                </CardContent>
              </Card>
            </div>

            {/* Selected Style Info */}
            {selectedGameStyle && (
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                        {selectedGameStyle === 'minecraft' && <span className="text-2xl">🎮</span>}
                        {selectedGameStyle === 'default' && <span className="text-2xl">✓</span>}
                        {selectedGameStyle === 'minecraft' ? 'Minecraft 3D' : 'Default'} Mode Selected
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedGameStyle === 'minecraft' 
                          ? 'Blocky 3D style with raised buttons and beveled edges will be applied across the platform.'
                          : 'Original SellSig interface - clean and professional.'}
                      </p>
                    </div>
                    <Button 
                      onClick={handleApplyTheme}
                      className={selectedGameStyle === 'minecraft' ? 'bg-amber-600 hover:bg-amber-500' : ''}
                    >
                      {selectedGameStyle === theme ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Active
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Apply Theme
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Organization Settings Tab */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OrganizationSSOConfig />
              <OrganizationBilling />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OrganizationDataExport />
              <OrganizationSecurityCompliance />
            </div>
            <OrganizationIntegrations />
          </TabsContent>
          
          {/* Activity Log Tab */}
          <TabsContent value="log" className="space-y-6 animate-fade-in">
            <EnterpriseActivityLog organizationId={organization.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
