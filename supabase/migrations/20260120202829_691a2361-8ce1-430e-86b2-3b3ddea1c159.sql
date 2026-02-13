-- Create team_goals table for team-wide targets
CREATE TABLE public.team_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('team_win_rate', 'total_calls', 'avg_team_score', 'coaching_coverage')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed')),
  UNIQUE(team_id, metric, period_start)
);

-- Enable RLS
ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;

-- Managers can view team goals
CREATE POLICY "Managers can view team goals"
ON public.team_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Managers can create team goals
CREATE POLICY "Managers can create team goals"
ON public.team_goals
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Managers can update team goals
CREATE POLICY "Managers can update team goals"
ON public.team_goals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Managers can delete team goals
CREATE POLICY "Managers can delete team goals"
ON public.team_goals
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_goals.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('manager', 'admin')
  )
);

-- Team members can view their team's goals
CREATE POLICY "Team members can view team goals"
ON public.team_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_goals.team_id
    AND tm.user_id = auth.uid()
  )
);

-- Add status column to rep_goals for history tracking
ALTER TABLE public.rep_goals ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed'));

-- Create email_digest_preferences table
CREATE TABLE public.email_digest_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  day_of_week INTEGER DEFAULT 1 CHECK (day_of_week >= 0 AND day_of_week <= 6),
  include_rep_breakdown BOOLEAN NOT NULL DEFAULT true,
  include_goals_progress BOOLEAN NOT NULL DEFAULT true,
  include_risk_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_digest_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own digest preferences"
ON public.email_digest_preferences
FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own preferences
CREATE POLICY "Users can create own digest preferences"
ON public.email_digest_preferences
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own digest preferences"
ON public.email_digest_preferences
FOR UPDATE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_team_goals_updated_at
BEFORE UPDATE ON public.team_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_digest_preferences_updated_at
BEFORE UPDATE ON public.email_digest_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();