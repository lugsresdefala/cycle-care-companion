import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  tsconfig: "./tests/visual/tsconfig.json",
  testDir: "./tests/visual",
  testMatch: "**/*.visual.spec.ts",
  // Vite's development dependency optimizer is not concurrency-safe while
  // this isolated harness first loads its two entry graphs.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "playwright-report/visual" }]] : "list",
  outputDir: "test-results/visual",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:4177",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
    colorScheme: "light",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec vite --config visual/vite.config.ts",
    cwd: ".",
    url: "http://127.0.0.1:4177/visual/harness/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 1000 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 1,
      },
    },
  ],
});