-- Add rate limiting for anonymous support_logs inserts
-- Create a function to check rate limit before insert
CREATE OR REPLACE FUNCTION public.check_support_log_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count INTEGER;
  ip_hash TEXT;
BEGIN
  -- For authenticated users, limit to 100 per hour per user
  IF NEW.user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM support_logs
    WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 100 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
    END IF;
  ELSE
    -- For anonymous users, limit to 50 per hour per session
    SELECT COUNT(*) INTO recent_count
    FROM support_logs
    WHERE session_id = NEW.session_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 50 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS support_logs_rate_limit ON support_logs;
CREATE TRIGGER support_logs_rate_limit
  BEFORE INSERT ON support_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_support_log_rate_limit();

-- Add index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_support_logs_session_created 
  ON support_logs(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_support_logs_user_created 
  ON support_logs(user_id, created_at) 
  WHERE user_id IS NOT NULL;