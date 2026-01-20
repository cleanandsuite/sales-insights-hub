import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, Plus, Calendar, TrendingUp, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

interface CompanyGoalsWidgetProps {
  teamId: string;
  kpis: {
    teamWinRate: number;
    avgCallsPerRep: number;
    coachingCoveragePct: number;
    avgDiscoveryScore: number;
    avgCloserScore: number;
    totalReps: number;
  } | null;
}

interface Goal {
  id: string;
  metric: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  status: string;
}

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const METRIC_OPTIONS = [
  { value: 'team_win_rate', label: 'Team Win Rate', suffix: '%' },
  { value: 'total_calls', label: 'Total Calls', suffix: '' },
  { value: 'avg_score', label: 'Avg Team Score', suffix: '' },
  { value: 'leads_converted', label: 'Leads Converted', suffix: '' },
  { value: 'revenue_target', label: 'Revenue Target', suffix: '$' },
];

export function CompanyGoalsWidget({ teamId, kpis }: CompanyGoalsWidgetProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [metric, setMetric] = useState('team_win_rate');
  const [targetValue, setTargetValue] = useState('');
  const [periodType, setPeriodType] = useState('monthly');

  useEffect(() => {
    fetchGoals();
  }, [teamId]);

  const fetchGoals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('team_goals')
        .select('*')
        .eq('team_id', teamId)
        .gte('period_end', today)
        .order('period_end', { ascending: true });

      if (error) throw error;

      // Enrich with current values from KPIs
      const enriched = (data || []).map(goal => ({
        ...goal,
        current_value: getCurrentValue(goal.metric),
      }));

      setGoals(enriched);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentValue = (metric: string): number => {
    if (!kpis) return 0;
    const mapping: Record<string, number> = {
      team_win_rate: kpis.teamWinRate,
      total_calls: kpis.avgCallsPerRep * kpis.totalReps,
      avg_score: (kpis.avgDiscoveryScore + kpis.avgCloserScore) / 2,
      leads_converted: 0,
      revenue_target: 0,
    };
    return mapping[metric] || 0;
  };

  const calculatePeriodDates = (type: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        end.setDate(start.getDate() + 6);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handleCreateGoal = async () => {
    if (!targetValue || parseFloat(targetValue) <= 0) {
      toast.error('Please enter a valid target');
      return;
    }

    setSaving(true);
    try {
      const dates = calculatePeriodDates(periodType);
      
      const { error } = await supabase
        .from('team_goals')
        .insert([{
          team_id: teamId,
          metric,
          target_value: parseFloat(targetValue),
          current_value: getCurrentValue(metric),
          period_start: dates.start,
          period_end: dates.end,
          status: 'active',
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        }]);

      if (error) {
        if (error.code === '23505') {
          toast.error('A goal for this metric and period already exists');
        } else {
          throw error;
        }
      } else {
        toast.success('Goal created successfully');
        setDialogOpen(false);
        resetForm();
        fetchGoals();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setMetric('team_win_rate');
    setTargetValue('');
    setPeriodType('monthly');
  };

  const getProgress = (goal: Goal) => {
    if (goal.target_value === 0) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) {
      return (
        <Badge className="bg-success/10 text-success border-success/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Achieved
        </Badge>
      );
    }
    if (progress >= 75) {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <TrendingUp className="h-3 w-3 mr-1" />
          On Track
        </Badge>
      );
    }
    if (progress >= 50) {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/30">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        Behind
      </Badge>
    );
  };

  const getMetricLabel = (metric: string) => {
    return METRIC_OPTIONS.find(m => m.value === metric)?.label || metric;
  };

  const getMetricSuffix = (metric: string) => {
    return METRIC_OPTIONS.find(m => m.value === metric)?.suffix || '';
  };

  const getPeriodLabel = (type: string) => {
    return PERIOD_OPTIONS.find(p => p.value === type)?.label || type;
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-enterprise">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Company Goals
              </CardTitle>
              <CardDescription>Daily, weekly, monthly, quarterly & yearly targets</CardDescription>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No active goals</p>
              <p className="text-sm text-muted-foreground">Create your first company goal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 5).map((goal) => {
                const progress = getProgress(goal);
                const suffix = getMetricSuffix(goal.metric);

                return (
                  <div key={goal.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Monthly
                        </Badge>
                        <span className="font-medium text-sm text-foreground">
                          {getMetricLabel(goal.metric)}
                        </span>
                      </div>
                      {getStatusBadge(progress)}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-sm font-semibold text-foreground min-w-[80px] text-right">
                        {suffix === '$' && suffix}
                        {Math.round(goal.current_value)}
                        {suffix !== '$' && suffix} / {suffix === '$' && suffix}
                        {goal.target_value}
                        {suffix !== '$' && suffix}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Ends {new Date(goal.period_end).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input
                type="number"
                placeholder="Enter target"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} disabled={saving}>
                {saving ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
