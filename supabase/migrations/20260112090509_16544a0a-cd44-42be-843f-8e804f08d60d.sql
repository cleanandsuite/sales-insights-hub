-- Insert the pricing_cta_test experiment
INSERT INTO public.experiments (name, description, status, traffic_percentage, started_at)
VALUES (
  'pricing_cta_test',
  'A/B test for pricing page CTA button text and urgency messaging',
  'running',
  100,
  now()
);

-- Get the experiment ID and insert variants
DO $$
DECLARE
  exp_id UUID;
BEGIN
  SELECT id INTO exp_id FROM public.experiments WHERE name = 'pricing_cta_test' LIMIT 1;
  
  -- Control variant (current design)
  INSERT INTO public.experiment_variants (experiment_id, name, weight, is_control, config)
  VALUES (
    exp_id,
    'Control',
    50,
    true,
    '{"buttonText": "Start Free 14-Day Trial Now", "urgencyText": "Limited: First 100 Spots at This Price", "buttonStyle": "default"}'::jsonb
  );
  
  -- Variant A (test variation)
  INSERT INTO public.experiment_variants (experiment_id, name, weight, is_control, config)
  VALUES (
    exp_id,
    'Variant A',
    50,
    false,
    '{"buttonText": "Claim Your Spot Now", "urgencyText": "Only 23 Left at This Price!", "buttonStyle": "animated"}'::jsonb
  );
END $$;