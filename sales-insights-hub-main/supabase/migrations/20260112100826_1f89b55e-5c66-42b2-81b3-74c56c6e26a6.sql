-- Create support_logs table for tracking chat analytics
CREATE TABLE public.support_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'chat_open', 'message_sent', 'unresolved', 'ticket_submitted'
  query_text TEXT,
  response_text TEXT,
  was_resolved BOOLEAN DEFAULT NULL,
  confidence_score NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for anonymous tracking)
CREATE POLICY "Anyone can insert support logs"
  ON public.support_logs
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON public.support_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON public.support_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for analytics queries
CREATE INDEX idx_support_logs_event_type ON public.support_logs(event_type);
CREATE INDEX idx_support_logs_created_at ON public.support_logs(created_at);