import { Router, type IRouter } from "express";
// @ts-ignore
import { clerkClient } from "@clerk/express";
import {
  db,
  profiles,
  userSubscriptions,
  subscriptionPlans,
  userRoles,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res): Promise<any> => {
  const profileRows = await db.select().from(profiles);
  const subs = await db
    .select({
      doctorId: userSubscriptions.doctorId,
      status: userSubscriptions.status,
      tokensRemaining: userSubscriptions.tokensRemaining,
      endDate: userSubscriptions.endDate,
      tier: subscriptionPlans.tier,
      createdAt: userSubscriptions.createdAt,
    })
    .from(userSubscriptions)
    .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .orderBy(desc(userSubscriptions.createdAt));
  const adminRows = await db.select().from(userRoles).where(eq(userRoles.role, "admin"));
  const adminIds = new Set(adminRows.map((r) => r.userId));
  const subByUser = new Map<string, any>();
  for (const s of subs) {
    if (!subByUser.has(s.doctorId)) subByUser.set(s.doctorId, s);
  }
  res.json(
    profileRows.map((p) => {
      const s = subByUser.get(p.id);
      return {
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        crmNumber: p.crmNumber,
        isAdmin: adminIds.has(p.id),
        subscription: s
          ? {
              tier: s.tier ?? null,
              status: s.status,
              tokensRemaining: s.tokensRemaining,
              endDate: s.endDate?.toISOString?.() ?? null,
            }
          : null,
      };
    }),
  );
});

router.post("/admin/grant-tokens", requireAuth, requireAdmin, async (req, res): Promise<any> => {
  const { userId, amount } = req.body || {};
  if (!userId || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "userId and positive amount required" });
  }
  const updated = await db.execute(sql`
    UPDATE user_subscriptions
    SET tokens_remaining = tokens_remaining + ${amount},
        updated_at = now()
    WHERE id = (
      SELECT id FROM user_subscriptions
      WHERE doctor_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    )
    RETURNING id
  `);
  // @ts-ignore
  const ok = ((updated.rows ?? updated) as any[]).length > 0;
  if (!ok) return res.status(404).json({ error: "User has no subscription" });
  res.json({ ok: true });
});

export default router;
