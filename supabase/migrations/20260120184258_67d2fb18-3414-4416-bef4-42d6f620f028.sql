-- Create coaching_assignments table for AI action cards workflow
CREATE TABLE IF NOT EXISTS public.coaching_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  coaching_type TEXT NOT NULL, -- 'high_stakes_closer', 'discovery_booker', 'objection_handling', etc.
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_kpi_snapshots for historical tracking
CREATE TABLE IF NOT EXISTS public.team_kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  team_win_rate NUMERIC(5,2),
  avg_calls_per_rep NUMERIC(8,2),
  coaching_coverage_pct NUMERIC(5,2),
  avg_discovery_score NUMERIC(5,2),
  avg_closer_score NUMERIC(5,2),
  forecast_risk_pct NUMERIC(5,2),
  pipeline_coverage_ratio NUMERIC(8,2),
  pipeline_value NUMERIC(12,2),
  quota_value NUMERIC(12,2),
  total_reps INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, snapshot_date)
);

-- Create risk_alerts table for predictive alerts
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'low_activity', 'score_drop', 'deal_stall', 'coaching_needed'
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.coaching_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- RLS: Team members can view assignments for their team
CREATE POLICY "Team members view coaching_assignments"
  ON public.coaching_assignments FOR SELECT
  USING (public.is_team_member(team_id, auth.uid()));

-- RLS: Managers can insert/update assignments
CREATE POLICY "Managers manage coaching_assignments"
  ON public.coaching_assignments FOR ALL
  USING (public.is_team_admin(team_id, auth.uid()) OR 
         EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = coaching_assignments.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager'));

-- RLS: Team members can view their team's KPI snapshots
CREATE POLICY "Team members view team_kpi_snapshots"
  ON public.team_kpi_snapshots FOR SELECT
  USING (public.is_team_member(team_id, auth.uid()));

-- RLS: Only managers can insert KPI snapshots
CREATE POLICY "Managers insert team_kpi_snapshots"
  ON public.team_kpi_snapshots FOR INSERT
  WITH CHECK (public.is_team_admin(team_id, auth.uid()) OR 
              EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = team_kpi_snapshots.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager'));

-- RLS: Team members can view risk alerts for their team
CREATE POLICY "Team members view risk_alerts"
  ON public.risk_alerts FOR SELECT
  USING (public.is_team_member(team_id, auth.uid()));

-- RLS: Managers can manage risk alerts
CREATE POLICY "Managers manage risk_alerts"
  ON public.risk_alerts FOR ALL
  USING (public.is_team_member(team_id, auth.uid()));

-- Add trigger for updated_at on coaching_assignments
CREATE TRIGGER update_coaching_assignments_updated_at
  BEFORE UPDATE ON public.coaching_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate team KPIs
CREATE OR REPLACE FUNCTION public.get_team_kpis(p_team_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_total_reps integer;
  v_team_win_rate numeric;
  v_avg_calls_per_rep numeric;
  v_coaching_coverage numeric;
  v_avg_discovery numeric;
  v_avg_closer numeric;
  v_forecast_risk numeric;
BEGIN
  -- Authorization check
  IF NOT public.is_team_member(p_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Not a team member';
  END IF;

  -- Get total reps
  SELECT COUNT(*) INTO v_total_reps
  FROM team_members WHERE team_id = p_team_id;

  -- Calculate team win rate
  SELECT 
    CASE WHEN COUNT(CASE WHEN outcome IN ('won', 'lost') THEN 1 END) > 0
      THEN ROUND(COUNT(CASE WHEN outcome = 'won' THEN 1 END)::numeric / 
           COUNT(CASE WHEN outcome IN ('won', 'lost') THEN 1 END) * 100, 1)
      ELSE 0
    END INTO v_team_win_rate
  FROM leads l
  JOIN team_members tm ON tm.user_id = l.user_id
  WHERE tm.team_id = p_team_id;

  -- Calculate avg calls per rep per week (last 7 days)
  SELECT COALESCE(ROUND(COUNT(*)::numeric / NULLIF(v_total_reps, 0), 1), 0) INTO v_avg_calls_per_rep
  FROM call_recordings cr
  JOIN team_members tm ON tm.user_id = cr.user_id
  WHERE tm.team_id = p_team_id
    AND cr.created_at >= NOW() - INTERVAL '7 days';

  -- Calculate coaching coverage (calls with coaching sessions / total calls)
  SELECT 
    CASE WHEN COUNT(DISTINCT cr.id) > 0
      THEN ROUND(COUNT(DISTINCT cs.recording_id)::numeric / COUNT(DISTINCT cr.id) * 100, 1)
      ELSE 0
    END INTO v_coaching_coverage
  FROM call_recordings cr
  JOIN team_members tm ON tm.user_id = cr.user_id
  LEFT JOIN coaching_sessions cs ON cs.recording_id = cr.id
  WHERE tm.team_id = p_team_id
    AND cr.created_at >= NOW() - INTERVAL '30 days';

  -- Calculate avg discovery score
  SELECT COALESCE(ROUND(AVG(cscore.discovery_score)::numeric, 1), 0) INTO v_avg_discovery
  FROM call_scores cscore
  JOIN call_recordings cr ON cr.id = cscore.recording_id
  JOIN team_members tm ON tm.user_id = cr.user_id
  WHERE tm.team_id = p_team_id;

  -- Calculate avg closing score
  SELECT COALESCE(ROUND(AVG(cscore.closing_score)::numeric, 1), 0) INTO v_avg_closer
  FROM call_scores cscore
  JOIN call_recordings cr ON cr.id = cscore.recording_id
  JOIN team_members tm ON tm.user_id = cr.user_id
  WHERE tm.team_id = p_team_id;

  -- Calculate forecast risk (deals with low activity or low scores)
  SELECT 
    CASE WHEN COUNT(*) > 0
      THEN ROUND(COUNT(CASE WHEN l.ai_confidence < 50 OR l.is_hot_lead = false THEN 1 END)::numeric / COUNT(*) * 100, 1)
      ELSE 0
    END INTO v_forecast_risk
  FROM leads l
  JOIN team_members tm ON tm.user_id = l.user_id
  WHERE tm.team_id = p_team_id
    AND l.outcome IS NULL;

  result := jsonb_build_object(
    'teamWinRate', v_team_win_rate,
    'avgCallsPerRep', v_avg_calls_per_rep,
    'coachingCoveragePct', v_coaching_coverage,
    'avgDiscoveryScore', v_avg_discovery,
    'avgCloserScore', v_avg_closer,
    'forecastRiskPct', v_forecast_risk,
    'totalReps', v_total_reps
  );

  RETURN result;
END;
$$;