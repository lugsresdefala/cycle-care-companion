---
name: Stripe secret key silent fallback
description: Why IDALIA checkout 500s when STRIPE_SECRET_KEY is unset, and how to confirm
---

The Stripe client is constructed as `new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder")`.
When the secret is missing, the app boots fine and every route works EXCEPT Stripe calls,
which fail at runtime with `StripeAuthenticationError: Invalid API Key provided: sk_test_*...lder`
(HTTP 401) -> checkout/portal return 500. Nothing in startup or typecheck flags this.

**Why:** the placeholder default makes a missing key look like a code bug instead of a config gap.
The fix is never a code change — it's setting the secret.

**How to apply:** if subscriptions/checkout 500 with no code changes, first check
`viewEnvVars({type:'secret', keys:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET']})`.
Secrets are global/shared, but the **live deployment must be re-published** to pick up
newly-added secrets — dev workflow restart is enough for the preview, prod is not.
Verify keys work without touching code: from `artifacts/api-server`, dynamic-import `stripe`
(it's hoisted, not resolvable from repo root), call `accounts.retrieve()`, then create+delete
a throwaway checkout session against a real price.

**Account binding (as of 2026-06):** keys belong to Stripe account QUIRAL (acct_1RfkFCFRyKUci3hF).
The 3 paid plans in `subscription_plans` map basic/professional/premium to products
prod_UBSjDxy12ggcNr / prod_UBXuhebJkzJkWX / prod_UBXvP745IUaxd3, matching PRODUCT_TIER_MAP.
If keys are ever swapped to another account these price/product IDs must be re-seeded.
