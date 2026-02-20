import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Crown, Shield, User, MoreVertical, ArrowUp, ArrowDown, Trash2, Phone, Target } from 'lucide-react';

interface TeamMemberStats {
  user_id: string;
  full_name: string;
  role: string;
  total_calls: number;
  avg_score: number;
  active_leads: number;
  joined_at: string;
}

interface TeamMemberCardProps {
  member: TeamMemberStats;
  isOwner: boolean;
  isCurrentUser: boolean;
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
  onRemove: (userId: string) => void;
}

export function TeamMemberCard({
  member,
  isOwner,
  isCurrentUser,
  onPromote,
  onDemote,
  onRemove
}: TeamMemberCardProps) {
  const [loading, setLoading] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-warning" />;
      case 'manager': return <Shield className="h-4 w-4 text-primary" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Owner</Badge>;
      case 'manager':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Manager</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Member</Badge>;
    }
  };

  const handleAction = async (action: () => void) => {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          {getRoleIcon(member.role)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">
              {member.full_name}
              {isCurrentUser && <span className="text-muted-foreground text-sm ml-1">(you)</span>}
            </p>
            {getRoleBadge(member.role)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {member.total_calls} calls
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {member.active_leads} leads
            </span>
            {member.avg_score > 0 && (
              <span className="font-medium text-primary">
                Score: {member.avg_score}
              </span>
            )}
          </div>
        </div>
      </div>

      {isOwner && !isCurrentUser && member.role !== 'owner' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={loading}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role === 'member' && (
              <DropdownMenuItem onClick={() => handleAction(() => onPromote(member.user_id))}>
                <ArrowUp className="h-4 w-4 mr-2 text-primary" />
                Promote to Manager
              </DropdownMenuItem>
            )}
            {member.role === 'manager' && (
              <DropdownMenuItem onClick={() => handleAction(() => onDemote(member.user_id))}>
                <ArrowDown className="h-4 w-4 mr-2 text-warning" />
                Demote to Member
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleAction(() => onRemove(member.user_id))}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from Team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
