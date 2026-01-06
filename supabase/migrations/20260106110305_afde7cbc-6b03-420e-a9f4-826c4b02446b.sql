-- Fix the security definer view by converting to invoker (default) with RLS-based access
-- Drop and recreate as a regular view that respects the caller's permissions
DROP VIEW IF EXISTS public.manager_team_stats;

CREATE VIEW public.manager_team_stats 
WITH (security_invoker = true) AS
SELECT 
  tm.team_id,
  tm.user_id,
  p.full_name,
  p.avatar_url,
  COALESCE(AVG(cs.overall_score), 0) as avg_overall_score,
  COALESCE(AVG(cs.rapport_score), 0) as avg_rapport_score,
  COALESCE(AVG(cs.discovery_score), 0) as avg_discovery_score,
  COALESCE(AVG(cs.presentation_score), 0) as avg_presentation_score,
  COALESCE(AVG(cs.closing_score), 0) as avg_closing_score,
  COALESCE(AVG(cs.objection_handling_score), 0) as avg_objection_handling_score,
  COUNT(DISTINCT cr.id) as total_calls,
  COUNT(DISTINCT CASE WHEN l.outcome = 'won' THEN l.id END) as deals_won,
  COUNT(DISTINCT CASE WHEN l.outcome = 'lost' THEN l.id END) as deals_lost,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN l.outcome IN ('won', 'lost') THEN l.id END) > 0 
    THEN ROUND(COUNT(DISTINCT CASE WHEN l.outcome = 'won' THEN l.id END)::numeric / 
         COUNT(DISTINCT CASE WHEN l.outcome IN ('won', 'lost') THEN l.id END) * 100, 1)
    ELSE 0 
  END as win_rate,
  COALESCE(AVG(l.deal_velocity_days), 0) as avg_deal_velocity
FROM public.team_members tm
JOIN public.profiles p ON p.user_id = tm.user_id
LEFT JOIN public.call_recordings cr ON cr.user_id = tm.user_id
LEFT JOIN public.call_scores cs ON cs.recording_id = cr.id
LEFT JOIN public.leads l ON l.user_id = tm.user_id
WHERE tm.team_id IN (
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND user_role = 'manager'
)
GROUP BY tm.team_id, tm.user_id, p.full_name, p.avatar_url;

GRANT SELECT ON public.manager_team_stats TO authenticated;