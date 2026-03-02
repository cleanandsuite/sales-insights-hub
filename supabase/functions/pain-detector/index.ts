import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (str: string): boolean => {
  return typeof str === 'string' && UUID_REGEX.test(str);
};

interface PainPoint {
  type: 'follow_up' | 'closing' | 'prospecting' | 'objection_handling' | 'turnover' | 'talk_ratio' | 'pricing';
  severity: number; // 1-10
  evidenceQuote: string;
  industryBenchmarkImpact: string;
  coachingFix: string;
  predictedWinRateLift: number; // percentage
}

interface PainAnalysisResult {
  pains: PainPoint[];
  overallHealthScore: number;
  priorityActions: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Request body must be an object' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transcript, recordingId } = body as { transcript?: unknown; recordingId?: unknown };

    // Validate recordingId is a valid UUID
    if (!recordingId || typeof recordingId !== 'string' || !isValidUuid(recordingId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing recordingId. Must be a valid UUID.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate transcript
    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid transcript. Must be a string.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const trimmedTranscript = transcript.trim();
    if (trimmedTranscript.length < 50) {
      return new Response(JSON.stringify({ error: 'Transcript must be at least 50 characters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (trimmedTranscript.length > 100000) {
      return new Response(JSON.stringify({ error: 'Transcript exceeds maximum length of 100,000 characters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user owns the recording
    const { data: recording, error: recError } = await supabase
      .from('call_recordings')
      .select('user_id')
      .eq('id', recordingId)
      .single();

    if (recError || !recording || recording.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Recording not found or unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a sales call pain detector. Analyze the transcript for the following common sales pains:

1. **Follow-up** - Missing or weak follow-up commitments, no next steps defined
2. **Closing** - Weak closing attempts, missing trial closes, hesitation to ask for the deal
3. **Prospecting** - Poor discovery, not qualifying properly, missing BANT info
4. **Objection Handling** - Deflecting objections, not addressing concerns, getting defensive
5. **Turnover** - Excessive talking, not letting customer speak, dominating conversation
6. **Talk Ratio** - Unhealthy talk/listen ratio (ideal is 40-60% rep talk time)
7. **Pricing** - Premature price discussion, not building value before price, discounting too quickly

For each pain detected, provide:
- severity: 1-10 (10 being most severe)
- evidenceQuote: A direct quote from the transcript showing the issue (max 100 chars)
- industryBenchmarkImpact: How this compares to industry top performers
- coachingFix: Specific actionable fix (1-2 sentences)
- predictedWinRateLift: Estimated win rate improvement if fixed (0-25%)

Return JSON with structure:
{
  "pains": [...],
  "overallHealthScore": 0-100,
  "priorityActions": ["top 3 immediate actions"]
}

Only include pains that are clearly evident. Be specific and actionable.`;

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
          { role: 'user', content: `Analyze this sales call transcript:\n\n${trimmedTranscript.slice(0, 15000)}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let painAnalysis: PainAnalysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        painAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      painAnalysis = {
        pains: [],
        overallHealthScore: 70,
        priorityActions: ['Unable to analyze transcript - try again']
      };
    }

    // Store analysis in database
    await supabase
      .from('call_recordings')
      .update({
        ai_suggestions: {
          ...(await supabase.from('call_recordings').select('ai_suggestions').eq('id', recordingId).single()).data?.ai_suggestions,
          painAnalysis
        }
      })
      .eq('id', recordingId);

    return new Response(JSON.stringify(painAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Pain detector error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during analysis' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
