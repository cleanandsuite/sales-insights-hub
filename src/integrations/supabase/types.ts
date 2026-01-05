export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          recording_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          recording_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          recording_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      action_items: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          recording_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recording_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recording_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_lead_settings: {
        Row: {
          auto_bold_pain_points: boolean | null
          auto_flag_budget: boolean | null
          auto_highlight_competitors: boolean | null
          auto_tag_timeline: boolean | null
          capture_next_steps: boolean | null
          create_30s_skim: boolean | null
          created_at: string
          custom_keywords: string[] | null
          extract_key_points: boolean | null
          highlight_urgency: boolean | null
          id: string
          identify_decision_makers: boolean | null
          is_ai_active: boolean | null
          is_test_mode: boolean | null
          note_competitive_mentions: boolean | null
          note_emotional_tone: boolean | null
          record_questions: boolean | null
          show_decision_signals: boolean | null
          show_tone_markers: boolean | null
          summary_length: string | null
          track_objections: boolean | null
          trigger_keywords: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_bold_pain_points?: boolean | null
          auto_flag_budget?: boolean | null
          auto_highlight_competitors?: boolean | null
          auto_tag_timeline?: boolean | null
          capture_next_steps?: boolean | null
          create_30s_skim?: boolean | null
          created_at?: string
          custom_keywords?: string[] | null
          extract_key_points?: boolean | null
          highlight_urgency?: boolean | null
          id?: string
          identify_decision_makers?: boolean | null
          is_ai_active?: boolean | null
          is_test_mode?: boolean | null
          note_competitive_mentions?: boolean | null
          note_emotional_tone?: boolean | null
          record_questions?: boolean | null
          show_decision_signals?: boolean | null
          show_tone_markers?: boolean | null
          summary_length?: string | null
          track_objections?: boolean | null
          trigger_keywords?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_bold_pain_points?: boolean | null
          auto_flag_budget?: boolean | null
          auto_highlight_competitors?: boolean | null
          auto_tag_timeline?: boolean | null
          capture_next_steps?: boolean | null
          create_30s_skim?: boolean | null
          created_at?: string
          custom_keywords?: string[] | null
          extract_key_points?: boolean | null
          highlight_urgency?: boolean | null
          id?: string
          identify_decision_makers?: boolean | null
          is_ai_active?: boolean | null
          is_test_mode?: boolean | null
          note_competitive_mentions?: boolean | null
          note_emotional_tone?: boolean | null
          record_questions?: boolean | null
          show_decision_signals?: boolean | null
          show_tone_markers?: boolean | null
          summary_length?: string | null
          track_objections?: boolean | null
          trigger_keywords?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      call_recordings: {
        Row: {
          ai_markers: Json | null
          ai_suggestions: Json | null
          analyzed_at: string | null
          audio_url: string | null
          call_score_id: string | null
          created_at: string
          deal_analysis_id: string | null
          duration_seconds: number | null
          file_name: string
          file_size: number | null
          file_url: string | null
          id: string
          key_topics: string[] | null
          live_transcription: string | null
          sentiment_score: number | null
          status: string | null
          summary: string | null
          team_id: string | null
          timestamped_transcript: Json | null
          user_id: string
        }
        Insert: {
          ai_markers?: Json | null
          ai_suggestions?: Json | null
          analyzed_at?: string | null
          audio_url?: string | null
          call_score_id?: string | null
          created_at?: string
          deal_analysis_id?: string | null
          duration_seconds?: number | null
          file_name: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          key_topics?: string[] | null
          live_transcription?: string | null
          sentiment_score?: number | null
          status?: string | null
          summary?: string | null
          team_id?: string | null
          timestamped_transcript?: Json | null
          user_id: string
        }
        Update: {
          ai_markers?: Json | null
          ai_suggestions?: Json | null
          analyzed_at?: string | null
          audio_url?: string | null
          call_score_id?: string | null
          created_at?: string
          deal_analysis_id?: string | null
          duration_seconds?: number | null
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          key_topics?: string[] | null
          live_transcription?: string | null
          sentiment_score?: number | null
          status?: string | null
          summary?: string | null
          team_id?: string | null
          timestamped_transcript?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      call_scores: {
        Row: {
          ai_feedback: Json | null
          closing_score: number | null
          competitor_mentions: string[] | null
          created_at: string
          discovery_score: number | null
          filler_words_count: number | null
          id: string
          objection_handling_score: number | null
          overall_score: number
          presentation_score: number | null
          price_mentions: number | null
          questions_asked: number | null
          rapport_score: number | null
          recording_id: string
          talk_ratio: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          closing_score?: number | null
          competitor_mentions?: string[] | null
          created_at?: string
          discovery_score?: number | null
          filler_words_count?: number | null
          id?: string
          objection_handling_score?: number | null
          overall_score: number
          presentation_score?: number | null
          price_mentions?: number | null
          questions_asked?: number | null
          rapport_score?: number | null
          recording_id: string
          talk_ratio?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          closing_score?: number | null
          competitor_mentions?: string[] | null
          created_at?: string
          discovery_score?: number | null
          filler_words_count?: number | null
          id?: string
          objection_handling_score?: number | null
          overall_score?: number
          presentation_score?: number | null
          price_mentions?: number | null
          questions_asked?: number | null
          rapport_score?: number | null
          recording_id?: string
          talk_ratio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_scores_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_summaries: {
        Row: {
          agreed_next_steps: string[] | null
          competitive_mentions: string[] | null
          concern_signals: number | null
          conversation_starters: string[] | null
          created_at: string
          decision_makers: string[] | null
          emotional_tone: string | null
          engagement_score: number | null
          id: string
          improvements: string[] | null
          key_points: string[] | null
          last_exchanges: Json | null
          materials_needed: string[] | null
          objections_raised: string[] | null
          positive_signals: number | null
          question_count_them: number | null
          question_count_you: number | null
          questions_asked: Json | null
          questions_to_ask: string[] | null
          quick_skim: Json | null
          recording_id: string
          review_before_calling: string[] | null
          strengths: string[] | null
          suggestions_next_call: string[] | null
          talk_ratio_them: number | null
          talk_ratio_you: number | null
          updated_at: string
          urgency_indicators: string[] | null
          user_id: string
          watch_out_for: string[] | null
        }
        Insert: {
          agreed_next_steps?: string[] | null
          competitive_mentions?: string[] | null
          concern_signals?: number | null
          conversation_starters?: string[] | null
          created_at?: string
          decision_makers?: string[] | null
          emotional_tone?: string | null
          engagement_score?: number | null
          id?: string
          improvements?: string[] | null
          key_points?: string[] | null
          last_exchanges?: Json | null
          materials_needed?: string[] | null
          objections_raised?: string[] | null
          positive_signals?: number | null
          question_count_them?: number | null
          question_count_you?: number | null
          questions_asked?: Json | null
          questions_to_ask?: string[] | null
          quick_skim?: Json | null
          recording_id: string
          review_before_calling?: string[] | null
          strengths?: string[] | null
          suggestions_next_call?: string[] | null
          talk_ratio_them?: number | null
          talk_ratio_you?: number | null
          updated_at?: string
          urgency_indicators?: string[] | null
          user_id: string
          watch_out_for?: string[] | null
        }
        Update: {
          agreed_next_steps?: string[] | null
          competitive_mentions?: string[] | null
          concern_signals?: number | null
          conversation_starters?: string[] | null
          created_at?: string
          decision_makers?: string[] | null
          emotional_tone?: string | null
          engagement_score?: number | null
          id?: string
          improvements?: string[] | null
          key_points?: string[] | null
          last_exchanges?: Json | null
          materials_needed?: string[] | null
          objections_raised?: string[] | null
          positive_signals?: number | null
          question_count_them?: number | null
          question_count_you?: number | null
          questions_asked?: Json | null
          questions_to_ask?: string[] | null
          quick_skim?: Json | null
          recording_id?: string
          review_before_calling?: string[] | null
          strengths?: string[] | null
          suggestions_next_call?: string[] | null
          talk_ratio_them?: number | null
          talk_ratio_you?: number | null
          updated_at?: string
          urgency_indicators?: string[] | null
          user_id?: string
          watch_out_for?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "call_summaries_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          objectives: string[] | null
          questions: Json | null
          talking_points: Json | null
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          objectives?: string[] | null
          questions?: Json | null
          talking_points?: Json | null
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          objectives?: string[] | null
          questions?: Json | null
          talking_points?: Json | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          id: string
          instance_url: string | null
          is_active: boolean
          last_sync_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          instance_url?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          provider: string
          refresh_token_encrypted?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          instance_url?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          account_id: string | null
          account_name: string | null
          company: string | null
          created_at: string
          crm_connection_id: string
          email: string | null
          external_id: string
          id: string
          last_synced_at: string
          metadata: Json | null
          name: string
          owner_id: string | null
          phone: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          company?: string | null
          created_at?: string
          crm_connection_id: string
          email?: string | null
          external_id: string
          id?: string
          last_synced_at?: string
          metadata?: Json | null
          name: string
          owner_id?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          company?: string | null
          created_at?: string
          crm_connection_id?: string
          email?: string | null
          external_id?: string
          id?: string
          last_synced_at?: string
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_crm_connection_id_fkey"
            columns: ["crm_connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_analysis: {
        Row: {
          budget_mentioned: number | null
          buying_signals: Json | null
          competitor_mentions: Json | null
          created_at: string
          deal_stage_suggestion: string | null
          decision_timeline: string | null
          id: string
          next_steps: Json | null
          price_objections: Json | null
          pricing_discussed: boolean
          recording_id: string
          risk_factors: Json | null
          win_probability: number | null
        }
        Insert: {
          budget_mentioned?: number | null
          buying_signals?: Json | null
          competitor_mentions?: Json | null
          created_at?: string
          deal_stage_suggestion?: string | null
          decision_timeline?: string | null
          id?: string
          next_steps?: Json | null
          price_objections?: Json | null
          pricing_discussed?: boolean
          recording_id: string
          risk_factors?: Json | null
          win_probability?: number | null
        }
        Update: {
          budget_mentioned?: number | null
          buying_signals?: Json | null
          competitor_mentions?: Json | null
          created_at?: string
          deal_stage_suggestion?: string | null
          decision_timeline?: string | null
          id?: string
          next_steps?: Json | null
          price_objections?: Json | null
          pricing_discussed?: boolean
          recording_id?: string
          risk_factors?: Json | null
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_analysis_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          id: string
          processed_at: string | null
          processed_by: string | null
          recording_id: string | null
          request_type: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          recording_id?: string | null
          request_type: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          recording_id?: string | null
          request_type?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_requests_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          lead_id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agreed_next_steps: string[] | null
          ai_confidence: number | null
          budget_info: string | null
          call_duration_seconds: number | null
          company: string | null
          competitor_status: string | null
          contact_name: string
          created_at: string
          decision_timeline_days: number | null
          email: string | null
          engagement_score: number | null
          evaluation_stage: string | null
          follow_up_count: number | null
          id: string
          is_hot_lead: boolean | null
          key_moments: Json | null
          key_quotes: Json | null
          last_contacted_at: string | null
          lead_status: string
          location: string | null
          materials_needed: string[] | null
          next_action: string | null
          next_action_due: string | null
          phone: string | null
          prep_questions: string[] | null
          primary_pain_point: string | null
          priority_score: number | null
          recording_id: string | null
          secondary_issues: string[] | null
          source: string | null
          talk_ratio: number | null
          team_size: number | null
          timeline: string | null
          title: string | null
          updated_at: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          agreed_next_steps?: string[] | null
          ai_confidence?: number | null
          budget_info?: string | null
          call_duration_seconds?: number | null
          company?: string | null
          competitor_status?: string | null
          contact_name: string
          created_at?: string
          decision_timeline_days?: number | null
          email?: string | null
          engagement_score?: number | null
          evaluation_stage?: string | null
          follow_up_count?: number | null
          id?: string
          is_hot_lead?: boolean | null
          key_moments?: Json | null
          key_quotes?: Json | null
          last_contacted_at?: string | null
          lead_status?: string
          location?: string | null
          materials_needed?: string[] | null
          next_action?: string | null
          next_action_due?: string | null
          phone?: string | null
          prep_questions?: string[] | null
          primary_pain_point?: string | null
          priority_score?: number | null
          recording_id?: string | null
          secondary_issues?: string[] | null
          source?: string | null
          talk_ratio?: number | null
          team_size?: number | null
          timeline?: string | null
          title?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          agreed_next_steps?: string[] | null
          ai_confidence?: number | null
          budget_info?: string | null
          call_duration_seconds?: number | null
          company?: string | null
          competitor_status?: string | null
          contact_name?: string
          created_at?: string
          decision_timeline_days?: number | null
          email?: string | null
          engagement_score?: number | null
          evaluation_stage?: string | null
          follow_up_count?: number | null
          id?: string
          is_hot_lead?: boolean | null
          key_moments?: Json | null
          key_quotes?: Json | null
          last_contacted_at?: string | null
          lead_status?: string
          location?: string | null
          materials_needed?: string[] | null
          next_action?: string | null
          next_action_due?: string | null
          phone?: string | null
          prep_questions?: string[] | null
          primary_pain_point?: string | null
          priority_score?: number | null
          recording_id?: string | null
          secondary_issues?: string[] | null
          source?: string | null
          talk_ratio?: number | null
          team_size?: number | null
          timeline?: string | null
          title?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recording_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          parent_id: string | null
          recording_id: string
          timestamp_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          parent_id?: string | null
          recording_id: string
          timestamp_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          parent_id?: string | null
          recording_id?: string
          timestamp_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recording_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "recording_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recording_comments_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      recording_consent: {
        Row: {
          consent_given: boolean
          consent_type: string | null
          id: string
          participant_email: string | null
          participant_name: string | null
          recorded_at: string
          recording_id: string
        }
        Insert: {
          consent_given?: boolean
          consent_type?: string | null
          id?: string
          participant_email?: string | null
          participant_name?: string | null
          recorded_at?: string
          recording_id: string
        }
        Update: {
          consent_given?: boolean
          consent_type?: string | null
          id?: string
          participant_email?: string | null
          participant_name?: string | null
          recorded_at?: string
          recording_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recording_consent_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      recording_crm_links: {
        Row: {
          account_id: string | null
          contact_id: string | null
          crm_connection_id: string
          id: string
          lead_id: string | null
          metadata: Json | null
          opportunity_id: string | null
          recording_id: string
          sync_status: string | null
          synced_at: string
        }
        Insert: {
          account_id?: string | null
          contact_id?: string | null
          crm_connection_id: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          opportunity_id?: string | null
          recording_id: string
          sync_status?: string | null
          synced_at?: string
        }
        Update: {
          account_id?: string | null
          contact_id?: string | null
          crm_connection_id?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          opportunity_id?: string | null
          recording_id?: string
          sync_status?: string | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recording_crm_links_crm_connection_id_fkey"
            columns: ["crm_connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recording_crm_links_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      recording_shares: {
        Row: {
          created_at: string
          id: string
          permission: string
          recording_id: string
          shared_by: string
          shared_with_team_id: string | null
          shared_with_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          permission?: string
          recording_id: string
          shared_by: string
          shared_with_team_id?: string | null
          shared_with_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          recording_id?: string
          shared_by?: string
          shared_with_team_id?: string | null
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recording_shares_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recording_shares_shared_with_team_id_fkey"
            columns: ["shared_with_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_calls: {
        Row: {
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          meeting_provider: string | null
          meeting_url: string | null
          prep_notes: string | null
          recording_id: string | null
          reminder_sent: boolean
          scheduled_at: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_provider?: string | null
          meeting_url?: string | null
          prep_notes?: string | null
          recording_id?: string | null
          reminder_sent?: boolean
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_provider?: string | null
          meeting_url?: string | null
          prep_notes?: string | null
          recording_id?: string | null
          reminder_sent?: boolean
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_calls_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_progress: {
        Row: {
          id: string
          recorded_at: string
          recording_id: string | null
          score: number
          skill_name: string
          user_id: string
        }
        Insert: {
          id?: string
          recorded_at?: string
          recording_id?: string | null
          score: number
          skill_name: string
          user_id: string
        }
        Update: {
          id?: string
          recorded_at?: string
          recording_id?: string | null
          score?: number
          skill_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_progress_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      team_benchmarks: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_benchmarks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: string
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_recommendations: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          priority: number
          recommendation: string
          resource_type: string | null
          resource_url: string | null
          skill_area: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          recommendation: string
          resource_type?: string | null
          resource_url?: string | null
          skill_area: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          recommendation?: string
          resource_type?: string | null
          resource_url?: string | null
          skill_area?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          audio_quality: string
          auto_analyze: boolean
          auto_redact_pii: boolean
          created_at: string
          daily_summary: boolean
          default_mic_device_id: string | null
          default_speaker_device_id: string | null
          email_notifications: boolean
          focus_areas: string[] | null
          id: string
          noise_cancellation: boolean
          push_notifications: boolean
          retention_days: number | null
          suggestion_frequency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_quality?: string
          auto_analyze?: boolean
          auto_redact_pii?: boolean
          created_at?: string
          daily_summary?: boolean
          default_mic_device_id?: string | null
          default_speaker_device_id?: string | null
          email_notifications?: boolean
          focus_areas?: string[] | null
          id?: string
          noise_cancellation?: boolean
          push_notifications?: boolean
          retention_days?: number | null
          suggestion_frequency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_quality?: string
          auto_analyze?: boolean
          auto_redact_pii?: boolean
          created_at?: string
          daily_summary?: boolean
          default_mic_device_id?: string | null
          default_speaker_device_id?: string | null
          email_notifications?: boolean
          focus_areas?: string[] | null
          id?: string
          noise_cancellation?: boolean
          push_notifications?: boolean
          retention_days?: number | null
          suggestion_frequency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
