import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enterprise pricing tiers
const ENTERPRISE_PRICES = {
  executive: 'price_1Srk7JAksiqydspmFvSXbkMJ',
  staff: 'price_1Srk7KAksiqydspm7I3lNLAD',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ENTERPRISE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("Admin authenticated", { userId: user.id, email: user.email });

    // Verify the caller is an admin
    const { data: adminRole, error: adminError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminRole) {
      throw new Error("Access denied: Admin role required");
    }
    logStep("Admin role verified");

    const { tier, targetEmail, quantity = 1 } = await req.json();
    
    if (!tier || !['executive', 'staff'].includes(tier)) {
      throw new Error("Invalid tier. Must be 'executive' or 'staff'");
    }
    if (!targetEmail) {
      throw new Error("Target email is required");
    }
    
    logStep("Request params", { tier, targetEmail, quantity });

    const priceId = ENTERPRISE_PRICES[tier as keyof typeof ENTERPRISE_PRICES];
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists for target email
    const customers = await stripe.customers.list({ email: targetEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const productionDomain = "https://sellsig.com";
    const origin = req.headers.get("origin") || productionDomain;
    const redirectBase = origin.includes("localhost") ? origin : productionDomain;

    // Create checkout session for enterprise subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : targetEmail,
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "subscription",
      success_url: `${redirectBase}/admin?checkout=success&tier=${tier}`,
      cancel_url: `${redirectBase}/admin?checkout=canceled`,
      metadata: {
        admin_id: user.id,
        target_email: targetEmail,
        tier: tier,
        enterprise: 'true',
      },
      subscription_data: {
        metadata: {
          admin_id: user.id,
          target_email: targetEmail,
          tier: tier,
          enterprise: 'true',
        },
      },
    });

    logStep("Enterprise checkout session created", { 
      sessionId: session.id, 
      tier, 
      targetEmail,
      url: session.url 
    });

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
