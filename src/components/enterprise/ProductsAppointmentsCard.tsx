import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, Calendar, TrendingUp, TrendingDown, Target
} from 'lucide-react';

interface ProductsAppointmentsCardProps {
  teamId: string;
}

interface MetricData {
  current: number;
  target: number;
  previous: number;
  label: string;
}

export function ProductsAppointmentsCard({ teamId }: ProductsAppointmentsCardProps) {
  const [products, setProducts] = useState<MetricData>({
    current: 0,
    target: 100,
    previous: 0,
    label: 'Products Sold',
  });
  const [appointments, setAppointments] = useState<MetricData>({
    current: 0,
    target: 50,
    previous: 0,
    label: 'Appointments Set',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [teamId]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Get team members
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members?.length) {
        setLoading(false);
        return;
      }

      const userIds = members.map(m => m.user_id);

      // Current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch leads (as proxy for products/appointments)
      const { data: currentLeads } = await supabase
        .from('leads')
        .select('lead_status, outcome')
        .in('user_id', userIds)
        .gte('created_at', startOfMonth.toISOString());

      const { data: previousLeads } = await supabase
        .from('leads')
        .select('lead_status, outcome')
        .in('user_id', userIds)
        .gte('created_at', startOfLastMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString());

      // Calculate metrics
      const currentWon = (currentLeads || []).filter(l => l.outcome === 'won').length;
      const currentAppointments = (currentLeads || []).filter(
        l => l.lead_status === 'qualified' || l.lead_status === 'proposal'
      ).length;

      const previousWon = (previousLeads || []).filter(l => l.outcome === 'won').length;
      const previousAppointments = (previousLeads || []).filter(
        l => l.lead_status === 'qualified' || l.lead_status === 'proposal'
      ).length;

      setProducts({
        current: currentWon,
        target: 100,
        previous: previousWon,
        label: 'Products Sold',
      });

      setAppointments({
        current: currentAppointments,
        target: 50,
        previous: previousAppointments,
        label: 'Appointments Set',
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ metric, icon: Icon }: { metric: MetricData; icon: React.ElementType }) => {
    const progress = (metric.current / metric.target) * 100;
    const change = metric.previous > 0 
      ? ((metric.current - metric.previous) / metric.previous) * 100 
      : 0;
    const isPositive = change >= 0;

    return (
      <div className="p-4 rounded-xl border bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              isPositive 
                ? 'border-success/30 bg-success/10 text-success' 
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {isPositive ? '+' : ''}{change.toFixed(0)}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{metric.current}</span>
            <span className="text-sm text-muted-foreground mb-1">/ {metric.target}</span>
          </div>
          
          <Progress value={Math.min(progress, 100)} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {progress.toFixed(0)}% of target
            </span>
            <span>vs. {metric.previous} last month</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Monthly Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricCard metric={products} icon={Package} />
        <MetricCard metric={appointments} icon={Calendar} />
      </CardContent>
    </Card>
  );
}
