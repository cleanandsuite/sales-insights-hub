ALTER TABLE public.call_recordings 
  ADD COLUMN IF NOT EXISTS call_disposition text,
  ADD COLUMN IF NOT EXISTS disposition_confidence integer;