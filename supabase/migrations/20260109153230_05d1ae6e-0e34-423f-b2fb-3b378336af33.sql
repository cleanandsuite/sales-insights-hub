-- =====================================================
-- FIX: Convert SECURITY DEFINER view to SECURITY INVOKER
-- The view already uses auth.uid() which works with INVOKER
-- =====================================================

-- Drop and recreate view with SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.team_leads_secure;

CREATE VIEW public.team_leads_secure 
WITH (security_invoker = true)
AS
SELECT 
  l.id,
  l.user_id,
  l.recording_id,
  l.contact_name,
  l.company,
  l.title,
  -- Mask PII for non-owners
  CASE WHEN l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid() 
       THEN l.email 
       ELSE '***@hidden.com' END AS email,
  CASE WHEN l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid() 
       THEN l.phone 
       ELSE '***-***-****' END AS phone,
  CASE WHEN l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid() 
       THEN l.location 
       ELSE 'Hidden' END AS location,
  l.ai_confidence,
  l.priority_score,
  l.lead_status,
  l.source,
  l.primary_pain_point,
  l.secondary_issues,
  l.budget_info,
  l.timeline,
  l.decision_timeline_days,
  l.team_size,
  l.competitor_status,
  l.evaluation_stage,
  l.call_duration_seconds,
  l.talk_ratio,
  l.engagement_score,
  l.key_quotes,
  l.key_moments,
  l.next_action,
  l.next_action_due,
  l.agreed_next_steps,
  l.prep_questions,
  l.materials_needed,
  l.last_contacted_at,
  l.follow_up_count,
  l.is_hot_lead,
  l.urgency_level,
  l.created_at,
  l.updated_at,
  l.bant_budget,
  l.bant_authority,
  l.bant_need,
  l.bant_timeline,
  l.sentiment_trend,
  l.objection_patterns,
  l.next_best_actions,
  l.risk_level,
  l.ai_coaching_log,
  l.deal_velocity_days,
  l.predicted_close_date,
  l.predicted_deal_value,
  l.outcome,
  l.outcome_reason,
  l.actual_close_date,
  l.actual_deal_value,
  l.ai_assisted,
  l.assigned_to_user_id
FROM public.leads l
WHERE 
  -- Owner or assigned user has full access
  (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
  OR
  -- Manager can view team members' leads (with masked PII)
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND user_role = 'manager'
    )
    AND EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() 
        AND tm2.user_id = l.user_id
    )
  );