import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const sanitizeString = (str: string, maxLength: number): string => {
  if (typeof str !== 'string') return '';
  // Remove potential HTML/script tags and trim
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
};

interface ChatMessage {
  role: string;
  content: string;
}

interface SupportTicketRequest {
  name: string;
  email: string;
  message: string;
  sessionId: string;
  conversationHistory?: ChatMessage[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate required fields exist and are strings
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name: rawName, email: rawEmail, message: rawMessage, sessionId: rawSessionId, conversationHistory } = body as SupportTicketRequest;

    // Validate and sanitize name
    if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const name = sanitizeString(rawName, 100);
    if (name.length < 1) {
      return new Response(
        JSON.stringify({ error: "Name must be at least 1 character" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!rawEmail || typeof rawEmail !== 'string') {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const email = rawEmail.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize message
    if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const message = sanitizeString(rawMessage, 5000);
    if (message.length < 10) {
      return new Response(
        JSON.stringify({ error: "Message must be at least 10 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate session ID
    const sessionId = typeof rawSessionId === 'string' ? sanitizeString(rawSessionId, 100) : 'unknown';

    // Validate and sanitize conversation history
    let sanitizedHistory: ChatMessage[] = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      sanitizedHistory = conversationHistory
        .slice(0, 50) // Limit to 50 messages
        .filter((msg): msg is ChatMessage => 
          msg && 
          typeof msg === 'object' && 
          typeof msg.role === 'string' &&
          typeof msg.content === 'string'
        )
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: sanitizeString(msg.content, 2000)
        }));
    }

    // Format conversation history for email
    let conversationText = "";
    if (sanitizedHistory.length > 0) {
      conversationText = "\n\n--- Previous Chat Conversation ---\n";
      sanitizedHistory.forEach((msg) => {
        conversationText += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n\n`;
      });
    }

    // HTML escape for email content
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SellSig Support <onboarding@resend.dev>",
        to: ["support@sellsig.com"],
        reply_to: email,
        subject: `Support Ticket from ${escapeHtml(name)} (${email})`,
        html: `
          <h2>New Support Ticket</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Session ID:</strong> ${escapeHtml(sessionId)}</p>
          <h3>Message:</h3>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          ${sanitizedHistory.length > 0 ? `
            <h3>Previous Chat Conversation:</h3>
            ${sanitizedHistory.map(msg => `
              <p><strong>${msg.role === 'user' ? 'User' : 'AI'}:</strong> ${escapeHtml(msg.content)}</p>
            `).join('')}
          ` : ''}
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      // Still log the ticket even if email fails
    }

    // Log the ticket submission
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("support_logs").insert({
      session_id: sessionId,
      event_type: "ticket_submitted",
      query_text: message.slice(0, 500), // Limit stored message size
      metadata: { 
        name: name.slice(0, 50), 
        email, 
        conversation_length: sanitizedHistory.length 
      }
    });

    console.log("Support ticket sent");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Submit support ticket error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit support ticket" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
