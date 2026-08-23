import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { selectScriptTests } from "./run-tests";

test("selects only script test entrypoints", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "tailrocks-script-tests-"));
  try {
    await mkdir(path.join(root, "scripts/templates"), { recursive: true });
    await writeFile(path.join(root, "scripts/a.test.ts"), "");
    await writeFile(path.join(root, "scripts/templates/b.test.ts"), "");
    await writeFile(path.join(root, "scripts/templates/c.spec.ts"), "");
    expect(await selectScriptTests(root)).toEqual(["scripts/a.test.ts", "scripts/templates/b.test.ts"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
