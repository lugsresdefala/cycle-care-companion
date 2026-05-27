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
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { stripe, resolveOrigin, PRODUCT_TIER_MAP } from "../lib/stripe";

const router: IRouter = Router();

router.post("/stripe/checkout", requireAuth, async (req, res): Promise<any> => {
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

    if (!customerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = resolveOrigin(req);
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
    const bucket = Math.floor(Date.now() / 60000);
    const idempotencyKey = `checkout:${userId}:${priceId}:${bucket}`;

    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        customer_email: customerId ? undefined : email,
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

router.post("/stripe/portal", requireAuth, async (req, res): Promise<any> => {
  try {
    const userId = (req as AuthedRequest).userId;
    const email = (req as AuthedRequest).userEmail;
    const subs = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.doctorId, userId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    let customerId = subs[0]?.stripeCustomerId || undefined;
    if (!customerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }
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
        if (userId && subId) {
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
          if (userId) await syncSubscription(userId, subId, sub, true);
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
  const bySub = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubId))
    .limit(1);
  if (bySub[0]) return bySub[0].doctorId;
  if (stripeCustomerId) {
    const byCust = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    if (byCust[0]) return byCust[0].doctorId;
    const attempt = await db
      .select()
      .from(stripeCheckoutAttempts)
      .orderBy(desc(stripeCheckoutAttempts.createdAt))
      .limit(50);
    // fallback: most recent checkout attempt — best-effort
    if (attempt[0]) return attempt[0].doctorId;
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

  if (existing[0]) {
    const updateFields: Record<string, unknown> = {
      planId: plan[0].id,
      status,
      endDate,
      stripeCustomerId: sub.customer as string,
      updatedAt: new Date(),
    };
    if (resetTokens) {
      updateFields.tokensRemaining = plan[0].tokensPerPeriod;
    }
    await db
      .update(userSubscriptions)
      .set(updateFields)
      .where(eq(userSubscriptions.id, existing[0].id));
  } else {
    await db.insert(userSubscriptions).values({
      doctorId: userId,
      planId: plan[0].id,
      status,
      startDate: new Date(),
      endDate,
      tokensRemaining: plan[0].tokensPerPeriod,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: stripeSubId,
    });
  }
}

export default router;
