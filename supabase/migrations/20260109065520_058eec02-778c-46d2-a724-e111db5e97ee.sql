-- Add coach style preference to ai_lead_settings or create new table
ALTER TABLE public.ai_lead_settings 
ADD COLUMN IF NOT EXISTS live_coach_style text DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS live_coaching_enabled boolean DEFAULT false;

-- Create table for live coaching suggestions history
CREATE TABLE IF NOT EXISTS public.live_coaching_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  coach_style text NOT NULL DEFAULT 'neutral',
  suggestion_type text NOT NULL,
  suggestion_text text NOT NULL,
  transcript_context text,
  timestamp_seconds integer,
  was_helpful boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_coaching_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own coaching suggestions" 
ON public.live_coaching_suggestions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching suggestions" 
ON public.live_coaching_suggestions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching suggestions" 
ON public.live_coaching_suggestions FOR UPDATE 
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_live_coaching_recording 
ON public.live_coaching_suggestions(recording_id);

CREATE INDEX IF NOT EXISTS idx_live_coaching_user 
ON public.live_coaching_suggestions(user_id, created_at DESC);