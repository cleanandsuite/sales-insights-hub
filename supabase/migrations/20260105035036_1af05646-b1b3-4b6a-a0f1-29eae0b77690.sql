-- Add Salesforce context columns to call_recordings
ALTER TABLE public.call_recordings 
ADD COLUMN IF NOT EXISTS salesforce_contact_id TEXT,
ADD COLUMN IF NOT EXISTS salesforce_account_id TEXT,
ADD COLUMN IF NOT EXISTS salesforce_opportunity_id TEXT,
ADD COLUMN IF NOT EXISTS salesforce_lead_id TEXT,
ADD COLUMN IF NOT EXISTS crm_sync_status TEXT DEFAULT 'pending';

-- Create Salesforce sync queue table
CREATE TABLE IF NOT EXISTS public.salesforce_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for sync queue
ALTER TABLE public.salesforce_sync_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for sync queue
CREATE POLICY "Users can manage their sync queue items"
  ON public.salesforce_sync_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.call_recordings cr 
      WHERE cr.id = salesforce_sync_queue.recording_id 
      AND cr.user_id = auth.uid()
    )
  );

-- Add index for faster sync queue processing
CREATE INDEX IF NOT EXISTS idx_salesforce_sync_queue_status ON public.salesforce_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_salesforce_sync_queue_recording ON public.salesforce_sync_queue(recording_id);