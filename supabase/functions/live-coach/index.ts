import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Coach style system prompts
const COACH_PROMPTS: Record<string, string> = {
  cardone: `You are a high-energy sales coach using the 10X Momentum methodology. Be direct, intense, and action-focused.
Focus on:
- Identifying PAIN and urgency - "Where's the pain? What's this costing them?"
- Massive action - push for bigger commitments
- Overcoming objections aggressively - "What would solving this be WORTH to you?"
- Closing harder - "Ask for the business NOW"
- Energy and enthusiasm - match their objection with 10X energy
Use SHORT, punchy phrases. Be direct. Create urgency.`,

  belfort: `You are a sales coach using the Straight Line methodology. Focus on tonality and looping.
Focus on:
- Tonality shifts - suggest when to change pace, pitch, lower voice for authority
- Looping back to objections - "Loop back: reframe their concern as a reason TO buy"
- Building certainty - help them feel certain about product, company, and YOU
- Pattern interrupts - suggest unexpected questions to regain control
- Emotional connection before logic
Use tactical phrases about HOW to say things, not just what.`,

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
  coachStyle: 'cardone' | 'belfort' | 'neutral';
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
