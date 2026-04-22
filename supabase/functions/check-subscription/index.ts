import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Map Stripe product IDs to internal tiers
const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_UBSjDxy12ggcNr": "basic",       // Pessoal
  "prod_UBXuhebJkzJkWX": "professional", // Clínico
  "prod_UBXvP745IUaxd3": "premium",      // Clínico Premium
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
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
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData?.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

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

    // Fetch both active and trialing subscriptions from Stripe
    const [activeSubs, trialingSubs] = await Promise.all([
      stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 }),
      stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 }),
    ]);

    const sub = activeSubs.data[0] || trialingSubs.data[0] || null;
    const hasActiveSub = sub !== null;
    let productId = null;
    let tier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      const periodStart = new Date(sub.current_period_start * 1000).toISOString();
      productId = sub.items.data[0].price.product as string;
      tier = PRODUCT_TIER_MAP[productId] || null;
      logStep("Active subscription", { productId, tier, end: subscriptionEnd });

      // Sync subscription status to local DB
      if (tier) {
        const { data: plans } = await supabaseClient
          .from("subscription_plans")
          .select("id, tokens_per_period")
          .eq("tier", tier)
          .eq("is_active", true)
          .limit(1);

        const plan = plans?.[0];
        if (plan) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          const { error: upsertError } = await supabaseClient
            .from("user_subscriptions")
            .upsert(
              {
                doctor_id: user.id,
                plan_id: plan.id,
                status: isActive ? "active" : sub.status,
                start_date: periodStart,
                end_date: subscriptionEnd,
                stripe_subscription_id: sub.id,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "doctor_id,stripe_subscription_id" }
            );

          if (upsertError) logStep("Error syncing subscription to DB", { error: upsertError.message });
          else logStep("Subscription synced to DB", { userId: user.id, tier });
        }
      }
    } else {
      logStep("No active subscription");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      tier,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    const isAuthError = msg.includes("Auth error") || msg.includes("not authenticated") || msg.includes("authorization");
    return new Response(JSON.stringify({ error: isAuthError ? msg : "Erro ao verificar assinatura." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: isAuthError ? 401 : 500,
    });
  }
});
