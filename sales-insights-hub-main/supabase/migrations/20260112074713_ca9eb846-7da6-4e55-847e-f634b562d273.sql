-- Add 'admin' to user role enum if not exists
DO $$
BEGIN
  -- Check if 'admin' value already exists in user_role column check constraint
  -- Since user_role is text with default 'user', we'll create a proper role table
END $$;

-- Create app_role enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');
  END IF;
END $$;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create user_billing table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'none',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on user_billing
ALTER TABLE public.user_billing ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_billing - owner only
CREATE POLICY "Users can view their own billing"
ON public.user_billing
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing"
ON public.user_billing
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access to billing"
ON public.user_billing
FOR ALL
USING (auth.role() = 'service_role');

-- Create profile_access_logs for audit
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accessed_user_id uuid NOT NULL,
  accessed_at timestamp with time zone DEFAULT now() NOT NULL,
  ip_address text,
  action text DEFAULT 'view'
);

-- Enable RLS on profile_access_logs
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view profile access logs
CREATE POLICY "Admins can view profile access logs"
ON public.profile_access_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert profile access logs"
ON public.profile_access_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create crm_contacts_access_logs for audit
CREATE TABLE IF NOT EXISTS public.crm_contacts_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  accessed_at timestamp with time zone DEFAULT now() NOT NULL,
  ip_address text,
  action text DEFAULT 'view'
);

-- Enable RLS
ALTER TABLE public.crm_contacts_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own access logs"
ON public.crm_contacts_access_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all access logs"
ON public.crm_contacts_access_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create subscription_counter for tracking grandfathered spots
CREATE TABLE IF NOT EXISTS public.subscription_counter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type text NOT NULL UNIQUE,
  count integer DEFAULT 0 NOT NULL,
  max_spots integer DEFAULT 100 NOT NULL,
  deadline timestamp with time zone DEFAULT '2026-01-31 23:59:59+00'::timestamptz NOT NULL,
  grandfathered_price_cents integer NOT NULL,
  regular_price_cents integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscription_counter ENABLE ROW LEVEL SECURITY;

-- Everyone can read counter (for pricing display)
CREATE POLICY "Anyone can view subscription counter"
ON public.subscription_counter
FOR SELECT
USING (true);

-- Only service role can update
CREATE POLICY "Service role can update counter"
ON public.subscription_counter
FOR ALL
USING (auth.role() = 'service_role');

-- Insert initial counter data
INSERT INTO public.subscription_counter (plan_type, count, max_spots, grandfathered_price_cents, regular_price_cents)
VALUES 
  ('single_user', 0, 100, 2900, 4900),
  ('enterprise', 0, 100, 7900, 9900)
ON CONFLICT (plan_type) DO NOTHING;

-- A/B Testing Tables
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  traffic_percentage integer DEFAULT 100 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  started_at timestamp with time zone,
  ended_at timestamp with time zone
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- Public can read running experiments
CREATE POLICY "Anyone can view running experiments"
ON public.experiments
FOR SELECT
USING (status = 'running' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage experiments"
ON public.experiments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Experiment variants
CREATE TABLE IF NOT EXISTS public.experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  weight integer DEFAULT 50 CHECK (weight >= 0 AND weight <= 100),
  is_control boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (experiment_id, name)
);

ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view variants of running experiments"
ON public.experiment_variants
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.experiments e 
  WHERE e.id = experiment_variants.experiment_id 
  AND (e.status = 'running' OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Admins can manage variants"
ON public.experiment_variants
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Experiment assignments (visitor -> variant mapping)
CREATE TABLE IF NOT EXISTS public.experiment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid REFERENCES public.experiment_variants(id) ON DELETE CASCADE NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (experiment_id, visitor_id)
);

ALTER TABLE public.experiment_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own assignment"
ON public.experiment_assignments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their own assignments"
ON public.experiment_assignments
FOR SELECT
USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id' 
  OR user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all assignments"
ON public.experiment_assignments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Experiment events (tracking)
CREATE TABLE IF NOT EXISTS public.experiment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid REFERENCES public.experiment_variants(id) ON DELETE CASCADE NOT NULL,
  assignment_id uuid REFERENCES public.experiment_assignments(id) ON DELETE SET NULL,
  visitor_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  revenue_cents integer,
  plan_type text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.experiment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events"
ON public.experiment_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all events"
ON public.experiment_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiment_events_experiment ON public.experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_variant ON public.experiment_events(variant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_visitor ON public.experiment_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_visitor ON public.experiment_assignments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON public.experiment_assignments(experiment_id);

-- Add encrypted_email and encrypted_phone columns to crm_contacts for app-layer encryption
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS encrypted_email text;
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS encrypted_phone text;

-- Migrate existing billing data from profiles to user_billing
INSERT INTO public.user_billing (user_id, stripe_customer_id, stripe_subscription_id, subscription_status)
SELECT user_id, stripe_customer_id, stripe_subscription_id, subscription_status
FROM public.profiles
WHERE stripe_customer_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
  subscription_status = EXCLUDED.subscription_status;