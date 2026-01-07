import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, Loader2, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';

const MAX_INVITES = 10;

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'manager']),
  message: z.string().max(500).optional(),
});

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export function InvitesTab() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: '',
  });

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('invited_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sentCount = invitations.length;
  const canSendMore = sentCount < MAX_INVITES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!canSendMore) {
      toast.error(`You've reached the maximum of ${MAX_INVITES} invites`);
      return;
    }

    const result = inviteSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSending(true);

    try {
      // Check if user has a team
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let teamId = teamMember?.team_id;

      // If no team, create one
      if (!teamId) {
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: 'My Team',
            owner_id: user.id,
          })
          .select('id')
          .single();

        if (teamError) throw teamError;
        teamId = newTeam.id;

        // Add user as team owner
        await supabase.from('team_members').insert({
          team_id: teamId,
          user_id: user.id,
          role: 'owner',
        });
      }

      // Generate invite token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('team_invitations').insert({
        team_id: teamId,
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        invited_by: user.id,
        invitation_token: token,
        token_expires_at: expiresAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${formData.email}!`);
      setFormData({ email: '', role: 'member', message: '' });
      fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      if (error.code === '23505') {
        toast.error('This email has already been invited');
      } else {
        toast.error('Failed to send invitation');
      }
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'pending') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
    }
    
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success/20 text-success"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Mail className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'declined':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Beta Invites</h2>
          <p className="text-sm text-muted-foreground">
            Invite colleagues to try the app ({sentCount}/{MAX_INVITES} used)
          </p>
        </div>
        <Badge variant={canSendMore ? 'secondary' : 'destructive'}>
          {MAX_INVITES - sentCount} remaining
        </Badge>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="colleague@company.com"
              disabled={!canSendMore}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              disabled={!canSendMore}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Team Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Personal Message (optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Add a personal note to your invitation..."
            rows={2}
            disabled={!canSendMore}
          />
        </div>
        <Button type="submit" disabled={sending || !canSendMore} className="gap-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send Invitation
        </Button>
      </form>

      {/* Invitations Table */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Sent Invitations</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell className="capitalize">{inv.role}</TableCell>
                    <TableCell>{getStatusBadge(inv.status, inv.expires_at)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
