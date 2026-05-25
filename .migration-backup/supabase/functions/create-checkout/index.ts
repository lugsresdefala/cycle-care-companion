import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Mask the local-part of an email for log output — keeps logs useful for
// debugging without storing raw PII.
const maskEmail = (email: string): string => {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);
  const masked = user.length <= 2 ? "**" : `${user[0]}***${user[user.length - 1]}`;
  return `${masked}@${domain}`;
};

const DEFAULT_ORIGIN = Deno.env.get("STRIPE_DEFAULT_ORIGIN") ?? "https://idalia.lovable.app";

function resolveAllowedOrigins(): string[] {
  const raw = Deno.env.get("STRIPE_ALLOWED_ORIGINS");
  if (raw && raw.trim()) {
    return raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  // Dev-only fallback. Production MUST set STRIPE_ALLOWED_ORIGINS.
  return [
    DEFAULT_ORIGIN,
    "http://localhost:5173",
    "http://localhost:8080",
  ];
}

const ALLOWED_ORIGINS = resolveAllowedOrigins();

function resolveOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  return origin && ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN;
}

// Rolling-window per-user cap on checkout creation. Tunable via env.
const RATE_LIMIT_WINDOW_SECONDS = Number(Deno.env.get("CHECKOUT_RATE_WINDOW_SECONDS") ?? "600");
const RATE_LIMIT_MAX_ATTEMPTS = Number(Deno.env.get("CHECKOUT_RATE_MAX_ATTEMPTS") ?? "5");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Service-role client is needed for the rate-limit table (no client RLS access).
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) throw new Error("Invalid authorization header");
    const { data, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: maskEmail(user.email) });

    const { priceId } = await req.json();
    if (!priceId || typeof priceId !== "string") throw new Error("priceId is required");
    logStep("Price ID received", { priceId });

    // Allowlist the priceId against our own subscription_plans table so a
    // client cannot start a checkout for an arbitrary Stripe price (e.g. a
    // one-cent test price or a competitor's product). Service role bypasses
    // RLS, which is needed here because the plans table has public SELECT
    // gated on is_active and we want the same gate.
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, tier, is_active")
      .eq("stripe_price_id", priceId)
      .eq("is_active", true)
      .maybeSingle();

    if (planErr) {
      logStep("Plan lookup failed", { error: planErr.message });
      return new Response(
        JSON.stringify({ error: "Erro ao validar plano." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!plan || plan.tier === "free_trial") {
      logStep("Unknown or non-purchasable priceId rejected", { priceId });
      return new Response(
        JSON.stringify({ error: "Plano inválido." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Rate limit: count recent attempts and reject if over cap. We still
    // record the rejected attempt so the window enforces a true lock-out.
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    const { count: recentAttempts, error: rateErr } = await supabaseAdmin
      .from("stripe_checkout_attempts")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .gte("created_at", windowStart);
    if (rateErr) logStep("Rate-limit lookup failed (open)", { error: rateErr.message });

    if ((recentAttempts ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
      logStep("Rate limit exceeded", { userId: user.id, recentAttempts });
      return new Response(
        JSON.stringify({ error: "Muitas tentativas de pagamento. Aguarde alguns minutos e tente novamente." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Customer lookup", { customerId: customerId || "new" });

    const origin = resolveOrigin(req);

    // Session expires in 30 minutes to avoid stale checkouts
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

    // Idempotency key prevents duplicate Stripe sessions if the frontend
    // retries the request or two tabs submit simultaneously. The 60-second
    // bucket means rapid double-clicks collapse to one session.
    const idempotencyBucket = Math.floor(Date.now() / 60000);
    const idempotencyKey = `checkout:${user.id}:${priceId}:${idempotencyBucket}`;

    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?checkout=canceled&session_id={CHECKOUT_SESSION_ID}`,
        expires_at: expiresAt,
        metadata: { user_id: user.id },
      },
      { idempotencyKey }
    );

    logStep("Checkout session created", { sessionId: session.id });

    // Record the attempt for rate limiting. Failures here are non-fatal.
    const { error: attemptErr } = await supabaseAdmin.from("stripe_checkout_attempts").insert({
      doctor_id: user.id,
      price_id: priceId,
      session_id: session.id,
    });
    if (attemptErr) logStep("Failed to record checkout attempt", { error: attemptErr.message });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    // Return generic message to client; details are logged server-side
    const isAuthError = msg.includes("not authenticated") || msg.includes("priceId") || msg.includes("authorization") || msg.includes("Auth error");
    return new Response(JSON.stringify({ error: isAuthError ? msg : "Erro ao criar sessão de pagamento." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: isAuthError ? 400 : 500,
    });
  }
});
