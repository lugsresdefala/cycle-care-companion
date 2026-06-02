---
name: INTERGROWTH-21st reference tables are inflated (idalia)
description: The growth-curve/percentile reference tables in idalia are wrong (inflated), causing bad percentile classification. Do not trust them; verify against official anchors.
---

# IDALIA INTERGROWTH-21st tables were inflated vs official values

`artifacts/idalia/src/lib/intergrowth.ts` shipped EFW/HC/AC/FL/BPD centile tables
that are systematically INFLATED vs the official INTERGROWTH-21st published values
(by ~10–75%). This is the root cause of the clinician's "diversas inconsistências
e erros graves" in the growth-curve / percentile calculators.

**Evidence (50th centile, official vs app):**
- EFW 32wk: 1726 g official vs 2982 g app (+73%); 24wk 639 vs 868; 40wk 3338 vs 4524.
- AC 32wk: 283 mm official vs 409 mm app (+44%). HC 40wk: 344 vs 418 (+22%).

**Why it matters:** inflated medians/centiles classify normal fetuses as large and
mask true growth restriction (CIUR) — a safety issue.

**How to apply:** Any fix MUST use the official INTERGROWTH-21st published centile
tables (P3/P10/P50/P90/P97, GA 14–40), NOT AI-summarized numbers. Validate against
known anchors before trusting: EFW p50 639@24w, 1726@32w, 3338@40w; HC p50 176@20w,
298@32w, 344@40w; AC p50 148@20w, 283@32w, 362@40w; FL p50 33@20w, 63@32w, 76@40w.
Separately, `biometry.ts getEFWPercentiles` is a SECOND, roughly-Hadlock EFW
percentile source (~reasonable) that diverges from the intergrowth.ts table — unify
to one source. EFW *formula* (Hadlock 3-param HC,AC,FL) is correct and matches the
INTERGROWTH-21st 2020 recommendation, so keep it. The CC→IG (HC→GA) formula bug
(quadratic+mm instead of Hadlock cubic+cm) was already fixed.
