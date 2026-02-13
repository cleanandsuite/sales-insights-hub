import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, PhoneIncoming, PhoneOutgoing, Clock, TrendingUp, TrendingDown,
  Target, CheckCircle2
} from 'lucide-react';

interface StaffCallOverviewProps {
  teamId: string;
}

interface StaffCallData {
  userId: string;
  name: string;
  avatar: string | null;
  callsMade: number;
  callsAnswered: number;
  avgDuration: number;
  successRate: number;
  dailyTarget: number;
  trend: 'up' | 'down' | 'stable';
}

export function StaffCallOverview({ teamId }: StaffCallOverviewProps) {
  const [staff, setStaff] = useState<StaffCallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetchCallData();
  }, [teamId, period]);

  const fetchCallData = async () => {
    setLoading(true);
    try {
      // Get team members with profiles
      const { data: members } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner (full_name, avatar_url)
        `)
        .eq('team_id', teamId);

      if (!members?.length) {
        setStaff([]);
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      // Fetch recordings
      const { data: recordings } = await supabase
        .from('call_recordings')
        .select('user_id, duration_seconds, status, created_at')
        .in('user_id', userIds)
        .gte('created_at', startDate.toISOString());

      // Aggregate by user
      const userStats = new Map<string, {
        callsMade: number;
        callsAnswered: number;
        totalDuration: number;
        successCount: number;
      }>();

      userIds.forEach(id => {
        userStats.set(id, { callsMade: 0, callsAnswered: 0, totalDuration: 0, successCount: 0 });
      });

      (recordings || []).forEach(rec => {
        const stats = userStats.get(rec.user_id);
        if (stats) {
          stats.callsMade++;
          if (rec.duration_seconds && rec.duration_seconds > 30) {
            stats.callsAnswered++;
            stats.totalDuration += rec.duration_seconds;
          }
          if (rec.status === 'analyzed') {
            stats.successCount++;
          }
        }
      });

      // Build staff data
      const staffData: StaffCallData[] = members.map((m: any) => {
        const stats = userStats.get(m.user_id)!;
        const avgDuration = stats.callsAnswered > 0 
          ? Math.round(stats.totalDuration / stats.callsAnswered)
          : 0;
        const successRate = stats.callsMade > 0
          ? Math.round((stats.callsAnswered / stats.callsMade) * 100)
          : 0;

        return {
          userId: m.user_id,
          name: m.profiles?.full_name || 'Unknown',
          avatar: m.profiles?.avatar_url,
          callsMade: stats.callsMade,
          callsAnswered: stats.callsAnswered,
          avgDuration,
          successRate,
          dailyTarget: 20,
          trend: stats.callsMade > 10 ? 'up' : stats.callsMade > 5 ? 'stable' : 'down',
        };
      });

      // Sort by calls made
      staffData.sort((a, b) => b.callsMade - a.callsMade);
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching call data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  // Calculate totals
  const totals = staff.reduce((acc, s) => ({
    callsMade: acc.callsMade + s.callsMade,
    callsAnswered: acc.callsAnswered + s.callsAnswered,
  }), { callsMade: 0, callsAnswered: 0 });

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Phone className="h-5 w-5 text-primary" />
              Staff Call Overview
            </CardTitle>
            <CardDescription>Team calling activity and performance</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="today" className="text-xs px-3">Today</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3">This Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PhoneOutgoing className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totals.callsMade}</p>
              <p className="text-xs text-muted-foreground">Calls Made</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <PhoneIncoming className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totals.callsAnswered}</p>
              <p className="text-xs text-muted-foreground">Calls Answered</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[350px] overflow-y-auto">
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No call data available
            </div>
          ) : (
            staff.map((member) => {
              const targetProgress = (member.callsMade / member.dailyTarget) * 100;
              
              return (
                <div 
                  key={member.userId}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground truncate">
                        {member.name}
                      </p>
                      {getTrendIcon(member.trend)}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <PhoneOutgoing className="h-3 w-3" />
                        {member.callsMade} made
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <PhoneIncoming className="h-3 w-3" />
                        {member.callsAnswered} answered
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(member.avgDuration)} avg
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {member.callsMade}/{member.dailyTarget}
                        </span>
                      </div>
                      <Progress value={Math.min(targetProgress, 100)} className="h-1.5 w-16 mt-1" />
                    </div>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        member.successRate >= 70 
                          ? 'border-success/30 bg-success/10 text-success' 
                          : member.successRate >= 50
                          ? 'border-warning/30 bg-warning/10 text-warning'
                          : 'border-muted text-muted-foreground'
                      }`}
                    >
                      {member.successRate}%
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
