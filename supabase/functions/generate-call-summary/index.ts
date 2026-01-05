import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recording_id, transcript, contact_info } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get recording data
    const { data: recording } = await supabase
      .from("call_recordings")
      .select("*")
      .eq("id", recording_id)
      .single();

    if (!recording) {
      throw new Error("Recording not found");
    }

    const transcriptText = transcript || recording.live_transcription || "";

    // Generate comprehensive call summary using AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a sales call analyzer. Analyze the transcript and extract structured information for sales follow-up. Return a JSON object with these fields:
- quick_skim: { pain, need, budget, timeline, urgency } - brief 1-sentence summaries
- key_points: array of 3-5 key points from the call
- emotional_tone: "positive", "neutral", or "negative"
- agreed_next_steps: array of agreed actions
- watch_out_for: array of risks or concerns
- strengths: array of what went well
- improvements: array of areas to improve
- questions_to_ask: array of follow-up questions
- conversation_starters: array of good openers for next call
- lead_info: { contact_name, company, title, email, phone, primary_pain_point, budget_info, timeline, ai_confidence (0-100), priority_score (0-10), urgency_level, is_hot_lead, secondary_issues, decision_timeline_days, team_size }
- talk_ratio_them: percentage (0-100)
- talk_ratio_you: percentage (0-100)
- positive_signals: count of buying signals
- concern_signals: count of concerns
- engagement_score: 0-10 rating
- should_create_lead: boolean indicating if lead should be created in CRM
- salesforce_sync_recommended: boolean for CRM sync`
          },
          {
            role: "user",
            content: `Analyze this sales call transcript:\n\n${transcriptText}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI error:", errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    console.log("AI Analysis complete:", { 
      shouldCreateLead: analysis.should_create_lead,
      confidence: analysis.lead_info?.ai_confidence 
    });

    // Create call summary
    const { error: summaryError } = await supabase.from("call_summaries").upsert({
      recording_id,
      user_id: recording.user_id,
      quick_skim: analysis.quick_skim || {},
      key_points: analysis.key_points || [],
      emotional_tone: analysis.emotional_tone,
      agreed_next_steps: analysis.agreed_next_steps || [],
      watch_out_for: analysis.watch_out_for || [],
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      questions_to_ask: analysis.questions_to_ask || [],
      conversation_starters: analysis.conversation_starters || [],
      talk_ratio_them: analysis.talk_ratio_them,
      talk_ratio_you: analysis.talk_ratio_you,
      positive_signals: analysis.positive_signals,
      concern_signals: analysis.concern_signals,
      engagement_score: analysis.engagement_score,
    }, { onConflict: 'recording_id' });

    if (summaryError) console.error("Summary error:", summaryError);

    // Create lead if we have contact info and AI recommends it
    const leadInfo = analysis.lead_info || contact_info;
    const shouldCreateLead = analysis.should_create_lead || 
      (leadInfo?.ai_confidence && leadInfo.ai_confidence > 70);

    let leadCreated = false;
    if (shouldCreateLead && leadInfo?.contact_name) {
      const { error: leadError } = await supabase.from("leads").insert({
        user_id: recording.user_id,
        recording_id,
        contact_name: leadInfo.contact_name,
        company: leadInfo.company,
        title: leadInfo.title,
        email: leadInfo.email,
        phone: leadInfo.phone,
        primary_pain_point: leadInfo.primary_pain_point,
        secondary_issues: leadInfo.secondary_issues || [],
        budget_info: leadInfo.budget_info,
        timeline: leadInfo.timeline,
        decision_timeline_days: leadInfo.decision_timeline_days,
        team_size: leadInfo.team_size,
        ai_confidence: leadInfo.ai_confidence || 75,
        priority_score: leadInfo.priority_score || 5,
        urgency_level: leadInfo.urgency_level || "medium",
        is_hot_lead: leadInfo.is_hot_lead || (leadInfo.ai_confidence > 85),
        call_duration_seconds: recording.duration_seconds,
        engagement_score: analysis.engagement_score,
        agreed_next_steps: analysis.agreed_next_steps,
        talk_ratio: analysis.talk_ratio_them,
      });

      if (leadError) {
        console.error("Lead error:", leadError);
      } else {
        leadCreated = true;
        console.log("Lead created for:", leadInfo.contact_name);
      }
    }

    // Check if Salesforce sync is recommended
    if (analysis.salesforce_sync_recommended && leadCreated) {
      // Get user's Salesforce connection
      const { data: connection } = await supabase
        .from("crm_connections")
        .select("*")
        .eq("user_id", recording.user_id)
        .eq("provider", "salesforce")
        .eq("is_active", true)
        .maybeSingle();

      if (connection) {
        // Queue for Salesforce sync
        await supabase.from("salesforce_sync_queue").insert({
          recording_id,
          sync_type: "lead",
          payload: {
            contactInfo: leadInfo,
            callContext: {
              keyPoints: analysis.key_points,
              painPoints: [leadInfo.primary_pain_point, ...(leadInfo.secondary_issues || [])],
              nextSteps: analysis.agreed_next_steps,
              confidence: leadInfo.ai_confidence,
              decisionTimeline: leadInfo.timeline,
              budgetRange: leadInfo.budget_info
            },
            recordingId: recording_id,
            userId: recording.user_id
          },
          status: "pending"
        });

        // Update recording CRM sync status
        await supabase
          .from("call_recordings")
          .update({ crm_sync_status: "pending" })
          .eq("id", recording_id);

        console.log("Queued for Salesforce sync");
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      leadCreated,
      syncQueued: analysis.salesforce_sync_recommended 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
