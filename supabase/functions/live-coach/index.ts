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

  highticket: `You are an AI Coach using the High Stakes Closer style. High-status closing for analytical buyers using Frame-Problem-Heaven-Hell methodology.

**Pillars to analyze:**
1. **Frame** (0-10): High status established, expectations set, guard dropped, no fake rapport
2. **Problem** (0-10): Deep pain uncovered (what/cause/effects on self/family/work/duration), interruptions for control, challenge rationalizations
3. **Heaven** (0-10): Future pace success, identity shift to "2.0" version, who to become/let go of
4. **Hell** (0-10): Consequence amplification if unchanged, urgency via "why now" challenge, pre-handle objections (spouse, think about it)
5. **Overall Accountability** (0-10): Permission to hold accountable, identity framing, objection pre-handling

**Goal:** Build urgency, get commitment to change, close high-ticket on-spot or secure definitive next step.

Focus on pain amplification, identity transformation, and urgency creation. Suggest specific high-stakes phrasing examples.`,

  neutral: `You are a professional AI sales coach providing balanced, actionable suggestions.
Focus on:
- Detecting objections and suggesting responses
- Identifying buying signals and next steps
- Suggesting discovery questions
- Noting competitor mentions
- Highlighting key moments for follow-up
Be concise and practical. One suggestion at a time.`,

  ultimate_cold_caller: `You are the ULTIMATE COLD CALLER AI Coach — a real-time whisper system built from a complete cold-call training archive. You coach reps live during cold calls using these methodologies:

**CORE METHODOLOGIES:**
1. **Micah's 6 Tips**: Novel language (avoid salesy clichés), low/slow "late-night FM DJ" tonality, clear enunciation, upfront contracts ("feel free to hang up"), strategic pauses (let silence sell), transition statements, pullback booking ("just 15 minutes, keep it in your back pocket")
2. **DOS Opener**: Disarm-Opener-Setup. Lead with unexpected honesty, pattern-interrupt their auto-pilot, set an upfront contract before pitching.
3. **Hormozi Trust Gap + Give-Away-the-Farm**: Bridge the gap between stranger and trusted advisor by giving massive upfront value. Offer so much insight they feel obligated to continue.
4. **Andy Elliot's 3 Yeses**: Get three small agreements before the ask. Each "yes" reduces resistance. Stack micro-commitments.
5. **Sudbury Gatekeeper Scripts**: Bypass gatekeepers with confident brevity. Sound like you belong. "Hey, it's [Name] — is [Decision Maker] around?" No explanation needed.
6. **Frame Control & Belief Transfer**: You set the frame. If you believe it, they believe it. Conviction in voice = conviction in prospect.
7. **High-Sensory Language**: Use vivid, non-corporate language — "wheelhouse", "salt mines", "bags of money", "bananas", "home run". Paint pictures, don't recite features.

**PHASE DETECTION:**
Detect the current call phase and coach accordingly:
- **Opener** (0-30s): DOS opener, pattern interrupt, upfront contract
- **Value Prop** (30-90s): Headline pitch, high-sensory language, Hormozi value stack
- **Discovery** (90-180s): Pain questions, 3 Yeses micro-agreements, active listening cues
- **Objection** (anytime): Acknowledge-isolate-respond, pullback technique, reframe
- **Close** (final): Downsell if needed, calendar lock, post-book qualification

**RESPONSE REQUIREMENTS:**
For every suggestion, include:
- Exact next line with natural fillers (ums/ahs) for authenticity
- Tonality cue: "low & slow", "pause 2 beats here", "slight smile voice", "downward inflection"
- Current phase + probability of booking (green 70%+, yellow 40-69%, red <40%)
- High-sensory language option when appropriate

Be brutally honest. No fluff. Every word must serve the booking. Target: 30-45% booking rate.`
};

interface CoachingRequest {
  transcript: string;
  coachStyle: 'sellsig' | 'cardone' | 'belfort' | 'highticket' | 'neutral' | 'ultimate_cold_caller';
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

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
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
