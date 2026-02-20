import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enterprise product IDs
const ENTERPRISE_PRODUCTS = {
  executive: 'prod_TpOv24ILHez3Aa',
  staff: 'prod_TpOvxEIGmMMCuW',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-ENTERPRISE] ${step}${detailsStr}`);
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Return default response for unauthenticated requests
      logStep("No auth header - returning default response");
      return new Response(JSON.stringify({ 
        isEnterprise: false,
        tier: null,
        subscriptionEnd: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      // Return default response for invalid/expired sessions
      logStep("Invalid session - returning default response", { error: userError?.message });
      return new Response(JSON.stringify({ 
        isEnterprise: false,
        tier: null,
        subscriptionEnd: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email - returning default response");
      return new Response(JSON.stringify({ 
        isEnterprise: false,
        tier: null,
        subscriptionEnd: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        isEnterprise: false,
        tier: null,
        subscriptionEnd: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check for enterprise subscriptions
    let enterpriseTier: 'executive' | 'staff' | null = null;
    let subscriptionEnd: string | null = null;
    let subscriptionId: string | null = null;

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const productId = typeof item.price.product === 'string' 
          ? item.price.product 
          : item.price.product?.id;

        if (productId === ENTERPRISE_PRODUCTS.executive) {
          enterpriseTier = 'executive';
          subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
          subscriptionId = sub.id;
          break;
        } else if (productId === ENTERPRISE_PRODUCTS.staff) {
          enterpriseTier = 'staff';
          subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
          subscriptionId = sub.id;
          break;
        }
      }
      if (enterpriseTier) break;
    }

    logStep("Enterprise check complete", { enterpriseTier, subscriptionEnd });

    // Update enterprise_users table if subscription found
    if (enterpriseTier && subscriptionId) {
      // Check if user already in enterprise_users
      const { data: existingUser } = await supabaseClient
        .from('enterprise_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingUser) {
        // Add user to enterprise_users
        await supabaseClient
          .from('enterprise_users')
          .insert({
            user_id: user.id,
            tier: enterpriseTier,
            status: 'active',
            stripe_subscription_id: subscriptionId,
          });
        logStep("Added user to enterprise_users", { tier: enterpriseTier });
      } else {
        // Update tier if changed
        await supabaseClient
          .from('enterprise_users')
          .update({
            tier: enterpriseTier,
            status: 'active',
            stripe_subscription_id: subscriptionId,
          })
          .eq('user_id', user.id);
        logStep("Updated enterprise_users", { tier: enterpriseTier });
      }
    }

    return new Response(JSON.stringify({
      isEnterprise: !!enterpriseTier,
      tier: enterpriseTier,
      subscriptionEnd,
      subscriptionId,
    }), {
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
