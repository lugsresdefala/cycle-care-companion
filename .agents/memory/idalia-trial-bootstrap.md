---
name: IDALIA trial/profile bootstrap boundary
description: Why profile + free-trial provisioning is a write-only path, and what new token-gated features must do.
---

# IDALIA profile + free-trial provisioning

`requireAuth` (api-server `src/lib/auth.ts`) intentionally performs **no writes** —
it never creates a profile or starts the free trial. Profile + trial creation
(`ensureProfileAndTrial`, 3 trial tokens) lives only in `requireBootstrap`, which
must stay attached to explicit POST/write routes (never on a GET).

**Why:** keeps state-changing onboarding off safe/idempotent reads (CSRF / accidental
side-effects on GET). Documented in `threat_model.md` "Auth/bootstrap caveat".

**The trap:** token-gated reads/actions (`GET /subscription`, `/tokens/remaining`,
premium `POST /calculate/*`) use `requireAuth`. A brand-new user is authenticated but
has **no subscription row → 0 tokens** until they happen to hit a write route. This
silently breaks the "3 cálculos gratuitos" promise. There is **no Clerk webhook** —
only Stripe — so nothing provisions the trial on sign-up automatically.

**How to apply:** the client provisions the trial via `POST /api/bootstrap`
(requireBootstrap) called once per signed-in user from `useSubscription`
(module-level `bootstrappedUserId`, reset on sign-out, re-runs on account switch).
Any future token-gated feature must ensure bootstrap has run before it reads
tokens — do NOT move provisioning into `requireAuth`/GET routes.
