import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation
interface ChatMessage {
  role: string;
  content: string;
}

const sanitizeString = (str: string, maxLength: number): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
};

const validateMessages = (messages: unknown): ChatMessage[] | null => {
  if (!Array.isArray(messages)) return null;
  if (messages.length === 0 || messages.length > 50) return null;
  
  const validated: ChatMessage[] = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') return null;
    const m = msg as Record<string, unknown>;
    if (typeof m.role !== 'string' || typeof m.content !== 'string') return null;
    if (!['user', 'assistant', 'system'].includes(m.role)) return null;
    if (m.content.length > 10000) return null; // Max 10k chars per message
    
    validated.push({
      role: m.role,
      content: sanitizeString(m.content, 10000)
    });
  }
  
  // Total content length check (prevent abuse)
  const totalLength = validated.reduce((sum, m) => sum + m.content.length, 0);
  if (totalLength > 50000) return null; // Max 50k total chars
  
  return validated;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages: rawMessages, faqContext: rawFaqContext } = body;
    
    // Validate messages array
    const messages = validateMessages(rawMessages);
    if (!messages) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format. Must be an array of 1-50 messages with role and content." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize FAQ context
    const faqContext = typeof rawFaqContext === 'string' 
      ? sanitizeString(rawFaqContext, 20000) 
      : '';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a helpful customer support AI assistant for SellSig, a sales call recording and AI coaching platform.

Your role is to answer user questions based on the FAQ knowledge below. You should:
1. Answer questions accurately based on the FAQ content
2. Be friendly, professional, and concise
3. If the question is covered by the FAQ, provide a direct answer with HIGH confidence
4. If the question is partially covered, answer what you can and note uncertainty
5. If the question is NOT covered or needs human support, START your response with "[LOW_CONFIDENCE]" and politely suggest contacting support@sellsig.com or using the support form below
6. Keep responses under 150 words unless more detail is specifically needed
7. Never make up features or pricing that isn't mentioned in the FAQ

FAQ KNOWLEDGE BASE:
${faqContext}

IMPORTANT: 
- Only answer based on the FAQ knowledge provided
- If asked about something not covered, START with "[LOW_CONFIDENCE]" then say you don't have that information and suggest contacting support
- For complex account-specific issues (refunds, technical bugs, account access), START with "[LOW_CONFIDENCE]" and recommend submitting a support ticket`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Support chat error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
