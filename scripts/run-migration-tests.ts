import { readdir } from "node:fs/promises";
import path from "node:path";

import { loadProtectedPathsManifest, matchesProtectedPath } from "./check-protected-paths";

const receiptSchema = "tailrocks.migration-tests/v1";

async function filesUnder(root: string, directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory.split(path.sep).join(path.posix.sep), entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(root, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

export async function selectMigrationTests(
  root: string,
  manifestFile = path.join(root, "skill-audits", "protected-paths.txt"),
): Promise<string[]> {
  const manifest = await loadProtectedPathsManifest(root, manifestFile);
  const tests = (await filesUnder(root, "scripts"))
    .filter((file) => file.endsWith(".test.ts"))
    .filter((file) => !matchesProtectedPath(manifest.patterns, file))
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  if (tests.length === 0) throw new Error("migration test selection matched zero non-protected files");
  return tests;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "..");
  try {
    const tests = await selectMigrationTests(root);
    console.log(JSON.stringify({ schema: receiptSchema, selected_test_files: tests.length, tests }));
    const child = Bun.spawn([process.execPath, "test", ...tests], {
      cwd: root,
      stdin: "ignore",
      stdout: "inherit",
      stderr: "inherit",
    });
    process.exit(await child.exited);
  } catch (error) {
    console.error(
      JSON.stringify({
        schema: receiptSchema,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(1);
  }
}
