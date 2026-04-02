import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_UBSjDxy12ggcNr": "basic",
  "prod_UBXuhebJkzJkWX": "professional",
  "prod_UBXvP745IUaxd3": "premium",
};

const TIER_TOKENS: Record<string, number> = {
  basic: 50,
  professional: 200,
  premium: 500,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      logStep("ERROR", { message: "STRIPE_WEBHOOK_SECRET is not configured" });
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!signature) {
      logStep("ERROR", { message: "Missing stripe-signature header" });
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const event: Stripe.Event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified via signature", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(supabase, stripe, subscription, session.metadata?.user_id);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subId: subscription.id, status: subscription.status });
        await upsertSubscription(supabase, stripe, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription canceled", { subId: subscription.id });

        const { error } = await supabase
          .from("user_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id);

        if (error) logStep("Error canceling subscription in DB", { error: error.message });
        else logStep("Subscription marked canceled in DB");
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          logStep("Invoice paid, refreshing subscription", { subId: subscription.id });
          await upsertSubscription(supabase, stripe, subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, customerId: invoice.customer });

        if (invoice.subscription) {
          const { error } = await supabase
            .from("user_subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) logStep("Error updating past_due", { error: error.message });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session expired/aborted", {
          sessionId: session.id,
          customerId: session.customer,
          userId: session.metadata?.user_id,
        });

        const userId = session.metadata?.user_id;
        if (userId) {
          // Clean up any pending subscription records created during checkout
          const { error } = await supabase
            .from("user_subscriptions")
            .update({ status: "canceled", updated_at: new Date().toISOString() })
            .eq("doctor_id", userId)
            .eq("status", "pending");

          if (error) logStep("Error cleaning up pending subscriptions", { error: error.message });
          else logStep("Cleaned up pending subscriptions for expired checkout", { userId });
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Async payment failed for checkout", {
          sessionId: session.id,
          customerId: session.customer,
          userId: session.metadata?.user_id,
        });

        const userId = session.metadata?.user_id;
        if (userId) {
          const { error } = await supabase
            .from("user_subscriptions")
            .update({ status: "payment_failed", updated_at: new Date().toISOString() })
            .eq("doctor_id", userId)
            .in("status", ["pending", "active"]);

          if (error) logStep("Error updating subscription after async payment failure", { error: error.message });
          else logStep("Subscription marked as payment_failed", { userId });
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent canceled", {
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer,
          cancellationReason: paymentIntent.cancellation_reason,
        });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function upsertSubscription(
  supabase: any,
  stripe: Stripe,
  subscription: Stripe.Subscription,
  userIdFromMetadata?: string
) {
  const productId = subscription.items.data[0]?.price.product as string;
  const tier = PRODUCT_TIER_MAP[productId];
  if (!tier) {
    logStep("Unknown product, skipping", { productId });
    return;
  }

  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as Stripe.Customer).email;

  if (!email && !userIdFromMetadata) {
    logStep("No email or user_id, cannot match user");
    return;
  }

  // Find user by email or metadata
  let userId = userIdFromMetadata;
  if (!userId && email) {
    // First check if we already have a subscription record with this customer
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("doctor_id")
      .eq("stripe_customer_id", customerId)
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      userId = existingSub.doctor_id;
    } else {
      // Fallback: search auth users by email with filter (avoids full table scan)
      const { data: users } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        filter: email,
      });
      const matchedUser = users?.users?.find((u: any) => u.email === email);
      if (matchedUser) userId = matchedUser.id;
    }
  }

  if (!userId) {
    logStep("User not found", { email });
    return;
  }

  // Find plan
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("id, tokens_per_period")
    .eq("tier", tier)
    .eq("is_active", true)
    .limit(1);

  const plan = plans?.[0];
  if (!plan) {
    logStep("Plan not found for tier", { tier });
    return;
  }

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const periodStart = new Date(subscription.current_period_start * 1000).toISOString();

  // Check for existing subscription record
  const { data: existing } = await supabase
    .from("user_subscriptions")
    .select("id, tokens_used, start_date")
    .eq("doctor_id", userId)
    .eq("stripe_subscription_id", subscription.id)
    .limit(1);

  if (existing && existing.length > 0) {
    // Detect period change: if the start_date from Stripe is newer, it's a new billing period
    const isNewPeriod = existing[0].start_date !== periodStart;
    const tokensUsed = isNewPeriod ? 0 : (existing[0].tokens_used || 0);

    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: isActive ? "active" : subscription.status,
        end_date: periodEnd,
        start_date: periodStart,
        plan_id: plan.id,
        tokens_remaining: isNewPeriod ? plan.tokens_per_period : Math.max(0, plan.tokens_per_period - tokensUsed),
        tokens_used: tokensUsed,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing[0].id);

    if (error) logStep("Error updating subscription", { error: error.message });
    else logStep("Subscription updated in DB", { userId, tier, isNewPeriod });
  } else {
    // Deactivate old subscriptions
    await supabase
      .from("user_subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("doctor_id", userId)
      .neq("status", "canceled");

    // Insert new
    const { error } = await supabase.from("user_subscriptions").insert({
      doctor_id: userId,
      plan_id: plan.id,
      status: isActive ? "active" : subscription.status,
      start_date: periodStart,
      end_date: periodEnd,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      tokens_remaining: plan.tokens_per_period,
      tokens_used: 0,
    });

    if (error) logStep("Error inserting subscription", { error: error.message });
    else logStep("New subscription created in DB", { userId, tier });
  }
}
