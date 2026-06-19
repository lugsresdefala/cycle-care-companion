---
name: Vite dev server hides type errors that break the deploy build
description: Why idalia deploy builds fail green-in-dev, and where to look
---

The idalia web client runs on Vite in dev, which does NOT typecheck — so the dev
workflow stays green even when `pnpm run build` (typecheck across ALL packages)
fails. A deploy "build failed to publish" with no dev symptom almost always
means a TypeScript error in a package whose dev server skips typecheck.

**Why it recurs:** parallel security/SEO task merges (a) move premium calc
formulas server-side and gut client libs, deleting exports that pages still
import, and (b) tighten shared-component prop signatures (e.g. PageMeta.path,
TokenGateAlert.needsLogin/blocked, ScientificFooter.references became required)
without updating every consumer page. Vite never catches it; the deploy build does.

**How to apply:** to reproduce a failed publish, run `pnpm run typecheck` (fast)
rather than the full `pnpm run build` (the global build can exceed the 2-min tool
timeout — build a single artifact with `pnpm --filter @workspace/idalia run build`
to confirm Vite/prerender). Distinguish dead imports (computation moved
server-side → delete the import) from wrongly-removed pure utilities (e.g.
dueDateFromGA is date math, not a premium formula → restore it). Recover original
impls from git history of the lib file, not by reinventing. Keep premium clinical
formulas server-side; only restore non-premium helpers client-side.
