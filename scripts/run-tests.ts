import { readdir } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";
import { isRestrictedLinuxCi } from "./test-platform";

const receiptSchema = "tailrocks.script-tests/v1";
const hostSandboxTestFiles = new Set(["scripts/create-pr.test.ts"]);

export function shouldSkipScriptTest(
  file: string,
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return isRestrictedLinuxCi(platform, environment) && hostSandboxTestFiles.has(file);
}

async function filesUnder(root: string, directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory.split(path.sep).join(path.posix.sep), entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(root, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

export async function selectScriptTests(
  root: string,
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string[]> {
  const tests = (await filesUnder(root, "scripts"))
    .filter((file) => file.endsWith(".test.ts"))
    .filter((file) => !shouldSkipScriptTest(file, platform, environment))
    .sort((left, right) => left.localeCompare(right));
  if (tests.length === 0) throw new Error("script test selection matched zero files");
  return tests;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "..");
  try {
    if (process.argv.length !== 2) throw new Error("run-tests takes no arguments");
    const tests = await selectScriptTests(root);
    const skippedTests = [...hostSandboxTestFiles].filter((file) => shouldSkipScriptTest(file));
    const result = await runBoundedCommand({
      // Sequential in-process execution: bun's --parallel worker mode (even with
      // N=1, which adds no concurrency) deadlocks intermittently right after
      // startup (oven-sh/bun#29519), stalling CI until the 900s bound trips.
      command: [process.execPath, "test", ...tests, "--timeout=60000"],
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
        skipped_test_files: skippedTests.length,
        skipped_tests: skippedTests,
        test_exit_code: result.code,
        mutations: [],
        detail: success
          ? skippedTests.length === 0
            ? "all script tests passed"
            : `all selected script tests passed; skipped ${skippedTests.join(", ")} on restricted Linux CI`
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
        skipped_test_files: 0,
        skipped_tests: [],
        mutations: [],
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(1);
  }
}
