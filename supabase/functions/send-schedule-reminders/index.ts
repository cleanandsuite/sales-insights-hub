import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find calls due for reminders: scheduled, not yet reminded, within reminder window
    const now = new Date();

    const { data: dueCalls, error: queryError } = await supabase
      .from("scheduled_calls")
      .select("id, title, contact_name, contact_email, scheduled_at, duration_minutes, prep_notes, reminder_minutes_before, user_id")
      .eq("status", "scheduled")
      .eq("reminder_sent", false);

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (!dueCalls || dueCalls.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter calls where scheduled_at is within reminder_minutes_before from now
    const callsDueForReminder = dueCalls.filter((call) => {
      const scheduledAt = new Date(call.scheduled_at);
      const reminderTime = new Date(scheduledAt.getTime() - (call.reminder_minutes_before || 30) * 60000);
      return now >= reminderTime && now < scheduledAt;
    });

    let sentCount = 0;

    for (const call of callsDueForReminder) {
      try {
        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(call.user_id);
        const userEmail = userData?.user?.email;
        if (!userEmail) continue;

        // Generate AI prep summary
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You are a sales call prep assistant. Write a brief, actionable reminder email (3-5 bullet points) for an upcoming sales call. Keep it concise and practical.",
              },
              {
                role: "user",
                content: `Upcoming call in ${call.reminder_minutes_before || 30} minutes:
Title: ${call.title}
Contact: ${call.contact_name || "Unknown"}
Duration: ${call.duration_minutes} minutes
Prep Notes: ${call.prep_notes || "None"}
Scheduled: ${new Date(call.scheduled_at).toLocaleString()}`,
              },
            ],
          }),
        });

        let aiBody = "Your call is starting soon. Review your prep notes and be ready!";
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiBody = aiData.choices?.[0]?.message?.content || aiBody;
        }

        // Send via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SellSig Reminders <onboarding@resend.dev>",
            to: [userEmail],
            subject: `⏰ Reminder: ${call.title} in ${call.reminder_minutes_before || 30} min`,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Upcoming Call Reminder</h2>
              <p><strong>${call.title}</strong></p>
              <p>Contact: ${call.contact_name || "N/A"}</p>
              <p>Time: ${new Date(call.scheduled_at).toLocaleString()}</p>
              <hr style="border: 1px solid #eee;" />
              <div style="white-space: pre-wrap;">${aiBody}</div>
            </div>`,
          }),
        });

        if (emailResponse.ok) {
          // Mark as sent
          await supabase
            .from("scheduled_calls")
            .update({ reminder_sent: true })
            .eq("id", call.id);
          sentCount++;
        } else {
          console.error(`Failed to send reminder for call ${call.id}:`, await emailResponse.text());
        }
      } catch (err) {
        console.error(`Error processing call ${call.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ sent: sentCount, checked: callsDueForReminder.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Reminder error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
