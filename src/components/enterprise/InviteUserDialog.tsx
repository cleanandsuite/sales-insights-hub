import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Mail, User, Shield, Users, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: { email: string; name: string; role: 'admin' | 'manager' | 'member' }) => { success: boolean; error?: string };
  remainingSeats: number;
}

export function InviteUserDialog({ open, onOpenChange, onInvite, remainingSeats }: InviteUserDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canInvite = remainingSeats > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !name) {
      setError('Please fill in all required fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!canInvite) {
      setError('No seats remaining. Contact sales to upgrade your contract.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = onInvite({ email, name, role });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('Invitation sent!', {
        description: `${name} will receive an email invitation to join your organization.`,
      });
      // Reset form
      setEmail('');
      setName('');
      setRole('member');
      onOpenChange(false);
    } else {
      setError(result.error || 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    setEmail('');
    setName('');
    setRole('member');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. They'll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>

        {!canInvite && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached your seat limit. Remove a user or contact sales to add more seats.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                disabled={!canInvite || isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                disabled={!canInvite || isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)} disabled={!canInvite || isSubmitting}>
              <SelectTrigger id="role" className="bg-background">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                <SelectItem value="member" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Member</p>
                      <p className="text-xs text-muted-foreground">Can access calls, coaching, and analytics</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manager" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-chart-2" />
                    <div>
                      <p className="font-medium">Manager</p>
                      <p className="text-xs text-muted-foreground">Can view team performance and assign leads</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-xs text-muted-foreground">Full access including user management</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>User receives email invitation</li>
              <li>Upon acceptance, 1 seat is allocated</li>
              <li>User can immediately access their dashboard</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canInvite || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          {remainingSeats} seat{remainingSeats !== 1 ? 's' : ''} remaining in your contract
        </p>
      </DialogContent>
    </Dialog>
  );
}
