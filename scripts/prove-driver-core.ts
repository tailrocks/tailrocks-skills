import { createHash, randomUUID } from "node:crypto";
import {
  chmod,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  realpath,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand, type BoundedCommandResult } from "./bounded-command";
import { resolveExecutable } from "./resolve-executable";

export const proveDriverInputSchema = "tailrocks.prove-driver-input/v1" as const;
export const proveDriverReceiptSchema = "tailrocks.prove-driver/v1" as const;
const sessionSchema = "tailrocks.prove-session/v1" as const;
const applicationProtocolSchema = "tailrocks.prove-application/v1" as const;
const browserProtocolSchema = "tailrocks.prove-browser/v1" as const;
let gitExecutable: Promise<string> | undefined;
const git = (): Promise<string> => (gitExecutable ??= resolveExecutable("git"));
const sha256Pattern = /^[a-f0-9]{64}$/;
const headPattern = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/;
const maximumInventory = 256;

type Capability = "CLI" | "APPLICATION" | "BROWSER";
type EffectAuthority = "READ_ONLY" | "WORKSPACE_WRITE";
const reservedEnvironment = new Set(["PATH", "HOME", "TMPDIR", "LANG", "LC_ALL"]);

interface InventoryRow {
  readonly id: string;
  readonly capability: Capability;
  readonly claims: readonly string[];
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly stdin: string | null;
  readonly timeout_ms: number;
  readonly maximum_output_bytes: number;
  readonly effect_authority: EffectAuthority;
  readonly artifacts: readonly string[];
  readonly env_names: readonly string[];
}

interface SessionManifest {
  readonly schema: typeof sessionSchema;
  readonly token: string;
  readonly root: string;
  readonly root_identity: string;
  readonly head: string;
  readonly status_sha256: string;
  readonly root_snapshot_sha256: string;
  readonly workspace: string;
  readonly owner_identity: string;
  readonly workspace_identity: string;
  readonly inventory_sha256: string;
  readonly inventory: readonly InventoryRow[];
  readonly prepared_artifacts: readonly ArtifactHash[];
  readonly build: CommandFact | null;
  readonly prepared_snapshot_sha256: string;
}

interface ArtifactHash {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

interface CommandFact {
  readonly outcome: "EXECUTED" | "FAILED";
  readonly argv: readonly string[];
  readonly executable: ArtifactHash;
  readonly exit_code: number;
  readonly timed_out: boolean;
  readonly saturated: boolean;
  readonly duration_ms: number;
  readonly stdout: { readonly bytes: number; readonly sha256: string };
  readonly stderr: { readonly bytes: number; readonly sha256: string };
}

interface RunReceipt {
  readonly schema: typeof proveDriverReceiptSchema;
  readonly operation: "run";
  readonly outcome: "EXECUTED" | "NOT_EXECUTED" | "FAILED";
  readonly session_token: string;
  readonly root: string;
  readonly root_identity: string;
  readonly head: string;
  readonly status_sha256: string;
  readonly root_snapshot_sha256: string;
  readonly inventory_sha256: string;
  readonly row_id: string;
  readonly capability: Capability;
  readonly claims: readonly string[];
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly stdin_sha256: string | null;
  readonly env_names: readonly string[];
  readonly environment_sha256: string;
  readonly effect_authority: EffectAuthority;
  readonly command_sha256: string;
  readonly executable: ArtifactHash | null;
  readonly exit_code: number | null;
  readonly timed_out: boolean;
  readonly saturated: boolean;
  readonly duration_ms: number;
  readonly stdout: { readonly bytes: number; readonly sha256: string };
  readonly stderr: { readonly bytes: number; readonly sha256: string };
  readonly decisive_line: {
    readonly stream: "stdout" | "stderr";
    readonly index: number;
    readonly text: string;
    readonly sha256: string;
  } | null;
  readonly artifacts: readonly ArtifactHash[];
  readonly adapter: Record<string, unknown> | null;
  readonly workspace_status_sha256: string;
  readonly workspace_snapshot_before: string;
  readonly workspace_snapshot_after: string;
  readonly runtime_snapshot_sha256: string;
  readonly mutations: readonly string[];
  readonly recovery: readonly string[];
  readonly detail: string;
  readonly receipt_path: string;
  readonly receipt_sha256: string;
}

function hash(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}
function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}
function exact(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort(),
    wanted = [...keys].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index]))
    throw new Error(`${label} has unknown or missing fields`);
}
function text(value: unknown, label: string, maximum = 4096): string {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    !value ||
    Buffer.byteLength(value) > maximum ||
    /[\0\r\n]/.test(value)
  )
    throw new Error(`${label} is invalid`);
  return value;
}
function list(value: unknown, label: string, maximum = 128): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > maximum)
    throw new Error(`${label} is invalid`);
  const result = value.map((entry, index) => text(entry, `${label}[${index}]`));
  if (new Set(result).size !== result.length) throw new Error(`${label} must be unique`);
  return result;
}
function argv(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 128)
    throw new Error(`${label} is invalid`);
  return value.map((entry, index) => text(entry, `${label}[${index}]`));
}
function boundedInteger(value: unknown, label: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum)
    throw new Error(`${label} is invalid`);
  return value as number;
}
function relative(value: unknown, label: string): string {
  const result = text(value, label);
  if (
    path.isAbsolute(result) ||
    result === ".." ||
    result.startsWith("../") ||
    result.split(path.sep).includes("..")
  )
    throw new Error(`${label} escaped workspace`);
  return result;
}
function parseRow(raw: unknown, index: number): InventoryRow {
  const row = object(raw, `inventory[${index}]`);
  exact(
    row,
    [
      "id",
      "capability",
      "claims",
      "argv",
      "cwd",
      "stdin",
      "timeout_ms",
      "maximum_output_bytes",
      "effect_authority",
      "artifacts",
      "env_names",
    ],
    `inventory[${index}]`,
  );
  const id = text(row.id, `inventory[${index}].id`, 64);
  if (
    !/^[A-Z][A-Z0-9_-]{0,63}$/.test(id) ||
    !["CLI", "APPLICATION", "BROWSER"].includes(row.capability as string) ||
    !["READ_ONLY", "WORKSPACE_WRITE"].includes(row.effect_authority as string)
  )
    throw new Error(`inventory[${index}] identity is invalid`);
  if (row.stdin !== null && (typeof row.stdin !== "string" || Buffer.byteLength(row.stdin) > 1_000_000))
    throw new Error(`inventory[${index}].stdin is invalid`);
  const artifacts = Array.isArray(row.artifacts)
    ? row.artifacts.map((entry, artifactIndex) =>
        relative(entry, `inventory[${index}].artifacts[${artifactIndex}]`),
      )
    : [];
  if (artifacts.length > 128 || new Set(artifacts).size !== artifacts.length)
    throw new Error(`inventory[${index}].artifacts is invalid`);
  const envNames = Array.isArray(row.env_names)
    ? row.env_names.map((entry, envIndex) => text(entry, `inventory[${index}].env_names[${envIndex}]`))
    : [];
  if (
    envNames.length > 64 ||
    new Set(envNames).size !== envNames.length ||
    envNames.some(
      (name) => !/^[A-Z_][A-Z0-9_]*$/.test(name) || reservedEnvironment.has(name) || name.startsWith("GIT_"),
    )
  )
    throw new Error(`inventory[${index}].env_names is invalid`);
  return {
    id,
    capability: row.capability as Capability,
    claims: list(row.claims, `inventory[${index}].claims`),
    argv: argv(row.argv, `inventory[${index}].argv`),
    cwd: relative(row.cwd, `inventory[${index}].cwd`),
    stdin: row.stdin as string | null,
    timeout_ms: boundedInteger(row.timeout_ms, `inventory[${index}].timeout_ms`, 100, 300_000),
    maximum_output_bytes: boundedInteger(
      row.maximum_output_bytes,
      `inventory[${index}].maximum_output_bytes`,
      1,
      10_000_000,
    ),
    effect_authority: row.effect_authority as EffectAuthority,
    artifacts,
    env_names: envNames,
  };
}

const scrubbedEnvironment = (allowed: readonly string[] = []): Record<string, string> => {
  const environment: Record<string, string> = {
    PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
    HOME: "",
    TMPDIR: "",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_OPTIONAL_LOCKS: "0",
  };
  for (const name of allowed) if (process.env[name] !== undefined) environment[name] = process.env[name]!;
  return environment;
};
async function command(
  command: readonly string[],
  cwd: string,
  timeout = 30_000,
  maximumOutput = 1_000_000,
  stdin?: string,
  envNames: readonly string[] = [],
  ownedEnvironment: Readonly<Record<string, string>> = {},
): Promise<BoundedCommandResult> {
  return runBoundedCommand({
    command,
    cwd,
    stdin,
    timeoutMilliseconds: timeout,
    maximumOutputBytes: maximumOutput,
    killGraceMilliseconds: 2_000,
    env: { ...scrubbedEnvironment(envNames), ...ownedEnvironment },
    inheritEnvironment: false,
  });
}
async function canonicalRoot(
  raw: unknown,
  rawHead: unknown,
  rawStatus: unknown,
  rawIdentity?: unknown,
): Promise<{ root: string; root_identity: string; head: string; status: string }> {
  const root = text(raw, "root"),
    expectedHead = text(rawHead, "head", 64),
    expectedStatus = text(rawStatus, "status_sha256", 64);
  if (
    !path.isAbsolute(root) ||
    (await realpath(root)) !== root ||
    !headPattern.test(expectedHead) ||
    !sha256Pattern.test(expectedStatus)
  )
    throw new Error("repository binding is invalid");
  const info = await lstat(root);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("repository root is unsafe");
  const rootIdentity = `${info.dev}:${info.ino}`;
  if (rawIdentity !== undefined && rawIdentity !== rootIdentity)
    throw new Error("repository root identity changed");
  const top = await command(
    [await git(), "-c", "core.hooksPath=/dev/null", "rev-parse", "--show-toplevel"],
    root,
  );
  const head = await command([await git(), "-c", "core.hooksPath=/dev/null", "rev-parse", "HEAD"], root);
  const status = await repositoryStatus(root);
  if (
    top.code !== 0 ||
    top.stdout.trim() !== root ||
    head.code !== 0 ||
    head.stdout.trim() !== expectedHead ||
    hash(status) !== expectedStatus
  )
    throw new Error("repository identity changed");
  return { root, root_identity: rootIdentity, head: expectedHead, status };
}
async function repositoryStatus(root: string): Promise<string> {
  const result = await command(
    [
      await git(),
      "-c",
      "core.hooksPath=/dev/null",
      "-c",
      "core.fsmonitor=false",
      "-c",
      "core.attributesFile=/dev/null",
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ],
    root,
  );
  if (result.code !== 0 || result.timedOut || result.saturated) throw new Error("repository status failed");
  return result.stdout;
}
async function filterOverrides(root: string): Promise<string[]> {
  const result = await command(
    [
      await git(),
      "config",
      "--local",
      "--no-includes",
      "--name-only",
      "--get-regexp",
      "^filter\\..*\\.(smudge|process|required)$",
    ],
    root,
  );
  if (result.timedOut || result.saturated || ![0, 1].includes(result.code))
    throw new Error("repository filter inventory failed");
  const keys = result.code === 1 ? [] : result.stdout.split(/\r?\n/).filter(Boolean);
  if (keys.some((key) => !/^filter\.[A-Za-z0-9_.-]+\.(smudge|process|required)$/.test(key)))
    throw new Error("repository filter inventory is unsafe");
  return keys.flatMap((key) => ["-c", `${key}=${key.endsWith(".required") ? "false" : ""}`]);
}
async function artifact(workspace: string, relativePath: string): Promise<ArtifactHash> {
  const absolute = path.join(workspace, relativePath),
    parent = await realpath(path.dirname(absolute));
  if (parent !== workspace && !parent.startsWith(`${workspace}${path.sep}`))
    throw new Error(`artifact escaped workspace: ${relativePath}`);
  const info = await lstat(absolute);
  if (!info.isFile() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
    throw new Error(`artifact is unsafe: ${relativePath}`);
  const bytes = await readFile(absolute);
  return { path: relativePath, bytes: bytes.byteLength, sha256: hash(bytes) };
}
async function workspaceIdentity(workspace: string): Promise<string> {
  const info = await lstat(workspace);
  return hash(`${await realpath(workspace)}\0${info.dev}\0${info.ino}`);
}
async function nodeIdentity(target: string): Promise<string> {
  const info = await lstat(target);
  return `${info.dev}:${info.ino}`;
}
async function treeSnapshot(
  root: string,
  excludedTopLevel: ReadonlySet<string> = new Set(),
): Promise<string> {
  const records: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (directory === root && excludedTopLevel.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name),
        relativePath = path.relative(root, absolute).split(path.sep).join("/");
      const info = await lstat(absolute);
      if (info.isSymbolicLink()) {
        records.push(`l\0${relativePath}\0${await readlink(absolute)}`);
      } else if (info.isDirectory()) {
        records.push(`d\0${relativePath}\0${info.mode & 0o777}`);
        await visit(absolute);
      } else if (info.isFile()) {
        const bytes = await readFile(absolute);
        records.push(`f\0${relativePath}\0${info.mode & 0o777}\0${bytes.byteLength}\0${hash(bytes)}`);
      } else {
        records.push(`o\0${relativePath}\0${info.mode}`);
      }
    }
  };
  await visit(root);
  return hash(records.join("\n"));
}
function environmentDigest(names: readonly string[]): string {
  return hash(
    JSON.stringify(
      [...names]
        .sort()
        .map((name) => ({ name, sha256: process.env[name] === undefined ? null : hash(process.env[name]!) })),
    ),
  );
}
async function persistReceipt(
  session: SessionManifest,
  fact: Omit<RunReceipt, "receipt_path" | "receipt_sha256">,
): Promise<RunReceipt> {
  const receipts = path.join(path.dirname(session.workspace), "receipts");
  await mkdir(receipts, { recursive: true, mode: 0o700 });
  const receiptPath = path.join(receipts, `${fact.row_id}.json`),
    bytes = `${JSON.stringify(fact)}\n`;
  await writeFile(receiptPath, bytes, { flag: "wx", mode: 0o600 });
  return { ...fact, receipt_path: receiptPath, receipt_sha256: hash(bytes) };
}
async function executableIdentity(workspace: string, cwd: string, value: string): Promise<ArtifactHash> {
  let absolute: string;
  if (value.includes("/")) absolute = path.isAbsolute(value) ? value : path.join(cwd, value);
  else {
    const found = await command(["/usr/bin/which", value], cwd);
    if (found.code !== 0) throw new Error("executable is unresolved");
    absolute = found.stdout.trim();
  }
  const canonical = await realpath(absolute),
    info = await lstat(canonical);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error("executable is unsafe");
  const bytes = await readFile(canonical);
  return {
    path: canonical.startsWith(`${workspace}${path.sep}`) ? path.relative(workspace, canonical) : canonical,
    bytes: bytes.byteLength,
    sha256: hash(bytes),
  };
}
async function safeCwd(workspace: string, value: string): Promise<string> {
  const resolved = await realpath(path.join(workspace, value));
  if (resolved !== workspace && !resolved.startsWith(`${workspace}${path.sep}`))
    throw new Error("cwd escaped workspace");
  return resolved;
}
async function writeManifest(manifestPath: string, manifest: SessionManifest): Promise<void> {
  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, { flag: "wx", mode: 0o600 });
  const info = await lstat(manifestPath);
  if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o777) !== 0o600)
    throw new Error("session manifest publication failed");
}
async function loadManifest(
  rawPath: unknown,
  rawDigest: unknown,
): Promise<{ path: string; manifest: SessionManifest }> {
  const manifestPath = text(rawPath, "session_manifest");
  if (
    !path.isAbsolute(manifestPath) ||
    !manifestPath.startsWith(`${await realpath(tmpdir())}${path.sep}tailrocks-prove-`)
  )
    throw new Error("session manifest path is not owned");
  const info = await lstat(manifestPath);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    (info.mode & 0o777) !== 0o600 ||
    (await realpath(manifestPath)) !== manifestPath
  )
    throw new Error("session manifest is unsafe");
  const manifestBytes = await readFile(manifestPath, "utf8");
  if (typeof rawDigest !== "string" || !sha256Pattern.test(rawDigest) || hash(manifestBytes) !== rawDigest)
    throw new Error("session manifest digest changed");
  const raw = JSON.parse(manifestBytes),
    value = object(raw, "session manifest");
  exact(
    value,
    [
      "schema",
      "token",
      "root",
      "root_identity",
      "head",
      "status_sha256",
      "root_snapshot_sha256",
      "workspace",
      "owner_identity",
      "workspace_identity",
      "inventory_sha256",
      "inventory",
      "prepared_artifacts",
      "build",
      "prepared_snapshot_sha256",
    ],
    "session manifest",
  );
  if (
    value.schema !== sessionSchema ||
    typeof value.token !== "string" ||
    !/^[a-f0-9-]{36}$/.test(value.token) ||
    !Array.isArray(value.inventory) ||
    !Array.isArray(value.prepared_artifacts) ||
    (value.build !== null && typeof value.build !== "object")
  )
    throw new Error("session manifest is invalid");
  const inventory = value.inventory.map(parseRow);
  if (new Set(inventory.map(({ id }) => id)).size !== inventory.length)
    throw new Error("session inventory ids are not unique");
  const manifest = { ...value, inventory } as unknown as SessionManifest;
  if (
    !path.isAbsolute(manifest.root) ||
    !/^\d+:\d+$/.test(manifest.root_identity) ||
    !headPattern.test(manifest.head) ||
    !sha256Pattern.test(manifest.status_sha256) ||
    !sha256Pattern.test(manifest.root_snapshot_sha256) ||
    !sha256Pattern.test(manifest.inventory_sha256) ||
    !sha256Pattern.test(manifest.prepared_snapshot_sha256) ||
    hash(JSON.stringify(inventory)) !== manifest.inventory_sha256 ||
    (await nodeIdentity(path.dirname(manifest.workspace))) !== manifest.owner_identity ||
    (await workspaceIdentity(manifest.workspace)) !== manifest.workspace_identity ||
    path.dirname(manifestPath) !== path.dirname(manifest.workspace)
  )
    throw new Error("session workspace identity changed");
  const cloneHead = await command([await git(), "rev-parse", "HEAD"], manifest.workspace),
    origin = await command([await git(), "remote", "get-url", "origin"], manifest.workspace);
  if (
    cloneHead.code !== 0 ||
    cloneHead.stdout.trim() !== manifest.head ||
    origin.code !== 0 ||
    origin.stdout.trim() !== manifest.root
  )
    throw new Error("session clone identity changed");
  if ((await treeSnapshot(manifest.workspace)) !== manifest.prepared_snapshot_sha256)
    throw new Error("prepared workspace changed");
  if ((await treeSnapshot(manifest.root, new Set([".git"]))) !== manifest.root_snapshot_sha256)
    throw new Error("repository byte snapshot changed");
  return { path: manifestPath, manifest };
}

async function prepare(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  exact(
    input,
    ["schema", "operation", "root", "head", "status_sha256", "inventory", "build_argv", "prepared_artifacts"],
    "input",
  );
  const binding = await canonicalRoot(input.root, input.head, input.status_sha256);
  const rootSnapshot = await treeSnapshot(binding.root, new Set([".git"]));
  if (
    !Array.isArray(input.inventory) ||
    input.inventory.length === 0 ||
    input.inventory.length > maximumInventory
  )
    throw new Error("inventory is invalid");
  const inventory = input.inventory.map(parseRow);
  if (new Set(inventory.map(({ id }) => id)).size !== inventory.length)
    throw new Error("inventory ids must be unique");
  const preparedPaths = Array.isArray(input.prepared_artifacts)
    ? input.prepared_artifacts.map((entry, index) => relative(entry, `prepared_artifacts[${index}]`))
    : [];
  if (preparedPaths.length > 128 || new Set(preparedPaths).size !== preparedPaths.length)
    throw new Error("prepared_artifacts is invalid");
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-prove-")));
  await chmod(parent, 0o700);
  const workspace = path.join(parent, "workspace"),
    template = path.join(parent, "template");
  await mkdir(template, { mode: 0o700 });
  try {
    const clone = await command(
      [
        await git(),
        "-c",
        "protocol.file.allow=always",
        "clone",
        "--quiet",
        "--local",
        "--no-hardlinks",
        "--no-checkout",
        "--template",
        template,
        binding.root,
        workspace,
      ],
      parent,
      120_000,
      2_000_000,
    );
    if (clone.code !== 0 || clone.timedOut || clone.saturated)
      throw new Error("exact-HEAD local clone failed");
    const checkout = await command(
      [
        await git(),
        ...(await filterOverrides(binding.root)),
        "-c",
        "filter.lfs.smudge=",
        "-c",
        "filter.lfs.process=",
        "-c",
        "filter.lfs.required=false",
        "-c",
        "core.hooksPath=/dev/null",
        "checkout",
        "--quiet",
        "--detach",
        binding.head,
      ],
      workspace,
      120_000,
      2_000_000,
    );
    if (checkout.code !== 0) throw new Error("exact-HEAD checkout failed");
    let build: CommandFact | null = null;
    if (input.build_argv !== null) {
      const buildArgv = argv(input.build_argv, "build_argv"),
        executable = await executableIdentity(workspace, workspace, buildArgv[0]!),
        buildRuntime = path.join(parent, "build-runtime"),
        buildHome = path.join(buildRuntime, "home"),
        buildTemporary = path.join(buildRuntime, "tmp");
      await mkdir(buildHome, { recursive: true, mode: 0o700 });
      await mkdir(buildTemporary, { recursive: true, mode: 0o700 });
      const started = performance.now(),
        result = await command(buildArgv, workspace, 300_000, 10_000_000, undefined, [], {
          HOME: buildHome,
          TMPDIR: buildTemporary,
        }),
        duration = Math.max(0, Math.round(performance.now() - started));
      build = {
        outcome: result.code === 0 && !result.timedOut && !result.saturated ? "EXECUTED" : "FAILED",
        argv: buildArgv,
        executable,
        exit_code: result.code,
        timed_out: result.timedOut,
        saturated: result.saturated,
        duration_ms: duration,
        stdout: { bytes: Buffer.byteLength(result.stdout), sha256: hash(result.stdout) },
        stderr: { bytes: Buffer.byteLength(result.stderr), sha256: hash(result.stderr) },
      };
    }
    const prepared =
      build?.outcome === "FAILED"
        ? []
        : await Promise.all(preparedPaths.map((entry) => artifact(workspace, entry)));
    const token = randomUUID(),
      manifestPath = path.join(parent, "session.json");
    const manifest: SessionManifest = {
      schema: sessionSchema,
      token,
      root: binding.root,
      root_identity: binding.root_identity,
      head: binding.head,
      status_sha256: input.status_sha256 as string,
      root_snapshot_sha256: rootSnapshot,
      workspace,
      owner_identity: await nodeIdentity(parent),
      workspace_identity: await workspaceIdentity(workspace),
      inventory_sha256: hash(JSON.stringify(inventory)),
      inventory,
      prepared_artifacts: prepared,
      build,
      prepared_snapshot_sha256: await treeSnapshot(workspace),
    };
    await writeManifest(manifestPath, manifest);
    await canonicalRoot(input.root, input.head, input.status_sha256, binding.root_identity);
    if ((await treeSnapshot(binding.root, new Set([".git"]))) !== rootSnapshot)
      throw new Error("repository byte snapshot changed");
    return {
      schema: proveDriverReceiptSchema,
      operation: "prepare",
      outcome: build?.outcome === "FAILED" ? "FAILED" : "EXECUTED",
      session_manifest: manifestPath,
      session_sha256: hash(await readFile(manifestPath)),
      session_token: token,
      root: binding.root,
      root_identity: binding.root_identity,
      head: binding.head,
      status_sha256: manifest.status_sha256,
      root_snapshot_sha256: manifest.root_snapshot_sha256,
      inventory_sha256: manifest.inventory_sha256,
      workspace_identity: manifest.workspace_identity,
      prepared_artifacts: prepared,
      build,
      prepared_snapshot_sha256: manifest.prepared_snapshot_sha256,
      mutations: [parent, manifestPath],
      recovery: [parent],
      detail:
        build?.outcome === "FAILED"
          ? "bounded build failed; session retained for NOT_EXECUTED surface receipts"
          : "exact-HEAD proof workspace prepared",
    };
  } catch (error) {
    await rm(parent, { recursive: true, force: true });
    throw error;
  }
}

function protocolLine(stdout: string): Record<string, unknown> {
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  return object(JSON.parse(lines.at(-1) ?? ""), "capability protocol");
}
function applicationAdapter(stdout: string): Record<string, unknown> {
  const value = protocolLine(stdout);
  exact(value, ["schema", "ready", "probes", "owned_pid", "cleanup"], "application protocol");
  if (
    value.schema !== applicationProtocolSchema ||
    value.ready !== true ||
    !Number.isSafeInteger(value.probes) ||
    (value.probes as number) <= 0 ||
    !Number.isSafeInteger(value.owned_pid) ||
    (value.owned_pid as number) <= 1 ||
    value.cleanup !== true
  )
    throw new Error("application protocol is unproven");
  return value;
}
function browserAdapter(stdout: string): Record<string, unknown> {
  const value = protocolLine(stdout);
  exact(
    value,
    [
      "schema",
      "origin",
      "navigations",
      "assertions",
      "external_requests",
      "cleanup",
      "page_errors",
      "console_errors",
    ],
    "browser protocol",
  );
  let url: URL;
  try {
    url = new URL(value.origin as string);
  } catch {
    throw new Error("browser origin is invalid");
  }
  const errorsAreBounded = (candidate: unknown): boolean =>
    Array.isArray(candidate) &&
    candidate.length <= 256 &&
    candidate.every((entry) => typeof entry === "string" && Buffer.byteLength(entry) <= 4096);
  if (
    value.schema !== browserProtocolSchema ||
    !["127.0.0.1", "localhost", "::1"].includes(url.hostname) ||
    !["http:", "https:"].includes(url.protocol) ||
    url.origin !== value.origin ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    !Number.isSafeInteger(value.navigations) ||
    (value.navigations as number) <= 0 ||
    !Number.isSafeInteger(value.assertions) ||
    (value.assertions as number) <= 0 ||
    value.external_requests !== 0 ||
    value.cleanup !== true ||
    !errorsAreBounded(value.page_errors) ||
    !errorsAreBounded(value.console_errors)
  )
    throw new Error("browser protocol is unproven");
  return value;
}
async function run(input: Record<string, unknown>): Promise<RunReceipt> {
  exact(
    input,
    [
      "schema",
      "operation",
      "session_manifest",
      "session_sha256",
      "root",
      "head",
      "status_sha256",
      "row_id",
      "effect_authority",
      "decisive_stream",
      "decisive_line_index",
      "not_executed_reason",
    ],
    "input",
  );
  const loaded = await loadManifest(input.session_manifest, input.session_sha256),
    session = loaded.manifest;
  await canonicalRoot(input.root, input.head, input.status_sha256, session.root_identity);
  if (
    input.root !== session.root ||
    input.head !== session.head ||
    input.status_sha256 !== session.status_sha256
  )
    throw new Error("run binding differs from session");
  const rowId = text(input.row_id, "row_id", 64),
    matches = session.inventory.filter(({ id }) => id === rowId);
  if (matches.length !== 1) throw new Error("inventory row is missing or ambiguous");
  const row = matches[0]!;
  if (input.effect_authority !== row.effect_authority)
    throw new Error("effect authority differs from inventory");
  if (input.not_executed_reason !== null) {
    const reason = text(input.not_executed_reason, "not_executed_reason", 1024);
    const receipt = await failedRun(session, row, reason);
    await canonicalRoot(input.root, input.head, input.status_sha256, session.root_identity);
    return receipt;
  }
  if (session.build?.outcome === "FAILED")
    return await failedRun(session, row, "surface not executed because the prepared build failed");
  const parent = path.dirname(session.workspace),
    runRoot = path.join(parent, "runs", `${row.id}-${randomUUID()}`),
    rowWorkspace = path.join(runRoot, "workspace"),
    runtime = path.join(runRoot, "runtime"),
    home = path.join(runtime, "home"),
    temporary = path.join(runtime, "tmp");
  await mkdir(runRoot, { recursive: true, mode: 0o700 });
  await cp(session.workspace, rowWorkspace, { recursive: true, verbatimSymlinks: true });
  await mkdir(home, { recursive: true, mode: 0o700 });
  await mkdir(temporary, { recursive: true, mode: 0o700 });
  const cloneHead = await command([await git(), "rev-parse", "HEAD"], rowWorkspace);
  if (cloneHead.code !== 0 || cloneHead.stdout.trim() !== session.head)
    throw new Error("workspace HEAD changed");
  const beforeStatus = await repositoryStatus(rowWorkspace),
    beforeSnapshot = await treeSnapshot(rowWorkspace),
    cwd = await safeCwd(rowWorkspace, row.cwd),
    executable = await executableIdentity(rowWorkspace, cwd, row.argv[0]!),
    environmentSha256 = environmentDigest(row.env_names);
  const started = performance.now();
  let result: BoundedCommandResult;
  try {
    result = await command(
      row.argv,
      cwd,
      row.timeout_ms,
      row.maximum_output_bytes,
      row.stdin ?? undefined,
      row.env_names,
      { HOME: home, TMPDIR: temporary },
    );
  } catch (error) {
    return await failedRun(
      session,
      row,
      `command could not execute: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
  const duration = Math.max(0, Math.round(performance.now() - started)),
    stdoutBytes = Buffer.byteLength(result.stdout),
    stderrBytes = Buffer.byteLength(result.stderr);
  if (!["stdout", "stderr"].includes(input.decisive_stream as string))
    throw new Error("decisive_stream is invalid");
  const decisiveStream = input.decisive_stream as "stdout" | "stderr",
    lineIndex = boundedInteger(input.decisive_line_index, "decisive_line_index", 0, 1_000_000),
    lines = (decisiveStream === "stdout" ? result.stdout : result.stderr).split(/\r?\n/);
  if (lineIndex >= lines.length) throw new Error("decisive line index is out of range");
  if (Buffer.byteLength(lines[lineIndex]!) > 4096) throw new Error("decisive line is too large");
  let adapter: Record<string, unknown> | null = null,
    protocolError = "";
  try {
    adapter =
      row.capability === "APPLICATION"
        ? applicationAdapter(result.stdout)
        : row.capability === "BROWSER"
          ? browserAdapter(result.stdout)
          : null;
  } catch (error) {
    protocolError = error instanceof Error ? error.message : "adapter protocol failed";
  }
  let artifacts: ArtifactHash[] = [],
    artifactError = "";
  try {
    artifacts = await Promise.all(row.artifacts.map((entry) => artifact(rowWorkspace, entry)));
  } catch (error) {
    artifactError = error instanceof Error ? error.message : "declared artifact invalid";
  }
  const afterStatus = await repositoryStatus(rowWorkspace),
    afterSnapshot = await treeSnapshot(rowWorkspace),
    runtimeSnapshot = await treeSnapshot(runtime),
    executableAfter = await executableIdentity(rowWorkspace, cwd, row.argv[0]!);
  if (JSON.stringify(executableAfter) !== JSON.stringify(executable))
    throw new Error("executable identity changed during run");
  await canonicalRoot(input.root, input.head, input.status_sha256, session.root_identity);
  const workspaceMutated = afterSnapshot !== beforeSnapshot,
    authorityError = row.effect_authority === "READ_ONLY" && workspaceMutated;
  const outcome =
    result.code === 0 &&
    !result.timedOut &&
    !result.saturated &&
    !protocolError &&
    !artifactError &&
    !authorityError
      ? "EXECUTED"
      : "FAILED";
  return await persistReceipt(session, {
    schema: proveDriverReceiptSchema,
    operation: "run",
    outcome,
    session_token: session.token,
    root: session.root,
    root_identity: session.root_identity,
    head: session.head,
    status_sha256: session.status_sha256,
    root_snapshot_sha256: session.root_snapshot_sha256,
    inventory_sha256: session.inventory_sha256,
    row_id: row.id,
    capability: row.capability,
    claims: row.claims,
    argv: row.argv,
    cwd: row.cwd,
    stdin_sha256: row.stdin === null ? null : hash(row.stdin),
    env_names: row.env_names,
    environment_sha256: environmentSha256,
    effect_authority: row.effect_authority,
    command_sha256: hash(JSON.stringify(row)),
    executable,
    exit_code: result.code,
    timed_out: result.timedOut,
    saturated: result.saturated,
    duration_ms: duration,
    stdout: { bytes: stdoutBytes, sha256: hash(result.stdout) },
    stderr: { bytes: stderrBytes, sha256: hash(result.stderr) },
    decisive_line: {
      stream: decisiveStream,
      index: lineIndex,
      text: lines[lineIndex]!,
      sha256: hash(lines[lineIndex]!),
    },
    artifacts,
    adapter,
    workspace_status_sha256: hash(afterStatus),
    workspace_snapshot_before: beforeSnapshot,
    workspace_snapshot_after: afterSnapshot,
    runtime_snapshot_sha256: runtimeSnapshot,
    mutations: workspaceMutated ? [rowWorkspace] : [],
    recovery: [path.dirname(session.workspace)],
    detail:
      protocolError ||
      artifactError ||
      (authorityError ? "read-only driver mutated workspace" : "") ||
      (outcome === "EXECUTED"
        ? "driver executed; receipt records facts without a WORKS claim"
        : "driver failed"),
  });
}
async function failedRun(session: SessionManifest, row: InventoryRow, detail: string): Promise<RunReceipt> {
  return await persistReceipt(session, {
    schema: proveDriverReceiptSchema,
    operation: "run",
    outcome: "NOT_EXECUTED",
    session_token: session.token,
    root: session.root,
    root_identity: session.root_identity,
    head: session.head,
    status_sha256: session.status_sha256,
    root_snapshot_sha256: session.root_snapshot_sha256,
    inventory_sha256: session.inventory_sha256,
    row_id: row.id,
    capability: row.capability,
    claims: row.claims,
    argv: row.argv,
    cwd: row.cwd,
    stdin_sha256: row.stdin === null ? null : hash(row.stdin),
    env_names: row.env_names,
    environment_sha256: environmentDigest(row.env_names),
    effect_authority: row.effect_authority,
    command_sha256: hash(JSON.stringify(row)),
    executable: null,
    exit_code: null,
    timed_out: false,
    saturated: false,
    duration_ms: 0,
    stdout: { bytes: 0, sha256: hash("") },
    stderr: { bytes: 0, sha256: hash("") },
    decisive_line: null,
    artifacts: [],
    adapter: null,
    workspace_status_sha256: session.status_sha256,
    workspace_snapshot_before: session.prepared_snapshot_sha256,
    workspace_snapshot_after: session.prepared_snapshot_sha256,
    runtime_snapshot_sha256: hash(""),
    mutations: [],
    recovery: [path.dirname(session.workspace)],
    detail,
  });
}

function validateHashFact(raw: unknown, label: string): void {
  const value = object(raw, label);
  exact(value, ["bytes", "sha256"], label);
  if (
    !Number.isSafeInteger(value.bytes) ||
    (value.bytes as number) < 0 ||
    !sha256Pattern.test(value.sha256 as string)
  )
    throw new Error(`${label} is invalid`);
}
function validateArtifactFact(raw: unknown, label: string): void {
  const value = object(raw, label);
  exact(value, ["path", "bytes", "sha256"], label);
  text(value.path, `${label}.path`);
  if (
    !Number.isSafeInteger(value.bytes) ||
    (value.bytes as number) < 0 ||
    !sha256Pattern.test(value.sha256 as string)
  )
    throw new Error(`${label} is invalid`);
}
function validateReceiptFacts(value: Record<string, unknown>, row: InventoryRow): void {
  if (
    !Number.isSafeInteger(value.duration_ms) ||
    (value.duration_ms as number) < 0 ||
    typeof value.timed_out !== "boolean" ||
    typeof value.saturated !== "boolean" ||
    !sha256Pattern.test(value.workspace_status_sha256 as string) ||
    !sha256Pattern.test(value.workspace_snapshot_before as string) ||
    !sha256Pattern.test(value.workspace_snapshot_after as string) ||
    !sha256Pattern.test(value.runtime_snapshot_sha256 as string) ||
    typeof value.detail !== "string" ||
    Buffer.byteLength(value.detail) > 4096
  )
    throw new Error(`receipt facts are invalid: ${row.id}`);
  validateHashFact(value.stdout, `receipt ${row.id}.stdout`);
  validateHashFact(value.stderr, `receipt ${row.id}.stderr`);
  if (value.executable !== null) validateArtifactFact(value.executable, `receipt ${row.id}.executable`);
  if (!Array.isArray(value.artifacts)) throw new Error(`receipt artifacts are invalid: ${row.id}`);
  value.artifacts.forEach((entry, index) =>
    validateArtifactFact(entry, `receipt ${row.id}.artifacts[${index}]`),
  );
  if (!Array.isArray(value.mutations) || !Array.isArray(value.recovery))
    throw new Error(`receipt paths are invalid: ${row.id}`);
  for (const [label, entries] of [
    ["mutations", value.mutations],
    ["recovery", value.recovery],
  ] as const) {
    if ((entries as unknown[]).some((entry) => typeof entry !== "string" || !path.isAbsolute(entry)))
      throw new Error(`receipt ${label} are invalid: ${row.id}`);
  }
  if (value.decisive_line !== null) {
    const decisive = object(value.decisive_line, `receipt ${row.id}.decisive_line`);
    exact(decisive, ["stream", "index", "text", "sha256"], `receipt ${row.id}.decisive_line`);
    if (
      !["stdout", "stderr"].includes(decisive.stream as string) ||
      !Number.isSafeInteger(decisive.index) ||
      (decisive.index as number) < 0 ||
      typeof decisive.text !== "string" ||
      hash(decisive.text) !== decisive.sha256
    )
      throw new Error(`receipt decisive line is invalid: ${row.id}`);
  }
  if (value.outcome === "NOT_EXECUTED") {
    if (
      value.exit_code !== null ||
      value.executable !== null ||
      value.decisive_line !== null ||
      (value.duration_ms as number) !== 0
    )
      throw new Error(`NOT_EXECUTED receipt has execution facts: ${row.id}`);
  } else if (!Number.isSafeInteger(value.exit_code)) {
    throw new Error(`executed receipt exit code is invalid: ${row.id}`);
  }
  if (value.outcome === "EXECUTED" && (value.exit_code !== 0 || value.timed_out || value.saturated))
    throw new Error(`EXECUTED receipt contradicts command facts: ${row.id}`);
  if (row.capability === "CLI" && value.adapter !== null)
    throw new Error(`CLI receipt has adapter facts: ${row.id}`);
  if (row.capability !== "CLI" && value.outcome === "EXECUTED" && value.adapter === null)
    throw new Error(`capability receipt lacks adapter facts: ${row.id}`);
}

async function validateRunReceipt(
  raw: unknown,
  session: SessionManifest,
  row: InventoryRow,
  index: number,
): Promise<RunReceipt> {
  const submitted = object(raw, `receipts[${index}]`);
  exact(submitted, ["row_id", "receipt_path", "receipt_sha256"], `receipts[${index}]`);
  const expectedPath = path.join(path.dirname(session.workspace), "receipts", `${row.id}.json`);
  if (submitted.receipt_path !== expectedPath || !sha256Pattern.test(submitted.receipt_sha256 as string))
    throw new Error(`receipt persistence binding is invalid: ${row.id}`);
  const receiptInfo = await lstat(expectedPath);
  if (receiptInfo.isSymbolicLink() || !receiptInfo.isFile() || (receiptInfo.mode & 0o777) !== 0o600)
    throw new Error(`persisted receipt is unsafe: ${row.id}`);
  const persistedBytes = await readFile(expectedPath, "utf8");
  if (hash(persistedBytes) !== submitted.receipt_sha256)
    throw new Error(`persisted receipt digest changed: ${row.id}`);
  const value = object(JSON.parse(persistedBytes), `persisted receipt ${row.id}`);
  if (
    value.schema !== proveDriverReceiptSchema ||
    value.operation !== "run" ||
    !["EXECUTED", "NOT_EXECUTED", "FAILED"].includes(value.outcome as string) ||
    value.session_token !== session.token ||
    value.root !== session.root ||
    value.root_identity !== session.root_identity ||
    value.head !== session.head ||
    value.status_sha256 !== session.status_sha256 ||
    value.root_snapshot_sha256 !== session.root_snapshot_sha256 ||
    value.inventory_sha256 !== session.inventory_sha256 ||
    value.row_id !== row.id ||
    value.capability !== row.capability ||
    JSON.stringify(value.claims) !== JSON.stringify(row.claims) ||
    JSON.stringify(value.argv) !== JSON.stringify(row.argv) ||
    value.cwd !== row.cwd ||
    value.stdin_sha256 !== (row.stdin === null ? null : hash(row.stdin)) ||
    JSON.stringify(value.env_names) !== JSON.stringify(row.env_names) ||
    !sha256Pattern.test(value.environment_sha256 as string) ||
    value.effect_authority !== row.effect_authority ||
    value.command_sha256 !== hash(JSON.stringify(row))
  )
    throw new Error(`receipt binding is invalid: ${row.id}`);
  validateReceiptFacts(value, row);
  return {
    ...(value as unknown as Omit<RunReceipt, "receipt_path" | "receipt_sha256">),
    receipt_path: expectedPath,
    receipt_sha256: submitted.receipt_sha256 as string,
  };
}
async function assemble(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  exact(
    input,
    [
      "schema",
      "operation",
      "session_manifest",
      "session_sha256",
      "root",
      "head",
      "status_sha256",
      "receipts",
    ],
    "input",
  );
  const loaded = await loadManifest(input.session_manifest, input.session_sha256),
    session = loaded.manifest;
  await canonicalRoot(input.root, input.head, input.status_sha256, session.root_identity);
  if (
    input.root !== session.root ||
    input.head !== session.head ||
    input.status_sha256 !== session.status_sha256 ||
    !Array.isArray(input.receipts) ||
    input.receipts.length !== session.inventory.length
  )
    throw new Error("assembly coverage or binding is invalid");
  const rawById = new Map<string, unknown>();
  for (const raw of input.receipts) {
    const id = text(object(raw, "receipt").row_id, "receipt.row_id", 64);
    if (rawById.has(id)) throw new Error("duplicate run receipt");
    rawById.set(id, raw);
  }
  const receipts: RunReceipt[] = [];
  for (const [index, row] of session.inventory.entries()) {
    if (!rawById.has(row.id)) throw new Error(`missing run receipt: ${row.id}`);
    receipts.push(await validateRunReceipt(rawById.get(row.id), session, row, index));
  }
  if (rawById.size !== session.inventory.length) throw new Error("foreign run receipt");
  const bundledReceipts = receipts.map((receipt) => ({
      ...receipt,
      receipt_sha256: hash(JSON.stringify(receipt)),
    })),
    bundle = {
      schema: "tailrocks.prove-evidence-bundle/v1",
      session_token: session.token,
      root: session.root,
      root_identity: session.root_identity,
      head: session.head,
      status_sha256: session.status_sha256,
      root_snapshot_sha256: session.root_snapshot_sha256,
      inventory_sha256: session.inventory_sha256,
      inventory: session.inventory,
      prepared_artifacts: session.prepared_artifacts,
      prepared_snapshot_sha256: session.prepared_snapshot_sha256,
      build: session.build,
      receipts: bundledReceipts,
    };
  const ownedParent = path.dirname(session.workspace),
    parentInfo = await lstat(ownedParent);
  if (
    (await realpath(ownedParent)) !== ownedParent ||
    parentInfo.isSymbolicLink() ||
    `${parentInfo.dev}:${parentInfo.ino}` !== session.owner_identity ||
    path.dirname(loaded.path) !== ownedParent ||
    !path.basename(ownedParent).startsWith("tailrocks-prove-")
  )
    throw new Error("owned workspace cleanup identity failed");
  const quarantine = `${ownedParent}.cleanup-${session.token}`;
  try {
    await rename(ownedParent, quarantine);
    if ((await nodeIdentity(quarantine)) !== session.owner_identity) {
      await rename(quarantine, ownedParent).catch(() => undefined);
      throw new Error("owned workspace changed during cleanup quarantine");
    }
    await rm(quarantine, { recursive: true, force: false });
  } catch (error) {
    return {
      schema: proveDriverReceiptSchema,
      operation: "assemble",
      outcome: "FAILED",
      bundle_sha256: hash(JSON.stringify(bundle)),
      bundle,
      receipts,
      mutations: [],
      recovery: [(await Bun.file(quarantine).exists()) ? quarantine : ownedParent],
      detail: `bundle assembled but owned cleanup failed: ${error instanceof Error ? error.message : "unknown error"}`,
    };
  }
  return {
    schema: proveDriverReceiptSchema,
    operation: "assemble",
    outcome: "EXECUTED",
    bundle_sha256: hash(JSON.stringify(bundle)),
    bundle,
    receipts,
    mutations: [ownedParent],
    recovery: [],
    detail: "machine proof bundle assembled; owned workspace removed",
  };
}

export async function runProveDriver(raw: unknown): Promise<Record<string, unknown>> {
  const input = object(raw, "input");
  if (input.schema !== proveDriverInputSchema) throw new Error("input schema is invalid");
  if (input.operation === "prepare") return prepare(input);
  if (input.operation === "run") return run(input);
  if (input.operation === "assemble") return assemble(input);
  throw new Error("operation is invalid");
}

export function refusal(
  operation: unknown,
  detail: string,
  recovery: readonly string[] = [],
): Record<string, unknown> {
  return {
    schema: proveDriverReceiptSchema,
    operation: typeof operation === "string" ? operation : "unknown",
    outcome: "REFUSED",
    mutations: [],
    recovery,
    detail,
  };
}
