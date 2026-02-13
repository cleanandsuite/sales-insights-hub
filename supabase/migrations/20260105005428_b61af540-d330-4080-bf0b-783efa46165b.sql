-- Add columns for live recording and AI analysis
ALTER TABLE public.call_recordings 
ADD COLUMN IF NOT EXISTS live_transcription TEXT,
ADD COLUMN IF NOT EXISTS ai_suggestions JSONB,
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_call_recordings_status ON public.call_recordings(status);
CREATE INDEX IF NOT EXISTS idx_call_recordings_user_status ON public.call_recordings(user_id, status);