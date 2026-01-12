-- Fix remaining security issues

-- 1. Secure subscription_counter - remove public access
DROP POLICY IF EXISTS "Anyone can view subscription counter" ON subscription_counter;

-- Allow authenticated users to view (needed for pricing page)
CREATE POLICY "Authenticated view subscription counter"
ON subscription_counter FOR SELECT
TO authenticated
USING (true);

-- 2. Secure experiments table
DROP POLICY IF EXISTS "Anyone can view running experiments" ON experiments;
DROP POLICY IF EXISTS "Admins can manage experiments" ON experiments;

CREATE POLICY "Admins manage experiments"
ON experiments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Secure experiment_variants  
DROP POLICY IF EXISTS "Anyone can view variants of running experiments" ON experiment_variants;
DROP POLICY IF EXISTS "Admins can manage variants" ON experiment_variants;

CREATE POLICY "Admins manage experiment variants"
ON experiment_variants FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));