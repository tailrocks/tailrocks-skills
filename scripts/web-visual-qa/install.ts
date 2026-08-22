import { randomUUID } from "node:crypto";
import { chmod, copyFile, link, lstat, mkdir, realpath, rm } from "node:fs/promises";
import path from "node:path";

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
  readonly code: "installed" | "invalid_root" | "collision" | "install_failed";
  readonly files: readonly string[];
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
  const staged: { temporary: string; destination: string }[] = [];
  const published: { path: string; dev: number; ino: number }[] = [];
  try {
    for (const [sourceRelative, destinationRelative] of targets) {
      await ensureParents(root, destinationRelative);
      const source = path.join(import.meta.dir, "templates", sourceRelative);
      const sourceInfo = await lstat(source);
      if (!sourceInfo.isFile() || sourceInfo.isSymbolicLink() || (await realpath(source)) !== source)
        throw new Error(`unsafe template: ${sourceRelative}`);
      const destination = path.join(root, destinationRelative);
      const temporary = path.join(
        path.dirname(destination),
        `.${path.basename(destination)}.tailrocks-${randomUUID()}`,
      );
      await copyFile(source, temporary, 0);
      await chmod(temporary, 0o644);
      staged.push({ temporary, destination });
    }
    for (const [index, item] of staged.entries()) {
      if ((await realpath(path.dirname(item.destination))) !== path.dirname(item.destination))
        throw new Error("target ancestor changed before publication");
      await link(item.temporary, item.destination);
      const identity = await lstat(item.destination);
      published.push({ path: item.destination, dev: identity.dev, ino: identity.ino });
      await rm(item.temporary);
      await runtime.afterPublish?.(item.destination, index);
    }
    return {
      schema,
      outcome: "installed",
      code: "installed",
      files: targets.map(([, destination]) => destination),
      detail: "owned web visual-QA harness installed",
    };
  } catch (error) {
    for (const item of staged) await rm(item.temporary, { force: true }).catch(() => undefined);
    for (const owned of published) {
      try {
        const current = await lstat(owned.path);
        if (current.dev === owned.dev && current.ino === owned.ino) await rm(owned.path);
      } catch {}
    }
    return {
      schema,
      outcome: "failed",
      code: "install_failed",
      files: published.map((file) => path.relative(root, file.path)),
      detail: String(error),
    };
  }
}

if (import.meta.main) {
  const index = Bun.argv.indexOf("--root");
  const result =
    index >= 0 && Bun.argv[index + 1]
      ? await install(Bun.argv[index + 1]!)
      : ({
          schema,
          outcome: "refused",
          code: "invalid_root",
          files: [],
          detail: "usage: bun install.ts --root PATH",
        } satisfies InstallReceipt);
  console.log(JSON.stringify(result));
  process.exit(result.outcome === "installed" ? 0 : result.outcome === "refused" ? 2 : 1);
}
