
-- SMS messages table
CREATE TABLE public.sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  to_number text NOT NULL,
  from_number text NOT NULL,
  body text NOT NULL CHECK (length(body) <= 1600),
  direction text NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
  telnyx_message_id text,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own SMS" ON public.sms_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMS" ON public.sms_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Full-text search index on call transcripts
CREATE INDEX idx_call_recordings_transcript_fts
  ON public.call_recordings
  USING GIN (to_tsvector('english', COALESCE(live_transcription, '')));
