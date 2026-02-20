-- Add AI-specific fields to leads table for enhanced CRM capabilities

-- AI Confidence Score (0-100)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_budget INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_authority INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_need INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_timeline INTEGER DEFAULT 0;

-- Sentiment and objection tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sentiment_trend JSONB DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS objection_patterns TEXT[] DEFAULT '{}';

-- AI suggestions and coaching
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_best_actions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_coaching_log JSONB DEFAULT '[]'::jsonb;

-- Predictions
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_velocity_days INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS predicted_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS predicted_deal_value DECIMAL(12,2);

-- Win/Loss tracking for ROI
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outcome VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outcome_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS actual_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS actual_deal_value DECIMAL(12,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_assisted BOOLEAN DEFAULT false;

-- Indexes for AI queries
CREATE INDEX IF NOT EXISTS idx_leads_ai_confidence ON leads(ai_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_leads_risk_level ON leads(risk_level);
CREATE INDEX IF NOT EXISTS idx_leads_predicted_close ON leads(predicted_close_date);
CREATE INDEX IF NOT EXISTS idx_leads_outcome ON leads(outcome);

-- Create AI coaching metrics table for ROI tracking
CREATE TABLE IF NOT EXISTS ai_coaching_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  suggestion_type VARCHAR(50) NOT NULL,
  suggestion_text TEXT NOT NULL,
  was_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  outcome_positive BOOLEAN,
  deal_value_impact DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_coaching_metrics
ALTER TABLE ai_coaching_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_coaching_metrics
CREATE POLICY "Users can view their own coaching metrics"
ON ai_coaching_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching metrics"
ON ai_coaching_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching metrics"
ON ai_coaching_metrics FOR UPDATE
USING (auth.uid() = user_id);

-- Create deal velocity tracking table
CREATE TABLE IF NOT EXISTS deal_velocity_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_velocity_days INTEGER,
  avg_deal_value DECIMAL(12,2),
  win_rate DECIMAL(5,2),
  ai_assisted_win_rate DECIMAL(5,2),
  total_deals INTEGER,
  ai_assisted_deals INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deal_velocity_benchmarks
ALTER TABLE deal_velocity_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_velocity_benchmarks
CREATE POLICY "Users can view their own velocity benchmarks"
ON deal_velocity_benchmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own velocity benchmarks"
ON deal_velocity_benchmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);