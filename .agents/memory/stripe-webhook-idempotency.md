---
name: Stripe webhook idempotency ordering
description: Correct ordering of the dedupe marker vs processing in the Stripe webhook
---
In artifacts/api-server stripe webhook handler: insert the `stripe_webhook_events` dedupe row ONLY AFTER the event has been processed successfully, and return a non-2xx status when processing throws.

**Why:** The original code inserted the dedupe row FIRST, then caught processing errors and still returned 200. A single transient DB/Stripe failure left the event marked "seen" forever, so Stripe's retry hit the duplicate guard and short-circuited — the subscription/tokens never reconciled and a paying user was stranded.

**How to apply:** Pattern = (1) check-exists → short-circuit true duplicates; (2) process inside try; (3) on throw, log + return 500 so Stripe retries; (4) on success, insert the dedupe row (ignore unique-violation from a concurrent delivery). This also makes the syncSubscription select-then-insert race self-healing: a unique-constraint collision returns 500, and the retry finds the row already present and takes the update path. A fully atomic upsert is still the ideal long-term fix (note: the stripe_subscription_id unique index is PARTIAL — `WHERE stripe_subscription_id != ''` — so any onConflict upsert must specify the matching targetWhere predicate).
