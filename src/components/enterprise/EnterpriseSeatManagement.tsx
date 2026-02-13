import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, UserPlus, AlertTriangle, Crown, 
  Building2, DollarSign, TrendingDown 
} from 'lucide-react';
import { SeatUsersTable } from './SeatUsersTable';
import { InviteUserDialog } from './InviteUserDialog';

export interface OrganizationSeats {
  id: string;
  name: string;
  maxSeats: number;
  usedSeats: number;
  customPricePerSeat: number;
  defaultPricePerSeat: number;
  contractStartDate: string;
  contractEndDate: string;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
  lastActiveAt?: string;
}

interface EnterpriseSeatManagementProps {
  teamId: string;
}

export function EnterpriseSeatManagement({ teamId }: EnterpriseSeatManagementProps) {
  // Mock organization data - In production, fetch from Supabase
  // Query: SELECT * FROM organizations WHERE id = ?
  const [organization] = useState<OrganizationSeats>({
    id: 'org-001',
    name: 'Acme Corporation',
    maxSeats: 50,
    usedSeats: 45,
    customPricePerSeat: 79,
    defaultPricePerSeat: 99,
    contractStartDate: '2025-01-01',
    contractEndDate: '2026-12-31',
  });

  // Mock members data - In production, fetch from Supabase
  // Query: SELECT u.*, p.full_name, p.avatar_url FROM users u 
  //        JOIN profiles p ON p.user_id = u.id 
  //        WHERE u.organization_id = ? AND u.active = true
  const [members, setMembers] = useState<OrgMember[]>([
    { id: '1', name: 'John Smith', email: 'john@acme.com', role: 'admin', joinedAt: '2025-01-15', status: 'active', lastActiveAt: '2026-01-26' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@acme.com', role: 'manager', joinedAt: '2025-02-10', status: 'active', lastActiveAt: '2026-01-25' },
    { id: '3', name: 'Mike Chen', email: 'mike@acme.com', role: 'member', joinedAt: '2025-03-05', status: 'active', lastActiveAt: '2026-01-24' },
    { id: '4', name: 'Emily Davis', email: 'emily@acme.com', role: 'member', joinedAt: '2025-04-20', status: 'pending', lastActiveAt: undefined },
    { id: '5', name: 'Alex Wilson', email: 'alex@acme.com', role: 'member', joinedAt: '2025-05-12', status: 'active', lastActiveAt: '2026-01-23' },
  ]);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const remainingSeats = organization.maxSeats - organization.usedSeats;
  const seatUsagePercent = (organization.usedSeats / organization.maxSeats) * 100;
  const isLowSeats = remainingSeats <= Math.ceil(organization.maxSeats * 0.1);
  const isOverLimit = organization.usedSeats >= organization.maxSeats;
  const monthlySavings = (organization.defaultPricePerSeat - organization.customPricePerSeat) * organization.usedSeats;

  const handleInviteUser = (data: { email: string; name: string; role: 'admin' | 'manager' | 'member' }) => {
    if (isOverLimit) {
      return { success: false, error: 'No seats remaining. Contact sales to upgrade your contract.' };
    }

    // In production: INSERT INTO organization_invites (organization_id, email, name, role) VALUES (?, ?, ?, ?)
    // Then send invite email via edge function
    const newMember: OrgMember = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      role: data.role,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setMembers(prev => [...prev, newMember]);
    // In production: UPDATE organizations SET current_seats_used = current_seats_used + 1 WHERE id = ?
    
    return { success: true };
  };

  const handleRemoveUser = (userId: string) => {
    // In production: UPDATE users SET active = false WHERE id = ?
    // Then: UPDATE organizations SET current_seats_used = current_seats_used - 1 WHERE id = ?
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  const handleUpdateRole = (userId: string, newRole: 'admin' | 'manager' | 'member') => {
    // In production: UPDATE users SET role = ? WHERE id = ?
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {isOverLimit && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Seat Limit Reached</AlertTitle>
          <AlertDescription>
            You've used all contracted seats. Contact your account manager to upgrade your contract.
            <Button variant="link" className="ml-2 p-0 h-auto text-destructive-foreground underline">
              Contact Sales →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLowSeats && !isOverLimit && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600">Low Seats Warning</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            Only {remainingSeats} seats remaining ({(remainingSeats / organization.maxSeats * 100).toFixed(0)}%). 
            Consider upgrading your contract to accommodate team growth.
            <Button variant="link" className="ml-2 p-0 h-auto text-amber-600 underline">
              Request Upgrade →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Seat Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contracted Seats Card */}
        <Card className="border-t-4 border-t-primary bg-gradient-to-br from-card to-muted/20">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Contracted Seats</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{organization.maxSeats}</span>
              <Badge variant="outline" className="text-xs">
                Enterprise
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Contract ends {new Date(organization.contractEndDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Used Seats Card */}
        <Card className="border-t-4 border-t-chart-2 bg-gradient-to-br from-card to-muted/20">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Users className="h-5 w-5 text-chart-2" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Used Seats</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{organization.usedSeats}</span>
              <span className="text-sm text-muted-foreground">/ {organization.maxSeats}</span>
            </div>
            <div className="mt-3 space-y-1">
              <Progress 
                value={seatUsagePercent} 
                className={`h-2 ${seatUsagePercent >= 90 ? '[&>div]:bg-destructive' : seatUsagePercent >= 75 ? '[&>div]:bg-amber-500' : ''}`}
              />
              <p className="text-xs text-muted-foreground text-right">{seatUsagePercent.toFixed(0)}% used</p>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Seats Card */}
        <Card className={`border-t-4 ${isOverLimit ? 'border-t-destructive' : isLowSeats ? 'border-t-amber-500' : 'border-t-success'} bg-gradient-to-br from-card to-muted/20`}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${isOverLimit ? 'bg-destructive/10' : isLowSeats ? 'bg-amber-500/10' : 'bg-success/10'}`}>
                <UserPlus className={`h-5 w-5 ${isOverLimit ? 'text-destructive' : isLowSeats ? 'text-amber-500' : 'text-success'}`} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Remaining Seats</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${isOverLimit ? 'text-destructive' : isLowSeats ? 'text-amber-500' : 'text-success'}`}>
                {remainingSeats}
              </span>
              {isOverLimit && <Badge variant="destructive">Limit Reached</Badge>}
              {isLowSeats && !isOverLimit && <Badge className="bg-amber-500 text-white">Low</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available for new team members
            </p>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card className="border-t-4 border-t-chart-4 bg-gradient-to-br from-card to-muted/20">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <DollarSign className="h-5 w-5 text-chart-4" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Per Seat Rate</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">${organization.customPricePerSeat}</span>
              <span className="text-sm text-muted-foreground line-through">${organization.defaultPricePerSeat}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-success">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs font-medium">
                Save ${monthlySavings}/mo with enterprise pricing
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manage Seats & Users Section */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Crown className="h-5 w-5 text-primary" />
                Manage Seats & Users
              </CardTitle>
              <CardDescription className="mt-1">
                Invite team members and manage user access for {organization.name}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setInviteDialogOpen(true)}
              disabled={isOverLimit}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SeatUsersTable 
            members={members}
            onRemoveUser={handleRemoveUser}
            onUpdateRole={handleUpdateRole}
          />
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInviteUser}
        remainingSeats={remainingSeats}
      />
    </div>
  );
}
