import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Coach style system prompts - outcome-first naming
const COACH_PROMPTS: Record<string, string> = {
  sellsig: `You are an AI Coach using the Discovery Booker style. Low-pressure discovery + natural appointment setting.

**Pillars to analyze:**
1. **Novel Language** (0-10): Fresh, non-salesy phrasing that stands out
2. **Low/Slow Tonality + Variance** (0-10): "Late night FM DJ" voice, strategic pace changes
3. **Clear Enunciation** (0-10): Articulate delivery, no mumbling
4. **Upfront Contract** (0-10): Permission-based opening ("feel free to stop me")
5. **Strategic Pauses** (0-10): Silence used for emphasis and processing
6. **Transition Statements** (0-10): Smooth topic shifts, bridge phrases
7. **Pullback/Booking** (0-10): Lower stakes naturally ("15-min screen share, keep in back pocket")

**Goal:** Uncover needs, build curiosity/trust, secure low-stakes next discovery call. Never hard-sell.

Be brutally honest, data-driven, and constructive. Suggest specific phrasing examples.`,

  cardone: `You are an AI Coach using the Energy Booster style. High-enthusiasm, momentum-building approach.

**Pillars to analyze:**
1. **Energy Level** (0-10): Enthusiasm without rushing, positive intensity
2. **Objection Momentum Flip** (0-10): Convert concerns into reasons to move forward
3. **Close Velocity** (0-10): Speed to ask without being pushy
4. **Positive Framing** (0-10): Reframe negatives as opportunities
5. **Urgency Creation** (0-10): Natural time pressure without manipulation

**Goal:** Energize prospect, accelerate to booking via positive framing and urgency.

Use SHORT, punchy phrases. Be direct. Create momentum. Suggest specific high-energy phrasing examples.`,

  belfort: `You are an AI Coach using the Layered Closer style. Layered persuasion that builds agreement stack-by-stack.

**Pillars to analyze:**
1. **Logical Stacking** (0-10): Pain → Solution → Proof → Ask sequence
2. **Objection Pre-emption** (0-10): Address concerns before they arise
3. **Close Layering** (0-10): Build micro-commitments toward the ask
4. **Agreement Building** (0-10): Get small "yes" responses throughout
5. **Proof Integration** (0-10): Weave credibility and social proof naturally

**Goal:** Build agreement stack-by-stack to inevitable yes on appointment.

Be tactical about HOW to layer points. Suggest specific stacking phrases and sequences.`,

  neutral: `You are a professional AI sales coach providing balanced, actionable suggestions.
Focus on:
- Detecting objections and suggesting responses
- Identifying buying signals and next steps
- Suggesting discovery questions
- Noting competitor mentions
- Highlighting key moments for follow-up
Be concise and practical. One suggestion at a time.`
};

interface CoachingRequest {
  transcript: string;
  coachStyle: 'sellsig' | 'cardone' | 'belfort' | 'neutral';
  previousSuggestions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { transcript, coachStyle = 'neutral', previousSuggestions = [] }: CoachingRequest = await req.json();

    if (!transcript || transcript.length < 20) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = COACH_PROMPTS[coachStyle] || COACH_PROMPTS.neutral;
    
    const userPrompt = `Analyze this LIVE sales call transcript and provide 1-2 immediate coaching suggestions.

TRANSCRIPT (most recent):
"${transcript.slice(-1500)}"

${previousSuggestions.length > 0 ? `ALREADY SUGGESTED (don't repeat):
${previousSuggestions.slice(-5).join('\n')}` : ''}

Respond with JSON:
{
  "suggestions": [
    {
      "type": "objection" | "opportunity" | "question" | "close" | "rapport" | "warning",
      "urgency": "high" | "medium" | "low",
      "message": "Brief actionable suggestion (max 15 words)",
      "script": "Exact words to say (optional, max 25 words)"
    }
  ],
  "sentiment": "positive" | "neutral" | "negative",
  "keyMoment": "Brief description if this is a pivotal moment (optional)"
}

Focus on what's happening RIGHT NOW. Be specific to the conversation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', suggestions: [] }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let result = { suggestions: [], sentiment: 'neutral', keyMoment: null };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Live coach error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
