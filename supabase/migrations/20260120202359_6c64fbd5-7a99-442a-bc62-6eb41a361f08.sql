-- Create rep_goals table for tracking performance targets
CREATE TABLE public.rep_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('win_rate', 'calls_per_week', 'avg_score', 'closing_score', 'discovery_score')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(team_id, user_id, metric, period_start)
);

-- Enable RLS
ALTER TABLE public.rep_goals ENABLE ROW LEVEL SECURITY;

-- Managers can view goals for their team
CREATE POLICY "Managers can view team goals"
ON public.rep_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = rep_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Managers can create goals for their team
CREATE POLICY "Managers can create team goals"
ON public.rep_goals
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = rep_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Managers can update goals for their team
CREATE POLICY "Managers can update team goals"
ON public.rep_goals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = rep_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Managers can delete goals for their team
CREATE POLICY "Managers can delete team goals"
ON public.rep_goals
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = rep_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Reps can view their own goals
CREATE POLICY "Reps can view own goals"
ON public.rep_goals
FOR SELECT
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_rep_goals_updated_at
BEFORE UPDATE ON public.rep_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();