import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_SCORING_PROMPT = `You are an expert sales analyst AI. Analyze the provided lead data and conversation context to generate comprehensive scoring and recommendations.

Based on the lead information and any conversation data, provide:

1. BANT Scores (0-100 each):
   - Budget: How clearly has budget been discussed or indicated?
   - Authority: Is this person a decision maker or influencer?
   - Need: How urgent and clear is their pain point?
   - Timeline: How defined is their buying timeline?

2. Sentiment Analysis:
   - Current sentiment (positive/neutral/negative)
   - Sentiment trend direction (improving/stable/declining)

3. Common Objection Patterns detected (array of strings)

4. Risk Level: low/medium/high/critical

5. Deal Velocity Prediction:
   - Estimated days to close
   - Predicted deal value (based on context)
   - Predicted close date

6. Next Best Actions (3-5 prioritized actions with:
   - action: string description
   - priority: high/medium/low
   - reason: why this action
   - timing: when to do it

7. AI Confidence Score (0-100): How confident are you in this analysis?

Respond ONLY with valid JSON in this exact format:
{
  "bant_budget": number,
  "bant_authority": number,
  "bant_need": number,
  "bant_timeline": number,
  "sentiment_trend": [{"date": "ISO date", "sentiment": "positive|neutral|negative", "score": number}],
  "objection_patterns": ["string array of common objections"],
  "risk_level": "low|medium|high|critical",
  "deal_velocity_days": number,
  "predicted_deal_value": number,
  "predicted_close_date": "YYYY-MM-DD",
  "next_best_actions": [
    {
      "action": "string",
      "priority": "high|medium|low",
      "reason": "string",
      "timing": "string"
    }
  ],
  "ai_confidence": number,
  "coaching_insight": "string - key insight for the sales rep"
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

    const { lead_id, conversation_data, deal_context, user_id } = await req.json();

    if (!lead_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'lead_id and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user_id matches authenticated user
    if (user_id !== userData.user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch current lead data and verify ownership
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .eq('user_id', user_id)
      .single();

    if (leadError || !lead) {
      console.error('Lead not found or access denied:', leadError);
      return new Response(
        JSON.stringify({ error: 'Lead not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context for AI
    const leadContext = {
      contact_name: lead.contact_name,
      company: lead.company,
      title: lead.title,
      lead_status: lead.lead_status,
      primary_pain_point: lead.primary_pain_point,
      secondary_issues: lead.secondary_issues,
      budget_info: lead.budget_info,
      timeline: lead.timeline,
      urgency_level: lead.urgency_level,
      evaluation_stage: lead.evaluation_stage,
      competitor_status: lead.competitor_status,
      engagement_score: lead.engagement_score,
      key_quotes: lead.key_quotes,
      existing_ai_confidence: lead.ai_confidence,
      conversation_data: conversation_data || null,
      deal_context: deal_context || null
    };

    console.log('Analyzing lead:', lead_id);

    // Call Groq AI for analysis
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: AI_SCORING_PROMPT },
          { role: 'user', content: `Analyze this lead and provide scoring:\n\n${JSON.stringify(leadContext, null, 2)}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Provide default values if parsing fails
      analysis = {
        bant_budget: 50,
        bant_authority: 50,
        bant_need: 50,
        bant_timeline: 50,
        sentiment_trend: [],
        objection_patterns: [],
        risk_level: 'medium',
        deal_velocity_days: 30,
        predicted_deal_value: 0,
        predicted_close_date: null,
        next_best_actions: [],
        ai_confidence: 50,
        coaching_insight: 'Unable to generate detailed analysis. Please provide more lead context.'
      };
    }

    // Calculate predicted close date if not provided
    if (!analysis.predicted_close_date && analysis.deal_velocity_days) {
      const closeDate = new Date();
      closeDate.setDate(closeDate.getDate() + analysis.deal_velocity_days);
      analysis.predicted_close_date = closeDate.toISOString().split('T')[0];
    }

    // Update lead with AI analysis
    const updateData = {
      bant_budget: analysis.bant_budget,
      bant_authority: analysis.bant_authority,
      bant_need: analysis.bant_need,
      bant_timeline: analysis.bant_timeline,
      sentiment_trend: analysis.sentiment_trend,
      objection_patterns: analysis.objection_patterns,
      next_best_actions: analysis.next_best_actions,
      risk_level: analysis.risk_level,
      deal_velocity_days: analysis.deal_velocity_days,
      predicted_close_date: analysis.predicted_close_date,
      predicted_deal_value: analysis.predicted_deal_value,
      ai_confidence: analysis.ai_confidence,
      ai_assisted: true,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead_id);

    if (updateError) {
      console.error('Failed to update lead:', updateError);
      throw new Error('Failed to update lead with AI analysis');
    }

    // Log coaching metric for tracking
    if (analysis.next_best_actions?.length > 0) {
      const coachingMetrics = analysis.next_best_actions.map((action: { action: string }) => ({
        user_id,
        lead_id,
        suggestion_type: 'next_best_action',
        suggestion_text: action.action,
        was_applied: false,
        created_at: new Date().toISOString()
      }));

      await supabase.from('ai_coaching_metrics').insert(coachingMetrics);
    }

    console.log('Lead analysis complete:', lead_id);

    return new Response(
      JSON.stringify({
        success: true,
        lead_id,
        analysis: {
          ...analysis,
          coaching_insight: analysis.coaching_insight
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Lead Score error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
