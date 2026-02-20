-- Create leads table for AI-generated leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  
  -- Contact information
  contact_name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  
  -- AI-generated scores and analysis
  ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  priority_score NUMERIC CHECK (priority_score >= 0 AND priority_score <= 10),
  lead_status TEXT NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'call',
  
  -- Pain points and context
  primary_pain_point TEXT,
  secondary_issues TEXT[],
  budget_info TEXT,
  timeline TEXT,
  decision_timeline_days INTEGER,
  team_size INTEGER,
  competitor_status TEXT,
  evaluation_stage TEXT,
  
  -- Call context
  call_duration_seconds INTEGER,
  talk_ratio NUMERIC,
  engagement_score NUMERIC,
  key_quotes JSONB DEFAULT '[]'::jsonb,
  key_moments JSONB DEFAULT '[]'::jsonb,
  
  -- Next steps
  next_action TEXT,
  next_action_due TIMESTAMP WITH TIME ZONE,
  agreed_next_steps TEXT[],
  prep_questions TEXT[],
  materials_needed TEXT[],
  
  -- Tracking
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  follow_up_count INTEGER DEFAULT 0,
  is_hot_lead BOOLEAN DEFAULT false,
  urgency_level TEXT DEFAULT 'medium',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create call_summaries table for detailed call analysis
CREATE TABLE public.call_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- 30-second skim
  quick_skim JSONB DEFAULT '{}'::jsonb,
  -- Contains: pain, need, budget, timeline, urgency
  
  -- Key points
  key_points TEXT[],
  last_exchanges JSONB DEFAULT '[]'::jsonb,
  watch_out_for TEXT[],
  agreed_next_steps TEXT[],
  
  -- AI analysis
  emotional_tone TEXT,
  objections_raised TEXT[],
  questions_asked JSONB DEFAULT '[]'::jsonb,
  urgency_indicators TEXT[],
  decision_makers TEXT[],
  competitive_mentions TEXT[],
  
  -- Metrics
  talk_ratio_them NUMERIC,
  talk_ratio_you NUMERIC,
  question_count_them INTEGER,
  question_count_you INTEGER,
  positive_signals INTEGER DEFAULT 0,
  concern_signals INTEGER DEFAULT 0,
  engagement_score NUMERIC,
  
  -- Coaching
  strengths TEXT[],
  improvements TEXT[],
  suggestions_next_call TEXT[],
  
  -- Pre-call prep
  review_before_calling TEXT[],
  questions_to_ask TEXT[],
  materials_needed TEXT[],
  conversation_starters TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_activities table for activity timeline
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_lead_settings table for user preferences
CREATE TABLE public.ai_lead_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Trigger keywords
  trigger_keywords TEXT[] DEFAULT ARRAY['interested', 'pricing', 'cost', 'budget', 'demo', 'trial', 'buy', 'purchase', 'problem', 'struggling']::text[],
  custom_keywords TEXT[],
  
  -- Summary settings
  create_30s_skim BOOLEAN DEFAULT true,
  extract_key_points BOOLEAN DEFAULT true,
  capture_next_steps BOOLEAN DEFAULT true,
  note_emotional_tone BOOLEAN DEFAULT true,
  track_objections BOOLEAN DEFAULT true,
  record_questions BOOLEAN DEFAULT true,
  highlight_urgency BOOLEAN DEFAULT true,
  identify_decision_makers BOOLEAN DEFAULT true,
  note_competitive_mentions BOOLEAN DEFAULT true,
  
  -- Summary length preference
  summary_length TEXT DEFAULT '30_second',
  
  -- Highlight detection
  auto_bold_pain_points BOOLEAN DEFAULT true,
  auto_flag_budget BOOLEAN DEFAULT true,
  auto_tag_timeline BOOLEAN DEFAULT true,
  auto_highlight_competitors BOOLEAN DEFAULT true,
  show_tone_markers BOOLEAN DEFAULT true,
  show_decision_signals BOOLEAN DEFAULT true,
  
  -- AI status
  is_ai_active BOOLEAN DEFAULT true,
  is_test_mode BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_lead_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Users can manage their own leads"
  ON public.leads FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for call_summaries
CREATE POLICY "Users can manage summaries for their recordings"
  ON public.call_summaries FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for lead_activities
CREATE POLICY "Users can manage their lead activities"
  ON public.lead_activities FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for ai_lead_settings
CREATE POLICY "Users can manage their AI lead settings"
  ON public.ai_lead_settings FOR ALL
  USING (user_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_call_summaries_updated_at
  BEFORE UPDATE ON public.call_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_lead_settings_updated_at
  BEFORE UPDATE ON public.ai_lead_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();