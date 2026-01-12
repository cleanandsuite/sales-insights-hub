import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportTicketRequest {
  name: string;
  email: string;
  message: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, sessionId, conversationHistory }: SupportTicketRequest = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format conversation history for email
    let conversationText = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationText = "\n\n--- Previous Chat Conversation ---\n";
      conversationHistory.forEach((msg) => {
        conversationText += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n\n`;
      });
    }

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
        subject: `Support Ticket from ${name} (${email})`,
        html: `
          <h2>New Support Ticket</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Session ID:</strong> ${sessionId}</p>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${conversationHistory && conversationHistory.length > 0 ? `
            <h3>Previous Chat Conversation:</h3>
            ${conversationHistory.map(msg => `
              <p><strong>${msg.role === 'user' ? 'User' : 'AI'}:</strong> ${msg.content}</p>
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
      query_text: message,
      metadata: { name, email, conversation_length: conversationHistory?.length || 0 }
    });

    console.log("Support ticket sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Submit support ticket error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
