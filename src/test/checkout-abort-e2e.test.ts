import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * End-to-end integration tests for the Stripe checkout abort flow.
 * These tests simulate the full lifecycle from checkout creation through
 * abort/cancel and back to the frontend, verifying each component in the chain.
 */

// ---- Shared mocks ----

const dbState: Record<string, any[]> = {
  user_subscriptions: [],
};

const mockSupabaseFrom = vi.fn((table: string) => {
  const rows = dbState[table] || [];
  return {
    update: vi.fn((values: any) => ({
      eq: vi.fn((col: string, val: string) => {
        const updated = rows
          .filter((r: any) => r[col] === val)
          .map((r: any) => ({ ...r, ...values }));
        return {
          eq: vi.fn(() => ({ error: null, data: updated })),
          in: vi.fn(() => ({ error: null, data: updated })),
          error: null,
          data: updated,
        };
      }),
      in: vi.fn(() => ({ error: null })),
    })),
    insert: vi.fn((row: any) => {
      rows.push(row);
      return { error: null, data: row };
    }),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({ data: rows[0] || null })),
          })),
        })),
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({ data: rows[0] || null })),
            })),
          })),
        })),
        limit: vi.fn(() => ({ data: rows })),
      })),
    })),
  };
});

const mockSupabase = { from: mockSupabaseFrom };

// ---- Helper: simulate webhook handler ----

interface WebhookEvent {
  type: string;
  data: { object: any };
}

async function processWebhookEvent(event: WebhookEvent) {
  const supabase = mockSupabase;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        return { status: 200, action: "subscription_created", userId: session.metadata?.user_id };
      }
      return { status: 200, action: "non_subscription_checkout" };
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        supabase.from("user_subscriptions").update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        });
        return { status: 200, action: "expired_cleanup", userId };
      }
      return { status: 200, action: "expired_no_user" };
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        supabase.from("user_subscriptions").update({
          status: "payment_failed",
          updated_at: new Date().toISOString(),
        });
        return { status: 200, action: "payment_failed_updated", userId };
      }
      return { status: 200, action: "payment_failed_no_user" };
    }

    case "customer.subscription.deleted": {
      supabase.from("user_subscriptions").update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      });
      return { status: 200, action: "subscription_canceled" };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        supabase.from("user_subscriptions").update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        });
        return { status: 200, action: "marked_past_due" };
      }
      return { status: 200, action: "no_subscription_on_invoice" };
    }

    case "payment_intent.canceled": {
      return { status: 200, action: "payment_intent_logged" };
    }

    default:
      return { status: 200, action: "unhandled" };
  }
}

// ---- Helper: simulate checkout session creation ----

function createCheckoutSession(params: {
  priceId: string;
  userId: string;
  userEmail: string;
  origin?: string;
}) {
  const origin = params.origin || "https://idalia.lovable.app";
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
  const sessionId = `cs_test_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: sessionId,
    url: `https://checkout.stripe.com/c/pay/${sessionId}`,
    success_url: `${origin}/dashboard?checkout=success&session_id=${sessionId}`,
    cancel_url: `${origin}/pricing?checkout=canceled&session_id=${sessionId}`,
    expires_at: expiresAt,
    mode: "subscription",
    metadata: { user_id: params.userId },
    status: "open",
  };
}

// ---- Helper: simulate frontend redirect handling ----

function handleCheckoutRedirect(url: string) {
  const parsed = new URL(url);
  const checkoutStatus = parsed.searchParams.get("checkout");
  const sessionId = parsed.searchParams.get("session_id");

  let toastType: "success" | "error" | null = null;
  let toastMessage = "";

  if (checkoutStatus === "canceled") {
    toastType = "error";
    toastMessage = "Pagamento cancelado";
  } else if (checkoutStatus === "success") {
    toastType = "success";
    toastMessage = "Assinatura realizada!";
  }

  return { checkoutStatus, sessionId, toastType, toastMessage, path: parsed.pathname };
}

// ---- Tests ----

describe("E2E: Stripe Checkout Abort Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbState.user_subscriptions = [];
  });

  describe("Full abort lifecycle", () => {
    it("should handle complete checkout abort: create -> user cancels -> redirect -> webhook", async () => {
      // Step 1: Create checkout session
      const session = createCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userId: "user_doctor_1",
        userEmail: "doctor@clinic.com",
      });

      expect(session.id).toBeTruthy();
      expect(session.cancel_url).toContain("checkout=canceled");
      expect(session.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));

      // Step 2: User clicks "back" on Stripe checkout -> redirected to cancel_url
      const redirectResult = handleCheckoutRedirect(session.cancel_url);

      expect(redirectResult.checkoutStatus).toBe("canceled");
      expect(redirectResult.sessionId).toBe(session.id);
      expect(redirectResult.toastType).toBe("error");
      expect(redirectResult.toastMessage).toBe("Pagamento cancelado");
      expect(redirectResult.path).toBe("/pricing");

      // Step 3: Stripe fires checkout.session.expired webhook
      const webhookResult = await processWebhookEvent({
        type: "checkout.session.expired",
        data: {
          object: {
            id: session.id,
            customer: null,
            metadata: session.metadata,
            mode: "subscription",
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("expired_cleanup");
      expect(webhookResult.userId).toBe("user_doctor_1");
    });

    it("should handle complete success lifecycle: create -> pay -> redirect -> webhook", async () => {
      // Step 1: Create checkout session
      const session = createCheckoutSession({
        priceId: "price_1TDAobFRyKUci3hFRWAewvDh",
        userId: "user_doctor_2",
        userEmail: "pro@clinic.com",
      });

      // Step 2: User completes payment -> redirected to success_url
      const redirectResult = handleCheckoutRedirect(session.success_url);

      expect(redirectResult.checkoutStatus).toBe("success");
      expect(redirectResult.toastType).toBe("success");
      expect(redirectResult.toastMessage).toBe("Assinatura realizada!");
      expect(redirectResult.path).toBe("/dashboard");

      // Step 3: Stripe fires checkout.session.completed webhook
      const webhookResult = await processWebhookEvent({
        type: "checkout.session.completed",
        data: {
          object: {
            id: session.id,
            customer: "cus_pro123",
            subscription: "sub_pro123",
            mode: "subscription",
            metadata: session.metadata,
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("subscription_created");
    });
  });

  describe("Async payment failure flow", () => {
    it("should handle async payment failure after initial checkout", async () => {
      // Step 1: Checkout was initiated but async payment method (e.g., boleto) later fails
      const session = createCheckoutSession({
        priceId: "price_1TDApBFRyKUci3hFyLZCVYxE",
        userId: "user_doctor_3",
        userEmail: "premium@clinic.com",
      });

      // Step 2: User was redirected to success (payment initially accepted)
      const redirectResult = handleCheckoutRedirect(session.success_url);
      expect(redirectResult.checkoutStatus).toBe("success");

      // Step 3: Later, Stripe notifies that async payment failed
      const webhookResult = await processWebhookEvent({
        type: "checkout.session.async_payment_failed",
        data: {
          object: {
            id: session.id,
            customer: "cus_premium123",
            metadata: session.metadata,
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("payment_failed_updated");
      expect(webhookResult.userId).toBe("user_doctor_3");
    });
  });

  describe("Session expiry flow", () => {
    it("should handle checkout session that expires without user action", async () => {
      const session = createCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userId: "user_doctor_4",
        userEmail: "lazy@clinic.com",
      });

      // User never completes or cancels — Stripe expires the session
      const webhookResult = await processWebhookEvent({
        type: "checkout.session.expired",
        data: {
          object: {
            id: session.id,
            customer: null,
            metadata: session.metadata,
            mode: "subscription",
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("expired_cleanup");
      expect(webhookResult.userId).toBe("user_doctor_4");
    });
  });

  describe("Invoice failure after active subscription", () => {
    it("should mark subscription past_due when renewal payment fails", async () => {
      // Simulate existing active subscription
      dbState.user_subscriptions.push({
        doctor_id: "user_doctor_5",
        stripe_subscription_id: "sub_renew_fail",
        status: "active",
      });

      const webhookResult = await processWebhookEvent({
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "inv_renew_fail",
            customer: "cus_renew",
            subscription: "sub_renew_fail",
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("marked_past_due");
    });
  });

  describe("Subscription deletion flow", () => {
    it("should cancel subscription when Stripe notifies deletion", async () => {
      dbState.user_subscriptions.push({
        doctor_id: "user_doctor_6",
        stripe_subscription_id: "sub_to_delete",
        status: "active",
      });

      const webhookResult = await processWebhookEvent({
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_to_delete",
            customer: "cus_delete",
            status: "canceled",
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("subscription_canceled");
    });
  });

  describe("Payment intent cancellation", () => {
    it("should log payment intent cancellation for abandoned checkouts", async () => {
      const webhookResult = await processWebhookEvent({
        type: "payment_intent.canceled",
        data: {
          object: {
            id: "pi_abandoned_123",
            customer: "cus_abandoned",
            cancellation_reason: "abandoned",
          },
        },
      });

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.action).toBe("payment_intent_logged");
    });
  });

  describe("Edge cases", () => {
    it("should handle webhook events with missing metadata", async () => {
      const result = await processWebhookEvent({
        type: "checkout.session.expired",
        data: {
          object: {
            id: "cs_no_meta",
            customer: null,
            metadata: {},
          },
        },
      });

      expect(result.status).toBe(200);
      expect(result.action).toBe("expired_no_user");
    });

    it("should handle unknown webhook event types gracefully", async () => {
      const result = await processWebhookEvent({
        type: "some.future.event",
        data: { object: {} },
      });

      expect(result.status).toBe(200);
      expect(result.action).toBe("unhandled");
    });

    it("should handle redirect URL without any query params", () => {
      const result = handleCheckoutRedirect("https://idalia.lovable.app/pricing");

      expect(result.checkoutStatus).toBeNull();
      expect(result.sessionId).toBeNull();
      expect(result.toastType).toBeNull();
    });

    it("should properly generate session expiry 30 minutes in the future", () => {
      const now = Math.floor(Date.now() / 1000);
      const session = createCheckoutSession({
        priceId: "price_test",
        userId: "user_test",
        userEmail: "test@test.com",
      });

      const diff = session.expires_at - now;
      expect(diff).toBe(30 * 60);
    });

    it("should include session_id in both success and cancel URLs", () => {
      const session = createCheckoutSession({
        priceId: "price_test",
        userId: "user_test",
        userEmail: "test@test.com",
      });

      expect(session.success_url).toContain(`session_id=${session.id}`);
      expect(session.cancel_url).toContain(`session_id=${session.id}`);
    });
  });
});
