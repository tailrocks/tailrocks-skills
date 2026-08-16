import { expect, test } from "bun:test";
import path from "node:path";

import { baselineStamps } from "./check-baseline-age";

test("finds the known platform baseline files and parses their dates", async () => {
  const root = path.resolve(import.meta.dir, "..");
  const stamps = await baselineStamps(root);
  expect(stamps.length).toBeGreaterThanOrEqual(6);
  expect(stamps.every((stamp) => /^\d{4}-\d{2}-\d{2}$/.test(stamp.date))).toBeTrue();
  // Stamps carry the stamper's local calendar date, which may lead UTC by a day.
  expect(stamps.every((stamp) => stamp.ageDays >= -1)).toBeTrue();
});
