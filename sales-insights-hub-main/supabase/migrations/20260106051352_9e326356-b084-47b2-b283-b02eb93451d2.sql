-- Security Fix 1: CRM Access Audit Table
CREATE TABLE IF NOT EXISTS public.crm_access_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connection_id UUID REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.crm_access_audit ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit logs
CREATE POLICY "Users can view their own CRM audit logs"
  ON public.crm_access_audit FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own audit logs
CREATE POLICY "Users can insert their own CRM audit logs"
  ON public.crm_access_audit FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Security Fix 2: Contact Access Audit Table
CREATE TABLE IF NOT EXISTS public.contact_access_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.contact_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contact access logs"
  ON public.contact_access_audit FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact access logs"
  ON public.contact_access_audit FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Security Fix 3: Secure Recording Metadata Table
CREATE TABLE IF NOT EXISTS public.secure_recording_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.secure_recording_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recording metadata"
  ON public.secure_recording_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recording metadata"
  ON public.secure_recording_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recording metadata"
  ON public.secure_recording_metadata FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recording metadata"
  ON public.secure_recording_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- Security Fix 4: Storage Access Logs Table
CREATE TABLE IF NOT EXISTS public.storage_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.storage_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storage access logs"
  ON public.storage_access_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage access logs"
  ON public.storage_access_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Rate limiting function for CRM access
CREATE OR REPLACE FUNCTION public.check_crm_rate_limit(p_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_access_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_access_count
  FROM crm_access_audit
  WHERE user_id = p_user_id
    AND accessed_at > NOW() - INTERVAL '1 hour';
    
  RETURN recent_access_count < 50;
END;
$$;

-- Rate limiting function for contact access
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(p_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_access_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_access_count
  FROM contact_access_audit
  WHERE user_id = p_user_id
    AND accessed_at > NOW() - INTERVAL '1 hour';
    
  RETURN recent_access_count < 1000;
END;
$$;