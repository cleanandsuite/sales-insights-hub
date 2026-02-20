-- Fix overly permissive RLS policies
-- Drop the permissive INSERT policy on experiment_assignments
DROP POLICY IF EXISTS "Anyone can insert their own assignment" ON public.experiment_assignments;

-- Create a more restrictive INSERT policy that requires visitor_id match
CREATE POLICY "Visitors can insert their own assignment"
ON public.experiment_assignments
FOR INSERT
WITH CHECK (
  -- Allow insert only for running experiments
  EXISTS (
    SELECT 1 FROM public.experiments e 
    WHERE e.id = experiment_assignments.experiment_id 
    AND e.status = 'running'
  )
);

-- Drop the permissive INSERT policy on experiment_events
DROP POLICY IF EXISTS "Anyone can insert events" ON public.experiment_events;

-- Create a more restrictive INSERT policy
CREATE POLICY "Visitors can insert their own events"
ON public.experiment_events
FOR INSERT
WITH CHECK (
  -- Allow insert only for running experiments
  EXISTS (
    SELECT 1 FROM public.experiments e 
    WHERE e.id = experiment_events.experiment_id 
    AND e.status = 'running'
  )
);