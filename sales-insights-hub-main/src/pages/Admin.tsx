import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Crown, 
  UserPlus, 
  Trash2, 
  Loader2,
  Building2,
  CreditCard,
  Mail,
  Check,
  X,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';

// Enterprise pricing tiers
const ENTERPRISE_TIERS = {
  executive: {
    name: 'Executive User',
    priceId: 'price_1Srk7JAksiqydspmFvSXbkMJ',
    productId: 'prod_TpOv24ILHez3Aa',
    price: 150,
    description: 'Full platform access with team management authority',
  },
  staff: {
    name: 'Staff Addon',
    priceId: 'price_1Srk7KAksiqydspm7I3lNLAD',
    productId: 'prod_TpOvxEIGmMMCuW',
    price: 99,
    description: 'Core platform features for team members',
  },
};

interface EnterpriseUser {
  id: string;
  user_id: string;
  tier: 'executive' | 'staff';
  email: string;
  full_name: string | null;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  created_by: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  tier: 'executive' | 'staff';
  invited_at: string;
  expires_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { initiateCheckout } = useEnterpriseSubscription();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [enterpriseUsers, setEnterpriseUsers] = useState<EnterpriseUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserTier, setNewUserTier] = useState<'executive' | 'staff'>('staff');
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [purchaseTier, setPurchaseTier] = useState<'executive' | 'staff'>('executive');
  const [addingUser, setAddingUser] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Handle checkout success/cancel from URL params
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const tier = searchParams.get('tier');
    
    if (checkoutStatus === 'success') {
      toast({
        title: 'Subscription activated!',
        description: `${tier === 'executive' ? 'Executive' : 'Staff'} subscription is now active.`,
      });
      fetchEnterpriseUsers();
    } else if (checkoutStatus === 'canceled') {
      toast({
        variant: 'destructive',
        title: 'Checkout canceled',
        description: 'The subscription purchase was canceled.',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAdmin) {
      fetchEnterpriseUsers();
    }
  }, [isAdmin]);

  const fetchEnterpriseUsers = async () => {
    setLoading(true);
    try {
      // Fetch users with enterprise subscriptions using raw query for new tables
      const { data: users, error } = await supabase
        .from('enterprise_users' as any)
        .select('id, user_id, tier, status, created_at, created_by')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each user
      if (users && Array.isArray(users)) {
        const usersWithProfiles = await Promise.all(
          (users as any[]).map(async (u) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', u.user_id)
              .maybeSingle();

            return {
              ...u,
              email: u.user_id,
              full_name: profile?.full_name || null,
            } as EnterpriseUser;
          })
        );
        setEnterpriseUsers(usersWithProfiles);
      }

      // Fetch pending invites
      const { data: invites, error: invitesError } = await supabase
        .from('enterprise_invitations' as any)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!invitesError && invites && Array.isArray(invites)) {
        setPendingInvites((invites as any[]).map(inv => ({
          id: inv.id,
          email: inv.email,
          tier: inv.tier as 'executive' | 'staff',
          invited_at: inv.created_at,
          expires_at: inv.expires_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching enterprise users:', error);
      // Tables may not exist yet, that's OK
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast({ variant: 'destructive', title: 'Please enter an email address' });
      return;
    }

    setAddingUser(true);
    try {
      // Check if user already exists by email in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .ilike('full_name', `%${newUserEmail}%`)
        .maybeSingle();

      if (existingProfile) {
        // Add existing user to enterprise
        const { error } = await supabase
          .from('enterprise_users' as any)
          .insert({
            user_id: existingProfile.user_id,
            tier: newUserTier,
            status: 'active',
            created_by: user?.id,
          });

        if (error) throw error;
        toast({ title: `${newUserTier === 'executive' ? 'Executive' : 'Staff'} user added successfully!` });
      } else {
        // Create invitation for new user
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

        const { error } = await supabase
          .from('enterprise_invitations' as any)
          .insert({
            email: newUserEmail,
            tier: newUserTier,
            invited_by: user?.id,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
          });

        if (error) throw error;
        toast({ title: 'Invitation sent!', description: `An invitation has been sent to ${newUserEmail}` });
      }

      setNewUserEmail('');
      setIsAddUserOpen(false);
      fetchEnterpriseUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({ variant: 'destructive', title: 'Failed to add user' });
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('enterprise_users' as any)
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast({ title: 'User removed from enterprise plan' });
      fetchEnterpriseUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({ variant: 'destructive', title: 'Failed to remove user' });
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('enterprise_invitations' as any)
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      
      toast({ title: 'Invitation cancelled' });
      fetchEnterpriseUsers();
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast({ variant: 'destructive', title: 'Failed to cancel invitation' });
    }
  };

  const handleChangeTier = async (userId: string, newTier: 'executive' | 'staff') => {
    try {
      const { error } = await supabase
        .from('enterprise_users' as any)
        .update({ tier: newTier })
        .eq('id', userId);

      if (error) throw error;
      
      toast({ title: `User upgraded to ${newTier === 'executive' ? 'Executive' : 'Staff'}` });
      fetchEnterpriseUsers();
    } catch (error) {
      console.error('Error changing tier:', error);
      toast({ variant: 'destructive', title: 'Failed to change tier' });
    }
  };

  const handlePurchaseSubscription = async () => {
    if (!purchaseEmail.trim()) {
      toast({ variant: 'destructive', title: 'Please enter an email address' });
      return;
    }

    setProcessingCheckout(true);
    try {
      const result = await initiateCheckout(purchaseTier, purchaseEmail);
      
      if (result.success) {
        toast({
          title: 'Redirecting to checkout...',
          description: 'Complete the payment in the new tab.',
        });
        setIsPurchaseOpen(false);
        setPurchaseEmail('');
      } else {
        throw new Error(result.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (adminLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const executiveCount = enterpriseUsers.filter(u => u.tier === 'executive' && u.status === 'active').length;
  const staffCount = enterpriseUsers.filter(u => u.tier === 'staff' && u.status === 'active').length;
  const monthlyRevenue = (executiveCount * 150) + (staffCount * 99);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">Manage enterprise users and billing</p>
          </div>
          
          <div className="flex gap-2">
            {/* Purchase Subscription Dialog */}
            <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                  <ShoppingCart className="h-4 w-4" />
                  Purchase Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Purchase Enterprise Subscription
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase-email">User Email</Label>
                    <Input
                      id="purchase-email"
                      type="email"
                      placeholder="user@company.com"
                      value={purchaseEmail}
                      onChange={(e) => setPurchaseEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The subscription will be linked to this email address
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase-tier">Subscription Tier</Label>
                    <Select value={purchaseTier} onValueChange={(v) => setPurchaseTier(v as 'executive' | 'staff')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-warning" />
                            Executive User - $150/mo
                          </div>
                        </SelectItem>
                        <SelectItem value="staff">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Staff Addon - $99/mo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Pricing summary */}
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Total</span>
                      <span className="text-xl font-bold text-foreground">
                        ${purchaseTier === 'executive' ? '150' : '99'}/mo
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPurchaseOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePurchaseSubscription} disabled={processingCheckout} className="gap-2">
                    {processingCheckout ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Checkout with Stripe
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User Manually
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Enterprise User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@company.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier">User Tier</Label>
                    <Select value={newUserTier} onValueChange={(v) => setNewUserTier(v as 'executive' | 'staff')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-warning" />
                            Executive User ($150/mo)
                          </div>
                        </SelectItem>
                        <SelectItem value="staff">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Staff Addon ($99/mo)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {newUserTier === 'executive' 
                        ? 'Full platform access with team management authority'
                        : 'Core platform features for team members'}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} disabled={addingUser}>
                    {addingUser ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add User'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Executive Users</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                {executiveCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">${executiveCount * 150}/mo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Staff Users</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {staffCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">${staffCount * 99}/mo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Invites</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                {pendingInvites.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Awaiting acceptance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Revenue</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                ${monthlyRevenue.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Enterprise subscriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Enterprise Pricing Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold">Executive User</h3>
                  <Badge variant="outline" className="ml-auto">$150/mo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full platform access with team management authority. Can add and manage staff accounts.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Staff Addon</h3>
                  <Badge variant="outline" className="ml-auto">$99/mo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Core platform features for team members. Access to recordings, coaching, and analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enterprise Users</CardTitle>
            <CardDescription>Manage all users with enterprise access</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enterpriseUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No enterprise users yet</p>
                <Button onClick={() => setIsAddUserOpen(true)} variant="outline" className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First User
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enterpriseUsers.map((eu) => (
                    <TableRow key={eu.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{eu.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{eu.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={eu.tier}
                          onValueChange={(v) => handleChangeTier(eu.id, v as 'executive' | 'staff')}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="executive">
                              <span className="flex items-center gap-2">
                                <Crown className="h-3 w-3 text-warning" />
                                Executive
                              </span>
                            </SelectItem>
                            <SelectItem value="staff">
                              <span className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Staff
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={eu.status === 'active' ? 'default' : 'secondary'}>
                          {eu.status === 'active' && <Check className="h-3 w-3 mr-1" />}
                          {eu.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(eu.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveUser(eu.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Users who haven't accepted their invitation yet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant={invite.tier === 'executive' ? 'default' : 'secondary'}>
                          {invite.tier === 'executive' && <Crown className="h-3 w-3 mr-1" />}
                          {invite.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invite.invited_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
