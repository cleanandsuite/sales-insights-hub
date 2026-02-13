-- Create a SECURITY DEFINER function to check if a user is a manager of a lead's owner
CREATE OR REPLACE FUNCTION public.is_team_manager_of_lead_owner(_manager_user_id uuid, _lead_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM team_members tm1
    JOIN team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = _manager_user_id
      AND tm2.user_id = _lead_owner_id
      AND tm1.role IN ('manager', 'owner')
  )
$$;

-- Add policy for managers to view leads of their team members
CREATE POLICY "Team managers can view team leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  is_team_manager_of_lead_owner(auth.uid(), user_id)
);

-- Add policy for managers to update leads of their team members (for assignment)
CREATE POLICY "Team managers can update team leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  is_team_manager_of_lead_owner(auth.uid(), user_id)
)
WITH CHECK (
  is_team_manager_of_lead_owner(auth.uid(), user_id)
);