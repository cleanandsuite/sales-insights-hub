-- Create a SECURITY DEFINER function to check if user is a manager of a team member
-- This avoids the infinite recursion issue in RLS policies
CREATE OR REPLACE FUNCTION public.is_manager_of_user(_target_user_id uuid, _current_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN team_members tm1 ON tm1.user_id = _current_user_id
    JOIN team_members tm2 ON tm2.team_id = tm1.team_id AND tm2.user_id = _target_user_id
    WHERE p.user_id = _current_user_id
      AND p.user_role = 'manager'
  )
$$;

-- Drop and recreate the problematic SELECT policy on profiles
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;

-- Create a new policy that uses the SECURITY DEFINER function to avoid recursion
CREATE POLICY "Users can view own profile or managers can view team members"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR public.is_manager_of_user(user_id, auth.uid())
  )
);