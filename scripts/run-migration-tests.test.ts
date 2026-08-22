import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { selectMigrationTests } from "./run-migration-tests";

const roots: string[] = [];

async function write(root: string, relative: string, source = ""): Promise<void> {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, source);
}

async function fixture(): Promise<{ root: string; manifest: string }> {
  const root = await mkdtemp(path.join(tmpdir(), "migration-tests-"));
  roots.push(root);
  const manifest = path.join(root, "protected-paths.txt");
  await write(
    root,
    "protected-paths.txt",
    `# Source SHA: ${"a".repeat(40)}\nscripts/run-evals.test.ts\nskills/*/evals/**\n`,
  );
  return { root, manifest };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

test("selects every non-protected script test in deterministic order", async () => {
  const { root, manifest } = await fixture();
  await write(root, "scripts/z.test.ts");
  await write(root, "scripts/nested/a.test.ts");
  await write(root, "scripts/run-evals.test.ts", "must not be read or run");
  await write(root, "scripts/not-a-test.ts");
  expect(await selectMigrationTests(root, manifest)).toEqual([
    "scripts/nested/a.test.ts",
    "scripts/z.test.ts",
  ]);
});

test("refuses a vacuous non-protected test selection", async () => {
  const { root, manifest } = await fixture();
  await write(root, "scripts/run-evals.test.ts", "excluded");
  await expect(selectMigrationTests(root, manifest)).rejects.toThrow("matched zero");
});

test("standalone selection rejects a changed canonical manifest", async () => {
  const { root, manifest } = await fixture();
  await write(root, "scripts/a.test.ts");
  await write(root, "skill-audits/protected-paths.txt", await Bun.file(manifest).text());
  await expect(selectMigrationTests(root)).rejects.toThrow("immutable SHA-256");
});
