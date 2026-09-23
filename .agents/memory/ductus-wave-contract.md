---
name: Ductus venosus wave contract
description: Why the ambiguous legacy wave boolean must not be accepted as normal flow
---
Require an explicit three-state observation for ductus venosus a-wave assessments; do not convert a legacy false boolean to positive.

**Why:** The old web selector encoded both absent and positive as false, so backwards compatibility would preserve a clinically unsafe ambiguity. ISUOG FGR guidance (2020, doi:10.1002/uog.22134) identifies both absent and reversed a-waves as abnormal in FGR.

**How to apply:** Older clients must refresh/update and send the observed state. Reject ambiguous requests before charging tokens rather than guessing. Distinguish absent from reversed in results without implying a standalone diagnosis or automatic delivery recommendation.