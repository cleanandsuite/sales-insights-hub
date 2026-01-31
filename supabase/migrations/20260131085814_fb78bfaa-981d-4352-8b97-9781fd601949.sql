-- Create storage bucket for call recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('call-recordings', 'call-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own recordings
CREATE POLICY "Users can upload their own call recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'call-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own recordings
CREATE POLICY "Users can read their own call recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'call-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to call recordings (for playback)
CREATE POLICY "Public read access to call recordings"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'call-recordings');