// @ts-ignore
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  // @ts-ignore
  apiVersion: "2025-08-27.basil",
});

export const PRODUCT_TIER_MAP: Record<string, string> = (() => {
  const raw = process.env.STRIPE_PRODUCT_TIER_MAP;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return {
    prod_UBSjDxy12ggcNr: "basic",
    prod_UBXuhebJkzJkWX: "professional",
    prod_UBXvP745IUaxd3: "premium",
  };
})();

export function resolveOrigin(req: import("express").Request): string {
  const fromHeader = req.headers.origin as string | undefined;
  if (fromHeader) return fromHeader;
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}
