-- Create promote_user_to_manager function
CREATE OR REPLACE FUNCTION public.promote_user_to_manager(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_team_id uuid;
  caller_role text;
BEGIN
  -- Get the caller's team and role
  SELECT team_id, role INTO caller_team_id, caller_role
  FROM team_members
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Only owners/managers can promote
  IF caller_role NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Access denied: Only owners and managers can promote users';
  END IF;

  -- Update the target user's role in the same team
  UPDATE team_members
  SET role = 'manager'
  WHERE user_id = target_user_id
    AND team_id = caller_team_id
    AND role = 'member';

  -- Also update their profile role
  UPDATE profiles
  SET user_role = 'manager'
  WHERE user_id = target_user_id;
END;
$$;

-- Create demote_user_from_manager function
CREATE OR REPLACE FUNCTION public.demote_user_from_manager(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_team_id uuid;
  caller_role text;
BEGIN
  -- Get the caller's team and role
  SELECT team_id, role INTO caller_team_id, caller_role
  FROM team_members
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Only owners can demote (managers can't demote other managers)
  IF caller_role != 'owner' THEN
    RAISE EXCEPTION 'Access denied: Only owners can demote managers';
  END IF;

  -- Cannot demote yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;

  -- Update the target user's role in the same team
  UPDATE team_members
  SET role = 'member'
  WHERE user_id = target_user_id
    AND team_id = caller_team_id
    AND role = 'manager';

  -- Also update their profile role
  UPDATE profiles
  SET user_role = 'user'
  WHERE user_id = target_user_id;
END;
$$;

-- Create function to get team statistics for the team page
CREATE OR REPLACE FUNCTION public.get_team_member_stats(p_team_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  role text,
  total_calls bigint,
  avg_score numeric,
  active_leads bigint,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Authorization check
  IF NOT public.is_team_member(p_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Not a team member';
  END IF;

  RETURN QUERY
  SELECT 
    tm.user_id,
    COALESCE(p.full_name, 'Unknown')::text as full_name,
    tm.role,
    COALESCE(call_stats.total_calls, 0) as total_calls,
    COALESCE(call_stats.avg_score, 0) as avg_score,
    COALESCE(lead_stats.active_leads, 0) as active_leads,
    tm.joined_at
  FROM team_members tm
  LEFT JOIN profiles p ON p.user_id = tm.user_id
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(cr.id)::bigint as total_calls,
      ROUND(AVG(cs.overall_score)::numeric, 1) as avg_score
    FROM call_recordings cr
    LEFT JOIN call_scores cs ON cs.recording_id = cr.id
    WHERE cr.user_id = tm.user_id
  ) call_stats ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint as active_leads
    FROM leads l
    WHERE l.user_id = tm.user_id
      AND l.outcome IS NULL
  ) lead_stats ON true
  WHERE tm.team_id = p_team_id
  ORDER BY 
    CASE tm.role 
      WHEN 'owner' THEN 1 
      WHEN 'manager' THEN 2 
      ELSE 3 
    END,
    p.full_name;
END;
$$;