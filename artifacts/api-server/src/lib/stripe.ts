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

/**
 * The canonical application origin used for Stripe return URLs (success_url,
 * cancel_url, return_url). Must be set via APP_ORIGIN env var (single value)
 * or ALLOWED_ORIGINS env var (comma-separated; first entry is used as the
 * canonical origin). Request headers are never trusted for this value — only
 * server-side configuration is used, so an attacker cannot supply a hostile
 * Origin/Host header to redirect users to an attacker-controlled site.
 *
 * The server will throw at startup if neither variable is set.
 */
const APP_ORIGIN: string = (() => {
  const single = (process.env.APP_ORIGIN || "").trim().replace(/\/$/, "");
  if (single) return single;

  const list = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (list.length > 0) return list[0];

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "APP_ORIGIN (or ALLOWED_ORIGINS) must be set in production. " +
        "Set it to the application's canonical public URL (e.g. https://app.example.com).",
    );
  }

  // Development-only fallback: log a warning but do not crash.
  console.warn(
    "[stripe] APP_ORIGIN / ALLOWED_ORIGINS not set — Stripe return URLs will " +
      "be derived from the server's own host. Set APP_ORIGIN in production.",
  );
  return "";
})();

/**
 * Returns the canonical application origin for use in Stripe redirect URLs.
 * The `req` parameter is accepted for API compatibility but request headers
 * are intentionally ignored — only the server-side APP_ORIGIN is returned.
 * In development without APP_ORIGIN set, falls back to the server host derived
 * from trusted proxy headers (not the user-supplied Origin header).
 */
export function resolveOrigin(req: import("express").Request): string {
  if (APP_ORIGIN) return APP_ORIGIN;

  // Development-only path: derive from server host (NOT the Origin header).
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "localhost";
  return `${proto}://${host}`.replace(/\/$/, "");
}
