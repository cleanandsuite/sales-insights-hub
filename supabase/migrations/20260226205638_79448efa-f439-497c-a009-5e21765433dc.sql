ALTER TABLE public.scheduled_calls 
ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_minutes_before integer NOT NULL DEFAULT 30;