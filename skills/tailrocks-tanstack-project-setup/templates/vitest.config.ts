import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["src/**/*.browser.test.{ts,tsx}", "jsdom"]],
    passWithNoTests: false,
  },
});
