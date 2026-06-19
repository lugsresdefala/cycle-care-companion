---
name: Parallel task merges can strand conflict markers
description: Why the API server build broke after concurrent billing-security merges, and how to catch it
---

When multiple task agents edit the SAME function/file in parallel and are merged
back to back, the auto-merge can leave raw Git conflict markers
(`<<<<<<< HEAD` / `=======` / `>>>>>>>`) in source. esbuild then fails with
`Unexpected "<<"` and the workflow never starts → production outage. Typecheck
also fails, but the symptom users see is downtime, not a TS error.

**Why:** several billing-integrity fixes (token lifecycle) all rewrote
`syncSubscription()` in `artifacts/api-server/src/routes/stripe.ts`; the merges
collided on the INSERT branch and left a marker.

**How to apply:** after a burst of merged tasks touching overlapping code, before
assuming things are fine run:
`grep -rln '^<<<<<<< \|^>>>>>>> \|^=======$' --include='*.ts' --include='*.tsx' artifacts lib`
Resolve by keeping the most complete implementation, then re-check for now-unused
imports (e.g. dropping a `sql` template can leave `sql` unused → TS error).
Always restart the API workflow and curl `/api/healthz` to confirm recovery, and
remember the live deploy needs a fresh publish to leave the broken state.
