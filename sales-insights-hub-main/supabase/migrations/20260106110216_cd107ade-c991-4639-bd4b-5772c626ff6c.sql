-- Create plans table for pricing tiers
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_monthly numeric NOT NULL DEFAULT 0,
  features_json jsonb NOT NULL DEFAULT '{}',
  max_users integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on plans (public read)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT
USING (is_active = true);

-- Seed default plans
INSERT INTO public.plans (name, price_monthly, features_json, max_users) VALUES
(
  'single_user',
  29,
  '{"recording": true, "playback": true, "basic_transcription": true, "personal_coaching": true, "team_sharing": false, "lead_assignment": false, "manager_dashboard": false}',
  1
),
(
  'team',
  99,
  '{"recording": true, "playback": true, "basic_transcription": true, "personal_coaching": true, "team_sharing": true, "lead_assignment": true, "manager_dashboard": true}',
  10
);

-- Create user_subscriptions table for billing
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'trialing', -- trialing, active, canceled, past_due
  trial_ends_at timestamptz DEFAULT (now() + interval '30 days'),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
USING (user_id = auth.uid());

-- Add role column to profiles (user, manager)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role text NOT NULL DEFAULT 'user';

-- Add assign_to_user_id to leads for lead assignment
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS assigned_to_user_id uuid REFERENCES auth.users(id);

-- Create index for faster lead assignment queries
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to_user_id);

-- Update leads RLS to allow managers to see team leads
DROP POLICY IF EXISTS "Users can manage their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads"
ON public.leads FOR SELECT
USING (
  user_id = auth.uid() 
  OR assigned_to_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.team_members tm ON tm.team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    WHERE p.user_id = auth.uid() AND p.user_role = 'manager'
    AND public.leads.user_id = tm.user_id
  )
);

CREATE POLICY "Users can insert their own leads"
ON public.leads FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads"
ON public.leads FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Managers can update team leads"
ON public.leads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.team_members tm ON tm.team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    WHERE p.user_id = auth.uid() AND p.user_role = 'manager'
    AND public.leads.user_id = tm.user_id
  )
);

CREATE POLICY "Users can delete their own leads"
ON public.leads FOR DELETE
USING (user_id = auth.uid());

-- Create manager view for team call scores
CREATE OR REPLACE VIEW public.manager_team_stats AS
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
GROUP BY tm.team_id, tm.user_id, p.full_name, p.avatar_url;

-- Grant access to the view
GRANT SELECT ON public.manager_team_stats TO authenticated;

-- Create function to get user strengths based on scores
CREATE OR REPLACE FUNCTION public.get_user_strengths(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
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

-- Function to suggest best user for lead assignment
CREATE OR REPLACE FUNCTION public.suggest_lead_assignment(p_lead_id uuid, p_team_id uuid)
RETURNS TABLE(user_id uuid, full_name text, reason text, score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_stage text;
BEGIN
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

-- Trigger to create subscription for new users (30-day trial)
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  single_plan_id uuid;
BEGIN
  -- Get single_user plan id
  SELECT id INTO single_plan_id FROM public.plans WHERE name = 'single_user' LIMIT 1;
  
  IF single_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, trial_ends_at)
    VALUES (NEW.id, single_plan_id, 'trialing', now() + interval '30 days')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user subscription
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_subscription();