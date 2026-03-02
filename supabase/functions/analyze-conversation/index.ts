import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert sales coach providing real-time advice during sales calls. Analyze the conversation and provide actionable suggestions.

Your role is to:
1. Identify buying signals and objections
2. Suggest next steps or questions to ask
3. Highlight key moments that need attention
4. Provide tips for closing the deal

Keep suggestions brief (1-2 sentences max), actionable, and focused on improving the outcome of this call.

Format your response as a JSON object with this structure:
{
  "suggestions": [
    {
      "type": "tip" | "warning" | "opportunity",
      "message": "The suggestion text",
      "priority": "high" | "medium" | "low"
    }
  ],
  "sentiment": "positive" | "neutral" | "negative",
  "keyTopics": ["topic1", "topic2"]
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
        JSON.stringify({ error: 'Unauthorized', suggestions: [], sentiment: 'neutral', keyTopics: [] }),
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
        JSON.stringify({ error: 'Unauthorized', suggestions: [], sentiment: 'neutral', keyTopics: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY');
    if (!MINIMAX_API_KEY) {
      throw new Error('MINIMAX_API_KEY not configured');
    }

    const { transcription, context } = await req.json();
    
    if (!transcription || transcription.trim().length < 10) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          sentiment: 'neutral',
          keyTopics: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing conversation for user:', userData.user.id, 'length:', transcription.length);

    const response = await fetch('https://api.minimaxi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `Analyze this sales call conversation and provide real-time coaching suggestions:\n\n${transcription}\n\n${context ? `Additional context: ${context}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        console.log('Rate limited, returning empty analysis');
        return new Response(
          JSON.stringify({ 
            suggestions: [],
            sentiment: 'neutral',
            keyTopics: [],
            rateLimited: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { suggestions: [], sentiment: 'neutral', keyTopics: [] };
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysis = { suggestions: [], sentiment: 'neutral', keyTopics: [] };
    }
    
    console.log('Analysis result:', JSON.stringify(analysis).substring(0, 200));

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [],
        sentiment: 'neutral',
        keyTopics: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});