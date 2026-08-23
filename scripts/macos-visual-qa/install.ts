import { lstat, mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicWriteFiles, atomicRecoveryArtifacts } from "../atomic-file-transaction";

const schema = "tailrocks.macos-visual-qa-install/v1";
const templates = [
  "AuditTests.swift",
  "app-launcher.swift",
  "ax-drive.swift",
  "capture.sh",
  "permissions.swift",
  "process-owner.swift",
  "run.ts",
  "state.sh",
  "window-id.swift",
] as const;

export interface InstallReceipt {
  readonly schema: typeof schema;
  readonly outcome: "installed" | "refused" | "failed";
  readonly code: "installed" | "invalid_arguments" | "invalid_root" | "destination_exists" | "install_failed";
  readonly root?: string;
  readonly destination?: string;
  readonly files: readonly string[];
  readonly recoveryArtifacts?: readonly string[];
  readonly detail: string;
}
interface InstallRuntime {
  readonly afterDestinationClaim?: (destination: string) => Promise<void>;
}

async function safeRoot(input: string): Promise<string> {
  const absolute = path.resolve(input);
  const info = await lstat(absolute);
  if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
    throw new Error("root must be a real, canonical directory");
  return absolute;
}

async function ensureRealParents(root: string, relativeDirectory: string): Promise<void> {
  let current = root;
  for (const component of relativeDirectory.split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    try {
      const info = await lstat(current);
      if (!info.isDirectory() || info.isSymbolicLink())
        throw new Error(`destination ancestor is not a real directory: ${component}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await mkdir(current, { mode: 0o755 });
    }
  }
}

export async function install(
  rootInput: string,
  destinationInput = "Scripts/TailrocksVisualQA",
  runtime: InstallRuntime = {},
): Promise<InstallReceipt> {
  let root: string;
  try {
    root = await safeRoot(rootInput);
  } catch (error) {
    return { schema, outcome: "refused", code: "invalid_root", files: [], detail: String(error) };
  }
  if (
    path.isAbsolute(destinationInput) ||
    destinationInput.split(/[\\/]/).some((part) => part === ".." || part === "")
  )
    return {
      schema,
      outcome: "refused",
      code: "invalid_arguments",
      root,
      files: [],
      detail: "destination must be a clean relative path",
    };
  const destination = path.join(root, destinationInput);
  try {
    await lstat(destination);
    return {
      schema,
      outcome: "refused",
      code: "destination_exists",
      root,
      destination,
      files: [],
      detail: "destination already exists; no files changed",
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      return {
        schema,
        outcome: "failed",
        code: "install_failed",
        root,
        destination,
        files: [],
        detail: String(error),
      };
  }
  const source = path.join(import.meta.dir, "templates");
  const published: string[] = [];
  let destinationClaimed = false;
  try {
    await ensureRealParents(root, path.dirname(destinationInput));
    const writes = [];
    for (const name of templates) {
      const from = path.join(source, name);
      const sourceInfo = await lstat(from);
      if (!sourceInfo.isFile() || sourceInfo.isSymbolicLink() || (await realpath(from)) !== from)
        throw new Error(`template is not a canonical regular file: ${name}`);
      writes.push({
        file: path.join(destination, name),
        content: await readFile(from),
        expected: null,
        mode: 0o644,
      });
    }
    await mkdir(destination, { mode: 0o755 });
    destinationClaimed = true;
    await runtime.afterDestinationClaim?.(destination);
    await atomicWriteFiles(writes);
    published.push(...templates);
    return {
      schema,
      outcome: "installed",
      code: "installed",
      root,
      destination,
      files: published,
      detail: "hardened harness installed",
    };
  } catch (error) {
    const recovery = atomicRecoveryArtifacts(error);
    return {
      schema,
      outcome: "failed",
      code: "install_failed",
      root,
      destination,
      files: published,
      recoveryArtifacts: destinationClaimed ? [...new Set([destination, ...recovery])] : recovery,
      detail: destinationClaimed
        ? `${String(error)}; partial destination retained for recovery at ${destination}`
        : String(error),
    };
  }
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  let root: string | undefined;
  let destination: string | undefined;
  let valid = true;
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (
      !value ||
      (flag === "--root" ? root !== undefined : flag === "--destination" ? destination !== undefined : true)
    ) {
      valid = false;
      break;
    }
    if (flag === "--root") root = value;
    else if (flag === "--destination") destination = value;
    else valid = false;
  }
  const receipt =
    valid && root
      ? await install(root, destination)
      : ({
          schema,
          outcome: "refused",
          code: "invalid_arguments",
          files: [],
          detail: "usage: bun install.ts --root PATH [--destination RELATIVE]",
        } satisfies InstallReceipt);
  console.log(JSON.stringify(receipt));
  process.exit(receipt.outcome === "installed" ? 0 : receipt.outcome === "refused" ? 2 : 1);
}
