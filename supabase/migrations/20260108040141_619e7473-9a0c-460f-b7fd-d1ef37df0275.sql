-- Create leads_access_logs table for audit logging
CREATE TABLE public.leads_access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('view', 'edit', 'delete', 'export')),
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.leads_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs
CREATE POLICY "Users can insert their own lead access logs"
  ON public.leads_access_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own logs
CREATE POLICY "Users can view their own lead access logs"
  ON public.leads_access_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE or DELETE policies - logs are immutable

-- Add index for efficient querying
CREATE INDEX idx_leads_access_logs_user_id ON public.leads_access_logs(user_id);
CREATE INDEX idx_leads_access_logs_lead_id ON public.leads_access_logs(lead_id);
CREATE INDEX idx_leads_access_logs_accessed_at ON public.leads_access_logs(accessed_at DESC);