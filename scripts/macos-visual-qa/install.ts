import { randomUUID } from "node:crypto";
import { chmod, copyFile, lstat, mkdir, realpath, rename, rm } from "node:fs/promises";
import path from "node:path";

const schema = "tailrocks.macos-visual-qa-install/v1";
const templates = [
  "AuditTests.swift",
  "ax-drive.swift",
  "capture.sh",
  "process-owner.swift",
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
  readonly detail: string;
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
  const created: string[] = [];
  let staging: string | undefined;
  try {
    await ensureRealParents(root, path.dirname(destinationInput));
    staging = path.join(path.dirname(destination), `.${path.basename(destination)}.stage-${randomUUID()}`);
    await mkdir(staging, { recursive: false, mode: 0o700 });
    for (const name of templates) {
      const from = path.join(source, name);
      const sourceInfo = await lstat(from);
      if (!sourceInfo.isFile() || sourceInfo.isSymbolicLink() || (await realpath(from)) !== from)
        throw new Error(`template is not a canonical regular file: ${name}`);
      const to = path.join(staging, name);
      await copyFile(from, to, 0);
      await chmod(to, name.endsWith(".sh") ? 0o755 : 0o644);
      created.push(name);
    }
    await chmod(staging, 0o755);
    await rename(staging, destination);
    staging = undefined;
    return {
      schema,
      outcome: "installed",
      code: "installed",
      root,
      destination,
      files: created,
      detail: "hardened harness installed",
    };
  } catch (error) {
    if (staging) await rm(staging, { recursive: true, force: true }).catch(() => undefined);
    return {
      schema,
      outcome: "failed",
      code: "install_failed",
      root,
      destination,
      files: created,
      detail: String(error),
    };
  }
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  const destinationIndex = args.indexOf("--destination");
  const receipt =
    rootIndex >= 0 && args[rootIndex + 1]
      ? await install(args[rootIndex + 1]!, destinationIndex >= 0 ? args[destinationIndex + 1] : undefined)
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
