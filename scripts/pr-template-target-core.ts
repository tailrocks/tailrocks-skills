import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath, rmdir } from "node:fs/promises";
import path from "node:path";

import { atomicRecoveryArtifacts, atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";
import { runBoundedCommand } from "./bounded-command";
import { resolveExecutable } from "./resolve-executable";

export const requestSchema = "tailrocks.pr-template-target-request/v1" as const;
export const receiptSchema = "tailrocks.pr-template-target/v1" as const;

interface Resolution {
  readonly target: string;
  readonly disposition: "CREATE" | "UPDATE";
  readonly before_sha256: string | null;
  readonly parent_existed: boolean;
  readonly parent_node: NodeIdentity | null;
  readonly target_node: NodeIdentity | null;
}

interface NodeIdentity {
  readonly dev: number;
  readonly ino: number;
}

interface Runtime {
  readonly atomic?: AtomicFileRuntime;
  readonly afterResolve?: (resolution: Resolution) => Promise<void>;
  readonly afterDirectoryCreate?: (directory: string) => Promise<void>;
}

export class PrTemplateTargetFailure extends AggregateError {
  constructor(
    errors: readonly unknown[],
    readonly mutations: readonly string[],
    readonly recoveryArtifacts: readonly string[],
  ) {
    super(errors, errors[0] instanceof Error ? errors[0].message : "PR-template transaction failed");
  }
}

const supportedParents = ["", "docs", ".github"] as const;
const headPattern = /^[a-f0-9]{40}$/;

function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

async function safeFileSnapshot(
  target: string,
  relative: string,
): Promise<{ sha256: string; node: NodeIdentity }> {
  const before = await lstat(target);
  if (!before.isFile() || before.isSymbolicLink() || (await realpath(target)) !== target)
    throw new Error(`template target is unsafe: ${relative}`);
  const body = await readFile(target);
  const after = await lstat(target);
  if (
    !after.isFile() ||
    after.isSymbolicLink() ||
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs
  )
    throw new Error(`template target changed while reading: ${relative}`);
  return { sha256: digest(body), node: { dev: before.dev, ino: before.ino } };
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} is invalid`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index]))
    throw new Error(`${label} has unknown or missing fields`);
}

async function safeRoot(
  rawRoot: unknown,
  rawHead: unknown,
  expectedIdentity?: unknown,
): Promise<{ root: string; head: string; root_identity: string }> {
  if (typeof rawRoot !== "string" || !path.isAbsolute(rawRoot) || (await realpath(rawRoot)) !== rawRoot)
    throw new Error("root must be canonical absolute");
  const rootInfo = await lstat(rawRoot);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error("root is unsafe");
  const rootIdentity = nodeToken({ dev: rootInfo.dev, ino: rootInfo.ino });
  if (expectedIdentity !== undefined && expectedIdentity !== rootIdentity)
    throw new Error("repository root identity changed");
  if (typeof rawHead !== "string" || !headPattern.test(rawHead)) throw new Error("expected_head is invalid");
  const environment = {
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_TERMINAL_PROMPT: "0",
    LANG: "C.UTF-8",
    PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
  };
  const git = await resolveExecutable("git");
  const top = await runBoundedCommand({
    command: [git, "-c", "core.fsmonitor=false", "rev-parse", "--show-toplevel"],
    cwd: rawRoot,
    env: environment,
    inheritEnvironment: false,
  });
  const head = await runBoundedCommand({
    command: [git, "-c", "core.fsmonitor=false", "rev-parse", "HEAD"],
    cwd: rawRoot,
    env: environment,
    inheritEnvironment: false,
  });
  if (top.code !== 0 || top.stdout.trim() !== rawRoot || head.code !== 0 || head.stdout.trim() !== rawHead)
    throw new Error("repository identity changed");
  return { root: rawRoot, head: rawHead, root_identity: rootIdentity };
}

async function safeDirectory(
  root: string,
  relative: string,
): Promise<{ absolute: string; node: NodeIdentity } | null> {
  const absolute = relative ? path.join(root, relative) : root;
  try {
    const info = await lstat(absolute);
    if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
      throw new Error(`template parent is unsafe: ${relative || "."}`);
    return { absolute, node: { dev: info.dev, ino: info.ino } };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" && relative) return null;
    throw error;
  }
}

async function resolveTarget(root: string): Promise<Resolution> {
  const candidates: {
    relative: string;
    sha256: string;
    parent: NodeIdentity;
    target: NodeIdentity;
  }[] = [];
  const multiTemplateDirectories: string[] = [];
  let githubParentExists = false;
  for (const parent of supportedParents) {
    const directory = await safeDirectory(root, parent);
    if (!directory) continue;
    const { absolute } = directory;
    if (parent === ".github") githubParentExists = true;
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries) {
      const lower = entry.name.toLowerCase();
      const relative = parent ? `${parent}/${entry.name}` : entry.name;
      if (parent === ".github" && lower === "pull_request_template") {
        if (!entry.isDirectory()) throw new Error(`template directory is unsafe: ${relative}`);
        const directory = path.join(root, relative);
        const info = await lstat(directory);
        if (info.isSymbolicLink() || (await realpath(directory)) !== directory)
          throw new Error(`template directory is unsafe: ${relative}`);
        const children = await readdir(directory, { withFileTypes: true });
        let supported = 0;
        for (const child of children) {
          if (!/\.md$/i.test(child.name)) continue;
          const childRelative = `${relative}/${child.name}`;
          const childTarget = path.join(root, childRelative);
          const childSnapshot = await safeFileSnapshot(childTarget, childRelative);
          candidates.push({
            relative: childRelative,
            sha256: childSnapshot.sha256,
            parent: { dev: info.dev, ino: info.ino },
            target: childSnapshot.node,
          });
          supported += 1;
        }
        if (supported === 0) multiTemplateDirectories.push(relative);
        continue;
      }
      if (lower !== "pull_request_template.md") continue;
      const target = path.join(root, relative);
      const snapshot = await safeFileSnapshot(target, relative);
      candidates.push({
        relative,
        sha256: snapshot.sha256,
        parent: directory.node,
        target: snapshot.node,
      });
    }
  }
  candidates.sort((left, right) => left.relative.localeCompare(right.relative, "en"));
  if (candidates.length > 1)
    throw new Error(
      `ambiguous pull request templates: ${candidates.map((item) => item.relative).join(", ")}`,
    );
  if (candidates.length === 1)
    return {
      target: candidates[0]!.relative,
      disposition: "UPDATE",
      before_sha256: candidates[0]!.sha256,
      parent_existed: true,
      parent_node: candidates[0]!.parent,
      target_node: candidates[0]!.target,
    };
  if (multiTemplateDirectories.length)
    throw new Error(
      `multiple-template layout has no sole default: ${multiTemplateDirectories.sort().join(", ")}`,
    );
  return {
    target: ".github/PULL_REQUEST_TEMPLATE.md",
    disposition: "CREATE",
    before_sha256: null,
    parent_existed: githubParentExists,
    parent_node: githubParentExists ? (await safeDirectory(root, ".github"))!.node : null,
    target_node: null,
  };
}

function sameNode(left: NodeIdentity | null, right: NodeIdentity | null): boolean {
  return left === null ? right === null : right !== null && left.dev === right.dev && left.ino === right.ino;
}

function nodeToken(node: NodeIdentity): string {
  return `${node.dev}:${node.ino}`;
}

function sameResolution(left: Resolution, right: Resolution): boolean {
  return (
    left.target === right.target &&
    left.disposition === right.disposition &&
    left.before_sha256 === right.before_sha256 &&
    left.parent_existed === right.parent_existed &&
    sameNode(left.parent_node, right.parent_node) &&
    sameNode(left.target_node, right.target_node)
  );
}

function publicResolution(resolution: Resolution): Record<string, unknown> {
  return {
    target: resolution.target,
    disposition: resolution.disposition,
    before_sha256: resolution.before_sha256,
    parent_existed: resolution.parent_existed,
  };
}

function resolutionBinding(rootIdentity: string, resolution: Resolution): string {
  return digest(
    JSON.stringify([
      rootIdentity,
      resolution.target,
      resolution.disposition,
      resolution.before_sha256,
      resolution.parent_existed,
      resolution.parent_node ? nodeToken(resolution.parent_node) : null,
      resolution.target_node ? nodeToken(resolution.target_node) : null,
    ]),
  );
}

async function removeOwnedDirectory(directory: string, dev: number, ino: number): Promise<string[]> {
  try {
    const current = await lstat(directory);
    if (!current.isDirectory() || current.isSymbolicLink() || current.dev !== dev || current.ino !== ino)
      return [directory];
    await rmdir(directory);
    return [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    return [directory];
  }
}

export async function runPrTemplateTarget(
  raw: unknown,
  runtime: Runtime = {},
): Promise<Record<string, unknown>> {
  const request = object(raw, "request");
  if (request.operation === "resolve") {
    exactKeys(request, ["schema", "operation", "root", "expected_head"], "request");
    if (request.schema !== requestSchema) throw new Error("request schema is invalid");
    const binding = await safeRoot(request.root, request.expected_head);
    const resolution = await resolveTarget(binding.root);
    await safeRoot(binding.root, binding.head, binding.root_identity);
    return {
      schema: receiptSchema,
      operation: "resolve",
      outcome: "RESOLVED",
      ...binding,
      ...publicResolution(resolution),
      resolution_binding: resolutionBinding(binding.root_identity, resolution),
      mutations: [],
    };
  }
  if (request.operation !== "publish") throw new Error("operation is invalid");
  exactKeys(
    request,
    [
      "schema",
      "operation",
      "root",
      "expected_head",
      "resolution_binding",
      "target",
      "before_sha256",
      "parent_existed",
      "content",
      "content_sha256",
    ],
    "request",
  );
  if (request.schema !== requestSchema) throw new Error("request schema is invalid");
  if (
    typeof request.content !== "string" ||
    !request.content ||
    request.content.includes("\0") ||
    request.content.length > 1_000_000
  )
    throw new Error("content is invalid");
  if (typeof request.content_sha256 !== "string" || digest(request.content) !== request.content_sha256)
    throw new Error("content digest is invalid");
  const baseTemplate = await readFile(
    path.join(import.meta.dir, "../skills/tailrocks-pr-template/references/PULL_REQUEST_TEMPLATE.md"),
    "utf8",
  );
  if (request.content === baseTemplate) throw new Error("untailored base template is invalid");
  const executableFences = [
    ...request.content.matchAll(/```(?:sh|bash|shell|zsh|console|terminal)\s*\n([\s\S]*?)```/gi),
  ];
  if (executableFences.some((match) => /<[A-Za-z][^>\n]*>/.test(match[1]!)))
    throw new Error("executable fence contains a placeholder command");
  const binding = await safeRoot(request.root, request.expected_head);
  const resolution = await resolveTarget(binding.root);
  if (
    request.resolution_binding !== resolutionBinding(binding.root_identity, resolution) ||
    request.target !== resolution.target ||
    request.before_sha256 !== resolution.before_sha256 ||
    request.parent_existed !== resolution.parent_existed ||
    (request.before_sha256 !== null && typeof request.before_sha256 !== "string")
  )
    throw new Error("target resolution changed");
  await runtime.afterResolve?.(resolution);
  const current = await resolveTarget(binding.root);
  if (!sameResolution(current, resolution)) throw new Error("target resolution changed before publication");
  await safeRoot(binding.root, binding.head, binding.root_identity);
  if (resolution.before_sha256 === request.content_sha256)
    return {
      schema: receiptSchema,
      operation: "publish",
      outcome: "UNCHANGED",
      ...binding,
      ...publicResolution(resolution),
      content_sha256: request.content_sha256,
      mutations: [],
      recovery_artifacts: [],
    };
  let createdDirectory: { path: string; dev: number; ino: number } | null = null;
  let publicationStarted = false;
  const parent = path.dirname(path.join(binding.root, resolution.target));
  try {
    let parentNode = resolution.parent_node;
    if (!(await safeDirectory(binding.root, path.relative(binding.root, parent)))) {
      await mkdir(parent);
      const info = await lstat(parent);
      if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(parent)) !== parent)
        throw new Error("created template parent is unsafe");
      createdDirectory = { path: parent, dev: info.dev, ino: info.ino };
      parentNode = { dev: info.dev, ino: info.ino };
      await runtime.afterDirectoryCreate?.(parent);
      const afterCreate = await lstat(parent);
      if (
        !afterCreate.isDirectory() ||
        afterCreate.isSymbolicLink() ||
        afterCreate.dev !== parentNode.dev ||
        afterCreate.ino !== parentNode.ino
      )
        throw new Error("created template parent changed");
    }
    const expected =
      resolution.before_sha256 === null ? null : await readFile(path.join(binding.root, resolution.target));
    if (expected !== null && digest(expected) !== resolution.before_sha256)
      throw new Error("target changed before publication");
    const callerAtomic = runtime.atomic ?? {};
    await atomicWriteFiles(
      [
        {
          file: path.join(binding.root, resolution.target),
          expected,
          expectedNode: resolution.target_node ?? undefined,
          content: request.content,
        },
      ],
      {
        ...callerAtomic,
        beforeAnchorSpawn: async (directory) => {
          const info = await lstat(directory);
          if (
            !parentNode ||
            !info.isDirectory() ||
            info.isSymbolicLink() ||
            info.dev !== parentNode.dev ||
            info.ino !== parentNode.ino
          )
            throw new Error("template parent changed before publication");
          await callerAtomic.beforeAnchorSpawn?.(directory);
        },
        afterPublish: async (file, index) => {
          publicationStarted = true;
          await callerAtomic.afterPublish?.(file, index);
          const finalResolution = await resolveTarget(binding.root);
          if (
            finalResolution.target !== resolution.target ||
            finalResolution.before_sha256 !== request.content_sha256 ||
            finalResolution.disposition !== "UPDATE" ||
            !sameNode(finalResolution.parent_node, parentNode)
          )
            throw new Error("published target proof failed");
          await safeRoot(binding.root, binding.head, binding.root_identity);
        },
      },
    );
    return {
      schema: receiptSchema,
      operation: "publish",
      outcome: "PUBLISHED",
      ...binding,
      target: resolution.target,
      before_sha256: resolution.before_sha256,
      content_sha256: request.content_sha256,
      mutations: [resolution.target],
      recovery_artifacts: [],
    };
  } catch (error) {
    const recovery = [
      ...atomicRecoveryArtifacts(error),
      ...(createdDirectory
        ? await removeOwnedDirectory(createdDirectory.path, createdDirectory.dev, createdDirectory.ino)
        : []),
    ];
    const artifacts = [...new Set(recovery)].sort();
    throw new PrTemplateTargetFailure(
      [error],
      publicationStarted && artifacts.length ? [resolution.target] : [],
      artifacts,
    );
  }
}
