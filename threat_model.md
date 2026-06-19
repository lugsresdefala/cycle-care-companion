# Threat Model

## Project Overview

IDALIA is a public-facing obstetrics application with a React web client (`artifacts/idalia`), an Express API (`artifacts/api-server`), shared PostgreSQL/Drizzle data models (`lib/db`), and an Expo mobile client (`artifacts/idalia-mobile`). Users are clinicians who authenticate with Clerk, store patient and exam-history data, and purchase subscriptions through Stripe to unlock premium calculators and token-based usage. The web client uses Clerk cookie-backed sessions against same-origin `/api` routes, while the mobile client sends Clerk bearer tokens to the same API.

The current production deployment is public (`https://idcalc.com`). Per deployment assumptions, transport security is handled by the platform. The scan should focus on production-reachable code paths and ignore mockup-only or presentation-only artifacts unless they can influence production behavior.

## Assets

- **Clinician accounts and sessions** — Clerk-backed identities, session cookies/tokens, and admin-role assignments. Compromise enables access to patient records and billing functions.
- **Patient and exam data** — names, ages, medical-record identifiers, clinical notes, gestational measurements, and calculated obstetric risk results. This is sensitive medical/PII data and must remain tenant-scoped.
- **Subscription and billing state** — Stripe customer IDs, Stripe subscription IDs, checkout sessions, trial state, and token balances. Corruption here can grant paid access, deny service, or misassign subscriptions.
- **Administrative capabilities** — admin-only visibility into all users plus the ability to grant tokens. Abuse materially affects every tenant.
- **Application secrets and service credentials** — database connection string, Clerk secret key, Stripe secret/webhook secrets. Exposure would allow account or billing compromise.
- **Clinical calculation logic** — several premium calculators remain embedded in the public web client, while the premium trisomy/preeclampsia risk models are now calculated server-side. Even when based on published formulas, access restrictions and integrity of premium-only features still matter to the product’s trust model.

## Trust Boundaries

- **Browser/mobile client to API** — all request bodies, query parameters, headers, and origins are untrusted and must not determine authorization or redirect targets without validation.
- **API to PostgreSQL** — the API has broad access to patient, billing, and role data. Broken authorization or unsafe queries here expose all tenants.
- **API to Clerk** — authenticated identity is delegated to Clerk. The API must trust only validated session context and must not infer user identity from client-controlled fields.
- **API to Stripe** — subscription state crosses from Stripe webhooks and API lookups into local authorization/token state. Webhook events and session/subscription identifiers must be strongly bound to the correct user.
- **Mobile device storage and in-memory caches** — bearer tokens, React Query caches, and locally rendered PHI on shared phones/tablets can outlive a session boundary unless explicitly cleared on logout or account switch.
- **Public vs authenticated vs admin surfaces** — `/api/healthz`, `/api/plans`, Clerk proxying, and Stripe webhooks are public; most patient/subscription routes are authenticated; `/api/admin/*` is privileged.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox`, pitch decks, promo artifacts, `.migration-backup`, and most build/export scripts are normally out of scope for production vulnerability reporting unless they leak real secrets or alter deployed behavior.

## Scan Anchors

- **Production API entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*.ts`
- **Highest-risk backend areas:** `artifacts/api-server/src/lib/auth.ts`, `artifacts/api-server/src/routes/patients.ts`, `artifacts/api-server/src/routes/exams.ts`, `artifacts/api-server/src/routes/stripe.ts`, `artifacts/api-server/src/routes/admin.ts`
- **Highest-risk client areas:** `artifacts/idalia/src/App.tsx`, calculator pages under `artifacts/idalia/src/pages/`, token/subscription hooks under `artifacts/idalia/src/hooks/`
- **Premium-access caveat:** the public landing page in `artifacts/idalia/src/pages/Index.tsx` can lazy-load premium calculator modules. The premium trisomy/preeclampsia risk formulas are now server-side, but client-side biometry/EFW/doppler/growth-curve logic still ships to the browser, so future scans should keep client-side entitlement enforcement as a primary attack surface.
- **Mobile premium-access caveat:** the native Expo client now also ships premium biometry / estimated-fetal-weight logic locally in `artifacts/idalia-mobile/app/(tabs)/biometry.tsx` and `artifacts/idalia-mobile/lib/biometry.ts`. Future scans should treat mobile entitlement enforcement as part of the same premium-bypass attack surface, not just the web bundle.
- **Shared data and authorization model:** `lib/db/src/schema/index.ts`, `lib/api-spec/openapi.yaml`
- **Auth/bootstrap caveat:** profile and free-trial creation currently live in `requireBootstrap()` rather than `requireAuth()`, so future scans should verify that bootstrap middleware stays limited to intentional write/onboarding routes.
- **Billing-binding caveat:** the current Stripe flow binds accounts through stored Stripe IDs plus Stripe metadata and schema uniqueness constraints, so future scans should verify those bindings stay intact if checkout or webhook reconciliation changes.
- **Subscription-lifecycle caveat:** free-trial provisioning, Stripe checkout/webhook reconciliation, and token spending all converge on `user_subscriptions`. Future scans should re-check this area for multi-row entitlement bugs, bootstrap concurrency races, token resets caused by event ordering changes, and any mismatch where premium calculator access is enforced by token balance alone instead of plan tier / `subscription_plans.features`.
- **Mobile-session caveat:** `artifacts/idalia-mobile/app/_layout.tsx` now clears the shared TanStack Query cache and bearer-token getter on sign-out, so the current logout boundary looks mitigated; however, generated mobile query keys in `lib/api-client-react/src/generated/api.ts` remain route-based rather than user-scoped, so any future account-switching or query-persistence feature should be reviewed as a potential cross-session PHI leak.
- **Mobile-web deployment caveat:** the native Expo client is in scope, but the standalone mobile-web landing/server artifact under `artifacts/idalia-mobile/server/` should be treated as out of scope unless there is evidence it is separately deployed in production.
- **Usually ignore unless proven reachable in production:** `artifacts/mockup-sandbox`, `artifacts/pitch-deck*`, `artifacts/idalia-promo`, `.migration-backup`, most build scripts under `scripts/` and `artifacts/*/scripts/`

## Threat Categories

### Spoofing

The application relies on Clerk for user identity and a local `user_roles` table for admin privileges. All protected API endpoints must derive identity from validated Clerk session context only, and privileged actions must require server-side admin checks. Stripe webhooks must be authenticated with Stripe signatures, and webhook/user association must not fall back to attacker-influenced heuristics.

### Tampering

Client input can modify patient records, exam history, token balances, and subscription state. The API must reject cross-tenant object references, must not let client-controlled headers choose unsafe redirect/return URLs, and must not let untrusted event ordering or fallback logic overwrite another user’s billing state.

### Information Disclosure

Patient and exam data are medical records and must be scoped to the authenticated clinician on every read and write. Error handling, logs, payment status endpoints, and mobile-side caches shown after logout or account switch must not reveal secrets or other users’ billing/session state. Public endpoints should expose only the minimum plan/catalog data required for checkout.

### Denial of Service

Public endpoints such as health checks, Clerk proxy routes, and Stripe webhook handling must tolerate malformed or repeated input. Authenticated endpoints that create profiles, trials, checkout attempts, or large note payloads should avoid unbounded work and should degrade safely under abuse.

### Elevation of Privilege

The main risks are broken object-level authorization on patient/exam resources, admin-only actions reachable by normal users, payment/subscription desynchronization that grants paid access to the wrong account, and client-side-only enforcement of premium calculator access. The system must ensure that only authorized users can access patient data, only the correct account receives subscription state, and premium feature enforcement does not rely solely on browser-side controls, on formulas shipped to unauthenticated browsers, or on token-balance checks that ignore the purchased plan tier/features.
