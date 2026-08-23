import { lstat, mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicRecoveryArtifacts, atomicWriteFiles } from "../atomic-file-transaction";

const schema = "tailrocks.web-visual-qa-install/v1";
const targets = [
  ["playwright.visual.config.ts", "playwright.visual.config.ts"],
  ["tests/visual/global-setup.ts", "tests/visual/global-setup.ts"],
  ["tests/visual/guarded-test.ts", "tests/visual/guarded-test.ts"],
  ["tests/visual/settings.spec.ts", "tests/visual/settings.spec.ts"],
  ["src/routes/api.tailrocks-visual-qa.ts", "src/routes/api.tailrocks-visual-qa.ts"],
] as const;

export interface InstallReceipt {
  readonly schema: typeof schema;
  readonly outcome: "installed" | "refused" | "failed";
  readonly code: "installed" | "invalid_arguments" | "invalid_root" | "collision" | "install_failed";
  readonly files: readonly string[];
  readonly recoveryArtifacts?: readonly string[];
  readonly detail: string;
}
interface InstallRuntime {
  readonly afterPublish?: (destination: string, index: number) => Promise<void>;
}

async function safeRoot(input: string): Promise<string> {
  const absolute = path.resolve(input);
  const info = await lstat(absolute);
  if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
    throw new Error("root must be canonical real directory");
  return absolute;
}
async function ensureParents(root: string, relative: string): Promise<void> {
  let current = root;
  for (const part of path.dirname(relative).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      const info = await lstat(current);
      if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`unsafe target ancestor: ${part}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await mkdir(current, { mode: 0o755 });
    }
  }
}

export async function install(rootInput: string, runtime: InstallRuntime = {}): Promise<InstallReceipt> {
  let root: string;
  try {
    root = await safeRoot(rootInput);
  } catch (error) {
    return { schema, outcome: "refused", code: "invalid_root", files: [], detail: String(error) };
  }
  for (const [, destination] of targets) {
    try {
      await lstat(path.join(root, destination));
      return {
        schema,
        outcome: "refused",
        code: "collision",
        files: [],
        detail: `target exists: ${destination}`,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        return { schema, outcome: "failed", code: "install_failed", files: [], detail: String(error) };
    }
  }
  try {
    const writes = [];
    for (const [sourceRelative, destinationRelative] of targets) {
      await ensureParents(root, destinationRelative);
      const source = path.join(import.meta.dir, "templates", sourceRelative);
      const sourceInfo = await lstat(source);
      if (!sourceInfo.isFile() || sourceInfo.isSymbolicLink() || (await realpath(source)) !== source)
        throw new Error(`unsafe template: ${sourceRelative}`);
      const destination = path.join(root, destinationRelative);
      writes.push({ file: destination, expected: null, content: await readFile(source), mode: 0o644 });
    }
    await atomicWriteFiles(writes, runtime);
    return {
      schema,
      outcome: "installed",
      code: "installed",
      files: targets.map(([, destination]) => destination),
      detail: "owned web visual-QA harness installed",
    };
  } catch (error) {
    return {
      schema,
      outcome: "failed",
      code: "install_failed",
      files: [],
      recoveryArtifacts: atomicRecoveryArtifacts(error),
      detail: String(error),
    };
  }
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const result =
    args.length === 2 && args[0] === "--root" && args[1]
      ? await install(args[1])
      : ({
          schema,
          outcome: "refused",
          code: "invalid_arguments",
          files: [],
          detail: "usage: bun install.ts --root PATH",
        } satisfies InstallReceipt);
  console.log(JSON.stringify(result));
  process.exit(result.outcome === "installed" ? 0 : result.outcome === "refused" ? 2 : 1);
}
