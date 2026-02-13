-- =====================================================
-- SECURITY FIX: Lock down sensitive tables with proper RLS
-- Block all anonymous/public access, enforce owner/manager policies
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE - Stricter RLS
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Require authentication for all access
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN team_members tm ON tm.user_id = profiles.user_id
      WHERE p.user_id = auth.uid() 
      AND p.user_role = 'manager'
      AND tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 2. CRM_CONTACTS TABLE - Stricter RLS
-- =====================================================
-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their CRM contacts" ON public.crm_contacts;

-- Separate policies for each operation with auth check
CREATE POLICY "Authenticated users can view own CRM contacts"
ON public.crm_contacts FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN team_members tm ON tm.user_id = crm_contacts.user_id
      WHERE p.user_id = auth.uid()
      AND p.user_role = 'manager'
      AND tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Authenticated users can insert own CRM contacts"
ON public.crm_contacts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own CRM contacts"
ON public.crm_contacts FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN team_members tm ON tm.user_id = crm_contacts.user_id
      WHERE p.user_id = auth.uid()
      AND p.user_role = 'manager'
      AND tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Authenticated users can delete own CRM contacts"
ON public.crm_contacts FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- 3. CRM_CONNECTIONS TABLE - Stricter RLS (most sensitive)
-- =====================================================
-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their CRM connections" ON public.crm_connections;

-- Strict owner-only access for CRM connections (contains tokens)
CREATE POLICY "Authenticated users can view own CRM connections"
ON public.crm_connections FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own CRM connections"
ON public.crm_connections FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own CRM connections"
ON public.crm_connections FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own CRM connections"
ON public.crm_connections FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =====================================================
-- 4. LEADS TABLE - Enhanced RLS with manager access
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
DROP POLICY IF EXISTS "Managers can update team leads" ON public.leads;

-- Comprehensive leads policies with auth check
CREATE POLICY "Authenticated users can view leads"
ON public.leads FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR assigned_to_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN team_members tm ON tm.user_id = leads.user_id
      WHERE p.user_id = auth.uid()
      AND p.user_role = 'manager'
      AND tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Authenticated users can insert own leads"
ON public.leads FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update leads"
ON public.leads FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN team_members tm ON tm.user_id = leads.user_id
      WHERE p.user_id = auth.uid()
      AND p.user_role = 'manager'
      AND tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Authenticated users can delete own leads"
ON public.leads FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);