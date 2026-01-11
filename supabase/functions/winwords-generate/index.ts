import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const companyResearchSchema = z.object({
  name: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  industry: z.string().max(500).optional(),
  size: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  state: z.string().max(200).optional(),
  country: z.string().max(200).optional(),
  website: z.string().max(500).optional(),
  recentNews: z.array(z.string().max(2000)).max(10).optional(),
  painPoints: z.array(z.string().max(2000)).max(20).optional(),
  competitors: z.array(z.string().max(1000)).max(10).optional(),
  techStack: z.array(z.string().max(1000)).max(20).optional(),
}).optional();

const personaSchema = z.object({
  role: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  companySize: z.string().max(100).optional(),
  painPoints: z.array(z.string().max(200)).max(10).optional(),
  personalityStyle: z.string().max(100).optional(),
  companyName: z.string().max(200).optional(),
  companyResearch: companyResearchSchema.nullable().optional(),
}).optional();

const dealContextSchema = z.object({
  stage: z.string().max(200).optional(),
  budget: z.string().max(200).optional(),
  timeline: z.string().max(200).optional(),
  competition: z.string().max(500).optional(),
  previousInteractions: z.string().max(1000).optional(),
  knownObjections: z.array(z.string().max(500)).max(10).optional(),
}).optional();

const requestSchema = z.object({
  scenario: z.enum(['cold_call', 'discovery', 'demo', 'negotiation', 'renewal', 'objection_handling']),
  persona: personaSchema,
  dealContext: dealContextSchema,
  style: z.enum(['confident', 'consultative', 'urgent', 'collaborative']).optional(),
});

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
    // Authenticate request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', userData.user.id);

    // Fetch user profile for WinWords personalization
    const { data: userProfile } = await authClient
      .from('profiles')
      .select('company, company_strengths, unique_differentiators, personal_tone')
      .eq('user_id', userData.user.id)
      .single();

    console.log('User profile for personalization:', userProfile ? 'found' : 'not found');

    // Parse and validate request
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.issues);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { scenario, persona, dealContext, style } = parseResult.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const template = scenarioTemplates[scenario];
    
    // Sanitize inputs for AI prompt
    const safeRole = (persona?.role || "Decision Maker").substring(0, 100);
    const safeIndustry = (persona?.industry || "Technology").substring(0, 100);
    const safeCompanySize = (persona?.companySize || "Mid-market").substring(0, 100);
    const safePainPoints = (persona?.painPoints || ["efficiency", "cost reduction", "growth"])
      .slice(0, 5)
      .map(p => p.substring(0, 100))
      .join(", ");
    const safePersonalityStyle = (persona?.personalityStyle || "analytical").substring(0, 100);
    const safeStage = (dealContext?.stage || "early").substring(0, 100);
    const safeBudget = (dealContext?.budget || "unknown").substring(0, 100);
    const safeTimeline = (dealContext?.timeline || "Q1").substring(0, 100);
    const safeCompetition = (dealContext?.competition || "unknown").substring(0, 100);
    const safePreviousInteractions = (dealContext?.previousInteractions || "none").substring(0, 200);
    const safeKnownObjections = (dealContext?.knownObjections || [])
      .slice(0, 5)
      .map(o => o.substring(0, 100))
      .join(", ") || "none yet";
    const safeStyle = style || "confident";
    
    // Build user profile personalization section
    const hasUserProfile = userProfile && (
      (userProfile.company_strengths && userProfile.company_strengths.length > 0) ||
      (userProfile.unique_differentiators && userProfile.unique_differentiators.length > 0) ||
      (userProfile.personal_tone && userProfile.personal_tone !== 'Neutral')
    );
    
    const userProfileSection = hasUserProfile ? `
YOUR COMPANY PROFILE (INCORPORATE THESE INTO THE SCRIPT):
- Your Company: ${userProfile.company || 'Not specified'}
- Your Strengths: ${(userProfile.company_strengths || []).join(', ') || 'Not specified'}
- Unique Differentiators: ${(userProfile.unique_differentiators || []).join(', ') || 'Not specified'}
- Communication Style: ${userProfile.personal_tone || 'Neutral'}

IMPORTANT: Naturally weave your company strengths and differentiators into the script. ${
  userProfile.personal_tone === 'High-Energy (Cardone)' 
    ? 'Use a high-energy, aggressive, action-oriented tone. Be bold and confident.' 
    : userProfile.personal_tone === 'Smooth Persuasion (Belfort)' 
    ? 'Use a charismatic, smooth, relationship-focused tone. Build rapport and create urgency naturally.' 
    : 'Use a balanced, professional tone.'
}` : '';
    
    // Company research data
    const companyResearch = persona?.companyResearch;
    const safeCompanyName = (persona?.companyName || companyResearch?.name || "").substring(0, 200);
    const safeCompanyDescription = (companyResearch?.description || "").substring(0, 500);
    const safeCompanyWebsite = (companyResearch?.website || "").substring(0, 200);
    const safeCompanyCity = (companyResearch?.city || "").substring(0, 100);
    const safeCompanyState = (companyResearch?.state || "").substring(0, 100);
    const safeRecentNews = (companyResearch?.recentNews || [])
      .slice(0, 3)
      .map(n => n.substring(0, 200))
      .join("; ") || "";
    const safeCompanyPainPoints = (companyResearch?.painPoints || [])
      .slice(0, 5)
      .map(p => p.substring(0, 100))
      .join(", ") || "";
    const safeCompetitors = (companyResearch?.competitors || [])
      .slice(0, 3)
      .map(c => c.substring(0, 100))
      .join(", ") || "";
    const safeTechStack = (companyResearch?.techStack || [])
      .slice(0, 5)
      .map(t => t.substring(0, 50))
      .join(", ") || "";
    
    const hasCompanyResearch = !!companyResearch && !!safeCompanyName;

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

    // Build company research section if available
    const companyResearchSection = hasCompanyResearch ? `
COMPANY RESEARCH (USE THIS TO PERSONALIZE THE SCRIPT):
- Company Name: ${safeCompanyName}
- Description: ${safeCompanyDescription}
- Location: ${safeCompanyCity}${safeCompanyState ? `, ${safeCompanyState}` : ''}
- Website: ${safeCompanyWebsite}
- Recent News/Developments: ${safeRecentNews || 'No recent news available'}
- Company-Specific Pain Points: ${safeCompanyPainPoints || 'Not identified'}
- Known Competitors: ${safeCompetitors || 'Not identified'}
- Technology Stack: ${safeTechStack || 'Not identified'}

IMPORTANT: Use the company research above to:
1. Reference the company by name and show you've done your homework
2. Connect pain points to their specific industry and situation
3. Mention relevant news or developments to build credibility
4. Position against their known competitors if applicable
5. Speak to their tech stack challenges if relevant` : '';

    const userPrompt = `Generate a winning ${template.name} script with this context:

SCENARIO: ${template.name}
FOCUS: ${template.focus}
SECTIONS TO INCLUDE: ${template.sections.join(", ")}
${userProfileSection}
${companyResearchSection}
BUYER PERSONA:
- Role: ${safeRole}
- Industry: ${safeIndustry}
- Company Size: ${safeCompanySize}
- Known Pain Points: ${safePainPoints}
- Personality Style: ${safePersonalityStyle}

DEAL CONTEXT:
- Stage: ${safeStage}
- Budget: ${safeBudget}
- Timeline: ${safeTimeline}
- Competition: ${safeCompetition}
- Previous Interactions: ${safePreviousInteractions}
- Known Objections: ${safeKnownObjections}

STYLE: ${safeStyle} (Options: confident, consultative, urgent, collaborative)

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
      return new Response(JSON.stringify({ error: "Failed to generate script" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(JSON.stringify({ error: "Failed to generate script" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      error: "An unexpected error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
