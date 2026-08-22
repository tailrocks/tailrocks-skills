import { createHash } from "node:crypto";
import { access, lstat, mkdir, readFile, readdir, realpath, rmdir } from "node:fs/promises";
import path from "node:path";

import { atomicRecoveryArtifacts, atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";

type Entry = { source: string; destinations: string[] };
type Manifest = { $schema: "tailrocks.generated-references/v1"; entries: Entry[] };
type PlannedCopy = { source: string; destination: string; content: Buffer };
type PlannedWrite = { source: string; destination: string; content: string | Uint8Array };
type LockCopy = { source: string; destination: string; sha256: string };
type ReferenceLock = { $schema: "tailrocks.generated-references-lock/v1"; copies: LockCopy[] };

export type GeneratorReceipt = {
  schema: "tailrocks.generated-references-receipt/v1";
  mode: "check" | "write";
  sources: number;
  destinations: number;
  byte_identical: number;
  written: number;
  mutations: string[];
};

const manifestSchema = "tailrocks.generated-references/v1";
const receiptSchema = "tailrocks.generated-references-receipt/v1";
const lockSchema = "tailrocks.generated-references-lock/v1";
const rootSourcePattern = /^(?:shared|skill-authoring)\/references\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const generatedFamilies = [
  {
    owner: "tailrocks-axum-best-practices",
    references: [
      "architecture-and-state.md",
      "extractors-and-errors.md",
      "lifecycle-and-testing.md",
      "middleware-and-security.md",
    ],
    destinations: ["tailrocks-axum-refactor", "tailrocks-axum-review"],
  },
  {
    owner: "tailrocks-graphql-best-practices",
    references: ["client-tanstack.md", "contract-gates.md", "schema-design.md", "server-rust.md"],
    destinations: ["tailrocks-graphql-review"],
  },
  {
    owner: "tailrocks-rust-best-practices",
    references: [
      "api-design.md",
      "errors-testing-docs.md",
      "ownership-performance.md",
      "readability-style-architecture.md",
      "tooling-lints.md",
    ],
    destinations: ["tailrocks-rust-refactor", "tailrocks-rust-review"],
  },
  {
    owner: "tailrocks-rust-project-setup",
    references: [
      "lints-clippy-rustfmt.md",
      "supply-chain-and-testing.md",
      "toolchain-and-mise.md",
      "version-policy.md",
      "workspace-and-layout.md",
    ],
    destinations: ["tailrocks-rust-project-audit", "tailrocks-rust-project-remediate"],
  },
] as const;
const familySources = generatedFamilies.flatMap((family) =>
  family.references.map((name) => `skills/${family.owner}/references/${name}`),
);
export function isGeneratedReferenceSource(source: string): boolean {
  return rootSourcePattern.test(source) || familySources.includes(source);
}
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
      !isGeneratedReferenceSource(copy.source) ||
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

async function loadPlan(
  root: string,
  manifestFile: string,
): Promise<{ plan: PlannedCopy[]; sourceCount: number }> {
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
    if (typeof entry.source !== "string" || !isGeneratedReferenceSource(entry.source))
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
  const rootSources = sources.filter((source) => !source.startsWith("skills/"));
  if (rootSources.join("\n") !== discoveredSources.join("\n"))
    throw new Error("manifest sources must exactly cover canonical reference files");
  const ownerSources = sources.filter((source) => source.startsWith("skills/"));
  const expectedOwnerSources: string[] = [];
  for (const family of generatedFamilies) {
    const ownerPresent = await exists(path.join(root, "skills", family.owner, "SKILL.md"));
    if (!ownerPresent) {
      if (ownerSources.some((source) => source.startsWith(`skills/${family.owner}/`)))
        throw new Error(`generated-reference source owner is missing: ${family.owner}`);
      continue;
    }
    for (const name of family.references) {
      const source = `skills/${family.owner}/references/${name}`;
      expectedOwnerSources.push(source);
      const expected = family.destinations.map((destination) => `skills/${destination}/references/${name}`);
      const actual = manifest.entries.find((entry) => entry.source === source)?.destinations;
      if (actual?.join("\n") !== expected.join("\n"))
        throw new Error(`${source} must copy exactly to ${family.destinations.join(" and ")}`);
    }
  }
  expectedOwnerSources.sort(compareCodeUnits);
  if (ownerSources.join("\n") !== expectedOwnerSources.join("\n"))
    throw new Error("manifest must exactly cover active generated-reference owner families");

  const destinations = manifest.entries.flatMap((entry) => entry.destinations);
  if (new Set(destinations).size !== destinations.length)
    throw new Error("generated-reference destinations must be unique");
  const caseFolded = destinations.map((destination) => destination.toLowerCase());
  if (new Set(caseFolded).size !== caseFolded.length)
    throw new Error("generated-reference destinations must be case-fold unique");
  if (sources.some((source) => destinations.includes(source)))
    throw new Error("generated-reference sources cannot also be destinations");
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
    if (entry.source.startsWith("skills/")) {
      const owner = entry.source.split("/")[1]!;
      if (!(await exists(path.join(root, "skills", owner, "SKILL.md"))))
        throw new Error(`generated-reference source owner is missing: ${owner}`);
    }
    const content = await readFile(sourceFile);
    for (const destination of entry.destinations) {
      await assertNoSymlink(root, destination);
      const skill = destination.split("/")[1]!;
      if (!(await exists(path.join(root, "skills", skill, "SKILL.md"))))
        throw new Error(`generated-reference destination skill is missing: ${skill}`);
      plan.push({ source: entry.source, destination, content });
    }
  }
  return { plan, sourceCount: sources.length };
}

export async function generateReferences(
  root: string,
  mode: "check" | "write",
  manifestPath = "generated-references.json",
  runtime: AtomicFileRuntime = {},
): Promise<GeneratorReceipt> {
  const resolvedRoot = await realpath(path.resolve(root));
  const manifestFile = resolveInside(resolvedRoot, manifestPath);
  await assertNoSymlink(resolvedRoot, manifestPath);
  const { plan, sourceCount } = await loadPlan(resolvedRoot, manifestFile);
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

  const createdDirectories: string[] = [];
  try {
    for (const copy of writes) {
      const directory = path.dirname(resolveInside(resolvedRoot, copy.destination));
      if (!(await exists(directory))) {
        await mkdir(directory, { recursive: true });
        createdDirectories.push(directory);
      }
    }
    const transactionWrites = [];
    for (const copy of writes) {
      const file = resolveInside(resolvedRoot, copy.destination);
      let expected: Buffer | null = null;
      try {
        expected = await readFile(file);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      transactionWrites.push({ file, expected, content: copy.content });
    }
    await atomicWriteFiles(transactionWrites, runtime);
  } finally {
    for (const directory of createdDirectories.reverse()) {
      try {
        await rmdir(directory);
      } catch {
        // Nonempty or concurrently owned directories remain.
      }
    }
  }

  return {
    schema: receiptSchema,
    mode,
    sources: sourceCount,
    destinations: plan.length,
    byte_identical: mode === "check" ? identical : identical + changed.length,
    written: mode === "write" ? changed.length : 0,
    mutations: mode === "write" ? writes.map((write) => write.destination) : [],
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || (args[0] !== "--check" && args[0] !== "--write")) {
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: "refused",
        code: "invalid_arguments",
        mutations: [],
        detail: "usage: generate-references.ts --check|--write",
      }),
    );
    process.exit(2);
  }
  try {
    const mode = args[0].slice(2) as "check" | "write";
    const receipt = await generateReferences(path.resolve(import.meta.dir, ".."), mode);
    console.log(
      JSON.stringify({
        ...receipt,
        outcome: "success",
        code: mode === "check" ? "checked" : "written",
        recovery_artifacts: [],
        detail: `${receipt.byte_identical} destinations are byte-identical`,
      }),
    );
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: "failed",
        code: "generation_failed",
        mutations: [],
        recovery_artifacts: atomicRecoveryArtifacts(error),
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(1);
  }
}
