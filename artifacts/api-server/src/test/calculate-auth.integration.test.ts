import express from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createClerkFixture } from "./helpers/clerkFixture";

// Fail closed before importing the application DB module. The shell runner
// creates this private socket; no inherited DATABASE_URL is ever accepted.
const socket = process.env.CALCULATE_AUTH_ISOLATED_DB;
if (!socket?.startsWith("/tmp/idalia-auth-test.") ||
    !socket.endsWith("/socket") ||
    process.env.DATABASE_URL !== `postgresql://isolated_test@localhost/postgres?host=${socket}`) {
  throw new Error("Run pnpm test:calculate-auth to use a disposable PostgreSQL cluster");
}

const { db, pool, profiles, subscriptionPlans, userSubscriptions } = await import("@workspace/db");
const { default: calculateRouter } = await import("../routes/calculate");
const fixture = createClerkFixture();
const app = express();
app.use(express.json());
app.use(fixture.middleware);
app.use(calculateRouter);

const userId = "user_isolated_calculator";
const routes = [
  ["/calculate/biometry/crl", { crl: 60 }],
  ["/calculate/biometry/bpd", { bpd: 50 }],
  ["/calculate/biometry/composite", { bpd: 50 }],
  ["/calculate/efw", { hc: 200, ac: 180, fl: 35 }],
  ["/calculate/doppler/ua", { ga: 28, pi: 1 }],
  ["/calculate/doppler/mca", { ga: 28, pi: 1.8 }],
  ["/calculate/doppler/uta", { ga: 24, pi: 0.9 }],
  ["/calculate/doppler/cpr", { ga: 28, mcaPi: 1.8, uaPi: 1 }],
  ["/calculate/doppler/dv", { ga: 24, piv: 0.5, waveA: "positive" }],
  ["/calculate/growth-curve", { parameter: "ac", measurements: [{ ga: 28, value: 240 }] }],
  ["/calculate/trisomy-risk", {}],
  ["/calculate/preeclampsia-risk", {}],
] as const;

function post(path = "/calculate/biometry/crl", body: object = { crl: 60 }, token?: string) {
  const req = request(app).post(path).send(body);
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
}

async function seed(options: {
  tier?: "free_trial" | "basic" | "professional" | "premium";
  status?: string; tokens?: number; expired?: boolean; doctorId?: string;
} = {}) {
  const [plan] = await db.insert(subscriptionPlans).values({
    name: "Synthetic plan", tier: options.tier ?? "professional",
  }).returning();
  const [sub] = await db.insert(userSubscriptions).values({
    doctorId: options.doctorId ?? userId, planId: plan.id,
    status: options.status ?? "active", tokensRemaining: options.tokens ?? 5,
    endDate: new Date(Date.now() + (options.expired ? -86400000 : 86400000)),
  }).returning();
  return sub;
}

async function snapshot() {
  return {
    subscriptions: (await pool.query("SELECT * FROM user_subscriptions ORDER BY id")).rows,
    profiles: (await pool.query("SELECT * FROM profiles ORDER BY id")).rows,
  };
}

beforeAll(async () => {
  // Only the optional profile lookup is stubbed: real Clerk JWT verification,
  // getAuth, requireAuth, Drizzle and PostgreSQL all execute unchanged.
  const { clerkClient } = await import("@clerk/express");
  vi.spyOn(clerkClient.users, "getUser").mockResolvedValue({
    id: userId, emailAddresses: [], firstName: "Synthetic", lastName: "Test",
  } as never);
});

beforeEach(async () => {
  await pool.query("TRUNCATE user_subscriptions, subscription_plans, profiles");
  await db.insert(profiles).values({ id: userId, fullName: "Synthetic Test" });
});

afterAll(async () => {
  vi.restoreAllMocks();
  await pool.end();
});

describe("real Clerk authentication boundary", () => {
  it.each(["missing", "expired", "invalid-signature", "malformed"] as const)(
    "%s session returns 401 on every calculator and leaves SQL rows unchanged",
    async (kind) => {
      await seed();
      const before = await snapshot();
      const token = kind === "missing" ? undefined : kind === "malformed" ? "not-a-jwt" :
        fixture.token({ userId, expired: kind === "expired", invalidSignature: kind === "invalid-signature" });
      for (const [path, body] of routes) {
        const response = await post(path, body, token);
        expect(response.status, path).toBe(401);
        expect(response.body).toEqual({ error: "Unauthorized" });
      }
      expect(await snapshot()).toEqual(before);
    },
  );
});

describe("real PostgreSQL credit and plan boundary", () => {
  it.each(["free_trial", "basic", "professional", "premium"] as const)(
    "%s can run biometry, consuming exactly one credit",
    async (tier) => {
      await seed({ tier, status: tier === "free_trial" ? "trial" : "active" });
      const response = await post(undefined, undefined, fixture.token({ userId }));
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty("error");
      const [row] = (await snapshot()).subscriptions;
      expect(row.tokens_remaining).toBe(4);
      expect(row.tokens_used).toBe(1);
    },
  );

  it.each(["free_trial", "basic", "professional", "premium"] as const)(
    "%s respects the clinical tier gate",
    async (tier) => {
      await seed({ tier, status: tier === "free_trial" ? "trial" : "active" });
      const allowed = tier === "professional" || tier === "premium";
      const response = await post("/calculate/efw", { hc: 200, ac: 180, fl: 35 }, fixture.token({ userId }));
      expect(response.status).toBe(allowed ? 200 : 402);
      const [row] = (await snapshot()).subscriptions;
      expect(row.tokens_remaining).toBe(allowed ? 4 : 5);
      expect(row.tokens_used).toBe(allowed ? 1 : 0);
    },
  );

  it.each([
    { tokens: 0 }, { expired: true }, { status: "cancelled" },
    { status: "past_due" }, { doctorId: "user_other_synthetic" },
  ])("ineligible subscription %j returns 402 without writes", async (options) => {
    await seed(options);
    const before = await snapshot();
    const response = await post(undefined, undefined, fixture.token({ userId }));
    expect(response.status).toBe(402);
    expect(await snapshot()).toEqual(before);
  });

  it("does not bootstrap a subscription for an authenticated new user", async () => {
    const before = await snapshot();
    expect((await post(undefined, undefined, fixture.token({ userId: "user_new_synthetic" }))).status).toBe(402);
    expect(await snapshot()).toEqual(before);
  });

  it("rejects invalid calculation inputs without charging", async () => {
    await seed();
    const before = await snapshot();
    expect((await post(undefined, { crl: "invalid" }, fixture.token({ userId }))).status).toBe(400);
    expect(await snapshot()).toEqual(before);
  });

  it.each([1, 3])("concurrent requests with %i credits never produce negative balances", async (tokens) => {
    const sub = await seed({ tokens });
    const lock = await pool.connect();
    let responses: Promise<request.Response[]> | undefined;
    try {
      await lock.query("BEGIN");
      await lock.query("SELECT id FROM user_subscriptions WHERE id = $1 FOR UPDATE", [sub.id]);
      // Hold the row until all six separate connections are attempting the
      // actual UPDATE. This proves contention, not just sequential HTTP calls.
      responses = Promise.all(Array.from({ length: 6 }, () =>
        post(undefined, undefined, fixture.token({ userId })).then((response) => response)));
      await vi.waitFor(async () => {
        // PostgreSQL caches statistics inside a transaction; refresh before
        // observing connections that began waiting after our first poll.
        await lock.query("SELECT pg_stat_clear_snapshot()");
        const result = await lock.query(
          "SELECT count(*)::int AS n FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND query LIKE '%UPDATE user_subscriptions%'",
        );
        expect(result.rows[0].n).toBe(6);
      }, { timeout: 10000, interval: 20 });
      await lock.query("COMMIT");
      const statuses = (await responses).map((response) => response.status);
      expect(statuses.filter((status) => status === 200)).toHaveLength(tokens);
      expect(statuses.filter((status) => status === 402)).toHaveLength(6 - tokens);
      const [row] = (await snapshot()).subscriptions;
      expect(row.tokens_remaining).toBe(0);
      expect(row.tokens_used).toBe(tokens);
    } finally {
      await lock.query("ROLLBACK");
      lock.release();
      await responses;
    }
  });
});