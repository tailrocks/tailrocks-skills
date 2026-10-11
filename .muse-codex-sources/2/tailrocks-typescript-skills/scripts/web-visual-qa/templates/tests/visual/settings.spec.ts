import { registry } from "../../src/design/registry";
import { expect, test } from "./guarded-test";

for (const state of registry.settings.states) {
  for (const theme of ["light", "dark"] as const) {
    test(`settings ${state} ${theme}`, async ({ page }) => {
      await page.goto(`/design/settings/${state}`);
      expect(new URL(page.url()).origin).toBe(process.env.TAILROCKS_VISUAL_QA_BASE_URL);
      if (theme === "dark") await page.evaluate(() => document.documentElement.classList.add("dark"));
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`settings--${state}--${theme}.png`);
    });
  }
}
