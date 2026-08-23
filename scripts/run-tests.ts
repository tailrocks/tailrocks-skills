import { readdir } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";

const receiptSchema = "tailrocks.script-tests/v1";

async function filesUnder(root: string, directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory.split(path.sep).join(path.posix.sep), entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(root, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

export async function selectScriptTests(root: string): Promise<string[]> {
  const tests = (await filesUnder(root, "scripts"))
    .filter((file) => file.endsWith(".test.ts"))
    .sort((left, right) => left.localeCompare(right));
  if (tests.length === 0) throw new Error("script test selection matched zero files");
  return tests;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "..");
  try {
    if (process.argv.length !== 2) throw new Error("run-tests takes no arguments");
    const tests = await selectScriptTests(root);
    const result = await runBoundedCommand({
      command: [process.execPath, "test", ...tests, "--parallel=1"],
      cwd: root,
      timeoutMilliseconds: 900_000,
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
        code: success ? "tests_passed" : "tests_failed",
        selected_test_files: tests.length,
        tests,
        test_exit_code: result.code,
        mutations: [],
        detail: success ? "all script tests passed" : result.stderr || `test exit ${result.code}`,
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
