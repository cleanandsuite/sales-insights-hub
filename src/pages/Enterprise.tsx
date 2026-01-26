import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Navigate } from 'react-router-dom';
import { Loader2, Building2, Crown, Calendar, FileText, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnterpriseSeatManagement } from '@/components/enterprise/EnterpriseSeatManagement';
import { EnterpriseActivityLog } from '@/components/enterprise/EnterpriseActivityLog';

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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Enterprise Management</h1>
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium gap-1">
                <Crown className="h-3 w-3" />
                {tier === 'executive' ? 'Executive' : 'Staff'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Manage your organization's seats, users, and enterprise settings
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-lg font-semibold text-foreground">{organization.name}</span>
            <span className="text-sm text-muted-foreground">Organization ID: {organization.id}</span>
          </div>
        </div>

        {/* Contract Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-t-4 border-t-primary bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Contract Period
              </CardDescription>
            </CardHeader>
            <CardContent>
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

          <Card className="border-t-4 border-t-emerald-500 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Contracted Seats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">{organization.maxSeats} seats</p>
              <p className="text-sm text-muted-foreground mt-1">
                ${organization.customPricePerSeat}/seat/month
                <span className="line-through ml-1 text-muted-foreground/60">${organization.defaultPricePerSeat}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-cyan-500 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Enterprise Tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground capitalize">{organization.tier}</p>
              <p className="text-sm text-muted-foreground mt-1">Full feature access</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-500 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                Monthly Cost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                ${(organization.usedSeats * organization.customPricePerSeat).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {organization.usedSeats} active seats
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seat Management Section */}
        <EnterpriseSeatManagement teamId={teamId || undefined} />

        {/* Activity Log */}
        <EnterpriseActivityLog organizationId={organization.id} />

        {/* Future Expansion: Organization Settings */}
        <Card className="bg-card/50 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              SSO/SAML configuration, billing details, and advanced settings coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                <p className="font-medium text-muted-foreground">SSO Configuration</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Coming soon</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                <p className="font-medium text-muted-foreground">Billing & Invoices</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Coming soon</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                <p className="font-medium text-muted-foreground">Data Export</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
