
-- 1. CRITICAL: Make call-recordings bucket private and remove public read policy
UPDATE storage.buckets 
SET public = false 
WHERE id = 'call-recordings';

DROP POLICY IF EXISTS "Public read access to call recordings" ON storage.objects;

-- 2. Fix experiment_assignments: restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can read experiment assignments" ON public.experiment_assignments;
DROP POLICY IF EXISTS "Anyone can create experiment assignments" ON public.experiment_assignments;

CREATE POLICY "Authenticated users can read experiment assignments"
ON public.experiment_assignments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create experiment assignments"
ON public.experiment_assignments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix experiment_events: restrict inserts to authenticated users
DROP POLICY IF EXISTS "Anyone can insert experiment events" ON public.experiment_events;

CREATE POLICY "Authenticated users can insert experiment events"
ON public.experiment_events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Fix support_logs: restrict anonymous read to own session only
DROP POLICY IF EXISTS "Users can view own logs" ON public.support_logs;

CREATE POLICY "Users can view own logs"
ON public.support_logs FOR SELECT
USING (auth.uid() = user_id);

-- 5. Fix support_logs: require authentication for inserts
DROP POLICY IF EXISTS "Anyone can insert support logs" ON public.support_logs;

CREATE POLICY "Authenticated users can insert support logs"
ON public.support_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
