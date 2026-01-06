-- Make the call-recordings bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'call-recordings';

-- Update storage policy to allow public read access
CREATE POLICY "Public read access for call recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'call-recordings');

-- Keep existing upload policy for authenticated users
DROP POLICY IF EXISTS "Allow authenticated uploads to call-recordings" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to call-recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'call-recordings' 
  AND auth.role() = 'authenticated'
);

-- Keep existing update policy for owners
DROP POLICY IF EXISTS "Allow users to update their own recordings" ON storage.objects;
CREATE POLICY "Allow users to update their own recordings"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'call-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Keep existing delete policy for owners
DROP POLICY IF EXISTS "Allow users to delete their own recordings" ON storage.objects;
CREATE POLICY "Allow users to delete their own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'call-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);