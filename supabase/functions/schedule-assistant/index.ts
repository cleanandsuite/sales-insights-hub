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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await authClient.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, recordingId, date, query, customPrompt } = body;

    if (action === "extract-from-transcript") {
      // Get recording transcript
      const { data: recording, error: recError } = await supabase
        .from("call_recordings")
        .select("live_transcription, timestamped_transcript, name, created_at")
        .eq("id", recordingId)
        .eq("user_id", userData.user.id)
        .single();

      if (recError || !recording) {
        return new Response(
          JSON.stringify({ error: "Recording not found" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get associated lead info if available
      const { data: lead } = await supabase
        .from("leads")
        .select("contact_name, company, email, phone, agreed_next_steps, timeline")
        .eq("recording_id", recordingId)
        .maybeSingle();

      // Get call summary if available
      const { data: summary } = await supabase
        .from("call_summaries")
        .select("agreed_next_steps, questions_to_ask, conversation_starters, key_points, objections_raised")
        .eq("recording_id", recordingId)
        .maybeSingle();

      const transcript = recording.live_transcription || "";

      // Enhanced AI extraction with summary, key points, and objections
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
              content: `You are a scheduling assistant and call analyst. Extract scheduling information and provide a comprehensive summary.
              
Return a JSON object with:
- suggested_title: A descriptive title for the follow-up call (e.g., "Follow-up: Demo walkthrough with Acme Corp")
- contact_name: The contact's name mentioned in the call
- contact_email: Email if mentioned
- suggested_date: ISO date string if a specific date/time was mentioned (calculate from today)
- suggested_time: Time in HH:MM format if mentioned
- suggested_duration: Duration in minutes (15, 30, 45, 60, 90) based on context
- meeting_provider: Inferred platform (zoom, teams, google_meet, other)
- prep_notes: Brief notes for call preparation based on agreed next steps
- confidence: 0-100 confidence score for the extraction
- follow_up_reason: Why this follow-up is needed (1-2 sentences)
- urgency: "high", "medium", or "low" based on conversation context
- ai_summary: A 2-3 sentence summary of the call (key outcome, main topic discussed, sentiment)
- key_points: Array of 3-5 key discussion points from the call
- objections: Array of any objections or concerns raised by the prospect
- next_steps: Array of agreed next steps or action items

Today's date is: ${new Date().toISOString()}`
            },
            {
              role: "user",
              content: `Extract scheduling info and create a summary from this call:

Recording: ${recording.name || "Untitled"}
Lead Info: ${JSON.stringify(lead || {})}
Previous Next Steps: ${JSON.stringify(summary?.agreed_next_steps || [])}
Previous Key Points: ${JSON.stringify(summary?.key_points || [])}

Transcript:
${transcript.slice(0, 12000)}`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted, please add funds" }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error("AI extraction failed");
      }

      const aiData = await aiResponse.json();
      const extraction = JSON.parse(aiData.choices[0].message.content);

      // Merge with lead data and existing summary
      return new Response(JSON.stringify({
        success: true,
        extraction: {
          ...extraction,
          contact_name: extraction.contact_name || lead?.contact_name,
          contact_email: extraction.contact_email || lead?.email,
          lead_company: lead?.company,
          lead_timeline: lead?.timeline,
          key_points: extraction.key_points || summary?.key_points || [],
          objections: extraction.objections || summary?.objections_raised || [],
        },
        lead,
        summary
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "coaching-query") {
      // On-demand coaching based on user query
      const { data: recording } = await supabase
        .from("call_recordings")
        .select("live_transcription, name")
        .eq("id", recordingId)
        .eq("user_id", userData.user.id)
        .single();

      if (!recording) {
        return new Response(
          JSON.stringify({ error: "Recording not found" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const coachResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `You are an expert sales coach analyzing a sales call. Provide specific, actionable feedback based on the user's query. Be concise but insightful. Reference specific moments from the transcript when relevant.`
            },
            {
              role: "user",
              content: `Analyze this sales call transcript and answer the following question:

Question: ${query}

Call: ${recording.name || "Sales Call"}
Transcript:
${recording.live_transcription?.slice(0, 10000) || "No transcript available"}`
            }
          ]
        }),
      });

      if (!coachResponse.ok) {
        if (coachResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded" }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error("Coaching query failed");
      }

      const coachData = await coachResponse.json();
      return new Response(JSON.stringify({
        success: true,
        response: coachData.choices[0].message.content
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate-email") {
      // Generate follow-up email script
      const { data: recording } = await supabase
        .from("call_recordings")
        .select("live_transcription, name")
        .eq("id", recordingId)
        .eq("user_id", userData.user.id)
        .single();

      const { data: lead } = await supabase
        .from("leads")
        .select("contact_name, company, email, agreed_next_steps")
        .eq("recording_id", recordingId)
        .maybeSingle();

      const emailResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `You are an expert at writing professional follow-up emails for sales calls. Create a personalized, engaging email that:
- References specific topics discussed in the call
- Reinforces agreed next steps
- Maintains a professional but friendly tone
- Includes a clear call-to-action

Return a JSON object with:
- subject: Email subject line (compelling, concise)
- body: Full email body (formatted with greeting, paragraphs, sign-off placeholder [Your Name])
- tone: The tone used (professional, friendly, urgent, etc.)`
            },
            {
              role: "user",
              content: `Create a follow-up email for this call:

Contact: ${lead?.contact_name || "the prospect"}
Company: ${lead?.company || "their company"}
Call Summary: ${recording?.name || "Sales call"}
Agreed Next Steps: ${JSON.stringify(lead?.agreed_next_steps || [])}
${customPrompt ? `\nCustom Instructions: ${customPrompt}` : ''}

Transcript excerpt:
${recording?.live_transcription?.slice(0, 5000) || "No transcript"}`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!emailResponse.ok) {
        if (emailResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded" }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error("Email generation failed");
      }

      const emailData = await emailResponse.json();
      const emailScript = JSON.parse(emailData.choices[0].message.content);

      return new Response(JSON.stringify({
        success: true,
        emailScript
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "suggest-times") {
      // Get user's existing calls for conflict detection
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const { data: daysCalls } = await supabase
        .from("scheduled_calls")
        .select("scheduled_at, duration_minutes")
        .eq("user_id", userData.user.id)
        .gte("scheduled_at", startDate.toISOString())
        .lte("scheduled_at", endDate.toISOString());

      // Also check calendar events if connected
      const { data: calendarEvents } = await supabase
        .from("calendar_events")
        .select("start_time, end_time")
        .eq("user_id", userData.user.id)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      // Analyze past calls to find preferred times
      const { data: pastCalls } = await supabase
        .from("scheduled_calls")
        .select("scheduled_at, status")
        .eq("user_id", userData.user.id)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(50);

      // Calculate time preferences based on past successful calls
      const timeSlots: Record<number, number> = {};
      pastCalls?.forEach(call => {
        const hour = new Date(call.scheduled_at).getHours();
        timeSlots[hour] = (timeSlots[hour] || 0) + 1;
      });

      // Find blocked slots from scheduled calls
      const blockedSlots = [
        ...(daysCalls || []).map(call => ({
          start: new Date(call.scheduled_at),
          end: new Date(new Date(call.scheduled_at).getTime() + call.duration_minutes * 60000)
        })),
        ...(calendarEvents || []).map(event => ({
          start: new Date(event.start_time),
          end: new Date(event.end_time)
        }))
      ];

      const suggestedTimes: string[] = [];
      const businessHours = [9, 10, 11, 14, 15, 16];
      
      for (const hour of businessHours) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        const isBlocked = blockedSlots.some(blocked => 
          (slotStart >= blocked.start && slotStart < blocked.end) ||
          (slotEnd > blocked.start && slotEnd <= blocked.end)
        );

        if (!isBlocked) {
          suggestedTimes.push(`${hour.toString().padStart(2, '0')}:00`);
        }
      }

      // Sort by preference based on past successful calls
      suggestedTimes.sort((a, b) => {
        const hourA = parseInt(a.split(':')[0]);
        const hourB = parseInt(b.split(':')[0]);
        return (timeSlots[hourB] || 0) - (timeSlots[hourA] || 0);
      });

      return new Response(JSON.stringify({
        success: true,
        suggestedTimes: suggestedTimes.slice(0, 4),
        blockedSlots,
        preferredHours: Object.entries(timeSlots)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([hour]) => parseInt(hour))
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check-conflicts") {
      const { proposedStart, proposedEnd } = body;

      // Check scheduled_calls
      const { data: callConflicts } = await supabase
        .from("scheduled_calls")
        .select("id, title, scheduled_at, duration_minutes")
        .eq("user_id", userData.user.id)
        .neq("status", "cancelled")
        .or(`scheduled_at.gte.${new Date(new Date(proposedStart).getTime() - 3600000).toISOString()},scheduled_at.lte.${new Date(new Date(proposedEnd).getTime() + 3600000).toISOString()}`);

      // Check calendar_events
      const { data: calendarConflicts } = await supabase
        .from("calendar_events")
        .select("id, title, start_time, end_time")
        .eq("user_id", userData.user.id)
        .gte("start_time", new Date(new Date(proposedStart).getTime() - 3600000).toISOString())
        .lte("start_time", new Date(new Date(proposedEnd).getTime() + 3600000).toISOString());

      const propStart = new Date(proposedStart);
      const propEnd = new Date(proposedEnd);

      const actualCallConflicts = (callConflicts || []).filter(call => {
        const callStart = new Date(call.scheduled_at);
        const callEnd = new Date(callStart.getTime() + call.duration_minutes * 60000);
        return (propStart < callEnd && propEnd > callStart);
      });

      const actualCalendarConflicts = (calendarConflicts || []).filter(event => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        return (propStart < eventEnd && propEnd > eventStart);
      }).map(event => ({
        id: event.id,
        title: event.title,
        scheduled_at: event.start_time,
        duration_minutes: Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000)
      }));

      const allConflicts = [...actualCallConflicts, ...actualCalendarConflicts];

      return new Response(JSON.stringify({
        success: true,
        hasConflict: allConflicts.length > 0,
        conflicts: allConflicts
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-analytics") {
      // Get call timing analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentCalls } = await supabase
        .from("scheduled_calls")
        .select("scheduled_at, status, duration_minutes")
        .eq("user_id", userData.user.id)
        .gte("scheduled_at", thirtyDaysAgo.toISOString());

      const analytics = {
        totalCalls: recentCalls?.length || 0,
        completedCalls: recentCalls?.filter(c => c.status === "completed").length || 0,
        noShows: recentCalls?.filter(c => c.status === "no_show").length || 0,
        cancelledCalls: recentCalls?.filter(c => c.status === "cancelled").length || 0,
        avgDuration: 0,
        peakHours: [] as number[],
        peakDays: [] as string[],
        completionRate: 0
      };

      if (recentCalls && recentCalls.length > 0) {
        analytics.avgDuration = Math.round(
          recentCalls.reduce((sum, c) => sum + c.duration_minutes, 0) / recentCalls.length
        );
        analytics.completionRate = Math.round((analytics.completedCalls / analytics.totalCalls) * 100);

        // Calculate peak hours
        const hourCounts: Record<number, number> = {};
        const dayCounts: Record<string, number> = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        recentCalls.forEach(call => {
          const date = new Date(call.scheduled_at);
          const hour = date.getHours();
          const day = dayNames[date.getDay()];
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        analytics.peakHours = Object.entries(hourCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([hour]) => parseInt(hour));

        analytics.peakDays = Object.entries(dayCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([day]) => day);
      }

      return new Response(JSON.stringify({
        success: true,
        analytics
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Schedule assistant error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});