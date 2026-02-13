import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Static pricing data - no database query needed
// This prevents exposing internal features_json and plan IDs
const PUBLIC_PRICING = {
  plans: [
    {
      name: "Individual",
      price: 29,
      currency: "USD",
      interval: "month",
      maxUsers: 1,
      features: [
        "Call recording & playback",
        "AI transcription",
        "Personal coaching insights",
        "Basic analytics"
      ]
    },
    {
      name: "Team",
      price: 99,
      currency: "USD", 
      interval: "month",
      maxUsers: 10,
      features: [
        "Everything in Individual",
        "Team sharing & collaboration",
        "Manager dashboard",
        "Lead assignment",
        "Team performance analytics"
      ]
    }
  ]
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Simple rate limiting via cache headers
    return new Response(JSON.stringify(PUBLIC_PRICING), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour
      },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[GET-PRICING] Error:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to fetch pricing" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
