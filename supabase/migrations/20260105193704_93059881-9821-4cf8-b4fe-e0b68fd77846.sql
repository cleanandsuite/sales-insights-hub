-- Create coaching_sessions table to track AI coaching analysis
CREATE TABLE public.coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Coaching Analysis Results
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  win_probability INTEGER CHECK (win_probability >= 0 AND win_probability <= 100),
  potential_win_probability INTEGER CHECK (potential_win_probability >= 0 AND potential_win_probability <= 100),
  
  -- Missed Opportunities
  missed_opportunities JSONB DEFAULT '[]',
  -- Format: [{ "moment": "timestamp", "what_happened": "...", "what_should_have_said": "...", "impact": "high|medium|low" }]
  
  -- Deal Risk Analysis
  deal_risks JSONB DEFAULT '[]',
  -- Format: [{ "risk": "...", "severity": "critical|warning|info", "recommendation": "..." }]
  
  -- Better Responses Suggestions
  better_responses JSONB DEFAULT '[]',
  -- Format: [{ "original": "...", "suggested": "...", "reasoning": "...", "expected_impact": "..." }]
  
  -- Improvement Plan
  improvement_areas JSONB DEFAULT '[]',
  -- Format: [{ "area": "...", "current_score": 0, "target_score": 0, "tips": [...] }]
  
  -- Key Moments
  key_moments JSONB DEFAULT '[]',
  -- Format: [{ "timestamp": "...", "type": "positive|negative|neutral", "description": "...", "significance": "..." }]
  
  -- Summary
  executive_summary TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  action_items TEXT[]
);

-- Create coaching_metrics table for ROI tracking
CREATE TABLE public.coaching_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coaching_session_id UUID REFERENCES public.coaching_sessions(id) ON DELETE SET NULL,
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Suggestion Tracking
  suggestion_type TEXT NOT NULL, -- 'missed_opportunity', 'better_response', 'risk_mitigation'
  suggestion_text TEXT NOT NULL,
  
  -- Outcome Tracking
  was_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  outcome_recorded BOOLEAN DEFAULT false,
  outcome_positive BOOLEAN,
  outcome_notes TEXT,
  
  -- Deal Outcome
  deal_stage_before TEXT,
  deal_stage_after TEXT,
  deal_won BOOLEAN,
  deal_value DECIMAL(12,2)
);

-- Create coaching_benchmarks for tracking improvement over time
CREATE TABLE public.coaching_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Aggregate Metrics
  total_calls INTEGER DEFAULT 0,
  total_coaching_sessions INTEGER DEFAULT 0,
  average_score INTEGER,
  average_win_probability INTEGER,
  
  -- Improvement Metrics
  suggestions_given INTEGER DEFAULT 0,
  suggestions_applied INTEGER DEFAULT 0,
  deals_won INTEGER DEFAULT 0,
  deals_lost INTEGER DEFAULT 0,
  total_deal_value DECIMAL(14,2) DEFAULT 0,
  
  -- Skill Improvements
  skill_improvements JSONB DEFAULT '{}'
  -- Format: { "discovery": { "before": 60, "after": 75 }, "closing": { "before": 50, "after": 68 } }
);

-- Enable RLS
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their coaching sessions"
  ON public.coaching_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their coaching metrics"
  ON public.coaching_metrics FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their coaching benchmarks"
  ON public.coaching_benchmarks FOR ALL
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_coaching_sessions_user ON public.coaching_sessions(user_id);
CREATE INDEX idx_coaching_sessions_recording ON public.coaching_sessions(recording_id);
CREATE INDEX idx_coaching_metrics_user ON public.coaching_metrics(user_id);
CREATE INDEX idx_coaching_metrics_session ON public.coaching_metrics(coaching_session_id);
CREATE INDEX idx_coaching_benchmarks_user ON public.coaching_benchmarks(user_id);
CREATE INDEX idx_coaching_benchmarks_period ON public.coaching_benchmarks(period_start, period_end);