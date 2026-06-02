---
name: Clerk web client proxyUrl (production auth)
description: Why production sign-in/sign-up breaks when the web ClerkProvider omits proxyUrl, even though dev works.
---

# Clerk web client must pass proxyUrl + publishableKeyFromHost

Replit-managed Clerk routes the production frontend API through a server proxy at
`/api/__clerk`. The browser `ClerkProvider` must therefore be wired with BOTH:

- `publishableKey={publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)}`
- `proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}` — passed UNCONDITIONALLY.

**Why:** `VITE_CLERK_PROXY_URL` is empty in dev (Clerk hits the dev FAPI directly,
so dev sign-in works fine) and auto-populated at publish time. If `proxyUrl` is
omitted, the published app's Clerk client tries to reach Clerk's FAPI domain
directly instead of the proxy, and ALL auth (entrar/criar conta) silently fails in
production while dev looks perfectly healthy. Symptom: "nothing works in prod, dev is fine".

**How to apply:** Never gate `proxyUrl` on `PROD`/`NODE_ENV`; never inline the raw
publishable env var (use `publishableKeyFromHost`). The server side
(`clerkProxyMiddleware` + `clerkMiddleware` in api-server `app.ts`) is the other
half and is production-only. `@clerk/clerk-react` does NOT export
`publishableKeyFromHost`; import it from `@clerk/shared/keys` (add `@clerk/shared`
as a client dep — it's isomorphic). After fixing client wiring, the app must be
RE-PUBLISHED for prod to pick it up.
