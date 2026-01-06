import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  recordingId: z.string().uuid().optional(),
  transcript: z.string().min(50).max(100000),
  userId: z.string().uuid(),
});

const DEAL_COACH_PROMPT = `You are an elite sales coach with 20+ years of experience closing enterprise deals. Analyze this sales call transcript and provide comprehensive coaching.

Your analysis must be brutally honest yet constructive. Focus on:

1. **MISSED OPPORTUNITIES**: Moments where the rep could have advanced the deal but didn't. For each:
   - What happened (the exact moment)
   - What should have been said instead
   - The impact level (high/medium/low)
   - Why this matters for the deal

2. **DEAL RISKS**: Red flags that could kill this deal:
   - The risk identified
   - Severity (critical/warning/info)
   - Specific recommendation to mitigate

3. **BETTER RESPONSES**: Specific suggestions for responses that would have been more effective:
   - The original statement/response
   - A better alternative
   - The reasoning behind the improvement
   - Expected impact on deal progression

4. **KEY MOMENTS**: Critical points in the conversation:
   - Timestamp/position in conversation
   - Type (positive/negative/neutral)
   - Description of what happened
   - Why it's significant

5. **IMPROVEMENT AREAS**: Skills to develop:
   - Skill area (discovery, objection handling, closing, rapport, etc.)
   - Current proficiency score (0-100)
   - Target score
   - Specific tips to improve

6. **SCORING**:
   - Overall call score (0-100)
   - Current win probability based on this call (0-100)
   - Potential win probability if suggestions applied (0-100)

7. **SUMMARY**:
   - Executive summary (2-3 sentences)
   - Top 3 strengths demonstrated
   - Top 3 weaknesses to address
   - Immediate action items for next call

Return ONLY valid JSON in this exact format:
{
  "overall_score": 72,
  "win_probability": 45,
  "potential_win_probability": 68,
  "missed_opportunities": [
    {
      "moment": "Early in call when prospect mentioned budget constraints",
      "what_happened": "Rep immediately started defending price instead of exploring value",
      "what_should_have_said": "That's helpful to know. Before we talk numbers, help me understand - if budget wasn't a factor, would this solution solve your core problem?",
      "impact": "high",
      "reasoning": "Missed chance to anchor on value before price discussion"
    }
  ],
  "deal_risks": [
    {
      "risk": "No clear next step agreed",
      "severity": "critical",
      "recommendation": "Always end calls with a specific calendar invite for the next meeting"
    }
  ],
  "better_responses": [
    {
      "original": "Our pricing starts at $5,000 per month",
      "suggested": "Before I share pricing, I want to make sure we're solving the right problems. Based on what you've shared, it sounds like [pain point] is costing you roughly $X per month. Does that sound right?",
      "reasoning": "Establish ROI context before revealing price to anchor value",
      "expected_impact": "Higher perceived value, fewer price objections"
    }
  ],
  "key_moments": [
    {
      "timestamp": "3:45",
      "type": "positive",
      "description": "Rep effectively uncovered the prospect's main pain point",
      "significance": "This is the foundation for building a compelling value proposition"
    }
  ],
  "improvement_areas": [
    {
      "area": "Objection Handling",
      "current_score": 55,
      "target_score": 80,
      "tips": ["Use the 'Feel, Felt, Found' framework", "Ask clarifying questions before responding", "Acknowledge the objection genuinely"]
    }
  ],
  "executive_summary": "This call showed promise in discovery but fell short in advancing the deal. The rep built decent rapport but missed critical buying signals and failed to establish clear next steps.",
  "strengths": ["Good discovery questions", "Friendly and approachable tone", "Understood the prospect's industry"],
  "weaknesses": ["Premature pricing discussion", "No clear next step", "Missed buying signal at 8:30"],
  "action_items": ["Send ROI calculation within 24 hours", "Schedule follow-up with decision maker", "Prepare case study from similar industry"]
}`;

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
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
        JSON.stringify({ error: 'Invalid request parameters. Transcript must be between 50 and 100,000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { recordingId, transcript, userId } = parseResult.data;

    // Verify the userId matches authenticated user
    if (userId !== userData.user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting Deal Coach analysis for recording:', recordingId);

    // Use Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and limit transcript length for AI
    const sanitizedTranscript = transcript.substring(0, 15000);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: DEAL_COACH_PROMPT },
          { 
            role: 'user', 
            content: `Analyze this sales call transcript and provide comprehensive coaching:\n\n${sanitizedTranscript}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze transcript' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse the JSON response
    let coaching;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        coaching = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse coaching analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deal Coach analysis complete. Score:', coaching.overall_score);

    // Store coaching session in database using service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .insert({
        recording_id: recordingId,
        user_id: userId,
        overall_score: coaching.overall_score,
        win_probability: coaching.win_probability,
        potential_win_probability: coaching.potential_win_probability,
        missed_opportunities: coaching.missed_opportunities || [],
        deal_risks: coaching.deal_risks || [],
        better_responses: coaching.better_responses || [],
        improvement_areas: coaching.improvement_areas || [],
        key_moments: coaching.key_moments || [],
        executive_summary: coaching.executive_summary,
        strengths: coaching.strengths || [],
        weaknesses: coaching.weaknesses || [],
        action_items: coaching.action_items || []
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to save coaching session:', sessionError);
    } else {
      // Track suggestions as metrics for ROI
      const metricsToInsert = [];
      
      // Track missed opportunities
      for (const opp of coaching.missed_opportunities || []) {
        metricsToInsert.push({
          user_id: userId,
          coaching_session_id: session.id,
          recording_id: recordingId,
          suggestion_type: 'missed_opportunity',
          suggestion_text: opp.what_should_have_said
        });
      }
      
      // Track better responses
      for (const resp of coaching.better_responses || []) {
        metricsToInsert.push({
          user_id: userId,
          coaching_session_id: session.id,
          recording_id: recordingId,
          suggestion_type: 'better_response',
          suggestion_text: resp.suggested
        });
      }
      
      // Track risk mitigations
      for (const risk of coaching.deal_risks || []) {
        metricsToInsert.push({
          user_id: userId,
          coaching_session_id: session.id,
          recording_id: recordingId,
          suggestion_type: 'risk_mitigation',
          suggestion_text: risk.recommendation
        });
      }
      
      if (metricsToInsert.length > 0) {
        const { error: metricsError } = await supabase
          .from('coaching_metrics')
          .insert(metricsToInsert);
        
        if (metricsError) {
          console.error('Failed to insert coaching metrics:', metricsError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ...coaching,
        session_id: session?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Deal Coach error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
