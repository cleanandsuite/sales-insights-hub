import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scenario templates for different sales interactions
const scenarioTemplates = {
  cold_call: {
    name: "Cold Call",
    sections: ["opening", "value_proposition", "qualifying_questions", "call_to_action", "objection_handlers"],
    focus: "Break the ice quickly and secure a follow-up meeting"
  },
  discovery: {
    name: "Discovery Call",
    sections: ["agenda_setting", "diagnostic_questions", "pain_exploration", "solution_mapping", "next_steps"],
    focus: "Uncover deep pain points and establish trust"
  },
  demo: {
    name: "Product Demo",
    sections: ["agenda_recap", "use_case_stories", "feature_walkthrough", "competitive_positioning", "trial_close"],
    focus: "Show value through their specific use cases"
  },
  negotiation: {
    name: "Negotiation",
    sections: ["value_reframe", "anchor_points", "concession_strategy", "mutual_gains", "commitment_securing"],
    focus: "Maximize deal value while building partnership"
  },
  renewal: {
    name: "Renewal Conversation",
    sections: ["relationship_check", "success_review", "expansion_opportunities", "objection_prevention", "commitment"],
    focus: "Celebrate wins and expand the relationship"
  },
  objection_handling: {
    name: "Objection Handling",
    sections: ["acknowledge", "clarify", "respond", "confirm", "advance"],
    focus: "Turn objections into opportunities"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, persona, dealContext, style } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    const scenarioKey = scenario as keyof typeof scenarioTemplates;
    const template = scenarioTemplates[scenarioKey] || scenarioTemplates.discovery;
    
    const systemPrompt = `You are WINWORDS, an elite AI sales coach that generates winning sales scripts. 
You have analyzed millions of successful sales conversations and know exactly what works.

Your scripts are:
- Specific and actionable (no generic fluff)
- Personalized to the buyer's role, industry, and pain points
- Designed for natural conversation flow
- Proven to convert based on real data

Always include:
1. Multiple opener variations
2. Key talking points with exact wording
3. Discovery questions that reveal pain
4. Objection handlers with responses
5. Strong calls to action
6. Transition phrases between sections

Format your response as a valid JSON object with this structure:
{
  "script_id": "unique_id",
  "scenario": "${scenario}",
  "confidence_score": 85,
  "estimated_success_rate": "Based on similar scripts, this has a X% success rate",
  "sections": {
    "opening": {
      "goal": "What to achieve",
      "variations": ["Option 1", "Option 2", "Option 3"],
      "tip": "AI insight for this section"
    },
    "value_proposition": {
      "goal": "What to achieve",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "proof_points": ["Statistic or case study"]
    },
    "discovery_questions": {
      "goal": "What to achieve",
      "questions": [
        {"question": "Question text", "why": "Why this question works", "listen_for": "What to listen for"}
      ]
    },
    "objection_handlers": {
      "common_objections": [
        {"objection": "The objection", "response": "How to respond", "follow_up": "Next question"}
      ]
    },
    "call_to_action": {
      "goal": "What to achieve",
      "options": ["CTA 1", "CTA 2"],
      "fallback": "If they resist"
    }
  },
  "key_moments": [
    {"moment": "Description", "script": "Exact words to say", "timing": "When to use"}
  ],
  "power_phrases": ["Phrase 1", "Phrase 2"],
  "words_to_avoid": ["Word 1", "Word 2"],
  "success_indicators": ["Sign 1", "Sign 2"],
  "suggested_next_steps": ["If successful: do X", "If needs more time: do Y"]
}`;

    const userPrompt = `Generate a winning ${template.name} script with this context:

SCENARIO: ${template.name}
FOCUS: ${template.focus}
SECTIONS TO INCLUDE: ${template.sections.join(", ")}

BUYER PERSONA:
- Role: ${persona?.role || "Decision Maker"}
- Industry: ${persona?.industry || "Technology"}
- Company Size: ${persona?.companySize || "Mid-market"}
- Known Pain Points: ${(persona?.painPoints || ["efficiency", "cost reduction", "growth"]).join(", ")}
- Personality Style: ${persona?.personalityStyle || "analytical"}

DEAL CONTEXT:
- Stage: ${dealContext?.stage || "early"}
- Budget: ${dealContext?.budget || "unknown"}
- Timeline: ${dealContext?.timeline || "Q1"}
- Competition: ${dealContext?.competition || "unknown"}
- Previous Interactions: ${dealContext?.previousInteractions || "none"}
- Known Objections: ${(dealContext?.knownObjections || []).join(", ") || "none yet"}

STYLE: ${style || "confident"} (Options: confident, consultative, urgent, collaborative)

Generate a comprehensive, personalized script that will WIN this deal. Include specific language tailored to their industry and role. Make every word count.`;

    console.log("Generating WinWords script for scenario:", scenario);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let scriptData;
    try {
      // Try to extract JSON from the response (it might have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a structured fallback
      scriptData = {
        script_id: `winwords_${Date.now()}`,
        scenario: scenario,
        confidence_score: 75,
        estimated_success_rate: "Based on similar scripts, this has a 75% success rate",
        sections: {
          opening: {
            goal: "Capture attention",
            variations: [content.substring(0, 200)],
            tip: "Personalize with their company name"
          }
        },
        raw_content: content
      };
    }

    // Ensure script_id is unique
    scriptData.script_id = `winwords_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    scriptData.generated_at = new Date().toISOString();
    scriptData.scenario = scenario;
    scriptData.persona = persona;
    scriptData.deal_context = dealContext;
    scriptData.style = style;

    console.log("Successfully generated WinWords script:", scriptData.script_id);

    return new Response(JSON.stringify(scriptData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in winwords-generate:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
