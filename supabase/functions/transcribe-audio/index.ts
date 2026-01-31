import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', userData.user.id);

    const body = await req.json();
    
    // Handle real-time token request for WebSocket transcription
    if (body.action === 'get_realtime_token') {
      const assemblyAIKey = Deno.env.get('ASSEMBLYAI_API_KEY');
      if (!assemblyAIKey) {
        return new Response(
          JSON.stringify({ error: 'ASSEMBLYAI_API_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Fetching AssemblyAI real-time token...');
      const tokenResponse = await fetch(
        'https://api.assemblyai.com/v2/realtime/token',
        {
          method: 'POST',
          headers: {
            'Authorization': assemblyAIKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ expires_in: 3600 }),
        }
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('AssemblyAI token error:', tokenResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: `Failed to get token: ${tokenResponse.status}` }),
          { status: tokenResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenData = await tokenResponse.json();
      console.log('AssemblyAI real-time token obtained');
      return new Response(
        JSON.stringify({ token: tokenData.token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Standard transcription flow
    const { audio, useAssemblyAI = true } = body;
    
    if (!audio || audio.length === 0) {
      console.log('Empty audio data received, returning empty result');
      return new Response(
        JSON.stringify({ text: '', service: 'none', message: 'No audio data to transcribe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received audio chunk for transcription, length:', audio.length);

    // Decode base64 audio
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Try AssemblyAI first if enabled
    if (useAssemblyAI) {
      const assemblyAIKey = Deno.env.get('ASSEMBLYAI_API_KEY');
      if (assemblyAIKey) {
        try {
          const result = await transcribeWithAssemblyAI(bytes, assemblyAIKey);
          return new Response(
            JSON.stringify({ text: result.text, service: 'assemblyai' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (assemblyError) {
          console.error('AssemblyAI failed, falling back to OpenAI:', assemblyError);
        }
      }
    }

    // Fallback to OpenAI Whisper with retry logic
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('No transcription API keys configured');
    }

    const result = await transcribeWithOpenAI(bytes, openAIKey);
    return new Response(
      JSON.stringify({ text: result.text, service: 'openai' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Transcription error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('Rate limit');
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        isRateLimit,
        retryAfter: isRateLimit ? 30 : undefined,
        suggestion: isRateLimit 
          ? 'Too many requests. Please wait 30 seconds and try again.'
          : 'Transcription failed. Please check your connection and try again.'
      }),
      { 
        status: isRateLimit ? 429 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function transcribeWithAssemblyAI(audioBytes: Uint8Array, apiKey: string): Promise<{ text: string }> {
  console.log('Starting AssemblyAI transcription...');
  
  // Step 1: Upload audio to AssemblyAI
  const audioBlob = new Blob([audioBytes.buffer as ArrayBuffer], { type: 'audio/webm' });
  
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: audioBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`AssemblyAI upload failed: ${uploadResponse.status}`);
  }

  const { upload_url } = await uploadResponse.json();
  console.log('Audio uploaded to AssemblyAI');

  // Step 2: Request transcription - disable language_detection, use English
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_code: 'en', // Use explicit language instead of detection
      punctuate: true,
      format_text: true,
    }),
  });

  if (!transcriptResponse.ok) {
    throw new Error(`AssemblyAI transcription request failed: ${transcriptResponse.status}`);
  }

  const { id } = await transcriptResponse.json();
  console.log('AssemblyAI transcription started:', id);

  // Step 3: Poll for results (max 60 seconds)
  for (let i = 0; i < 20; i++) {
    await wait(3000);
    
    const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { 'Authorization': apiKey },
    });
    
    const result = await statusResponse.json();
    
    if (result.status === 'completed') {
      console.log('AssemblyAI transcription completed');
      return { text: result.text || '' };
    } else if (result.status === 'error') {
      throw new Error(`AssemblyAI error: ${result.error}`);
    }
    
    console.log('AssemblyAI status:', result.status);
  }
  
  throw new Error('AssemblyAI transcription timeout');
}

async function transcribeWithOpenAI(audioBytes: Uint8Array, apiKey: string): Promise<{ text: string }> {
  console.log('Starting OpenAI Whisper transcription...');
  
  const formData = new FormData();
  const blob = new Blob([audioBytes.buffer as ArrayBuffer], { type: 'audio/webm' });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenAI attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(5000 * Math.pow(2, attempt), 60000);
        console.log(`Rate limited (429). Waiting ${waitTime / 1000}s before retry...`);
        
        if (attempt < maxRetries) {
          await wait(waitTime);
          continue;
        }
        throw new Error('Rate limit exceeded (429)');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('OpenAI transcription completed');
      return { text: result.text || '' };

    } catch (attemptError) {
      lastError = attemptError instanceof Error ? attemptError : new Error(String(attemptError));
      console.error(`Attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxRetries && !lastError.message.includes('429')) {
        await wait(2000 * attempt);
      }
    }
  }

  throw lastError || new Error('Transcription failed after all retries');
}
