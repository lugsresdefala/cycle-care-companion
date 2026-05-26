import { Router, type IRouter } from "express";
import { db, userSubscriptions, subscriptionPlans } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

async function loadState(userId: string) {
  const rows = await db
    .select({
      sub: userSubscriptions,
      tier: subscriptionPlans.tier,
    })
    .from(userSubscriptions)
    .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(eq(userSubscriptions.doctorId, userId))
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1);
  if (!rows[0]) {
    return {
      subscribed: false,
      subscriptionTier: null,
      subscriptionEnd: null,
      tokensRemaining: 0,
      isTrial: false,
      trialEndsAt: null,
      status: null,
    };
  }
  const s = rows[0].sub;
  const now = new Date();
  const active = (s.status === "active" || s.status === "trial") && s.endDate > now;
  return {
    subscribed: active && s.status === "active",
    subscriptionTier: rows[0].tier ?? null,
    subscriptionEnd: s.endDate.toISOString(),
    tokensRemaining: s.tokensRemaining,
    isTrial: s.status === "trial" && (s.trialEndsAt ? s.trialEndsAt > now : false),
    trialEndsAt: s.trialEndsAt ? s.trialEndsAt.toISOString() : null,
    status: s.status,
  };
}

router.get("/subscription", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  res.json(await loadState(userId));
});

router.post("/subscription/refresh", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  res.json(await loadState(userId));
});

router.get("/tokens/remaining", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.doctorId, userId))
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1);
  res.json({ tokensRemaining: rows[0]?.tokensRemaining ?? 0 });
});

router.post("/tokens/use", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const now = new Date();
  // atomic decrement via SQL
  const updated = await db.execute(sql`
    UPDATE user_subscriptions
    SET tokens_remaining = tokens_remaining - 1,
        tokens_used = tokens_used + 1,
        updated_at = now()
    WHERE id = (
      SELECT id FROM user_subscriptions
      WHERE doctor_id = ${userId}
        AND (status = 'active' OR status = 'trial')
        AND end_date > ${now}
        AND tokens_remaining > 0
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE
    )
    RETURNING tokens_remaining
  `);
  // @ts-ignore
  const row = (updated.rows ?? updated)[0];
  if (!row) return res.json({ success: false, tokensRemaining: 0 });
  res.json({ success: true, tokensRemaining: Number(row.tokens_remaining) });
});

export default router;
