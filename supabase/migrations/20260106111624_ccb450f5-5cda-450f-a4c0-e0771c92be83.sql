-- The manager_team_stats is a VIEW with security_invoker = true
-- It already has filtering built-in (WHERE EXISTS manager check)
-- But we need to ensure the underlying view access is working properly

-- Add rate limiting to invitation_check_logs (already handled via check_invitation_rate_limit function)
-- Add index to improve rate limit queries
CREATE INDEX IF NOT EXISTS idx_invitation_check_logs_ip_time ON public.invitation_check_logs(ip_address, checked_at);

-- Update the invitation_check_logs policy to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can insert invitation check logs" ON public.invitation_check_logs;

CREATE POLICY "Rate-limited invitation check inserts"
ON public.invitation_check_logs FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow insert if rate limit not exceeded (100 per hour per IP)
  check_invitation_rate_limit(COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', 'unknown'))
);

-- Add INSERT policy for user_subscriptions (needed for the trigger)
CREATE POLICY "System can insert subscriptions"
ON public.user_subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Ensure manager_team_stats view returns empty for non-managers
-- The view already filters via WHERE EXISTS for manager role, so it's protected