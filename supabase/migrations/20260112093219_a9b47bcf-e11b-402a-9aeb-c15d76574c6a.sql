-- Drop duplicate policy before recreating if needed
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;