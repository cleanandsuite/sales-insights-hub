-- =====================================================
-- SECURITY FIX: Restrict crm_contacts to owner-only access
-- Remove manager team-view to protect PII (email, phone)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view own CRM contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can update own CRM contacts" ON public.crm_contacts;

-- Strict owner-only SELECT policy (no manager access to PII)
CREATE POLICY "Owner only can view CRM contacts"
ON public.crm_contacts FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Strict owner-only UPDATE policy
CREATE POLICY "Owner only can update CRM contacts"
ON public.crm_contacts FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());