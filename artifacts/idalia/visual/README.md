# Calculator visual regression suite

This suite renders the real `DopplerCalculator` and `GrowthCurveCalculator`
pages in an isolated Vite entry point. Only authentication/token and
patient-save boundaries are replaced in the harness; production routes and
authentication code are unchanged. Playwright intercepts calculation requests
with responses generated from the API server's real premium calculator
functions and official reference tables, so snapshots do not depend on a
running API or user account and do not duplicate medical constants.

## Requirements

- `@playwright/test` in this workspace's development dependencies
- Playwright Chromium: `pnpm exec playwright install chromium`

The checked-in baselines were generated on Replit. Chromium is provisioned by
the repository root `replit.nix` as `pkgs.chromium`; the resolved Chromium 138
executable used for generation and comparison was:

```text
/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium
```

The downloaded Playwright browser could not launch because the workspace lacks
its shared-library dependencies. To reproduce baseline validation in this
workspace, provide that executable through the config's path override:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium \
  pnpm exec playwright test --config playwright.visual.config.ts
```

## Run

From the repository root, `pnpm test:calculators` runs integration tests and
visual comparisons together. `pnpm test:calculators:visual` runs only visual
comparisons, selecting Chromium on PATH (or the explicit
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` override) before falling back to Playwright's
installed browser. Keep the browser and OS consistent with the baseline environment.

From `artifacts/idalia`:

```sh
pnpm exec playwright test --config playwright.visual.config.ts
```

Update reviewed baselines after an intentional UI change:

```sh
pnpm exec playwright test --config playwright.visual.config.ts --update-snapshots
```

The suite runs each CPR, ductus venosus, and growth-curve/reference scenario at
1280 px desktop and 412 px mobile widths. Baselines live beside the spec under
`tests/visual/calculators.visual.spec.ts-snapshots`. CI should run on Linux with
the checked-in Chromium baselines; inspect the HTML report and diff artifacts
before accepting any update.