import { expect, test } from "@playwright/test";

import { registry } from "../../src/design/registry";

// One capture per state × theme; the project matrix supplies viewports.
// Baselines hold the code: --update-snapshots only during design
// iteration or after a recorded re-blessing.
for (const state of registry.settings.states) {
  for (const theme of ["light", "dark"] as const) {
    test(`settings ${state} ${theme}`, async ({ page }) => {
      await page.goto(`/design/settings/${state}`);
      if (theme === "dark") {
        await page.evaluate(() => document.documentElement.classList.add("dark"));
      }
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`settings--${state}--${theme}.png`);
    });
  }
}
