---
name: Calculator visual baseline environment
description: Browser environment constraint for repeatable calculator screenshots.
---

Use the same Linux Chromium build when comparing or deliberately updating visual baselines.

**Why:** Downloaded Playwright Chromium could not launch in this Nix workspace because host libraries were missing. Baselines were generated with Nix Chromium 138.0.7204.100; changing the engine can change pixels without a UI regression.

**How to apply:** Prefer the workspace Chromium or an explicit executable override. For a different CI browser environment, inspect differences before accepting new baselines; never regenerate them just to hide a failed check.