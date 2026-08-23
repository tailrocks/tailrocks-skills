import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { selectScriptTests, shouldSkipScriptTest } from "./run-tests";
import { isRestrictedLinuxCi } from "./test-platform";

test("selects only script test entrypoints", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "tailrocks-script-tests-"));
  try {
    await mkdir(path.join(root, "scripts/templates"), { recursive: true });
    await writeFile(path.join(root, "scripts/a.test.ts"), "");
    await writeFile(path.join(root, "scripts/templates/b.test.ts"), "");
    await writeFile(path.join(root, "scripts/templates/c.spec.ts"), "");
    await writeFile(path.join(root, "scripts/create-pr.test.ts"), "");
    expect(await selectScriptTests(root, "linux", { CI: "true" })).toEqual([
      "scripts/a.test.ts",
      "scripts/templates/b.test.ts",
    ]);
    expect(await selectScriptTests(root, "darwin", { CI: "true" })).toEqual([
      "scripts/a.test.ts",
      "scripts/create-pr.test.ts",
      "scripts/templates/b.test.ts",
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("skips host sandbox integration only on Linux CI", () => {
  expect(isRestrictedLinuxCi("linux", { CI: "true" })).toBe(true);
  expect(isRestrictedLinuxCi("darwin", { CI: "true" })).toBe(false);
  expect(isRestrictedLinuxCi("linux", {})).toBe(false);
  expect(shouldSkipScriptTest("scripts/create-pr.test.ts", "linux", { CI: "true" })).toBe(true);
  expect(shouldSkipScriptTest("scripts/create-pr.test.ts", "linux", { GITHUB_ACTIONS: "true" })).toBe(true);
  expect(shouldSkipScriptTest("scripts/create-pr.test.ts", "darwin", { CI: "true" })).toBe(false);
  expect(shouldSkipScriptTest("scripts/create-pr.test.ts", "linux", {})).toBe(false);
  expect(shouldSkipScriptTest("scripts/create-pr-ownership.test.ts", "linux", { CI: "true" })).toBe(false);
});
