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

    switch (event.type) {
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        logStep("Subscription deleted", { subscriptionId: subscription.id, customerId });

        // Find user by stripe_customer_id or metadata
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              is_active: false,
              subscription_status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (error) {
            logStep("Error updating profile by user_id", { error: error.message });
          } else {
            logStep("Profile deactivated by user_id", { userId });
          }
        } else {
          // Fallback: update by stripe_customer_id
          const { error } = await supabase
            .from("profiles")
            .update({
              is_active: false,
              subscription_status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            logStep("Error updating profile by customer_id", { error: error.message });
          } else {
            logStep("Profile deactivated by customer_id", { customerId });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        logStep("Subscription updated", { subscriptionId: subscription.id, status, customerId });

        const isActive = status === "active" || status === "trialing";
        const userId = subscription.metadata?.user_id;

        const updateData = {
          is_active: isActive,
          subscription_status: status,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        };

        if (userId) {
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("user_id", userId);

          if (error) {
            logStep("Error updating profile", { error: error.message });
          } else {
            logStep("Profile updated", { userId, isActive, status });
          }
        } else {
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("stripe_customer_id", customerId);

          if (error) {
            logStep("Error updating profile by customer_id", { error: error.message });
          } else {
            logStep("Profile updated by customer_id", { customerId, isActive, status });
          }
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

          const updateData = {
            is_active: true,
            subscription_status: subscription.status,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          };

          if (userId) {
            const { error } = await supabase
              .from("profiles")
              .update(updateData)
              .eq("user_id", userId);

            if (error) {
              logStep("Error activating profile", { error: error.message });
            } else {
              logStep("Profile activated", { userId });
            }
          } else {
            const { error } = await supabase
              .from("profiles")
              .update(updateData)
              .eq("stripe_customer_id", customerId);

            if (error) {
              logStep("Error activating profile by customer_id", { error: error.message });
            } else {
              logStep("Profile activated by customer_id", { customerId });
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("Payment failed", { invoiceId: invoice.id, customerId });

        const { error } = await supabase
          .from("profiles")
          .update({
            is_active: false,
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          logStep("Error marking profile past_due", { error: error.message });
        } else {
          logStep("Profile marked past_due", { customerId });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;
        logStep("Checkout completed", { sessionId: session.id, customerId, userId, subscriptionId });

        if (userId && customerId) {
          // Link customer to profile and activate
          const { error } = await supabase
            .from("profiles")
            .update({
              is_active: true,
              subscription_status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (error) {
            logStep("Error linking customer to profile", { error: error.message });
          } else {
            logStep("Customer linked and profile activated", { userId, customerId });
          }

          // Also update subscription metadata with user_id for future events
          if (subscriptionId) {
            try {
              await stripe.subscriptions.update(subscriptionId, {
                metadata: { user_id: userId },
              });
              logStep("Subscription metadata updated", { subscriptionId, userId });
            } catch (err) {
              logStep("Error updating subscription metadata", { error: err });
            }
          }
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
