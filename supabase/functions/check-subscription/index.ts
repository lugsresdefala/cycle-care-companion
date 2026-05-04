import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const maskEmail = (email: string): string => {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);
  const masked = user.length <= 2 ? "**" : `${user[0]}***${user[user.length - 1]}`;
  return `${masked}@${domain}`;
};

// Map Stripe product IDs to internal tiers. Override per-environment with
// STRIPE_PRODUCT_TIER_MAP='{"prod_xxx":"basic",...}'.
const FALLBACK_PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_UBSjDxy12ggcNr": "basic",
  "prod_UBXuhebJkzJkWX": "professional",
  "prod_UBXvP745IUaxd3": "premium",
};

function loadProductTierMap(): Record<string, string> {
  const raw = Deno.env.get("STRIPE_PRODUCT_TIER_MAP");
  if (!raw) return FALLBACK_PRODUCT_TIER_MAP;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
  } catch (err) {
    logStep("Invalid STRIPE_PRODUCT_TIER_MAP, using fallback", { error: String(err) });
  }
  return FALLBACK_PRODUCT_TIER_MAP;
}

const PRODUCT_TIER_MAP = loadProductTierMap();

async function syncSubscription(
  supabaseAdmin: SupabaseClient,
  userId: string,
  sub: Stripe.Subscription,
  customerId: string,
  planId: string,
  tokensPerPeriod: number
): Promise<void> {
  const isActive = sub.status === "active" || sub.status === "trialing";
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
  const periodStart = new Date(sub.current_period_start * 1000).toISOString();

  // Fetch existing record to detect billing period changes and preserve tokens.
  const { data: existing } = await supabaseAdmin
    .from("user_subscriptions")
    .select("id, tokens_used, tokens_remaining, start_date")
    .eq("doctor_id", userId)
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (existing) {
    // Detect period change by comparing normalized timestamps. A changed
    // start_date means the billing period renewed — reset token counters so
    // the user gets their fresh allocation. Without this check, tokens would
    // stay depleted even after a successful renewal if this sync runs before
    // the invoice.payment_succeeded webhook has a chance to fire.
    const existingStart = existing.start_date ? new Date(existing.start_date).getTime() : 0;
    const newStart = new Date(periodStart).getTime();
    const isNewPeriod =
      Number.isFinite(existingStart) && Number.isFinite(newStart) && existingStart !== newStart;

    const tokensUsed = isNewPeriod ? 0 : (existing.tokens_used || 0);
    const tokensRemaining = isNewPeriod
      ? tokensPerPeriod
      : Math.max(0, tokensPerPeriod - tokensUsed);

    const { error } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        plan_id: planId,
        status: isActive ? "active" : sub.status,
        start_date: periodStart,
        end_date: periodEnd,
        stripe_customer_id: customerId,
        tokens_remaining: tokensRemaining,
        tokens_used: tokensUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) logStep("Error updating subscription", { error: error.message });
    else logStep("Subscription updated in DB", { userId, isNewPeriod });
  } else {
    // No record for this Stripe subscription ID. Cancel any stale rows from
    // previous subscriptions (plan changes, cancellations, etc.) and insert
    // a fresh record.
    await supabaseAdmin
      .from("user_subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("doctor_id", userId)
      .neq("status", "canceled");

    const { error } = await supabaseAdmin.from("user_subscriptions").insert({
      doctor_id: userId,
      plan_id: planId,
      status: isActive ? "active" : sub.status,
      start_date: periodStart,
      end_date: periodEnd,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      tokens_remaining: tokensPerPeriod,
      tokens_used: 0,
      updated_at: new Date().toISOString(),
    });

    if (error) logStep("Error inserting subscription", { error: error.message });
    else logStep("New subscription created in DB", { userId });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Separate clients: anon key for JWT verification, service role for DB writes.
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) throw new Error("Invalid authorization header");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData?.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: maskEmail(user.email) });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Fetch both active and trialing subscriptions from Stripe.
    const [activeSubs, trialingSubs] = await Promise.all([
      stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 }),
      stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 }),
    ]);

    const sub = activeSubs.data[0] || trialingSubs.data[0] || null;
    const hasActiveSub = sub !== null;
    let productId: string | null = null;
    let tier: string | null = null;
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      productId = sub.items.data[0].price.product as string;
      tier = PRODUCT_TIER_MAP[productId] || null;
      logStep("Active subscription", { productId, tier, end: subscriptionEnd });

      if (tier) {
        const { data: plans } = await supabaseAdmin
          .from("subscription_plans")
          .select("id, tokens_per_period")
          .eq("tier", tier)
          .eq("is_active", true)
          .limit(1);

        const plan = plans?.[0];
        if (plan) {
          await syncSubscription(
            supabaseAdmin,
            user.id,
            sub,
            customerId,
            plan.id,
            plan.tokens_per_period
          );
        } else {
          logStep("Plan not found for tier", { tier });
        }
      }
    } else {
      logStep("No active subscription");
    }

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        product_id: productId,
        tier,
        subscription_end: subscriptionEnd,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    const isAuthError =
      msg.includes("Auth error") ||
      msg.includes("not authenticated") ||
      msg.includes("authorization");
    return new Response(
      JSON.stringify({ error: isAuthError ? msg : "Erro ao verificar assinatura." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: isAuthError ? 401 : 500,
      }
    );
  }
});
