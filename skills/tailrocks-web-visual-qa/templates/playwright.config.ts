import { defineConfig, devices } from "@playwright/test";

// Visual baselines for the design routes. Runs as `test:visual`, separate
// from the unit gate. Captures bind to the pinned browser and one OS
// family — record both in tests/visual/BASELINES.md.
export default defineConfig({
  testDir: "tests/visual",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    deviceScaleFactor: 1,
    // reducedMotion lives in contextOptions — at the top level of `use` it
    // is silently ignored and animations race the captures.
    contextOptions: { reducedMotion: "reduce" },
  },
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: { VITE_DESIGN_ROUTES: "1" },
  },
});
