import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response("No signature", { status: 400 });
    }

    const payload = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
      logStep("Event verified", { type: event.type, id: event.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logStep("Signature verification failed", { error: message });
      return new Response(`Webhook Error: ${message}`, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Helper to update user_billing table
    const updateUserBilling = async (userId: string | null, customerId: string, data: Record<string, unknown>) => {
      if (userId) {
        // Try user_billing first
        const { error: billingError } = await supabase
          .from("user_billing")
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            ...data,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (billingError) {
          logStep("Error updating user_billing", { error: billingError.message });
        }

        // Also update profiles for backwards compatibility
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (profileError) {
          logStep("Error updating profile", { error: profileError.message });
        }
      } else {
        // Fallback: update by stripe_customer_id
        const { error: billingError } = await supabase
          .from("user_billing")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (billingError) {
          logStep("Error updating user_billing by customer_id", { error: billingError.message });
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (profileError) {
          logStep("Error updating profile by customer_id", { error: profileError.message });
        }
      }
    };

    // Helper to track A/B experiment conversions
    const trackExperimentConversion = async (
      visitorId: string | null,
      userId: string | null,
      amountCents: number,
      planType: string
    ) => {
      if (!visitorId && !userId) return;

      try {
        // Find assignments for this visitor/user
        let query = supabase
          .from('experiment_assignments')
          .select('id, experiment_id, variant_id');
        
        if (visitorId) {
          query = query.eq('visitor_id', visitorId);
        } else if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data: assignments } = await query;

        if (assignments && assignments.length > 0) {
          // Record conversion events for each experiment assignment
          const events = assignments.map(a => ({
            experiment_id: a.experiment_id,
            variant_id: a.variant_id,
            assignment_id: a.id,
            visitor_id: visitorId || '',
            user_id: userId,
            event_type: 'conversion',
            event_data: { source: 'stripe_webhook' },
            revenue_cents: amountCents,
            plan_type: planType,
          }));

          const { error } = await supabase
            .from('experiment_events')
            .insert(events);

          if (error) {
            logStep("Error tracking experiment conversion", { error: error.message });
          } else {
            logStep("Experiment conversions tracked", { count: events.length });
          }
        }
      } catch (err) {
        logStep("Error in experiment tracking", { error: err });
      }
    };

    // Helper to update subscription counter
    const updateSubscriptionCounter = async (planType: string) => {
      try {
        const { data: counter } = await supabase
          .from('subscription_counter')
          .select('count, max_spots')
          .eq('plan_type', planType)
          .single();

        if (counter && counter.count < counter.max_spots) {
          await supabase
            .from('subscription_counter')
            .update({ 
              count: counter.count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('plan_type', planType);
          
          logStep("Subscription counter updated", { planType, newCount: counter.count + 1 });
        }
      } catch (err) {
        logStep("Error updating subscription counter", { error: err });
      }
    };

    switch (event.type) {
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.user_id;
        logStep("Subscription deleted", { subscriptionId: subscription.id, customerId });

        await updateUserBilling(userId || null, customerId, {
          is_active: false,
          subscription_status: "canceled",
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const userId = subscription.metadata?.user_id;
        const visitorId = subscription.metadata?.visitor_id;
        logStep("Subscription updated/created", { subscriptionId: subscription.id, status, customerId });

        const isActive = status === "active" || status === "trialing";
        
        // Determine plan type from price
        const priceId = subscription.items.data[0]?.price?.id;
        let planType = 'single_user';
        if (priceId === 'price_1SmY6YAbfbNoHWTTnHLW4w07') {
          planType = 'enterprise';
        }

        await updateUserBilling(userId || null, customerId, {
          is_active: isActive,
          subscription_status: status,
          stripe_subscription_id: subscription.id,
        });

        // Track A/B conversion for new subscriptions
        if (event.type === "customer.subscription.created" && isActive) {
          const amountCents = subscription.items.data[0]?.price?.unit_amount || 0;
          await trackExperimentConversion(visitorId || null, userId || null, amountCents, planType);
          await updateSubscriptionCounter(planType);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;
        logStep("Payment succeeded", { invoiceId: invoice.id, subscriptionId, customerId });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          await updateUserBilling(userId || null, customerId, {
            is_active: true,
            subscription_status: subscription.status,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("Payment failed", { invoiceId: invoice.id, customerId });

        await updateUserBilling(null, customerId, {
          is_active: false,
          subscription_status: "past_due",
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.metadata?.user_id;
        const visitorId = session.metadata?.visitor_id;
        const subscriptionId = session.subscription as string;
        const planType = session.metadata?.plan_type || 'single_user';
        logStep("Checkout completed", { sessionId: session.id, customerId, userId, subscriptionId });

        if (userId && customerId) {
          await updateUserBilling(userId, customerId, {
            is_active: true,
            subscription_status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          });

          // Also update subscription metadata with user_id for future events
          if (subscriptionId) {
            try {
              await stripe.subscriptions.update(subscriptionId, {
                metadata: { user_id: userId, visitor_id: visitorId || '' },
              });
              logStep("Subscription metadata updated", { subscriptionId, userId });
            } catch (err) {
              logStep("Error updating subscription metadata", { error: err });
            }
          }

          // Track A/B conversion
          const amountTotal = session.amount_total || 0;
          await trackExperimentConversion(visitorId || null, userId, amountTotal, planType);
          await updateSubscriptionCounter(planType);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
