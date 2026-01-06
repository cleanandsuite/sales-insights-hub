import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, useAssemblyAI = true } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
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

    // Fallback to OpenAI Whisper
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
        suggestion: isRateLimit 
          ? 'Too many requests. Please wait a moment and try again.'
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

  // Step 2: Request transcription
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_detection: true,
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (response.status === 429) {
    throw new Error('Rate limit exceeded (429)');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('OpenAI transcription completed');
  return { text: result.text || '' };
}
