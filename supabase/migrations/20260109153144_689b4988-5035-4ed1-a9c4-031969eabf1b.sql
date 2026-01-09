-- =====================================================
-- SECURITY FIX: Leads PII Protection for Manager Access
-- Managers get limited view (no email/phone/location)
-- Add audit logging for leads access
-- =====================================================

-- 1. Create a secure view for team leads (managers see masked PII)
CREATE OR REPLACE VIEW public.team_leads_secure AS
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

-- 2. Update leads RLS to be stricter (owner/assigned only for direct access)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete own leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can insert own leads" ON public.leads;

-- Owner-only SELECT (managers must use team_leads_secure view)
CREATE POLICY "Owner or assigned can view leads"
ON public.leads FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR assigned_to_user_id = auth.uid())
);

-- Owner-only INSERT
CREATE POLICY "Owner can insert leads"
ON public.leads FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Owner or assigned can UPDATE
CREATE POLICY "Owner or assigned can update leads"
ON public.leads FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR assigned_to_user_id = auth.uid())
);

-- Owner-only DELETE
CREATE POLICY "Owner can delete leads"
ON public.leads FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 3. Create leads access audit function
CREATE OR REPLACE FUNCTION public.log_leads_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leads_access_logs (user_id, lead_id, action)
  VALUES (auth.uid(), NEW.id, TG_OP);
  RETURN NEW;
END;
$$;

-- 4. Add trigger for audit logging on leads table (if not exists)
DROP TRIGGER IF EXISTS leads_access_audit ON public.leads;
CREATE TRIGGER leads_access_audit
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.log_leads_access();