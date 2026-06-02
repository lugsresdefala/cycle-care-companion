---
name: INTERGROWTH-21st fetal tables — authoritative source & extraction
description: Where the official INTERGROWTH-21st fetal growth centiles come from and how to re-extract them verbatim (avoid AI-synthesized medical values).
---

# INTERGROWTH-21st fetal growth standards (IDALIA)

The web app's `artifacts/idalia/src/lib/intergrowth.ts` percentile tables (EFW/HC/AC/FL/BPD,
P3/P10/P50/P90/P97) were once grossly inflated (e.g. EFW p50@32w ≈ 2982 vs official 1755;
p97@40w an impossible 6896 g). They have been replaced with the **official published values**.

**Rule:** never hand-type or AI-synthesize these medical reference numbers. webSearch only gives
structure + a few anchors, not the full coefficient/centile set.

**Authoritative source & how to re-extract (verifiable):**
- The `gigs` R package (github `lshtm-gigs/gigs`, `data-raw/ig_fet.R`) points to the official
  Oxford centile-table PDFs on `media.tghn.org`:
  - EFW centiles: `2017/12/GROW_EFW_ct_Table_values.pdf` (GA **22–40 wk only**).
  - Biometry: `2017/03/GROW_Fetal-ct_<hc|ac|fl|bpd|ofd>_Table.pdf` (GA **14–40 wk**).
  - PDF column order is `GA, P3, P5, P10, P50, P90, P95, P97`.
- Extract with **positional** parsing (pdfjs `getTextContent`, bucket items by y-row, sort by x).
  Plain `pdf-parse` concatenates the digits and is ambiguous — do not trust it for the numbers.
- Validate against anchors before shipping: EFW p50 40w = **3338** (exact), 32w = 1755, 24w = 669.

**App consequences of the real ranges:**
- EFW standard is undefined < 22 wk → `GROWTH_PARAMS` efw `minGA: 22`; `getEFWPercentiles` returns
  `null` below 22 wk. `getEFWPercentiles` (biometry.ts) now reads the same official EFW table
  (single source) instead of its own simplified curve.

**Why:** this is a live clinical tool (idcalc.com); inflated tables cause both false IUGR alarms
and missed macrosomia. Correctness of the reference data outweighs convenience.
