// @ts-ignore
import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, profiles, userRoles } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

export interface AuthedRequest extends Request {
  userId: string;
  userEmail?: string;
}

async function ensureProfileAndTrial(userId: string, email: string, fullName: string) {
  const existing = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(profiles).values({ id: userId, fullName: fullName || "", email });
  } else if (email && existing[0].email !== email) {
    await db.update(profiles).set({ email }).where(eq(profiles.id, userId));
  }

  // Provision the free trial INDEPENDENTLY of profile creation so a partial
  // failure (profile inserted but trial insert failed on an earlier call) heals
  // on the next bootstrap instead of permanently stranding the account.
  //
  // This is a single atomic statement that combines two guards:
  //   1. Eligibility: the INSERT ... SELECT only fires when NOT EXISTS returns
  //      no rows — i.e. the user has zero subscription rows of any kind (trial
  //      OR paid). This prevents paid users from receiving a new trial row via
  //      bootstrap-protected routes (/stripe/checkout, /stripe/portal).
  //   2. Concurrency: ON CONFLICT DO NOTHING silently discards any concurrent
  //      insert that races past the NOT EXISTS check and then hits the partial
  //      unique index (doctor_id WHERE stripe_subscription_id = '').
  // Together these two guards make the operation fully safe under parallel
  // requests without any application-level locking.
  const now = new Date();
  const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  await db.execute(sql`
    INSERT INTO user_subscriptions
      (doctor_id, plan_id, status, start_date, end_date, trial_ends_at, tokens_remaining)
    SELECT
      ${userId},
      sp.id,
      'trial',
      ${now},
      ${end},
      ${end},
      sp.tokens_per_period
    FROM subscription_plans sp
    WHERE sp.tier = 'free_trial'
      AND NOT EXISTS (
        SELECT 1 FROM user_subscriptions WHERE doctor_id = ${userId}
      )
    ON CONFLICT DO NOTHING
  `);
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
