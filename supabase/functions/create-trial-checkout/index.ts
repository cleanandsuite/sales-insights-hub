import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TRIAL-CHECKOUT] ${step}${detailsStr}`);
};

const PRICE_IDS = {
  single_user: 'price_1SmY6SAbfbNoHWTTYuvR4kHQ',
  team: 'price_1SmY6YAbfbNoHWTTnHLW4w07',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { plan = 'single_user', quantity = 1 } = await req.json();
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS] || PRICE_IDS.single_user;
    logStep("Request params", { plan, quantity, priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create checkout session for guest (no auth required)
    // Trial for 14 days, card required upfront
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${origin}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
