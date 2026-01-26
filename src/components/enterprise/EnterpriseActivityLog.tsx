import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, UserPlus, UserMinus, Shield, Mail, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogEntry {
  id: string;
  type: 'user_invited' | 'user_joined' | 'user_removed' | 'role_changed' | 'contract_updated' | 'invitation_resent';
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, string>;
}

interface EnterpriseActivityLogProps {
  organizationId: string;
}

export function EnterpriseActivityLog({ organizationId }: EnterpriseActivityLogProps) {
  // Mock activity data - in production, fetch from activity_logs table
  const [activities] = useState<ActivityLogEntry[]>([
    {
      id: '1',
      type: 'user_invited',
      title: 'User Invited',
      description: 'Emily Davis (emily@acme.com) was invited as Member',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actor: 'John Smith',
    },
    {
      id: '2',
      type: 'role_changed',
      title: 'Role Changed',
      description: 'Mike Chen role changed from Member to Manager',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      actor: 'Sarah Johnson',
    },
    {
      id: '3',
      type: 'user_joined',
      title: 'User Joined',
      description: 'Alex Turner accepted invitation and joined the organization',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'contract_updated',
      title: 'Contract Renewed',
      description: 'Enterprise contract extended until December 2026',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      actor: 'System',
    },
    {
      id: '5',
      type: 'user_removed',
      title: 'User Removed',
      description: 'Tom Wilson was removed from the organization',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      actor: 'John Smith',
    },
    {
      id: '6',
      type: 'invitation_resent',
      title: 'Invitation Resent',
      description: 'Invitation resent to pending@acme.com',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      actor: 'Sarah Johnson',
    },
  ]);

  const getActivityIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'user_invited':
        return <Mail className="h-4 w-4" />;
      case 'user_joined':
        return <UserPlus className="h-4 w-4" />;
      case 'user_removed':
        return <UserMinus className="h-4 w-4" />;
      case 'role_changed':
        return <Shield className="h-4 w-4" />;
      case 'contract_updated':
        return <RefreshCw className="h-4 w-4" />;
      case 'invitation_resent':
        return <Mail className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'user_invited':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'user_joined':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'user_removed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'role_changed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'contract_updated':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'invitation_resent':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          User additions, role changes, and organization updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-full border ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{activity.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                  {activity.actor && (
                    <p className="text-xs text-muted-foreground/70 mt-1">by {activity.actor}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* DB Integration Notes */}
        {/* 
          Production queries:
          
          SELECT * FROM organization_activity_logs
          WHERE organization_id = $1
          ORDER BY created_at DESC
          LIMIT 50;
          
          Insert on user actions:
          INSERT INTO organization_activity_logs (organization_id, type, title, description, actor_user_id)
          VALUES ($1, $2, $3, $4, auth.uid());
        */}
      </CardContent>
    </Card>
  );
}
