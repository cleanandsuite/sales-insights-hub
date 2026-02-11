import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Navigate } from 'react-router-dom';
import { Loader2, Building2, Crown, Calendar, FileText, Shield, Users, TrendingUp, Phone, LayoutGrid, List, Plus, Palette, Zap, Sparkles, Target, Crosshair } from 'lucide-react';
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

  // Deals state
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'all'>('all');
  const [dealsViewMode, setDealsViewMode] = useState<'table' | 'kanban'>('table');
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGameStyle, setSelectedGameStyle] = useState<string | null>(null);

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
              {/* Minimal Dark */}
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] overflow-hidden group hover:bg-card/40 transition-all cursor-pointer">
                <div className="aspect-video bg-gray-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Minimal Dark</h3>
                    <Badge variant="outline" className="border-gray-700 text-gray-400">Clean</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-900/50 p-2 rounded text-center">
                      <p className="text-xs text-emerald-400">$1.2M</p>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded text-center">
                      <p className="text-xs text-blue-400">89</p>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded text-center">
                      <p className="text-xs text-amber-400">78%</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-4/5" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Clean, modern interface with subtle accents</p>
                  <Button 
                    className="w-full" 
                    variant={selectedGameStyle === 'minimal' ? 'default' : 'outline'}
                    onClick={() => setSelectedGameStyle('minimal')}
                  >
                    {selectedGameStyle === 'minimal' ? 'Selected' : 'Select Style'}
                  </Button>
                </CardContent>
              </Card>

              {/* Minecraft 3D */}
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] overflow-hidden group hover:bg-card/40 transition-all cursor-pointer">
                <div className="aspect-video bg-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase text-white tracking-wider">Minecraft 3D</h3>
                    <span className="px-2 py-0.5 bg-amber-600 text-white font-black text-xs border-b-2 border-amber-800">Boxy</span>
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
                  <p className="text-sm text-muted-foreground mb-3">Blocky, voxel-style with 3D depth and beveled edges</p>
                  <Button 
                    className="w-full" 
                    variant={selectedGameStyle === 'minecraft' ? 'default' : 'outline'}
                    onClick={() => setSelectedGameStyle('minecraft')}
                  >
                    {selectedGameStyle === 'minecraft' ? 'Selected' : 'Select Style'}
                  </Button>
                </CardContent>
              </Card>

              {/* Cyberpunk */}
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] overflow-hidden group hover:bg-card/40 transition-all cursor-pointer">
                <div className="aspect-video bg-slate-950 p-4 space-y-3 relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 blur-xl rounded-full" />
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-bold text-cyan-400 tracking-widest">Cyberpunk</h3>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 font-mono text-xs border border-cyan-500/50">Neon</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-slate-900/80 p-2 rounded text-center border border-slate-700">
                      <p className="text-xs font-bold text-cyan-400 drop-shadow-lg">$1.2M</p>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded text-center border border-slate-700">
                      <p className="text-xs font-bold text-pink-400 drop-shadow-lg">89</p>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded text-center border border-slate-700">
                      <p className="text-xs font-bold text-amber-400 drop-shadow-lg">78%</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded relative z-10">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 w-4/5 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Neon glow effects with futuristic HUD design</p>
                  <Button 
                    className="w-full" 
                    variant={selectedGameStyle === 'cyberpunk' ? 'default' : 'outline'}
                    onClick={() => setSelectedGameStyle('cyberpunk')}
                  >
                    {selectedGameStyle === 'cyberpunk' ? 'Selected' : 'Select Style'}
                  </Button>
                </CardContent>
              </Card>

              {/* RPG Adventure */}
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] overflow-hidden group hover:bg-card/40 transition-all cursor-pointer">
                <div className="aspect-video bg-stone-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif text-amber-400">RPG Adventure</h3>
                    <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 font-serif text-xs border border-amber-700">Quest</span>
                  </div>
                  <div className="flex gap-2 p-2 bg-stone-800/50 rounded border border-stone-700">
                    <div className="h-10 w-10 rounded bg-amber-900/30 border-2 border-amber-600 flex items-center justify-center text-xl">🎯</div>
                    <div>
                      <p className="font-serif text-sm text-amber-100">AGENT</p>
                      <p className="text-xs text-stone-400">LVL 12 • Hunter</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-stone-800/50 rounded text-center border border-stone-700">
                      <p className="text-sm font-serif text-amber-400">$1.2M</p>
                    </div>
                    <div className="p-2 bg-stone-800/50 rounded text-center border border-stone-700">
                      <p className="text-sm font-serif text-green-400">89</p>
                    </div>
                    <div className="p-2 bg-stone-800/50 rounded text-center border border-stone-700">
                      <p className="text-sm font-serif text-blue-400">78%</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Character-focused with quest/mission framing</p>
                  <Button 
                    className="w-full" 
                    variant={selectedGameStyle === 'rpg' ? 'default' : 'outline'}
                    onClick={() => setSelectedGameStyle('rpg')}
                  >
                    {selectedGameStyle === 'rpg' ? 'Selected' : 'Select Style'}
                  </Button>
                </CardContent>
              </Card>

              {/* Retro Arcade */}
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] overflow-hidden group hover:bg-card/40 transition-all cursor-pointer">
                <div className="aspect-video bg-black p-4 space-y-3 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-bold text-red-500 tracking-widest" style={{ textShadow: '2px 2px 0 #ff0000' }}>Arcade</h3>
                    <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-xs animate-pulse">HIGH SCORE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-gray-900 p-2 rounded text-center border-2 border-gray-600">
                      <p className="text-xs font-bold text-yellow-400" style={{ textShadow: '2px 2px 0 #000' }}>$1.2M</p>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center border-2 border-gray-600">
                      <p className="text-xs font-bold text-cyan-400">89</p>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center border-2 border-gray-600">
                      <p className="text-xs font-bold text-red-400">LVL 12</p>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-900 border-2 border-gray-600 relative z-10">
                    <div className="h-full bg-yellow-500 animate-pulse" style={{ width: '80%' }} />
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Pixel fonts, scanlines, and high-score energy</p>
                  <Button 
                    className="w-full" 
                    variant={selectedGameStyle === 'arcade' ? 'default' : 'outline'}
                    onClick={() => setSelectedGameStyle('arcade')}
                  >
                    {selectedGameStyle === 'arcade' ? 'Selected' : 'Select Style'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Selected Style Info */}
            {selectedGameStyle && (
              <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white capitalize">{selectedGameStyle.replace('-', ' ')} Style Selected</h3>
                      <p className="text-sm text-muted-foreground">This style will be applied across the entire SellSig platform.</p>
                    </div>
                    <Button onClick={() => toast.success(`${selectedGameStyle} style applied!`)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Apply Style
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
