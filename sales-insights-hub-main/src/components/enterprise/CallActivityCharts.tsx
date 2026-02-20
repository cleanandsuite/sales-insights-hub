import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';

interface CallActivityChartsProps {
  teamId: string;
}

interface CallStats {
  today: { made: number; answered: number; missed: number };
  week: { made: number; answered: number; missed: number };
  month: { made: number; answered: number; missed: number };
}

const COLORS = {
  made: 'hsl(var(--primary))',
  answered: 'hsl(var(--success))',
  missed: 'hsl(var(--destructive))',
};

export function CallActivityCharts({ teamId }: CallActivityChartsProps) {
  const [stats, setStats] = useState<CallStats | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallStats();
  }, [teamId]);

  const fetchCallStats = async () => {
    try {
      // Get team member IDs
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members || members.length === 0) {
        setStats({
          today: { made: 0, answered: 0, missed: 0 },
          week: { made: 0, answered: 0, missed: 0 },
          month: { made: 0, answered: 0, missed: 0 },
        });
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(todayStart);
      monthStart.setMonth(monthStart.getMonth() - 1);

      // Fetch all calls for the month
      const { data: calls } = await supabase
        .from('call_recordings')
        .select('id, user_id, created_at, duration_seconds, status')
        .in('user_id', userIds)
        .gte('created_at', monthStart.toISOString());

      const calculateStats = (callsList: typeof calls, startDate: Date) => {
        const filtered = (callsList || []).filter(c => new Date(c.created_at) >= startDate);
        return {
          made: filtered.length,
          answered: filtered.filter(c => (c.duration_seconds || 0) > 30).length,
          missed: filtered.filter(c => (c.duration_seconds || 0) <= 30).length,
        };
      };

      setStats({
        today: calculateStats(calls, todayStart),
        week: calculateStats(calls, weekStart),
        month: calculateStats(calls, monthStart),
      });
    } catch (error) {
      console.error('Error fetching call stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center h-80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const currentStats = stats?.[period] || { made: 0, answered: 0, missed: 0 };
  
  const pieData = [
    { name: 'Answered', value: currentStats.answered, color: COLORS.answered },
    { name: 'Missed', value: currentStats.missed, color: COLORS.missed },
  ];

  const barData = [
    { name: 'Made', value: currentStats.made, fill: COLORS.made },
    { name: 'Answered', value: currentStats.answered, fill: COLORS.answered },
    { name: 'Missed', value: currentStats.missed, fill: COLORS.missed },
  ];

  const periodLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
  };

  return (
    <Card className="card-enterprise">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Phone className="h-5 w-5 text-primary" />
              Call Activity
            </CardTitle>
            <CardDescription>Track team call performance</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="today" className="text-xs px-2">Today</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <PhoneOutgoing className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{currentStats.made}</p>
            <p className="text-xs text-muted-foreground">Calls Made</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/10">
            <PhoneIncoming className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{currentStats.answered}</p>
            <p className="text-xs text-muted-foreground">Answered</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <PhoneMissed className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{currentStats.missed}</p>
            <p className="text-xs text-muted-foreground">Short/Missed</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pie Chart */}
          <div className="h-48">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Answer Rate - {periodLabels[period]}
            </p>
            {currentStats.made > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={24}
                    formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No calls yet
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="h-48">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Call Breakdown - {periodLabels[period]}
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={60} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
