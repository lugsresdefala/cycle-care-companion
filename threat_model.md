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
- **Clinical calculation logic** — premium calculators and risk models embedded in the client. Even when based on published formulas, access restrictions and integrity of premium-only features still matter to the product’s trust model.

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
- **Shared data and authorization model:** `lib/db/src/schema/index.ts`, `lib/api-spec/openapi.yaml`
- **Auth/bootstrap caveat:** `requireAuth()` in `artifacts/api-server/src/lib/auth.ts` performs profile and free-trial bootstrap side effects before protected routes run, including on authenticated `GET` requests.
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

The main risks are broken object-level authorization on patient/exam resources, admin-only actions reachable by normal users, payment/subscription desynchronization that grants paid access to the wrong account, and client-side-only enforcement of premium calculator access. The system must ensure that only authorized users can access patient data, only the correct account receives subscription state, and premium feature enforcement does not rely solely on browser-side controls.
