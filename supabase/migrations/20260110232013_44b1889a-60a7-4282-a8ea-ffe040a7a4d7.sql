-- Add authorization checks to get_user_strengths function
CREATE OR REPLACE FUNCTION public.get_user_strengths(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Authorization check: User can only view their own data OR managers can view team members
  IF NOT (
    auth.uid() = p_user_id 
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.user_role = 'manager'
        AND EXISTS (
          SELECT 1 FROM team_members tm1
          JOIN team_members tm2 ON tm1.team_id = tm2.team_id
          WHERE tm1.user_id = auth.uid()
            AND tm2.user_id = p_user_id
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not have permission to view this user''s data';
  END IF;

  SELECT jsonb_build_object(
    'strongest_skill', 
    CASE 
      WHEN AVG(cs.closing_score) >= GREATEST(AVG(cs.rapport_score), AVG(cs.discovery_score), AVG(cs.presentation_score), AVG(cs.objection_handling_score))
        THEN 'closing'
      WHEN AVG(cs.rapport_score) >= GREATEST(AVG(cs.closing_score), AVG(cs.discovery_score), AVG(cs.presentation_score), AVG(cs.objection_handling_score))
        THEN 'rapport'
      WHEN AVG(cs.discovery_score) >= GREATEST(AVG(cs.closing_score), AVG(cs.rapport_score), AVG(cs.presentation_score), AVG(cs.objection_handling_score))
        THEN 'discovery'
      WHEN AVG(cs.presentation_score) >= GREATEST(AVG(cs.closing_score), AVG(cs.rapport_score), AVG(cs.discovery_score), AVG(cs.objection_handling_score))
        THEN 'presentation'
      ELSE 'objection_handling'
    END,
    'avg_closing', COALESCE(AVG(cs.closing_score), 0),
    'avg_rapport', COALESCE(AVG(cs.rapport_score), 0),
    'avg_discovery', COALESCE(AVG(cs.discovery_score), 0),
    'avg_presentation', COALESCE(AVG(cs.presentation_score), 0),
    'avg_objection_handling', COALESCE(AVG(cs.objection_handling_score), 0)
  ) INTO result
  FROM public.call_recordings cr
  JOIN public.call_scores cs ON cs.recording_id = cr.id
  WHERE cr.user_id = p_user_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Add authorization check to suggest_lead_assignment function
CREATE OR REPLACE FUNCTION public.suggest_lead_assignment(p_lead_id uuid, p_team_id uuid)
RETURNS TABLE(user_id uuid, full_name text, reason text, score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_stage text;
BEGIN
  -- Authorization check: caller must be a member of the team
  IF NOT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = p_team_id AND team_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this team';
  END IF;

  -- Get lead status to determine which skill matters most
  SELECT lead_status INTO lead_stage FROM public.leads WHERE id = p_lead_id;
  
  RETURN QUERY
  SELECT 
    tm.user_id,
    p.full_name,
    CASE 
      WHEN lead_stage IN ('proposal', 'negotiation') THEN 'High closing score'
      WHEN lead_stage = 'new' THEN 'Strong rapport building'
      WHEN lead_stage = 'qualified' THEN 'Good discovery skills'
      ELSE 'Balanced skills'
    END as reason,
    CASE 
      WHEN lead_stage IN ('proposal', 'negotiation') THEN COALESCE(AVG(cs.closing_score), 50)
      WHEN lead_stage = 'new' THEN COALESCE(AVG(cs.rapport_score), 50)
      WHEN lead_stage = 'qualified' THEN COALESCE(AVG(cs.discovery_score), 50)
      ELSE COALESCE(AVG(cs.overall_score), 50)
    END as score
  FROM public.team_members tm
  JOIN public.profiles p ON p.user_id = tm.user_id
  LEFT JOIN public.call_recordings cr ON cr.user_id = tm.user_id
  LEFT JOIN public.call_scores cs ON cs.recording_id = cr.id
  WHERE tm.team_id = p_team_id
  GROUP BY tm.user_id, p.full_name, lead_stage
  ORDER BY score DESC
  LIMIT 5;
END;
$$;