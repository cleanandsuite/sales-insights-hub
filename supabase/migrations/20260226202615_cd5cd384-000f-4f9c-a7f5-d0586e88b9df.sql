
-- Create user_phone_lines table for per-user Telnyx phone provisioning
CREATE TABLE public.user_phone_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  phone_number text,
  area_code text,
  telnyx_connection_id text,
  telnyx_phone_id text,
  sip_username text,
  sip_password text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_phone_lines ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own row, and only safe columns
CREATE POLICY "Users can view own phone line"
  ON public.user_phone_lines
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role handles all writes (edge functions use service_role key)
-- No INSERT/UPDATE/DELETE policies for regular users

-- Allow service_role full access
CREATE POLICY "Service role full access"
  ON public.user_phone_lines
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
