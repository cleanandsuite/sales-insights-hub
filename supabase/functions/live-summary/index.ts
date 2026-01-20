import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummaryRequest {
  transcription: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transcription } = await req.json() as SummaryRequest;

    if (!transcription || transcription.length < 30) {
      return new Response(JSON.stringify({ error: "Insufficient transcription" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use only the most recent portion for efficiency
    const recentTranscript = transcription.slice(-3000);

    const systemPrompt = `You are a real-time sales call analyzer. Analyze the ongoing conversation and extract structured insights.

Return a JSON object with these fields:
- mainTopic: string - The primary subject being discussed (1 sentence max)
- keyPoints: string[] - 3-5 most important points discussed so far
- customerNeeds: string[] - Pain points or needs the customer has expressed
- objections: string[] - Any concerns, hesitations, or objections raised
- nextSteps: string[] - Any agreed upon or suggested next actions
- budgetMentioned: string | null - Any budget or pricing discussed
- timelineMentioned: string | null - Any timeline or deadline mentioned
- decisionMakers: string[] - Names or roles of decision makers mentioned
- sentiment: "positive" | "neutral" | "negative" - Overall tone of the conversation
- engagementLevel: "high" | "medium" | "low" - How engaged the customer seems

Keep responses concise. Focus on actionable intelligence for the salesperson.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this sales call transcript:\n\n${recentTranscript}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited", isRateLimit: true }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let summary;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback with defaults
      summary = {
        mainTopic: "Conversation in progress...",
        keyPoints: [],
        customerNeeds: [],
        objections: [],
        nextSteps: [],
        budgetMentioned: null,
        timelineMentioned: null,
        decisionMakers: [],
        sentiment: "neutral",
        engagementLevel: "medium",
      };
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Live summary error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
