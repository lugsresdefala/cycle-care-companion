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

async function resolveClerkUser(userId: string): Promise<{ email: string; fullName: string }> {
  try {
    // @ts-ignore
    const u: any = await clerkClient.users.getUser(userId);
    const email: string = u?.primaryEmailAddress?.emailAddress ?? u?.emailAddresses?.[0]?.emailAddress ?? "";
    const fullName: string = [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.username || "";
    return { email, fullName };
  } catch {
    return { email: "", fullName: "" };
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
    const { email } = await resolveClerkUser(userId);
    (req as AuthedRequest).userId = userId;
    (req as AuthedRequest).userEmail = email;
    // Keep email in sync if the profile already exists, but do NOT create a
    // profile or start a trial here — that is an intentional write and must
    // only happen through explicit onboarding routes (see requireBootstrap).
    const existing = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    if (existing.length > 0 && email && existing[0].email !== email) {
      await db.update(profiles).set({ email }).where(eq(profiles.id, userId));
    }
    next();
  } catch (e) {
    req.log?.error({ err: e }, "auth error");
    res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * requireBootstrap must be used (instead of requireAuth) on routes that
 * represent an intentional, user-initiated action where it is acceptable to
 * create the local profile and start the free trial if they don't exist yet.
 *
 * Do NOT attach this middleware to GET (read-only) endpoints — bootstrap is a
 * state-changing write and must never be triggered by a safe/idempotent request.
 */
export async function requireBootstrap(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    // @ts-ignore
    const auth = getAuth(req);
    // @ts-ignore
    const userIdRaw: any = auth?.sessionClaims?.userId || auth?.userId;
    if (!userIdRaw) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId: string = String(userIdRaw);
    const { email, fullName } = await resolveClerkUser(userId);
    (req as AuthedRequest).userId = userId;
    (req as AuthedRequest).userEmail = email;
    await ensureProfileAndTrial(userId, email, fullName);
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
