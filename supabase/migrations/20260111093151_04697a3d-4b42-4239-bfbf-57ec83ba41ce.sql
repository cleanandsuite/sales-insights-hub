-- Add name column to call_recordings table
ALTER TABLE public.call_recordings ADD COLUMN IF NOT EXISTS name text;

-- Set default name for existing recordings (using file_name as fallback)
UPDATE public.call_recordings SET name = file_name WHERE name IS NULL;