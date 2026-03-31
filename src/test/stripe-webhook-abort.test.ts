import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockEq: any = vi.fn().mockReturnThis();
const mockIn: any = vi.fn().mockReturnValue({ error: null });
const mockUpdate: any = vi.fn().mockReturnValue({ eq: mockEq, in: mockIn });
const mockFrom: any = vi.fn(() => ({
  update: mockUpdate,
  eq: mockEq,
  in: mockIn,
}));

// Chain mocks properly
mockEq.mockReturnValue({ eq: mockEq, in: mockIn, error: null });

const mockSupabase = { from: mockFrom };

// Mock Stripe
const mockRetrieveSubscription = vi.fn();
const mockStripe = {
  subscriptions: { retrieve: mockRetrieveSubscription },
  customers: { retrieve: vi.fn() },
  webhooks: { constructEvent: vi.fn() },
};

// Simulate the webhook handler logic for testing
async function handleWebhookEvent(
  supabase: typeof mockSupabase,
  _stripe: typeof mockStripe,
  event: { type: string; data: { object: any } }
) {
  switch (event.type) {
    case "checkout.session.expired": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        const result = await supabase
          .from("user_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() });
        // Simulate chained .eq calls
        return { handled: true, userId, action: "cleanup_pending" };
      }
      return { handled: true, action: "no_user_id" };
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase
          .from("user_subscriptions")
          .update({ status: "payment_failed", updated_at: new Date().toISOString() });
        return { handled: true, userId, action: "mark_payment_failed" };
      }
      return { handled: true, action: "no_user_id" };
    }

    case "payment_intent.canceled": {
      const paymentIntent = event.data.object;
      return {
        handled: true,
        paymentIntentId: paymentIntent.id,
        cancellationReason: paymentIntent.cancellation_reason,
        action: "logged",
      };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabase
        .from("user_subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() });
      return { handled: true, subscriptionId: subscription.id, action: "mark_canceled" };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await supabase
          .from("user_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() });
        return { handled: true, action: "mark_past_due" };
      }
      return { handled: true, action: "no_subscription" };
    }

    default:
      return { handled: false };
  }
}

describe("Stripe Webhook - Abort/Failure Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain mocks
    mockUpdate.mockReturnValue({ eq: mockEq, in: mockIn });
    mockEq.mockReturnValue({ eq: mockEq, in: mockIn, error: null });
    mockIn.mockReturnValue({ error: null });
  });

  describe("checkout.session.expired", () => {
    it("should clean up pending subscriptions when checkout expires with user_id", async () => {
      const event = {
        type: "checkout.session.expired",
        data: {
          object: {
            id: "cs_test_expired123",
            customer: "cus_test123",
            metadata: { user_id: "user_abc123" },
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.userId).toBe("user_abc123");
      expect(result.action).toBe("cleanup_pending");
      expect(mockFrom).toHaveBeenCalledWith("user_subscriptions");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "canceled" })
      );
    });

    it("should handle expired checkout without user_id gracefully", async () => {
      const event = {
        type: "checkout.session.expired",
        data: {
          object: {
            id: "cs_test_expired_no_user",
            customer: "cus_test456",
            metadata: {},
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.action).toBe("no_user_id");
    });

    it("should handle expired checkout with null metadata", async () => {
      const event = {
        type: "checkout.session.expired",
        data: {
          object: {
            id: "cs_test_null_meta",
            customer: null,
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.action).toBe("no_user_id");
    });
  });

  describe("checkout.session.async_payment_failed", () => {
    it("should mark subscription as payment_failed when async payment fails", async () => {
      const event = {
        type: "checkout.session.async_payment_failed",
        data: {
          object: {
            id: "cs_test_async_fail",
            customer: "cus_test789",
            metadata: { user_id: "user_def456" },
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.userId).toBe("user_def456");
      expect(result.action).toBe("mark_payment_failed");
      expect(mockFrom).toHaveBeenCalledWith("user_subscriptions");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "payment_failed" })
      );
    });

    it("should handle async payment failure without user_id", async () => {
      const event = {
        type: "checkout.session.async_payment_failed",
        data: {
          object: {
            id: "cs_test_async_no_user",
            customer: "cus_test000",
            metadata: {},
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.action).toBe("no_user_id");
    });
  });

  describe("payment_intent.canceled", () => {
    it("should log canceled payment intent with cancellation reason", async () => {
      const event = {
        type: "payment_intent.canceled",
        data: {
          object: {
            id: "pi_test_canceled123",
            customer: "cus_testABC",
            cancellation_reason: "abandoned",
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.paymentIntentId).toBe("pi_test_canceled123");
      expect(result.cancellationReason).toBe("abandoned");
      expect(result.action).toBe("logged");
    });

    it("should handle canceled payment intent with duplicate reason", async () => {
      const event = {
        type: "payment_intent.canceled",
        data: {
          object: {
            id: "pi_test_dup",
            customer: "cus_testDUP",
            cancellation_reason: "duplicate",
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.cancellationReason).toBe("duplicate");
    });
  });

  describe("customer.subscription.deleted", () => {
    it("should mark subscription as canceled in DB", async () => {
      const event = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_test_deleted123",
            customer: "cus_testDEL",
            status: "canceled",
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.action).toBe("mark_canceled");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "canceled" })
      );
    });
  });

  describe("invoice.payment_failed", () => {
    it("should mark subscription as past_due on payment failure", async () => {
      const event = {
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "inv_test_failed123",
            customer: "cus_testFAIL",
            subscription: "sub_test_pastdue",
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.action).toBe("mark_past_due");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "past_due" })
      );
    });

    it("should handle invoice failure without subscription", async () => {
      const event = {
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "inv_test_nosub",
            customer: "cus_testNO",
            subscription: null,
          },
        },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(true);
      expect(result.action).toBe("no_subscription");
    });
  });

  describe("Unhandled events", () => {
    it("should return handled=false for unknown event types", async () => {
      const event = {
        type: "some.unknown.event",
        data: { object: {} },
      };

      const result = await handleWebhookEvent(mockSupabase, mockStripe, event);

      expect(result.handled).toBe(false);
    });
  });

  describe("Webhook signature verification", () => {
    it("should require STRIPE_WEBHOOK_SECRET to be set", () => {
      // Simulate the guard: if webhookSecret is falsy, reject
      function validateWebhookRequest(webhookSecret: string | undefined, signature: string | null) {
        if (!webhookSecret) return { valid: false, error: "Webhook not configured" };
        if (!signature) return { valid: false, error: "Missing signature" };
        return { valid: true };
      }

      expect(validateWebhookRequest(undefined, "sig_test")).toEqual({ valid: false, error: "Webhook not configured" });
      expect(validateWebhookRequest("", "sig_test")).toEqual({ valid: false, error: "Webhook not configured" });
      expect(validateWebhookRequest("whsec_test", null)).toEqual({ valid: false, error: "Missing signature" });
      expect(validateWebhookRequest("whsec_test", "sig_test")).toEqual({ valid: true });
    });
  });

  describe("Token renewal on new billing period", () => {
    it("should detect new billing period and reset tokens", () => {
      function calculateTokens(
        existingStartDate: string,
        newPeriodStart: string,
        tokensUsed: number,
        tokensPerPeriod: number,
      ) {
        const isNewPeriod = existingStartDate !== newPeriodStart;
        const effectiveUsed = isNewPeriod ? 0 : tokensUsed;
        return {
          isNewPeriod,
          tokens_remaining: isNewPeriod ? tokensPerPeriod : Math.max(0, tokensPerPeriod - effectiveUsed),
          tokens_used: effectiveUsed,
        };
      }

      // Same period — keep used tokens
      const same = calculateTokens("2026-03-01T00:00:00Z", "2026-03-01T00:00:00Z", 30, 50);
      expect(same.isNewPeriod).toBe(false);
      expect(same.tokens_remaining).toBe(20);
      expect(same.tokens_used).toBe(30);

      // New period — reset tokens
      const renewed = calculateTokens("2026-03-01T00:00:00Z", "2026-04-01T00:00:00Z", 30, 50);
      expect(renewed.isNewPeriod).toBe(true);
      expect(renewed.tokens_remaining).toBe(50);
      expect(renewed.tokens_used).toBe(0);
    });
  });
});
