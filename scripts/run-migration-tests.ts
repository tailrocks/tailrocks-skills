import { readdir } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";
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
    if (process.argv.length !== 2) {
      console.log(
        JSON.stringify({
          schema: receiptSchema,
          outcome: "refused",
          code: "invalid_arguments",
          selected_test_files: 0,
          tests: [],
          mutations: [],
          detail: "run-migration-tests takes no arguments",
        }),
      );
      process.exit(2);
    }
    const tests = await selectMigrationTests(root);
    const result = await runBoundedCommand({
      command: [process.execPath, "test", ...tests],
      cwd: root,
      timeoutMilliseconds: 600_000,
      killGraceMilliseconds: 5_000,
      maximumOutputBytes: 50_000_000,
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr && !result.timedOut && !result.saturated) process.stderr.write(result.stderr);
    const success = result.code === 0 && !result.timedOut && !result.saturated;
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: success ? "success" : "failed",
        code: success
          ? "tests_passed"
          : result.timedOut
            ? "timeout"
            : result.saturated
              ? "output_saturated"
              : "tests_failed",
        selected_test_files: tests.length,
        tests,
        test_exit_code: result.code,
        mutations: [],
        detail: success
          ? "all selected non-protected tests passed"
          : result.stderr || `test exit ${result.code}`,
      }),
    );
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: "failed",
        code: "selection_failed",
        selected_test_files: 0,
        tests: [],
        mutations: [],
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(1);
  }
}
