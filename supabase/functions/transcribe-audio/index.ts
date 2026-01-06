import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Received audio chunk for transcription, length:', audio.length);

    // Decode base64 audio in chunks to prevent memory issues
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'json');

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Transcription attempt ${attempt}/${maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempt), 30000);
          console.log(`Rate limited (429). Waiting ${waitTime / 1000} seconds before retry...`);
          
          if (attempt < maxRetries) {
            await wait(waitTime);
            continue;
          }
          
          // Return rate limit info so client can handle it
          return new Response(
            JSON.stringify({ 
              error: 'Rate limit exceeded',
              isRateLimit: true,
              retryAfter: Math.ceil(waitTime / 1000),
              suggestion: 'Too many requests. Please wait a moment and try again.'
            }),
            { 
              status: 429, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Whisper API error (${response.status}):`, errorText);
          throw new Error(`Whisper API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Transcription successful:', result.text?.substring(0, 100));

        return new Response(
          JSON.stringify({ text: result.text || '' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (attemptError) {
        lastError = attemptError instanceof Error ? attemptError : new Error(String(attemptError));
        console.error(`Attempt ${attempt} failed:`, lastError.message);

        const isNetworkError = lastError.message.includes('dns') || 
                               lastError.message.includes('network') ||
                               lastError.message.includes('fetch') ||
                               lastError.message.includes('abort');

        if (attempt < maxRetries && isNetworkError) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Network error detected. Retrying in ${backoffTime / 1000} seconds...`);
          await wait(backoffTime);
          continue;
        }

        if (!isNetworkError) {
          break;
        }
      }
    }

    throw lastError || new Error('Transcription failed after all retries');

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
