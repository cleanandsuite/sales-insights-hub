-- Create a public function to get pricing availability without exposing full table
-- This allows the pricing page to work for unauthenticated visitors
CREATE OR REPLACE FUNCTION public.get_public_pricing_availability()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  single_user_row subscription_counter%ROWTYPE;
  now_ts TIMESTAMP WITH TIME ZONE := NOW();
  deadline_ts TIMESTAMP WITH TIME ZONE;
  is_deadline_passed BOOLEAN;
  spots_remaining INTEGER;
BEGIN
  -- Get single_user plan data
  SELECT * INTO single_user_row 
  FROM subscription_counter 
  WHERE plan_type = 'single_user' 
  LIMIT 1;
  
  -- Use defaults if no data
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'singleUser', jsonb_build_object(
        'available', true,
        'spotsRemaining', 100,
        'grandfatheredPrice', 29,
        'regularPrice', 49
      ),
      'deadline', '2026-01-31T23:59:59Z',
      'isDeadlinePassed', false
    );
  END IF;
  
  deadline_ts := single_user_row.deadline;
  is_deadline_passed := now_ts > deadline_ts;
  spots_remaining := GREATEST(0, COALESCE(single_user_row.max_spots, 100) - COALESCE(single_user_row.count, 0));
  
  RETURN jsonb_build_object(
    'singleUser', jsonb_build_object(
      'available', NOT is_deadline_passed AND spots_remaining > 0,
      'spotsRemaining', spots_remaining,
      'grandfatheredPrice', COALESCE(single_user_row.grandfathered_price_cents, 2900) / 100,
      'regularPrice', COALESCE(single_user_row.regular_price_cents, 4900) / 100
    ),
    'deadline', deadline_ts,
    'isDeadlinePassed', is_deadline_passed
  );
END;
$$;

-- Grant execute to anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_pricing_availability() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_pricing_availability() TO authenticated;