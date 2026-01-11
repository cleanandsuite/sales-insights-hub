-- Add soft delete column to call_recordings
ALTER TABLE public.call_recordings 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient filtering of non-deleted recordings
CREATE INDEX idx_call_recordings_deleted_at ON public.call_recordings(deleted_at) WHERE deleted_at IS NULL;