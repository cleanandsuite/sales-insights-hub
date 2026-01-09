-- =====================================================
-- SECURITY FIX: Restrict plans table access
-- Remove public access, require authentication
-- =====================================================

-- Drop existing public policy
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;

-- Create authenticated-only policy
CREATE POLICY "Authenticated users can view active plans"
ON public.plans FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);