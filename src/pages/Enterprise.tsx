import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Navigate } from 'react-router-dom';
import { Loader2, Building2, Crown, Calendar, FileText, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnterpriseSeatManagement } from '@/components/enterprise/EnterpriseSeatManagement';
import { EnterpriseActivityLog } from '@/components/enterprise/EnterpriseActivityLog';
import { OrganizationSSOConfig } from '@/components/enterprise/OrganizationSSOConfig';
import { OrganizationBilling } from '@/components/enterprise/OrganizationBilling';
import { OrganizationDataExport } from '@/components/enterprise/OrganizationDataExport';
import { OrganizationSecurityCompliance } from '@/components/enterprise/OrganizationSecurityCompliance';
import { OrganizationIntegrations } from '@/components/enterprise/OrganizationIntegrations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Enterprise() {
  const { user, loading: authLoading } = useAuth();
  const { isEnterprise, tier, loading: enterpriseLoading } = useEnterpriseSubscription();
  const { teamId, loading: roleLoading } = useUserRole();
  const { isAdmin, loading: adminLoading } = useAdminRole();

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
                  Enterprise Management
                </h1>
                <p className="text-muted-foreground mt-0.5">
                  Manage your organization's seats, users, and settings
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

          <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] border-t-4 border-t-emerald-500 shadow-xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <p className="text-sm text-emerald-400 mt-1">
                Saving ${((organization.defaultPricePerSeat - organization.customPricePerSeat) * organization.usedSeats).toLocaleString()}/mo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card/30 backdrop-blur-xl border border-white/[0.08] p-1 h-auto flex-wrap">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Users className="h-4 w-4" />
              Users & Seats
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Shield className="h-4 w-4" />
              Organization Settings
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <FileText className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>
          
          {/* Users & Seats Tab */}
          <TabsContent value="users" className="space-y-6 animate-fade-in">
            <EnterpriseSeatManagement teamId={teamId || undefined} />
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
          <TabsContent value="activity" className="space-y-6 animate-fade-in">
            <EnterpriseActivityLog organizationId={organization.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}