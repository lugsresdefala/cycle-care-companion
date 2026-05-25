import { describe, it, expect, vi, beforeEach } from "vitest";

// Simulate the create-checkout logic for unit testing
interface CheckoutParams {
  priceId: string;
  userEmail: string;
  userId: string;
  existingCustomerId?: string;
  origin?: string;
}

interface CheckoutSession {
  id: string;
  url: string;
  expires_at: number;
  success_url: string;
  cancel_url: string;
  metadata: Record<string, string>;
  mode: string;
}

function buildCheckoutSession(params: CheckoutParams): Omit<CheckoutSession, "id" | "url"> & { customer?: string; customer_email?: string } {
  const origin = params.origin || "https://idalia.lovable.app";
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

  return {
    customer: params.existingCustomerId,
    customer_email: params.existingCustomerId ? undefined : params.userEmail,
    mode: "subscription",
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=canceled&session_id={CHECKOUT_SESSION_ID}`,
    expires_at: expiresAt,
    metadata: { user_id: params.userId },
  };
}

function validateCheckoutRequest(body: any, user: any): { valid: boolean; error?: string } {
  if (!user?.email) return { valid: false, error: "User not authenticated" };
  if (!body?.priceId) return { valid: false, error: "priceId is required" };
  return { valid: true };
}

describe("Create Checkout - Session Configuration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Session creation", () => {
    it("should create checkout session with correct abort/cancel URL", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_123",
      });

      expect(session.cancel_url).toBe(
        "https://idalia.lovable.app/pricing?checkout=canceled&session_id={CHECKOUT_SESSION_ID}"
      );
      expect(session.cancel_url).toContain("checkout=canceled");
      expect(session.cancel_url).toContain("session_id={CHECKOUT_SESSION_ID}");
    });

    it("should create checkout session with correct success URL", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_123",
      });

      expect(session.success_url).toBe(
        "https://idalia.lovable.app/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}"
      );
      expect(session.success_url).toContain("checkout=success");
    });

    it("should set expires_at to 30 minutes from now", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_123",
      });

      const now = Math.floor(Date.now() / 1000);
      expect(session.expires_at).toBe(now + 30 * 60);
    });

    it("should include user_id in metadata for webhook matching", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_abc",
      });

      expect(session.metadata.user_id).toBe("user_abc");
    });

    it("should use existing customer ID when available", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_123",
        existingCustomerId: "cus_existing",
      });

      expect(session.customer).toBe("cus_existing");
      expect(session.customer_email).toBeUndefined();
    });

    it("should use customer_email for new customers", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "new_doctor@test.com",
        userId: "user_456",
      });

      expect(session.customer).toBeUndefined();
      expect(session.customer_email).toBe("new_doctor@test.com");
    });

    it("should use custom origin for redirect URLs", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_123",
        origin: "http://localhost:5173",
      });

      expect(session.success_url).toContain("http://localhost:5173/dashboard");
      expect(session.cancel_url).toContain("http://localhost:5173/pricing");
    });

    it("should always set mode to subscription", () => {
      const session = buildCheckoutSession({
        priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
        userEmail: "doctor@test.com",
        userId: "user_123",
      });

      expect(session.mode).toBe("subscription");
    });
  });

  describe("Request validation", () => {
    it("should reject request without authenticated user", () => {
      const result = validateCheckoutRequest({ priceId: "price_123" }, null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should reject request without email", () => {
      const result = validateCheckoutRequest({ priceId: "price_123" }, { id: "user_123" });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should reject request without priceId", () => {
      const result = validateCheckoutRequest({}, { email: "test@test.com" });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("priceId is required");
    });

    it("should reject request with null priceId", () => {
      const result = validateCheckoutRequest({ priceId: null }, { email: "test@test.com" });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("priceId is required");
    });

    it("should accept valid request", () => {
      const result = validateCheckoutRequest(
        { priceId: "price_1TD5nyFRyKUci3hFbzlg1Bf9" },
        { email: "doctor@test.com", id: "user_123" }
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
