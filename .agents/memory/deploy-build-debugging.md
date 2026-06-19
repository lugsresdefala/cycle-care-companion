---
name: deploy build debugging (pnpm multi-artifact)
description: How to find the real cause of a failed publish in this monorepo, and the prod build model
---

# Debugging a failed deployment build

**Get the real error from build history, do not guess.** Use the `deployment` skill's
`listDeploymentBuilds()` + `getDeploymentBuild({buildId})` callbacks (code_execution). The
failure is in the last ~100 log lines. `fetchDeploymentLogs` only returns *runtime* logs, not
build logs.

**Cross-check commit timing.** A `failed` build in history may predate your fix. Compare the
build's `timeCreated` against `git log` — a failed build from before your fix is not evidence
the current HEAD is broken. Verify current HEAD by running the failing artifact's prod build.

## Production build model (non-obvious)
- Deploy does NOT run root `pnpm run build`. Each artifact deploys independently via its
  `artifacts/<slug>/.replit-artifact/artifact.toml` `[services.production].build`/`.run`.
- `.replit` `[deployment].build` is only a repo-root pre-build hook; its `run` is ignored.
- Artifacts with **no** `[services.production]` (e.g. mockup-sandbox) are dev-only, never deployed.
- Build runs artifacts in order (api-server → idalia → ...); it stops at the first failure, so a
  later artifact (e.g. idalia-mobile Metro build) is irrelevant if an earlier one fails.

**Why:** spent many turns assuming a Metro/port-8081 issue blocked deploy; the actual blocker was
idalia's vite build failing on a missing export (`dueDateFromGA`) removed by an earlier refactor.
**How to apply:** on "publish failed", pull the failed build's logs first; fix the artifact named
in the error; confirm with that artifact's prod build; then re-publish.
