---
name: Synthetic Clerk lifecycle tests
description: Safety boundary for development-only logout and expiry browser verification.
---

Verify that the browser and server both identify the newly created synthetic account before bootstrapping, seeding credits, calculating, or revoking sessions. Do not treat a successful programmatic test sign-in as proof of a real revocable Clerk session.

**Why:** A development browser test using the provided Clerk sign-in helper did not produce the requested synthetic email in the server's identity response. The helper's documented arguments did not allow overriding userId or establish real Clerk revocation semantics. The lifecycle checks were stopped rather than risk acting on another identity.

**How to apply:** Establish an auditable synthetic identity mapping and real Clerk session provenance first. If unavailable, report the lifecycle test as blocked, not passed. Static footer attribution is not identity evidence, and a clinical-plan restriction can coexist with a positive trial balance.