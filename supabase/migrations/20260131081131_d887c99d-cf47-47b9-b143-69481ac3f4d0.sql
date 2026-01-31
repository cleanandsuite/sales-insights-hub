-- Call limits table for warmup tracking and daily call limiting
CREATE TABLE public.call_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_limit INTEGER DEFAULT 20,
  warmup_start_date DATE DEFAULT CURRENT_DATE,
  enforce_limit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own limits
CREATE POLICY "Users can view own call limits"
ON public.call_limits FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own limits
CREATE POLICY "Users can insert own call limits"
ON public.call_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own limits
CREATE POLICY "Users can update own call limits"
ON public.call_limits FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_call_limits_updated_at
BEFORE UPDATE ON public.call_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();