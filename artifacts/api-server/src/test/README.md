# Calculator authentication and credit integration tests

Run from the workspace root:

```sh
pnpm test:calculate-auth
```

Requires PostgreSQL binaries (`initdb`, `pg_ctl`) on PATH and a non-root
user. The runner creates a fresh temporary PostgreSQL cluster with TCP disabled,
overrides DATABASE_URL with its private Unix socket, applies the actual Drizzle
schema, and stops/deletes the cluster on exit. It never uses the workspace or
production database. Calling Vitest directly without the isolated runner fails
closed.

The suite uses the actual calculator router, `requireAuth`, Clerk middleware and
JWT signature/expiry verification, Drizzle queries and PostgreSQL row locking.
RSA keys and user IDs are generated/synthetic, with no real Clerk account.
Only Clerk's optional user-profile API lookup is stubbed to avoid external calls.
These tests establish local JWT rejection, not live Clerk session revocation or
browser cookie refresh behavior.

Coverage includes 401 with no SQL changes across every calculator, trial/basic/
professional/premium eligibility, zero credits, expired or inactive subscriptions,
cross-user isolation, no implicit bootstrap, invalid input without debit, and
six simultaneous debits contending for one or three remaining credits.
The concurrency test holds a PostgreSQL row lock until all requests are waiting
in the actual debit query, then checks both response counts and persisted balances.

This complements the web calculator tests, whose mocked auth/database are useful
for UI behavior but cannot establish this security and concurrency boundary.