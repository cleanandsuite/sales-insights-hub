-- Create security definer function to check team membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = _team_id
      AND user_id = _user_id
  )
$$;

-- Create security definer function to check if user is team admin/owner
CREATE OR REPLACE FUNCTION public.is_team_admin(_team_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = _team_id
      AND user_id = _user_id
      AND role = ANY (ARRAY['owner'::text, 'admin'::text])
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Members can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;

-- Create new policies using the security definer functions
CREATE POLICY "Members can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "Team admins can manage members"
ON public.team_members
FOR ALL
TO authenticated
USING (public.is_team_admin(team_id, auth.uid()))
WITH CHECK (public.is_team_admin(team_id, auth.uid()));