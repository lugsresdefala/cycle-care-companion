# IDALIA Clerk session lifecycle browser test

**Status:** Blocked before lifecycle assertions  
**Environment:** Development only; IDALIA web `/`, API `/api`  
**Date:** 2026-09-23 (UTC)

## Safety and test identity

- Used the Clerk E2E testing helper with a newly generated synthetic address in
  the `@example.com` domain.
- No existing patient, production account, credential, cookie, JWT, or token
  value was printed or persisted.
- No application code was changed.
- No database seed or subscription mutation was performed.

## Steps attempted

1. Created a new browser context and injected a programmatic Clerk test sign-in
   with a short TTL.
2. Opened `/` and `/growth-curve`.
3. Waited for the calculator to settle.
4. POSTed `/api/bootstrap` using the browser context; response was HTTP 200.
5. Performed sanitized GET checks of `/api/me` and `/api/subscription` (only
   status, keys, and synthetic-email presence were inspected).

## Observations

- The page rendered authenticated-looking controls (`Pacientes`, `Painel`,
  `Sair`) and `/api/me` returned HTTP 200.
- The calculator displayed `Tokens esgotados`; `Plotar na Curva` was disabled.
  The header displayed `3 tokens restantes`. `TokenGateAlert.tsx` shows that
  `blocked` takes precedence over the limited-token notice; therefore this is
  consistent with a trial/clinical-tier restriction and is **not** reported as
  a token-count bug.
- `/api/bootstrap` returned HTTP 200, but no profile row was created for the
  synthetic email.
- The sanitized `/api/me` response did **not** contain the synthetic email.
  It returned the normal profile field keys, but the identity value was not
  logged.
- The rendered `ScientificFooter` attribution was observed but is static UI
  content and is not treated as identity evidence.
- Browser console reported an unsupported MIME type for a script and a Clerk
  development-keys warning.

Evidence captured by the browser runner: screenshots `935my9`, `d6sujk`,
`jy2fie`, `aku01n`, and `dbdzt1` (IDs are runner evidence references, not
credentials).

## Clerk helper and identity limitation

The helper contract was checked in
`.local/skills/clerk-auth-e2e-testing-only/SKILL.md`. Its options are
`firstName`, `lastName`, `email`, `ttl`, and `basePath`; there is no `userId`
option. I therefore did **not** explicitly override `userId` (nor could I).
This matters because the server implementation in
`artifacts/api-server/src/lib/auth.ts` prioritizes
`auth.sessionClaims.userId` over `auth.userId`.

The helper returns a sign-in URL and the documentation calls this an injected
sign-in session. The browser runner also redacted a JWT-related console value,
but I did not inspect or persist it. The available helper documentation does
not establish that the resulting identity is a real Clerk-managed user/session
whose revocation can be independently verified; it also provides no safe way
to bind the server's prioritized `sessionClaims.userId` to the newly generated
email. The API did not expose that synthetic email in the sanitized `/api/me`
check, so this run cannot distinguish a real Clerk session from a test-claims
injection in a way safe enough for revocation testing.

## Verdict / limitation

The programmatic sign-in helper did not establish a verifiably isolated
synthetic Clerk identity in this managed Clerk development instance. Continuing
would risk bootstrapping, debiting, or revoking an existing user's
subscription/session. No further bootstrap or identity-changing operation was
performed after this was recognized. Therefore the following were **not run**:

- baseline/healthy growth-curve calculation and atomic credit decrement;
- renewal/token rollover;
- two-tab logout and stale-session rejection;
- pre-logout cookie/token rejection;
- real JWT expiry with refresh blocked;
- real Clerk session revocation;
- final synthetic-only balance verification.

No auth mock was used as proof. The safe supported method available in this
environment is `signInClerkUser`, but it is insufficient for this task unless
the environment documents that it creates a revocable Clerk-managed session and
provides a verified synthetic `sessionClaims.userId` mapping. Otherwise the
request requires a Clerk-managed synthetic user/session provisioning method
with an auditable user-id mapping. The requested real-revocation conclusions
cannot be made from this run.