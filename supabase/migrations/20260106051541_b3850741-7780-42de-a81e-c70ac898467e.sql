-- FIX 5: Secure Team Invitations
-- Add invitation tokens for secure invitation handling
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Generate tokens for existing invitations
UPDATE public.team_invitations 
SET invitation_token = encode(gen_random_bytes(32), 'hex'),
    token_expires_at = created_at + INTERVAL '7 days'
WHERE invitation_token IS NULL;

-- Invitation check logs for rate limiting
CREATE TABLE IF NOT EXISTS public.invitation_check_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  invitation_token TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  was_valid BOOLEAN
);

-- Enable RLS
ALTER TABLE public.invitation_check_logs ENABLE ROW LEVEL SECURITY;

-- Only allow inserts (no select for security)
CREATE POLICY "Allow insert invitation check logs"
  ON public.invitation_check_logs FOR INSERT
  WITH CHECK (true);

-- Rate limiting function for invitations
CREATE OR REPLACE FUNCTION public.check_invitation_rate_limit(p_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_checks INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_checks
  FROM invitation_check_logs
  WHERE ip_address = p_ip
    AND checked_at > NOW() - INTERVAL '1 hour';
    
  RETURN recent_checks < 100;
END;
$$;

-- FIX 6: Security Logs Table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own security logs
CREATE POLICY "Users can view their own security logs"
  ON public.security_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own security logs
CREATE POLICY "Users can insert their own security logs"
  ON public.security_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Transcription logs for rate limiting
CREATE TABLE IF NOT EXISTS public.transcription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration INTEGER,
  service_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transcription_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transcription logs"
  ON public.transcription_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcription logs"
  ON public.transcription_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Password strength check function
CREATE OR REPLACE FUNCTION public.check_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Minimum 8 characters
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- At least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- At least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- At least one number
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- At least one special character
  IF password !~ '[^A-Za-z0-9]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;