import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.TAILROCKS_VISUAL_QA_BASE_URL;
if (!baseURL || !/^http:\/\/127\.0\.0\.1:\d+$/.test(baseURL))
  throw new Error("owned visual-QA base URL missing");
const staging = process.env.TAILROCKS_VISUAL_QA_SNAPSHOT_STAGING;
const outputDir = process.env.TAILROCKS_VISUAL_QA_OUTPUT_DIR;
if (!outputDir) throw new Error("external visual-QA output directory missing");
const screenshotPath = staging
  ? `${staging}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}`
  : `{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}`;

export default defineConfig({
  testDir: "tests/visual",
  outputDir,
  fullyParallel: true,
  reporter: "list",
  globalSetup: "./tests/visual/global-setup.ts",
  updateSnapshots: staging ? "all" : "none",
  use: {
    baseURL,
    deviceScaleFactor: 1,
    serviceWorkers: "block",
    contextOptions: { reducedMotion: "reduce" },
  },
  expect: { toHaveScreenshot: { maxDiffPixels: 100, pathTemplate: screenshotPath } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
  ],
});
