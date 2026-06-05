import { Router, type IRouter, type Request, type Response } from "express";
// @ts-ignore
import type Stripe from "stripe";
import {
  db,
  userSubscriptions,
  subscriptionPlans,
  stripeWebhookEvents,
  stripeCheckoutAttempts,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireBootstrap, type AuthedRequest } from "../lib/auth";
import { stripe, resolveOrigin, PRODUCT_TIER_MAP } from "../lib/stripe";

const router: IRouter = Router();

router.post("/stripe/checkout", requireBootstrap, async (req, res): Promise<any> => {
  try {
    const userId = (req as AuthedRequest).userId;
    const email = (req as AuthedRequest).userEmail;
    const { priceId } = req.body || {};
    if (!priceId) return res.status(400).json({ error: "priceId required" });

    // verify it's a known plan
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.stripePriceId, priceId))
      .limit(1);
    if (!plan[0]) return res.status(400).json({ error: "Unknown priceId" });

    // get existing customer id if any
    const existing = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.doctorId, userId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    let customerId = existing[0]?.stripeCustomerId || undefined;

    // If no locally-bound Stripe customer exists, create one explicitly.
    // We must NOT pass customer_email without customer — Stripe may reuse an
    // existing customer record that shares this email address (email recycling,
    // shared clinic inboxes) and would bind a different account's billing to
    // this user. Explicit creation guarantees a fresh, user-scoped customer.
    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { user_id: userId },
      });
      customerId = newCustomer.id;
    }

    const origin = resolveOrigin(req);
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
    const bucket = Math.floor(Date.now() / 60000);
    const idempotencyKey = `checkout:${userId}:${priceId}:${bucket}`;

    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?checkout=canceled&session_id={CHECKOUT_SESSION_ID}`,
        expires_at: expiresAt,
        metadata: { user_id: userId },
        subscription_data: { metadata: { user_id: userId } },
      },
      { idempotencyKey },
    );

    await db.insert(stripeCheckoutAttempts).values({
      doctorId: userId,
      priceId,
      sessionId: session.id,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    req.log?.error({ err: e }, "checkout error");
    res.status(500).json({ error: e?.message || "Checkout failed" });
  }
});

router.post("/stripe/portal", requireBootstrap, async (req, res): Promise<any> => {
  try {
    const userId = (req as AuthedRequest).userId;
    const subs = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.doctorId, userId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    let customerId = subs[0]?.stripeCustomerId || undefined;
    if (!customerId) {
      return res.status(404).json({
        error: "no_customer",
        message: "Você ainda não possui uma assinatura ativa no Stripe.",
      });
    }
    const origin = resolveOrigin(req);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });
    res.json({ url: portal.url });
  } catch (e: any) {
    req.log?.error({ err: e }, "portal error");
    res.status(500).json({ error: e?.message || "Portal failed" });
  }
});

router.get("/stripe/checkout-status", requireAuth, async (req, res): Promise<any> => {
  try {
    const userId = (req as AuthedRequest).userId;
    const sessionId = req.query.session_id as string;
    if (!sessionId) return res.status(400).json({ error: "session_id required" });

    const attempt = await db
      .select()
      .from(stripeCheckoutAttempts)
      .where(
        and(
          eq(stripeCheckoutAttempts.sessionId, sessionId),
          eq(stripeCheckoutAttempts.doctorId, userId),
        ),
      )
      .limit(1);
    if (!attempt[0]) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({
      status: session.status || "unknown",
      paymentStatus: session.payment_status || null,
      subscriptionId: (session.subscription as string) || null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Status check failed" });
  }
});

// Webhook handler. Must be mounted with express.raw at the app level.
export async function stripeWebhookHandler(req: Request, res: Response): Promise<any> {
  const signature = req.headers["stripe-signature"] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "Webhook not configured" });
  if (!signature) return res.status(400).json({ error: "Missing signature" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, signature, secret);
  } catch (e: any) {
    return res.status(400).json({ error: `Invalid signature: ${e?.message}` });
  }

  // idempotency
  try {
    await db.insert(stripeWebhookEvents).values({
      eventId: event.id,
      eventType: event.type,
      payloadCreatedAt: new Date(event.created * 1000),
    });
  } catch {
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id as string) || "";
        const subId = session.subscription as string;
        const sessionCustomerId = session.customer as string;
        if (userId && subId) {
          // Guard: verify the Stripe customer returned by this checkout is not
          // already bound to a *different* local user. Fetch ALL rows for this
          // customer (no limit) to catch legacy duplicates before the unique
          // constraint was enforced. Any foreign-owner row aborts the sync.
          if (sessionCustomerId) {
            const customerRows = await db
              .select()
              .from(userSubscriptions)
              .where(eq(userSubscriptions.stripeCustomerId, sessionCustomerId));
            const foreignOwner = customerRows.find((r) => r.doctorId !== userId);
            if (foreignOwner) {
              req.log?.error(
                { userId, sessionCustomerId, existingOwnerId: foreignOwner.doctorId },
                "SECURITY: checkout.session.completed customer already owned by different user — aborting sync",
              );
              break;
            }
          }
          await syncSubscription(userId, subId, undefined, true);
        }
        break;
      }
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          (sub.metadata?.user_id as string) ||
          (await lookupUserIdBySub(sub.id, sub.customer as string));
        if (userId) await syncSubscription(userId, sub.id, sub, true);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          (sub.metadata?.user_id as string) ||
          (await lookupUserIdBySub(sub.id, sub.customer as string));
        if (userId) await syncSubscription(userId, sub.id, sub, false);
        break;
      }
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        // @ts-ignore
        const subId = (inv.subscription as string) || "";
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId =
            (sub.metadata?.user_id as string) ||
            (await lookupUserIdBySub(subId, sub.customer as string));
          // Only replenish tokens on genuine billing-cycle renewals, not on
          // subscription updates, upgrades, or other invoice triggers.
          // @ts-ignore
          const isRenewal = (inv.billing_reason as string) === "subscription_cycle";
          if (userId) await syncSubscription(userId, subId, sub, isRenewal);
        }
        break;
      }
    }
  } catch (e: any) {
    req.log?.error({ err: e }, "webhook handler error");
  }

  res.json({ received: true });
}

async function lookupUserIdBySub(
  stripeSubId: string,
  stripeCustomerId?: string,
): Promise<string> {
  // Primary: look up by subscription ID — most specific binding.
  const bySub = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubId))
    .limit(1);
  if (bySub[0]) return bySub[0].doctorId;

  // Customer-ID fallback: only trust this when ALL matching rows resolve to the
  // same owner. Multiple rows (legacy data before the unique constraint) are
  // ambiguous — we fail closed rather than guess.
  if (stripeCustomerId) {
    const byCust = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId));
    const ownerIds = new Set(byCust.map((r) => r.doctorId));
    if (ownerIds.size === 1) return byCust[0].doctorId;
    if (ownerIds.size > 1) {
      console.error(
        `SECURITY: lookupUserIdBySub found ${ownerIds.size} distinct owners for stripeCustomerId ${stripeCustomerId} — failing closed`,
      );
    }
  }
  return "";
}

async function syncSubscription(
  userId: string,
  stripeSubId: string,
  preloaded?: Stripe.Subscription,
  resetTokens: boolean = false,
) {
  const sub = preloaded || (await stripe.subscriptions.retrieve(stripeSubId));
  const incomingCustomerId = sub.customer as string;
  const productId = sub.items.data[0]?.price.product as string;
  const tier = PRODUCT_TIER_MAP[productId] || "basic";

  const plan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.tier, tier as any))
    .limit(1);
  if (!plan[0]) return;

  // @ts-ignore
  const endDate = new Date((sub.current_period_end || Math.floor(Date.now() / 1000) + 30 * 86400) * 1000);
  const isActive = sub.status === "active" || sub.status === "trialing";
  const status = isActive ? "active" : sub.status;

  const existing = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.doctorId, userId),
        eq(userSubscriptions.stripeSubscriptionId, stripeSubId),
      ),
    )
    .limit(1);

  // Shared guard: verify the incoming stripeCustomerId is not owned by a
  // different user. Fetch ALL rows for this customer (no limit) to catch
  // legacy duplicates that existed before the unique constraint was enforced.
  // Any row belonging to a different user is grounds for rejection.
  if (incomingCustomerId) {
    const customerRows = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, incomingCustomerId));
    const foreignOwner = customerRows.find((r) => r.doctorId !== userId);
    if (foreignOwner) {
      console.error(
        `SECURITY: syncSubscription blocked — stripeCustomerId ${incomingCustomerId} is bound to user ${foreignOwner.doctorId}, refusing operation for ${userId}`,
      );
      return;
    }
  }

  if (existing[0]) {
    const fields: Record<string, unknown> = {
      planId: plan[0].id,
      status,
      endDate,
      stripeCustomerId: incomingCustomerId,
      updatedAt: new Date(),
    };
    if (resetTokens) {
      fields.tokensRemaining = plan[0].tokensPerPeriod;
    }
    await db
      .update(userSubscriptions)
      .set(fields)
      .where(eq(userSubscriptions.id, existing[0].id));
  } else {
    await db.insert(userSubscriptions).values({
      doctorId: userId,
      planId: plan[0].id,
      status,
      startDate: new Date(),
      endDate,
      tokensRemaining: plan[0].tokensPerPeriod,
      stripeCustomerId: incomingCustomerId,
      stripeSubscriptionId: stripeSubId,
    });
  }
}

export default router;
