// @ts-ignore
import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, profiles, userSubscriptions, subscriptionPlans, userRoles } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export interface AuthedRequest extends Request {
  userId: string;
  userEmail?: string;
}

async function ensureProfileAndTrial(userId: string, email: string, fullName: string) {
  const existing = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(profiles).values({ id: userId, fullName: fullName || "", email });
    // create free trial subscription
    const trialPlan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.tier, "free_trial"))
      .limit(1);
    if (trialPlan.length > 0) {
      const now = new Date();
      const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      await db.insert(userSubscriptions).values({
        // @ts-ignore
        doctorId: userId,
        planId: trialPlan[0].id,
        status: "trial",
        startDate: now,
        endDate: end,
        trialEndsAt: end,
        tokensRemaining: 3,
      });
    }
  } else if (email && existing[0].email !== email) {
    await db.update(profiles).set({ email }).where(eq(profiles.id, userId));
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    // @ts-ignore
    const auth = getAuth(req);
    // @ts-ignore
    const userIdRaw: any = auth?.sessionClaims?.userId || auth?.userId;
    if (!userIdRaw) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId: string = String(userIdRaw);
    let email: string = "";
    let fullName: string = "";
    try {
      // @ts-ignore
      const u: any = await clerkClient.users.getUser(userId);
      const e: any = u?.primaryEmailAddress?.emailAddress ?? u?.emailAddresses?.[0]?.emailAddress ?? "";
      const f: any = [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.username || "";
      email = e as string;
      fullName = f as string;
    } catch {}
    const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
    if (!safeMethods.has(req.method)) {
      await ensureProfileAndTrial(userId, email, fullName);
    }
    (req as AuthedRequest).userId = userId;
    (req as AuthedRequest).userEmail = email;
    next();
  } catch (e) {
    req.log?.error({ err: e }, "auth error");
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, "admin")))
    .limit(1);
  return rows.length > 0;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<any> {
  const userId = (req as AuthedRequest).userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!(await isAdmin(userId))) return res.status(403).json({ error: "Forbidden" });
  next();
}
