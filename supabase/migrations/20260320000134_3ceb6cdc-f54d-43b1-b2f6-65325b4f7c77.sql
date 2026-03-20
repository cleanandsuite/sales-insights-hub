-- 1. Fix profiles UPDATE policy: restrict columns users can update (prevent user_role escalation)
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_role IS NOT DISTINCT FROM (SELECT p.user_role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_active IS NOT DISTINCT FROM (SELECT p.is_active FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_status IS NOT DISTINCT FROM (SELECT p.subscription_status FROM public.profiles p WHERE p.user_id = auth.uid())
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.user_id = auth.uid())
  AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. Fix user_subscriptions UPDATE policy: only allow non-sensitive column updates
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND status IS NOT DISTINCT FROM (SELECT us.status FROM public.user_subscriptions us WHERE us.user_id = auth.uid())
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT us.stripe_customer_id FROM public.user_subscriptions us WHERE us.user_id = auth.uid())
  AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT us.stripe_subscription_id FROM public.user_subscriptions us WHERE us.user_id = auth.uid())
  AND plan_id IS NOT DISTINCT FROM (SELECT us.plan_id FROM public.user_subscriptions us WHERE us.user_id = auth.uid())
);

-- 3. Fix experiment_assignments: remove overly permissive anon policy
DROP POLICY IF EXISTS "Anonymous view by visitor_id" ON public.experiment_assignments;
DROP POLICY IF EXISTS "Authenticated users can read experiment assignments" ON public.experiment_assignments;