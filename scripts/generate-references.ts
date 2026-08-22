import { createHash } from "node:crypto";
import { access, lstat, mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Entry = { source: string; destinations: string[] };
type Manifest = { $schema: "tailrocks.generated-references/v1"; entries: Entry[] };
type PlannedCopy = { source: string; destination: string; content: Buffer };
type PlannedWrite = { source: string; destination: string; content: string | Uint8Array };
type LockCopy = { source: string; destination: string; sha256: string };
type ReferenceLock = { $schema: "tailrocks.generated-references-lock/v1"; copies: LockCopy[] };

export type GeneratorIO = { rename: typeof rename; rm: typeof rm; writeFile: typeof writeFile };
export type GeneratorReceipt = {
  schema: "tailrocks.generated-references-receipt/v1";
  mode: "check" | "write";
  sources: number;
  destinations: number;
  byte_identical: number;
  written: number;
};

const manifestSchema = "tailrocks.generated-references/v1";
const receiptSchema = "tailrocks.generated-references-receipt/v1";
const lockSchema = "tailrocks.generated-references-lock/v1";
const sourcePattern = /^(?:shared|skill-authoring)\/references\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const destinationPattern =
  /^skills\/tailrocks-[a-z0-9]+(?:-[a-z0-9]+)*\/references\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function exactKeys(value: object, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort(compareCodeUnits).join(",");
  const wanted = [...expected].sort(compareCodeUnits).join(",");
  if (actual !== wanted) throw new Error(`${label} fields must be exactly: ${wanted}`);
}

function assertSorted(values: readonly string[], label: string): void {
  for (let index = 1; index < values.length; index += 1)
    if (compareCodeUnits(values[index - 1]!, values[index]!) >= 0)
      throw new Error(`${label} must be strictly sorted and unique`);
}

function sha256(source: Uint8Array): string {
  return createHash("sha256").update(source).digest("hex");
}

function expectedLock(plan: readonly PlannedCopy[]): ReferenceLock {
  return {
    $schema: lockSchema,
    copies: plan
      .map((copy) => ({ source: copy.source, destination: copy.destination, sha256: sha256(copy.content) }))
      .sort((left, right) => compareCodeUnits(left.destination, right.destination)),
  };
}

function parseLock(source: string): ReferenceLock {
  let lock: ReferenceLock;
  try {
    lock = JSON.parse(source) as ReferenceLock;
  } catch {
    throw new Error("generated-reference lock must be valid JSON");
  }
  if (typeof lock !== "object" || lock === null || Array.isArray(lock))
    throw new Error("generated-reference lock must be an object");
  exactKeys(lock, ["$schema", "copies"], "lock");
  if (lock.$schema !== lockSchema) throw new Error(`lock schema must be ${lockSchema}`);
  if (!Array.isArray(lock.copies)) throw new Error("lock copies must be an array");
  const destinations: string[] = [];
  for (const [index, copy] of lock.copies.entries()) {
    if (typeof copy !== "object" || copy === null || Array.isArray(copy))
      throw new Error(`lock.copies[${index}] must be an object`);
    exactKeys(copy, ["destination", "sha256", "source"], `lock.copies[${index}]`);
    if (
      typeof copy.source !== "string" ||
      !sourcePattern.test(copy.source) ||
      typeof copy.destination !== "string" ||
      !destinationPattern.test(copy.destination) ||
      typeof copy.sha256 !== "string" ||
      !/^[0-9a-f]{64}$/.test(copy.sha256)
    )
      throw new Error(`lock.copies[${index}] is invalid`);
    destinations.push(copy.destination);
  }
  assertSorted(destinations, "lock destinations");
  return lock;
}

function resolveInside(root: string, relative: string): string {
  if (
    relative.includes("\\") ||
    path.posix.normalize(relative) !== relative ||
    path.posix.isAbsolute(relative)
  )
    throw new Error(`unsafe generated-reference path: ${relative}`);
  const resolved = path.resolve(root, relative);
  const parent = `${path.resolve(root)}${path.sep}`;
  if (!resolved.startsWith(parent)) throw new Error(`generated-reference path escapes root: ${relative}`);
  return resolved;
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function assertNoSymlink(root: string, relative: string): Promise<void> {
  let current = path.resolve(root);
  for (const segment of relative.split("/")) {
    current = path.join(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink())
        throw new Error(`generated-reference path contains symlink: ${relative}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
  }
}

async function canonicalSources(root: string): Promise<string[]> {
  const sources: string[] = [];
  for (const directory of ["shared/references", "skill-authoring/references"]) {
    const entries = await readdir(path.join(root, directory), { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md"))
        throw new Error(`${directory} contains unsupported entry: ${entry.name}`);
      sources.push(`${directory}/${entry.name}`);
    }
  }
  return sources.sort(compareCodeUnits);
}

async function skillNames(root: string): Promise<string[]> {
  const entries = await readdir(path.join(root, "skills"), { withFileTypes: true });
  const names: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (await exists(path.join(root, "skills", entry.name, "SKILL.md"))) names.push(entry.name);
  }
  return names.sort(compareCodeUnits);
}

async function loadPlan(root: string, manifestFile: string): Promise<PlannedCopy[]> {
  let manifest: Manifest;
  try {
    manifest = JSON.parse(await readFile(manifestFile, "utf8")) as Manifest;
  } catch {
    throw new Error("generated-reference manifest must be valid JSON");
  }
  if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest))
    throw new Error("generated-reference manifest must be an object");
  exactKeys(manifest, ["$schema", "entries"], "manifest");
  if (manifest.$schema !== manifestSchema) throw new Error(`manifest schema must be ${manifestSchema}`);
  if (!Array.isArray(manifest.entries) || manifest.entries.length === 0)
    throw new Error("manifest entries must be nonempty");

  const sources = manifest.entries.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry))
      throw new Error(`entries[${index}] must be an object`);
    exactKeys(entry, ["destinations", "source"], `entries[${index}]`);
    if (typeof entry.source !== "string" || !sourcePattern.test(entry.source))
      throw new Error(`entries[${index}].source is invalid`);
    if (
      !Array.isArray(entry.destinations) ||
      entry.destinations.some(
        (destination) => typeof destination !== "string" || !destinationPattern.test(destination),
      )
    )
      throw new Error(`entries[${index}].destinations are invalid`);
    assertSorted(entry.destinations, `entries[${index}].destinations`);
    return entry.source;
  });
  assertSorted(sources, "manifest sources");

  const discoveredSources = await canonicalSources(root);
  if (sources.join("\n") !== discoveredSources.join("\n"))
    throw new Error("manifest sources must exactly cover canonical reference files");

  const destinations = manifest.entries.flatMap((entry) => entry.destinations);
  if (new Set(destinations).size !== destinations.length)
    throw new Error("generated-reference destinations must be unique");
  const caseFolded = destinations.map((destination) => destination.toLowerCase());
  if (new Set(caseFolded).size !== caseFolded.length)
    throw new Error("generated-reference destinations must be case-fold unique");
  const runtime = manifest.entries.find((entry) => entry.source === "shared/references/runtime-trust.md");
  if (runtime) {
    const covered = runtime.destinations
      .map((destination) => destination.split("/")[1]!)
      .sort(compareCodeUnits);
    const skills = await skillNames(root);
    if (covered.join("\n") !== skills.join("\n"))
      throw new Error("runtime-trust destinations must exactly cover current skills");
  }

  const plan: PlannedCopy[] = [];
  for (const entry of manifest.entries) {
    await assertNoSymlink(root, entry.source);
    const sourceFile = resolveInside(root, entry.source);
    const content = await readFile(sourceFile);
    for (const destination of entry.destinations) {
      await assertNoSymlink(root, destination);
      const skill = destination.split("/")[1]!;
      if (!(await exists(path.join(root, "skills", skill, "SKILL.md"))))
        throw new Error(`generated-reference destination skill is missing: ${skill}`);
      plan.push({ source: entry.source, destination, content });
    }
  }
  return plan;
}

export async function generateReferences(
  root: string,
  mode: "check" | "write",
  manifestPath = "generated-references.json",
  io: GeneratorIO = { rename, rm, writeFile },
): Promise<GeneratorReceipt> {
  const resolvedRoot = path.resolve(root);
  const manifestFile = resolveInside(resolvedRoot, manifestPath);
  await assertNoSymlink(resolvedRoot, manifestPath);
  const plan = await loadPlan(resolvedRoot, manifestFile);
  const lockFile = resolveInside(resolvedRoot, "generated-references.lock.json");
  await assertNoSymlink(resolvedRoot, "generated-references.lock.json");
  const lock = expectedLock(plan);
  const lockSource = `${JSON.stringify(lock, null, 2)}\n`;
  let previousLockSource: string | undefined;
  try {
    previousLockSource = await readFile(lockFile, "utf8");
    const previousLock = parseLock(previousLockSource);
    const expectedDestinations = new Set(lock.copies.map((copy) => copy.destination));
    const removed = previousLock.copies
      .map((copy) => copy.destination)
      .filter((destination) => !expectedDestinations.has(destination));
    if (removed.length > 0)
      throw new Error(
        `manifest removes generated destinations; explicit migration required: ${removed.join(", ")}`,
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (mode === "check" && previousLockSource !== lockSource)
    throw new Error("generated-reference lock drift");
  let identical = 0;
  const changed: PlannedCopy[] = [];
  for (const copy of plan) {
    try {
      if ((await readFile(resolveInside(resolvedRoot, copy.destination))).equals(copy.content)) {
        identical += 1;
        continue;
      }
    } catch {
      // Missing destinations are generated in write mode and fail check mode.
    }
    changed.push(copy);
  }
  if (mode === "check" && changed.length > 0)
    throw new Error(`generated-reference drift: ${changed.map((copy) => copy.destination).join(", ")}`);

  const writes: PlannedWrite[] = [...changed];
  if (mode === "write" && previousLockSource !== lockSource)
    writes.push({
      source: "generated-references.json",
      destination: "generated-references.lock.json",
      content: lockSource,
    });

  const transaction = `${process.pid}`;
  const staged = writes.map((copy) => ({
    ...copy,
    file: resolveInside(resolvedRoot, copy.destination),
    temporary: `${resolveInside(resolvedRoot, copy.destination)}.generated-${transaction}.next`,
    restore: `${resolveInside(resolvedRoot, copy.destination)}.generated-${transaction}.restore`,
  }));
  const createdDirectories: string[] = [];
  const installed: Array<(typeof staged)[number] & { hadOriginal: boolean }> = [];
  try {
    for (const copy of staged) {
      const directory = path.dirname(copy.file);
      if (!(await exists(directory))) {
        await mkdir(directory, { recursive: true });
        createdDirectories.push(directory);
      }
      if ((await exists(copy.temporary)) || (await exists(copy.restore)))
        throw new Error(`stale generated-reference transaction beside ${copy.destination}`);
      await io.writeFile(copy.temporary, copy.content, { flag: "wx" });
    }
    for (const copy of staged) {
      const hadOriginal = await exists(copy.file);
      if (hadOriginal) await io.rename(copy.file, copy.restore);
      try {
        await io.rename(copy.temporary, copy.file);
      } catch (error) {
        if (hadOriginal) await io.rename(copy.restore, copy.file);
        throw error;
      }
      installed.push({ ...copy, hadOriginal });
    }
  } catch (error) {
    const rollbackErrors: unknown[] = [];
    for (const copy of installed.reverse()) {
      try {
        await io.rm(copy.file, { force: true });
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
      if (copy.hadOriginal) {
        try {
          await io.rename(copy.restore, copy.file);
        } catch (rollbackError) {
          rollbackErrors.push(rollbackError);
        }
      }
    }
    if (rollbackErrors.length > 0)
      throw new AggregateError(
        [error, ...rollbackErrors],
        "generated-reference install failed and rollback needs recovery from retained .restore files",
      );
    throw error;
  } finally {
    for (const copy of staged) {
      await io.rm(copy.temporary, { force: true });
    }
    for (const directory of createdDirectories.reverse()) {
      try {
        await rmdir(directory);
      } catch {
        // Nonempty or concurrently owned directories remain.
      }
    }
  }

  const cleanupErrors: unknown[] = [];
  for (const copy of installed) {
    try {
      await io.rm(copy.restore, { force: true });
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  if (cleanupErrors.length > 0)
    throw new AggregateError(
      cleanupErrors,
      "generated-reference install committed but retained .restore files need cleanup",
    );

  return {
    schema: receiptSchema,
    mode,
    sources: (await canonicalSources(resolvedRoot)).length,
    destinations: plan.length,
    byte_identical: mode === "check" ? identical : identical + changed.length,
    written: mode === "write" ? changed.length : 0,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || (args[0] !== "--check" && args[0] !== "--write")) {
    console.error(
      JSON.stringify({ schema: receiptSchema, error: "usage: generate-references.ts --check|--write" }),
    );
    process.exit(1);
  }
  try {
    console.log(
      JSON.stringify(
        await generateReferences(path.resolve(import.meta.dir, ".."), args[0].slice(2) as "check" | "write"),
      ),
    );
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
