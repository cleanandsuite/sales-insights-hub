-- Fix overly permissive INSERT on experiment_assignments
DROP POLICY IF EXISTS "Anyone can insert experiment assignments" ON public.experiment_assignments;

CREATE POLICY "Authenticated or visitor can insert assignments" ON public.experiment_assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM experiments e
    WHERE e.id = experiment_assignments.experiment_id
    AND e.status = 'running'
  )
);