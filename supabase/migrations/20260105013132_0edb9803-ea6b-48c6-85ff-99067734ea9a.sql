-- ==========================================
-- AI SALES COACH PLATFORM - FULL SCHEMA
-- ==========================================

-- 1. TEAM MANAGEMENT TABLES
-- ------------------------------------------

-- Teams table for organization structure
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members with roles
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team invitations
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- 2. RECORDING SHARING & COLLABORATION
-- ------------------------------------------

-- Shared recordings
CREATE TABLE public.recording_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with_user_id UUID,
  shared_with_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timestamped comments on recordings
CREATE TABLE public.recording_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  timestamp_seconds NUMERIC,
  parent_id UUID REFERENCES public.recording_comments(id) ON DELETE CASCADE,
  mentions UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Action items from recordings
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  created_by UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. CRM INTEGRATION (SALESFORCE)
-- ------------------------------------------

-- CRM connections
CREATE TABLE public.crm_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('salesforce', 'hubspot', 'pipedrive')),
  instance_url TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM contacts synced
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crm_connection_id UUID NOT NULL REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  account_id TEXT,
  account_name TEXT,
  owner_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link recordings to CRM entities
CREATE TABLE public.recording_crm_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  crm_connection_id UUID NOT NULL REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  contact_id TEXT,
  account_id TEXT,
  opportunity_id TEXT,
  lead_id TEXT,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'error')),
  metadata JSONB
);

-- 4. CALL SCHEDULING
-- ------------------------------------------

-- Scheduled calls
CREATE TABLE public.scheduled_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  contact_name TEXT,
  contact_email TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_url TEXT,
  meeting_provider TEXT CHECK (meeting_provider IN ('zoom', 'teams', 'google_meet', 'other')),
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  prep_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pre-call preparation templates
CREATE TABLE public.call_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  talking_points JSONB,
  questions JSONB,
  objectives TEXT[],
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. COACHING & SCORING
-- ------------------------------------------

-- Call scores
CREATE TABLE public.call_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  rapport_score NUMERIC CHECK (rapport_score >= 0 AND rapport_score <= 100),
  discovery_score NUMERIC CHECK (discovery_score >= 0 AND discovery_score <= 100),
  presentation_score NUMERIC CHECK (presentation_score >= 0 AND presentation_score <= 100),
  objection_handling_score NUMERIC CHECK (objection_handling_score >= 0 AND objection_handling_score <= 100),
  closing_score NUMERIC CHECK (closing_score >= 0 AND closing_score <= 100),
  talk_ratio NUMERIC,
  filler_words_count INTEGER,
  questions_asked INTEGER,
  competitor_mentions TEXT[],
  price_mentions INTEGER,
  ai_feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User skill tracking over time
CREATE TABLE public.skill_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training recommendations
CREATE TABLE public.training_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_area TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('video', 'article', 'course', 'practice')),
  priority INTEGER NOT NULL DEFAULT 5,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team benchmarks
CREATE TABLE public.team_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. SETTINGS & PREFERENCES
-- ------------------------------------------

-- User settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Audio settings
  default_mic_device_id TEXT,
  default_speaker_device_id TEXT,
  audio_quality TEXT NOT NULL DEFAULT 'balanced' CHECK (audio_quality IN ('high', 'balanced', 'data_saver')),
  noise_cancellation BOOLEAN NOT NULL DEFAULT true,
  
  -- AI preferences
  suggestion_frequency TEXT NOT NULL DEFAULT 'normal' CHECK (suggestion_frequency IN ('aggressive', 'normal', 'minimal')),
  focus_areas TEXT[] DEFAULT ARRAY['rapport', 'objection_handling', 'closing'],
  auto_analyze BOOLEAN NOT NULL DEFAULT true,
  
  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  daily_summary BOOLEAN NOT NULL DEFAULT false,
  
  -- Privacy
  auto_redact_pii BOOLEAN NOT NULL DEFAULT true,
  retention_days INTEGER DEFAULT 90,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. COMPLIANCE & AUDIT
-- ------------------------------------------

-- Access logs
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Consent tracking
CREATE TABLE public.recording_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_type TEXT CHECK (consent_type IN ('verbal', 'written', 'implicit')),
  participant_name TEXT,
  participant_email TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data deletion requests (GDPR)
CREATE TABLE public.deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('recording', 'account', 'all_data')),
  recording_id UUID REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID
);

-- 8. DEAL INTELLIGENCE
-- ------------------------------------------

-- Deal analysis from recordings
CREATE TABLE public.deal_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  competitor_mentions JSONB,
  price_objections JSONB,
  buying_signals JSONB,
  risk_factors JSONB,
  win_probability NUMERIC CHECK (win_probability >= 0 AND win_probability <= 100),
  deal_stage_suggestion TEXT,
  next_steps JSONB,
  pricing_discussed BOOLEAN NOT NULL DEFAULT false,
  budget_mentioned NUMERIC,
  decision_timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to call_recordings for enhanced analysis
ALTER TABLE public.call_recordings 
ADD COLUMN IF NOT EXISTS timestamped_transcript JSONB,
ADD COLUMN IF NOT EXISTS ai_markers JSONB,
ADD COLUMN IF NOT EXISTS call_score_id UUID,
ADD COLUMN IF NOT EXISTS deal_analysis_id UUID,
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_crm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_analysis ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- ------------------------------------------

-- Teams policies
CREATE POLICY "Team owners can do everything" ON public.teams
FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their teams" ON public.teams
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid())
);

-- Team members policies
CREATE POLICY "Team admins can manage members" ON public.team_members
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role IN ('owner', 'admin'))
);

CREATE POLICY "Members can view team members" ON public.team_members
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
);

-- Recording shares policies
CREATE POLICY "Users can share their own recordings" ON public.recording_shares
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.call_recordings 
    WHERE id = recording_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view shares for their recordings or shared with them" ON public.recording_shares
FOR SELECT USING (
  shared_by = auth.uid() 
  OR shared_with_user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = shared_with_team_id AND tm.user_id = auth.uid())
);

-- Recording comments policies
CREATE POLICY "Users can comment on accessible recordings" ON public.recording_comments
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.recording_shares 
    WHERE recording_id = recording_comments.recording_id 
    AND (shared_with_user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = shared_with_team_id AND user_id = auth.uid()
    ))
    AND permission IN ('comment', 'edit'))
);

CREATE POLICY "Users can view comments on accessible recordings" ON public.recording_comments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.recording_shares 
    WHERE recording_id = recording_comments.recording_id 
    AND (shared_with_user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = shared_with_team_id AND user_id = auth.uid()
    )))
);

CREATE POLICY "Users can update own comments" ON public.recording_comments
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.recording_comments
FOR DELETE USING (user_id = auth.uid());

-- Action items policies
CREATE POLICY "Users can manage action items on their recordings" ON public.action_items
FOR ALL USING (
  created_by = auth.uid() 
  OR assigned_to = auth.uid()
  OR EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

-- CRM connections policies
CREATE POLICY "Users can manage their CRM connections" ON public.crm_connections
FOR ALL USING (user_id = auth.uid());

-- CRM contacts policies
CREATE POLICY "Users can manage their CRM contacts" ON public.crm_contacts
FOR ALL USING (user_id = auth.uid());

-- Recording CRM links policies
CREATE POLICY "Users can manage their recording CRM links" ON public.recording_crm_links
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

-- Scheduled calls policies
CREATE POLICY "Users can manage their scheduled calls" ON public.scheduled_calls
FOR ALL USING (user_id = auth.uid());

-- Call templates policies
CREATE POLICY "Users can manage their templates" ON public.call_templates
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team members can view team templates" ON public.call_templates
FOR SELECT USING (
  team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.team_members WHERE team_id = call_templates.team_id AND user_id = auth.uid()
  )
);

-- Call scores policies
CREATE POLICY "Users can view scores for their recordings" ON public.call_scores
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

CREATE POLICY "System can insert scores" ON public.call_scores
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

-- Skill progress policies
CREATE POLICY "Users can view and manage their skill progress" ON public.skill_progress
FOR ALL USING (user_id = auth.uid());

-- Training recommendations policies
CREATE POLICY "Users can manage their training recommendations" ON public.training_recommendations
FOR ALL USING (user_id = auth.uid());

-- Team benchmarks policies
CREATE POLICY "Team members can view benchmarks" ON public.team_benchmarks
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_benchmarks.team_id AND user_id = auth.uid())
);

-- User settings policies
CREATE POLICY "Users can manage their own settings" ON public.user_settings
FOR ALL USING (user_id = auth.uid());

-- Access logs policies (users can view their own)
CREATE POLICY "Users can view their access logs" ON public.access_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert access logs" ON public.access_logs
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Recording consent policies
CREATE POLICY "Users can manage consent for their recordings" ON public.recording_consent
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

-- Deletion requests policies
CREATE POLICY "Users can manage their deletion requests" ON public.deletion_requests
FOR ALL USING (user_id = auth.uid());

-- Deal analysis policies
CREATE POLICY "Users can view deal analysis for their recordings" ON public.deal_analysis
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

CREATE POLICY "System can insert deal analysis" ON public.deal_analysis
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.call_recordings WHERE id = recording_id AND user_id = auth.uid())
);

-- Team invitations policies
CREATE POLICY "Team admins can manage invitations" ON public.team_invitations
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = team_invitations.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role IN ('owner', 'admin'))
);

CREATE POLICY "Users can view invitations sent to their email" ON public.team_invitations
FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create updated_at triggers
CREATE OR REPLACE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_recording_comments_updated_at
  BEFORE UPDATE ON public.recording_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crm_connections_updated_at
  BEFORE UPDATE ON public.crm_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_scheduled_calls_updated_at
  BEFORE UPDATE ON public.scheduled_calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_call_templates_updated_at
  BEFORE UPDATE ON public.call_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_recording_shares_recording_id ON public.recording_shares(recording_id);
CREATE INDEX IF NOT EXISTS idx_recording_comments_recording_id ON public.recording_comments(recording_id);
CREATE INDEX IF NOT EXISTS idx_action_items_recording_id ON public.action_items(recording_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned_to ON public.action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_user_id ON public.scheduled_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_scheduled_at ON public.scheduled_calls(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_call_scores_recording_id ON public.call_scores(recording_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_user_id ON public.skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_recording_id ON public.access_logs(recording_id);