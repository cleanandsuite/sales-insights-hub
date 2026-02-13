import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, Phone, Users, Target, TrendingUp, Sparkles, 
  Calendar, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnterpriseActivityFeedProps {
  teamId: string;
}

interface ActivityItem {
  id: string;
  type: 'call' | 'lead' | 'goal' | 'score';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  metadata?: {
    score?: number;
    duration?: number;
    leadName?: string;
  };
}

export function EnterpriseActivityFeed({ teamId }: EnterpriseActivityFeedProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [teamId]);

  const fetchActivities = async () => {
    try {
      // Get team member IDs with profiles
      const { data: members } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId);

      if (!members || members.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);
      const userMap = new Map(
        members.map((m: any) => [
          m.user_id,
          { name: m.profiles?.full_name || 'Unknown', avatar: m.profiles?.avatar_url }
        ])
      );

      // Fetch recent calls
      const { data: calls } = await supabase
        .from('call_recordings')
        .select('id, file_name, user_id, created_at, duration_seconds, status')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, contact_name, company, user_id, created_at, ai_confidence, is_hot_lead')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(10);

      // Combine and sort activities
      const allActivities: ActivityItem[] = [];

      (calls || []).forEach(call => {
        const user = userMap.get(call.user_id) || { name: 'Unknown', avatar: null };
        allActivities.push({
          id: `call-${call.id}`,
          type: 'call',
          title: 'Completed Call',
          description: call.file_name,
          timestamp: call.created_at,
          userId: call.user_id,
          userName: user.name,
          userAvatar: user.avatar,
          metadata: {
            duration: call.duration_seconds || 0,
          },
        });
      });

      (leads || []).forEach(lead => {
        const user = userMap.get(lead.user_id) || { name: 'Unknown', avatar: null };
        allActivities.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: lead.is_hot_lead ? 'Hot Lead Captured' : 'New Lead',
          description: `${lead.contact_name}${lead.company ? ` at ${lead.company}` : ''}`,
          timestamp: lead.created_at,
          userId: lead.user_id,
          userName: user.name,
          userAvatar: user.avatar,
          metadata: {
            score: lead.ai_confidence || undefined,
            leadName: lead.contact_name,
          },
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-primary" />;
      case 'lead':
        return <Users className="h-4 w-4 text-success" />;
      case 'goal':
        return <Target className="h-4 w-4 text-warning" />;
      case 'score':
        return <TrendingUp className="h-4 w-4 text-primary" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enterprise h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Team Activity
            </CardTitle>
            <CardDescription>Recent actions by staff members</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground">Team activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* User Avatar */}
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={activity.userAvatar || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {activity.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {activity.userName.split(' ')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm text-muted-foreground">{activity.title}</span>
                  </div>
                  <p className="text-sm text-foreground truncate mt-1">
                    {activity.description}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-2">
                    {activity.type === 'call' && activity.metadata?.duration !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(activity.metadata.duration)}
                      </Badge>
                    )}
                    {activity.type === 'lead' && activity.metadata?.score !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          activity.metadata.score >= 80 
                            ? 'border-success/30 text-success' 
                            : 'border-primary/30 text-primary'
                        }`}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {activity.metadata.score}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
