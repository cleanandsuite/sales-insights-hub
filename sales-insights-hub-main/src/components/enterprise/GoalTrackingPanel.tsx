import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Target, Plus, Trash2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';

interface RepGoal {
  id: string;
  user_id: string;
  metric: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  rep_name?: string;
}

interface RepOption {
  user_id: string;
  full_name: string;
}

interface GoalTrackingPanelProps {
  teamId: string;
}

const METRIC_OPTIONS = [
  { value: 'win_rate', label: 'Win Rate (%)', suffix: '%' },
  { value: 'calls_per_week', label: 'Calls per Week', suffix: '' },
  { value: 'avg_score', label: 'Average Score', suffix: '' },
  { value: 'closing_score', label: 'Closing Score', suffix: '' },
  { value: 'discovery_score', label: 'Discovery Score', suffix: '' },
];

const PERIOD_OPTIONS = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
];

export function GoalTrackingPanel({ teamId }: GoalTrackingPanelProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<RepGoal[]>([]);
  const [reps, setReps] = useState<RepOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedRep, setSelectedRep] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('avg_score');
  const [targetValue, setTargetValue] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      // Fetch reps
      const { data: repData } = await supabase
        .from('manager_team_stats')
        .select('user_id, full_name')
        .eq('team_id', teamId);
      
      setReps((repData || []).map(r => ({
        user_id: r.user_id,
        full_name: r.full_name || 'Unknown',
      })));

      // Fetch goals with current values
      const { data: goalData, error } = await supabase
        .from('rep_goals')
        .select('*')
        .eq('team_id', teamId)
        .gte('period_end', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      // Enrich with rep names and current values
      const enrichedGoals = await Promise.all((goalData || []).map(async (goal) => {
        const rep = repData?.find(r => r.user_id === goal.user_id);
        const currentValue = await calculateCurrentValue(goal.user_id, goal.metric);
        return {
          ...goal,
          rep_name: rep?.full_name || 'Unknown',
          current_value: currentValue,
        };
      }));

      setGoals(enrichedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentValue = async (userId: string, metric: string): Promise<number> => {
    try {
      const { data } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!data) return 0;

      switch (metric) {
        case 'win_rate': return Number(data.win_rate) || 0;
        case 'calls_per_week': return Math.round((Number(data.total_calls) || 0) / 4);
        case 'avg_score': return Number(data.avg_overall_score) || 0;
        case 'closing_score': return Number(data.avg_closing_score) || 0;
        case 'discovery_score': return Number(data.avg_discovery_score) || 0;
        default: return 0;
      }
    } catch {
      return 0;
    }
  };

  const handleCreateGoal = async () => {
    if (!selectedRep || !targetValue || !user) return;

    setSaving(true);
    try {
      const now = new Date();
      let periodStart: Date, periodEnd: Date;

      if (period === 'month') {
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
      } else {
        periodStart = startOfQuarter(now);
        periodEnd = endOfQuarter(now);
      }

      const { error } = await supabase
        .from('rep_goals')
        .insert({
          team_id: teamId,
          user_id: selectedRep,
          metric: selectedMetric,
          target_value: parseFloat(targetValue),
          period_start: format(periodStart, 'yyyy-MM-dd'),
          period_end: format(periodEnd, 'yyyy-MM-dd'),
          created_by: user.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('A goal for this metric already exists for this period');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Goal created successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('rep_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      toast.success('Goal deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setSelectedRep('');
    setSelectedMetric('avg_score');
    setTargetValue('');
    setPeriod('month');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-500';
    if (progress >= 75) return 'text-primary';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) {
      return <Badge variant="outline" className="border-primary/50 text-primary"><CheckCircle2 className="h-3 w-3 mr-1" /> Achieved</Badge>;
    }
    if (progress >= 75) {
      return <Badge variant="outline" className="border-primary/30 text-primary"><TrendingUp className="h-3 w-3 mr-1" /> On Track</Badge>;
    }
    return <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground"><AlertCircle className="h-3 w-3 mr-1" /> Behind</Badge>;
  };

  const getMetricLabel = (metric: string) => METRIC_OPTIONS.find(m => m.value === metric)?.label || metric;
  const getMetricSuffix = (metric: string) => METRIC_OPTIONS.find(m => m.value === metric)?.suffix || '';

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Goal Tracking
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Set and monitor rep performance targets</p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No active goals</p>
              <p className="text-sm">Create goals to track rep performance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = goal.target_value > 0 
                  ? Math.min(100, (goal.current_value / goal.target_value) * 100)
                  : 0;
                
                return (
                  <div key={goal.id} className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{goal.rep_name}</p>
                        <p className="text-sm text-muted-foreground">{getMetricLabel(goal.metric)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(progress)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={getProgressColor(progress)}>
                          {goal.current_value.toFixed(1)}{getMetricSuffix(goal.metric)}
                        </span>
                        <span className="text-muted-foreground">
                          Target: {goal.target_value}{getMetricSuffix(goal.metric)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(goal.period_start), 'MMM d')} - {format(new Date(goal.period_end), 'MMM d, yyyy')}
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
            <DialogTitle>Create Performance Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rep</Label>
              <Select value={selectedRep} onValueChange={setSelectedRep}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rep" />
                </SelectTrigger>
                <SelectContent>
                  {reps.map((rep) => (
                    <SelectItem key={rep.user_id} value={rep.user_id}>
                      {rep.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input
                type="number"
                placeholder="e.g., 85"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGoal} disabled={!selectedRep || !targetValue || saving}>
              {saving ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
