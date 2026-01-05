import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_PROMPT = `You are an expert sales coach analyzing a sales call recording. Provide comprehensive analysis.

Analyze the following aspects:
1. **Call Scoring** (0-100 for each):
   - Overall performance
   - Rapport building
   - Discovery questions
   - Presentation clarity
   - Objection handling
   - Closing techniques

2. **Key Metrics**:
   - Talk-to-listen ratio (estimate %)
   - Count of filler words (um, uh, like, you know)
   - Number of questions asked
   - Competitor mentions (list them)
   - Price mentions count

3. **Conversation Markers** (with timestamps if possible):
   - Buying signals
   - Objections raised
   - Key moments
   - Questions from prospect
   - Positive sentiment moments
   - Negative sentiment moments

4. **Deal Intelligence**:
   - Overall sentiment
   - Win probability (0-100)
   - Suggested next deal stage
   - Risk factors identified
   - Next steps recommended
   - Budget indicators
   - Decision timeline mentioned

5. **AI Coaching Suggestions**:
   - What went well
   - Areas for improvement
   - Specific actionable tips

Respond with a JSON object following this exact structure:
{
  "callScore": {
    "overall": number,
    "rapport": number,
    "discovery": number,
    "presentation": number,
    "objectionHandling": number,
    "closing": number
  },
  "metrics": {
    "talkRatio": number,
    "fillerWordsCount": number,
    "questionsAsked": number,
    "competitorMentions": string[],
    "priceMentions": number
  },
  "markers": [
    {
      "type": "buying_signal" | "objection" | "key_moment" | "question" | "positive" | "negative",
      "content": "description",
      "timestampSeconds": number or null
    }
  ],
  "dealIntelligence": {
    "sentiment": "positive" | "neutral" | "negative",
    "winProbability": number,
    "suggestedStage": string,
    "riskFactors": string[],
    "nextSteps": string[],
    "budgetMentioned": number or null,
    "decisionTimeline": string or null
  },
  "coaching": {
    "strengths": string[],
    "improvements": string[],
    "tips": string[]
  },
  "summary": "2-3 sentence summary of the call"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIKey) throw new Error('OPENAI_API_KEY not configured');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase credentials not configured');

    const { recordingId, transcription, audioBase64 } = await req.json();
    
    if (!recordingId) throw new Error('Recording ID is required');

    console.log(`Processing recording ${recordingId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let finalTranscription = transcription;
    
    // If no transcription provided but audio is, transcribe it first
    if (!finalTranscription && audioBase64) {
      console.log('Transcribing audio with Whisper...');
      
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const formData = new FormData();
      const blob = new Blob([bytes], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'word');
      
      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openAIKey}` },
        body: formData,
      });
      
      if (!whisperResponse.ok) {
        const error = await whisperResponse.text();
        console.error('Whisper error:', error);
        throw new Error('Transcription failed');
      }
      
      const whisperResult = await whisperResponse.json();
      finalTranscription = whisperResult.text;
      
      // Store timestamped words if available
      if (whisperResult.words) {
        await supabase
          .from('call_recordings')
          .update({ timestamped_transcript: whisperResult.words })
          .eq('id', recordingId);
      }
    }
    
    if (!finalTranscription || finalTranscription.length < 20) {
      console.log('Transcription too short for analysis');
      
      await supabase
        .from('call_recordings')
        .update({ 
          status: 'analyzed',
          analyzed_at: new Date().toISOString(),
          live_transcription: finalTranscription || 'No speech detected'
        })
        .eq('id', recordingId);
        
      return new Response(
        JSON.stringify({ success: true, message: 'Transcription too short for full analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing with GPT-4...');
    
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: `Analyze this sales call transcription:\n\n${finalTranscription}` }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.text();
      console.error('GPT-4 error:', error);
      throw new Error('Analysis failed');
    }

    const analysisResult = await analysisResponse.json();
    const analysis = JSON.parse(analysisResult.choices[0].message.content);
    
    console.log('Analysis complete, saving to database...');

    // Convert markers to the format expected by the database
    const aiMarkers = analysis.markers?.map((m: any, index: number) => ({
      id: `marker_${index}`,
      type: m.type,
      content: m.content,
      timestampSeconds: m.timestampSeconds || null,
      color: getMarkerColor(m.type)
    })) || [];

    // Update call_recordings with analysis
    const { error: updateError } = await supabase
      .from('call_recordings')
      .update({
        live_transcription: finalTranscription,
        status: 'analyzed',
        analyzed_at: new Date().toISOString(),
        sentiment_score: analysis.dealIntelligence?.winProbability / 100 || 0.5,
        key_topics: analysis.metrics?.competitorMentions || [],
        ai_suggestions: {
          coaching: analysis.coaching,
          dealIntelligence: analysis.dealIntelligence,
          metrics: analysis.metrics,
          summary: analysis.summary
        },
        ai_markers: aiMarkers,
        summary: analysis.summary
      })
      .eq('id', recordingId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Insert call score
    if (analysis.callScore) {
      const { data: scoreData, error: scoreError } = await supabase
        .from('call_scores')
        .insert({
          recording_id: recordingId,
          overall_score: analysis.callScore.overall,
          rapport_score: analysis.callScore.rapport,
          discovery_score: analysis.callScore.discovery,
          presentation_score: analysis.callScore.presentation,
          objection_handling_score: analysis.callScore.objectionHandling,
          closing_score: analysis.callScore.closing,
          talk_ratio: analysis.metrics?.talkRatio,
          filler_words_count: analysis.metrics?.fillerWordsCount,
          questions_asked: analysis.metrics?.questionsAsked,
          competitor_mentions: analysis.metrics?.competitorMentions,
          price_mentions: analysis.metrics?.priceMentions,
          ai_feedback: analysis.coaching
        })
        .select()
        .single();

      if (scoreError) {
        console.error('Score insert error:', scoreError);
      } else if (scoreData) {
        await supabase
          .from('call_recordings')
          .update({ call_score_id: scoreData.id })
          .eq('id', recordingId);
      }
    }

    // Insert deal analysis
    if (analysis.dealIntelligence) {
      const { data: dealData, error: dealError } = await supabase
        .from('deal_analysis')
        .insert({
          recording_id: recordingId,
          competitor_mentions: analysis.metrics?.competitorMentions?.map((c: string) => ({ name: c })),
          buying_signals: analysis.markers?.filter((m: any) => m.type === 'buying_signal'),
          risk_factors: analysis.dealIntelligence.riskFactors?.map((r: string) => ({ description: r })),
          win_probability: analysis.dealIntelligence.winProbability,
          deal_stage_suggestion: analysis.dealIntelligence.suggestedStage,
          next_steps: analysis.dealIntelligence.nextSteps?.map((s: string) => ({ action: s })),
          pricing_discussed: analysis.metrics?.priceMentions > 0,
          budget_mentioned: analysis.dealIntelligence.budgetMentioned,
          decision_timeline: analysis.dealIntelligence.decisionTimeline
        })
        .select()
        .single();

      if (dealError) {
        console.error('Deal analysis insert error:', dealError);
      } else if (dealData) {
        await supabase
          .from('call_recordings')
          .update({ deal_analysis_id: dealData.id })
          .eq('id', recordingId);
      }
    }

    console.log('Recording fully analyzed and saved');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        recordingId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getMarkerColor(type: string): string {
  switch (type) {
    case 'buying_signal': return '#22c55e'; // green
    case 'objection': return '#ef4444'; // red
    case 'key_moment': return '#a855f7'; // purple
    case 'question': return '#eab308'; // yellow
    case 'positive': return '#22c55e'; // green
    case 'negative': return '#ef4444'; // red
    default: return '#3b82f6'; // blue
  }
}