-- 1. Add validation trigger to experiment_assignments to prevent abuse
-- This validates that experiment_id and variant_id exist and experiment is running

CREATE OR REPLACE FUNCTION public.validate_experiment_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate experiment exists and is running
  IF NOT EXISTS (
    SELECT 1 FROM public.experiments
    WHERE id = NEW.experiment_id
    AND status = 'running'
  ) THEN
    RAISE EXCEPTION 'Invalid experiment_id or experiment is not running';
  END IF;

  -- Validate variant belongs to the experiment
  IF NOT EXISTS (
    SELECT 1 FROM public.experiment_variants
    WHERE id = NEW.variant_id
    AND experiment_id = NEW.experiment_id
  ) THEN
    RAISE EXCEPTION 'Invalid variant_id or variant does not belong to experiment';
  END IF;

  -- Prevent duplicate assignments (same visitor_id + experiment_id)
  IF EXISTS (
    SELECT 1 FROM public.experiment_assignments
    WHERE visitor_id = NEW.visitor_id
    AND experiment_id = NEW.experiment_id
    AND id != COALESCE(NEW.id, gen_random_uuid())
  ) THEN
    RAISE EXCEPTION 'Assignment already exists for this visitor and experiment';
  END IF;

  -- Limit visitor_id length
  IF LENGTH(NEW.visitor_id) > 100 THEN
    RAISE EXCEPTION 'visitor_id exceeds maximum length';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS validate_experiment_assignment_trigger ON public.experiment_assignments;
CREATE TRIGGER validate_experiment_assignment_trigger
  BEFORE INSERT ON public.experiment_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_experiment_assignment();

-- 2. Create a secure function to replace direct manager_team_stats view access
-- This function enforces manager role check

CREATE OR REPLACE FUNCTION public.get_manager_team_stats(p_team_id uuid)
RETURNS TABLE (
  team_id uuid,
  user_id uuid,
  full_name text,
  role text,
  total_calls bigint,
  avg_score numeric,
  total_leads bigint,
  hot_leads bigint,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get calling user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify user is a manager of this team
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.profiles p ON p.user_id = tm.user_id
    WHERE tm.team_id = p_team_id
    AND tm.user_id = v_user_id
    AND (tm.role = 'manager' OR p.user_role = 'manager')
  ) THEN
    RAISE EXCEPTION 'Access denied: You must be a manager of this team';
  END IF;

  RETURN QUERY
  SELECT 
    tm.team_id,
    tm.user_id,
    p.full_name,
    tm.role,
    COALESCE(cr.total_calls, 0::bigint) as total_calls,
    COALESCE(cs.avg_score, 0::numeric) as avg_score,
    COALESCE(l.total_leads, 0::bigint) as total_leads,
    COALESCE(l.hot_leads, 0::bigint) as hot_leads,
    tm.joined_at
  FROM public.team_members tm
  JOIN public.profiles p ON p.user_id = tm.user_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint as total_calls
    FROM public.call_recordings
    WHERE user_id = tm.user_id
  ) cr ON true
  LEFT JOIN LATERAL (
    SELECT AVG(overall_score)::numeric as avg_score
    FROM public.call_scores cs
    JOIN public.call_recordings cr ON cr.id = cs.recording_id
    WHERE cr.user_id = tm.user_id
  ) cs ON true
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(*)::bigint as total_leads,
      COUNT(*) FILTER (WHERE is_hot_lead = true)::bigint as hot_leads
    FROM public.leads
    WHERE user_id = tm.user_id
  ) l ON true
  WHERE tm.team_id = p_team_id;
END;
$$;

-- Grant execute to authenticated users (function handles authorization internally)
GRANT EXECUTE ON FUNCTION public.get_manager_team_stats(uuid) TO authenticated;

-- Revoke direct SELECT on the view from authenticated (require using the function)
REVOKE SELECT ON public.manager_team_stats FROM authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_manager_team_stats IS 'Securely fetches team stats for managers only. Validates caller is a manager of the specified team.';