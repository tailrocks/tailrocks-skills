import { createHash } from "node:crypto";
import { lstat, readFile, readlink, readdir, realpath } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand as runSharedBoundedCommand } from "./bounded-command";
import { resolveExecutable } from "./resolve-executable";

export const planPackageInputSchema = "tailrocks.plan-package-input/v1" as const;
export const planPackageReceiptSchema = "tailrocks.plan-package/v1" as const;
export const researchGapsSchema = "tailrocks.plan-research-gaps/v1" as const;
export const proofSchema = "tailrocks.plan-proof/v1" as const;

type ResumeState = "START" | "CONTINUE" | "RECONCILE_REQUIRED" | "REPLAN_REQUIRED" | "BLOCKED" | "COMPLETE";

interface CommandResult {
  readonly exit_code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly stdout_sha256: string;
  readonly stderr_sha256: string;
}

export interface PlanPackageRuntime {
  readonly run: (
    argv: readonly string[],
    cwd: string,
    timeout_ms: number,
    env?: Readonly<Record<string, string>>,
  ) => Promise<CommandResult>;
}

interface RunnableCommand {
  readonly id: string;
  readonly disposition: "RUNNABLE";
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly proof_argv: readonly string[];
  readonly timeout_ms: number;
  readonly allowed_output_roots: readonly string[];
}

interface DeferredCommand {
  readonly id: string;
  readonly disposition: "DEFERRED";
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly enabling_slice: string;
  readonly blocker_argv: readonly string[];
  readonly blocker_proof_argv: readonly string[];
  readonly timeout_ms: number;
  readonly allowed_output_roots: readonly string[];
}

type PlannedCommand = RunnableCommand | DeferredCommand;

interface ResearchGap {
  readonly id: string;
  readonly question: string;
  readonly requiredEvidence: readonly string[];
  readonly status: "OPEN" | "RESOLVED" | "DEFERRED";
  readonly resolution: readonly string[] | null;
  readonly deferral: {
    readonly decision: string;
    readonly reason: string;
    readonly revisitWhen: string;
  } | null;
}

const digestPattern = /^[a-f0-9]{64}$/;
const headPattern = /^[a-f0-9]{40}$/;
const idPattern = /^[A-Z][A-Z0-9_-]{0,63}$/;
const slicePattern = /^\d{3}$/;
const hardenedGitEnvironment = {
  GIT_ATTR_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_TERMINAL_PROMPT: "0",
  LANG: "C.UTF-8",
  PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
} as const;

async function repositoryGitEnvironment(
  root: string,
  runtime: PlanPackageRuntime,
): Promise<Record<string, string>> {
  const discovered = await runtime.run(
    [
      await resolveExecutable("git"),
      "config",
      "--local",
      "--name-only",
      "--get-regexp",
      "^filter\\..*\\.(clean|process|smudge|required)$",
    ],
    root,
    10_000,
    hardenedGitEnvironment,
  );
  if (discovered.exit_code !== 0 && discovered.exit_code !== 1)
    throw new Error("repository filter inventory failed");
  const names = [...new Set(discovered.stdout.split(/\r?\n/).filter(Boolean))].sort();
  if (
    names.length > 128 ||
    names.some((name) => !/^filter\.[A-Za-z0-9_.-]+\.(clean|process|smudge|required)$/.test(name))
  )
    throw new Error("repository filter inventory is invalid");
  const filters = [...new Set(names.map((name) => name.split(".").slice(0, -1).join(".")))];
  const overrides = filters.flatMap((name) => [
    [`${name}.clean`, "/bin/cat"],
    [`${name}.smudge`, "/bin/cat"],
    [`${name}.process`, ""],
    [`${name}.required`, "false"],
  ]);
  const environment: Record<string, string> = {
    ...hardenedGitEnvironment,
    GIT_CONFIG_COUNT: String(overrides.length),
  };
  for (const [index, [key, value]] of overrides.entries()) {
    environment[`GIT_CONFIG_KEY_${index}`] = key!;
    environment[`GIT_CONFIG_VALUE_${index}`] = value!;
  }
  return environment;
}

function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

async function workspaceDigest(root: string, allowedRoots: readonly string[]): Promise<string> {
  const hash = createHash("sha256");
  let entries = 0;
  let bytes = 0;
  const excluded = (relative: string): boolean =>
    relative === ".git" ||
    relative.startsWith(".git/") ||
    allowedRoots.some((candidate) => relative === candidate || relative.startsWith(`${candidate}/`));
  const visit = async (relative: string): Promise<void> => {
    const absolute = relative ? path.join(root, relative) : root;
    const children = (await readdir(absolute, { withFileTypes: true })).sort((left, right) =>
      left.name.localeCompare(right.name, "en"),
    );
    for (const child of children) {
      const childRelative = relative ? `${relative}/${child.name}` : child.name;
      if (excluded(childRelative)) continue;
      if (++entries > 100_000) throw new Error("workspace inventory is too large");
      const childAbsolute = path.join(root, childRelative);
      const info = await lstat(childAbsolute);
      hash.update(childRelative).update("\0").update(String(info.mode)).update("\0");
      if (info.isSymbolicLink()) hash.update(await readlink(childAbsolute));
      else if (info.isDirectory()) await visit(childRelative);
      else if (info.isFile()) {
        bytes += info.size;
        if (info.size > 100_000_000 || bytes > 1_000_000_000)
          throw new Error("workspace inventory bytes are too large");
        hash.update(await readFile(childAbsolute));
      } else throw new Error(`workspace path is unsupported: ${childRelative}`);
      hash.update("\0");
    }
  };
  await visit("");
  const dotGit = path.join(root, ".git");
  const dotGitInfo = await lstat(dotGit);
  let gitDirectory = dotGit;
  if (dotGitInfo.isFile()) {
    const match = /^gitdir: (.+)\s*$/.exec(await readFile(dotGit, "utf8"));
    if (!match) throw new Error("Git directory pointer is invalid");
    gitDirectory = path.resolve(root, match[1]!);
  }
  hash.update("index\0").update(await readFile(path.join(gitDirectory, "index")));
  return hash.digest("hex");
}

function outputRoots(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length > 16) throw new Error(`${label} is invalid`);
  const allowed =
    /^(?:target|node_modules|dist|build|coverage|DerivedData|\.build|\.cache)(?:\/[A-Za-z0-9._-]+)*$/;
  const roots = value.map((entry, index) => line(entry, `${label}[${index}]`, 512));
  if (roots.some((entry) => !allowed.test(entry)) || new Set(roots).size !== roots.length)
    throw new Error(`${label} is invalid`);
  return roots.sort();
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort(),
    wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index]))
    throw new Error(`${label} has unknown or missing fields`);
}

function line(value: unknown, label: string, maximum = 512): string {
  if (typeof value !== "string" || value !== value.trim() || !value || Buffer.byteLength(value) > maximum)
    throw new Error(`${label} is invalid`);
  for (const character of value)
    if (character.charCodeAt(0) < 0x20 || character.charCodeAt(0) === 0x7f)
      throw new Error(`${label} is invalid`);
  return value;
}

function argv(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 128)
    throw new Error(`${label} must be a non-empty bounded argv`);
  const parsed = value.map((part, index) => line(part, `${label}[${index}]`, 4096));
  if (!path.isAbsolute(parsed[0]!)) throw new Error(`${label} executable must be absolute`);
  return parsed;
}

function timeout(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 100 || (value as number) > 120_000)
    throw new Error("timeout_ms is invalid");
  return value as number;
}

function parseCommand(raw: unknown, label = "command"): PlannedCommand {
  const value = object(raw, label);
  if (value.disposition === "RUNNABLE") {
    exactKeys(
      value,
      ["id", "disposition", "argv", "cwd", "proof_argv", "timeout_ms", "allowed_output_roots"],
      label,
    );
    const id = line(value.id, `${label}.id`, 64);
    if (!idPattern.test(id)) throw new Error(`${label}.id is invalid`);
    return {
      id,
      disposition: "RUNNABLE",
      argv: argv(value.argv, `${label}.argv`),
      cwd: line(value.cwd, `${label}.cwd`, 4096),
      proof_argv: argv(value.proof_argv, `${label}.proof_argv`),
      timeout_ms: timeout(value.timeout_ms),
      allowed_output_roots: outputRoots(value.allowed_output_roots, `${label}.allowed_output_roots`),
    };
  }
  if (value.disposition === "DEFERRED") {
    exactKeys(
      value,
      [
        "id",
        "disposition",
        "argv",
        "cwd",
        "enabling_slice",
        "blocker_argv",
        "blocker_proof_argv",
        "timeout_ms",
        "allowed_output_roots",
      ],
      label,
    );
    const id = line(value.id, `${label}.id`, 64),
      enabling = line(value.enabling_slice, `${label}.enabling_slice`, 3);
    if (!idPattern.test(id) || !slicePattern.test(enabling)) throw new Error(`${label} identity is invalid`);
    return {
      id,
      disposition: "DEFERRED",
      argv: argv(value.argv, `${label}.argv`),
      cwd: line(value.cwd, `${label}.cwd`, 4096),
      enabling_slice: enabling,
      blocker_argv: argv(value.blocker_argv, `${label}.blocker_argv`),
      blocker_proof_argv: argv(value.blocker_proof_argv, `${label}.blocker_proof_argv`),
      timeout_ms: timeout(value.timeout_ms),
      allowed_output_roots: outputRoots(value.allowed_output_roots, `${label}.allowed_output_roots`),
    };
  }
  throw new Error(`${label}.disposition is invalid`);
}

function parseProof(stdout: string): number {
  let raw: unknown;
  try {
    raw = JSON.parse(stdout.trim());
  } catch {
    throw new Error("proof output must be one JSON object");
  }
  const value = object(raw, "proof output");
  exactKeys(value, ["schema", "units"], "proof output");
  if (value.schema !== proofSchema || !Number.isSafeInteger(value.units) || (value.units as number) <= 0)
    throw new Error("proof units must be an exact positive integer");
  return value.units as number;
}

async function safeRoot(
  rootInput: unknown,
  expectedHead: unknown,
  runtime: PlanPackageRuntime,
): Promise<{
  root: string;
  head: string;
}> {
  const root = line(rootInput, "root", 4096);
  if (!path.isAbsolute(root) || (await realpath(root)) !== root)
    throw new Error("root must be canonical absolute");
  const info = await lstat(root);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("root is unsafe");
  if (typeof expectedHead !== "string" || !headPattern.test(expectedHead))
    throw new Error("expected_head is invalid");
  const git = await resolveExecutable("git");
  const top = await runtime.run(
    [git, "-c", "core.fsmonitor=false", "rev-parse", "--show-toplevel"],
    root,
    10_000,
    hardenedGitEnvironment,
  );
  if (top.exit_code !== 0 || top.stdout.trim() !== root)
    throw new Error("root is not the exact Git worktree");
  const headResult = await runtime.run(
    [git, "-c", "core.fsmonitor=false", "rev-parse", "HEAD"],
    root,
    10_000,
    hardenedGitEnvironment,
  );
  const head = headResult.stdout.trim();
  if (headResult.exit_code !== 0 || head !== expectedHead) throw new Error("Git HEAD changed");
  return { root, head };
}

async function commandCwd(root: string, relative: string): Promise<string> {
  if (path.isAbsolute(relative) || relative === ".." || relative.startsWith("../"))
    throw new Error("command cwd must be root-relative");
  const resolved = await realpath(path.join(root, relative));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`))
    throw new Error("command cwd escaped root");
  const info = await lstat(resolved);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("command cwd is unsafe");
  return resolved;
}

function commandDigest(command: PlannedCommand): string {
  return digest(JSON.stringify(command));
}

async function prove(
  raw: Record<string, unknown>,
  runtime: PlanPackageRuntime,
): Promise<Record<string, unknown>> {
  exactKeys(raw, ["schema", "operation", "root", "expected_head", "command"], "input");
  const binding = await safeRoot(raw.root, raw.expected_head, runtime),
    command = parseCommand(raw.command),
    cwd = await commandCwd(binding.root, command.cwd);
  const before = await workspaceDigest(binding.root, command.allowed_output_roots);
  const executedArgv = command.disposition === "RUNNABLE" ? command.argv : command.blocker_argv,
    proofArgv = command.disposition === "RUNNABLE" ? command.proof_argv : command.blocker_proof_argv,
    execution = await runtime.run(executedArgv, cwd, command.timeout_ms);
  if (execution.exit_code !== 0) throw new Error(`${command.disposition.toLowerCase()} command failed`);
  const proof = await runtime.run(proofArgv, cwd, command.timeout_ms);
  if (proof.exit_code !== 0) throw new Error("dedicated proof command failed");
  const units = parseProof(proof.stdout);
  await safeRoot(binding.root, binding.head, runtime);
  if ((await workspaceDigest(binding.root, command.allowed_output_roots)) !== before)
    throw new Error("command mutated repository state");
  return {
    schema: planPackageReceiptSchema,
    operation: "prove",
    outcome: command.disposition === "RUNNABLE" ? "PROVEN" : "DEFERRED",
    root: binding.root,
    head: binding.head,
    command_id: command.id,
    command_sha256: commandDigest(command),
    disposition: command.disposition,
    enabling_slice: command.disposition === "DEFERRED" ? command.enabling_slice : null,
    units,
    execution: {
      exit_code: execution.exit_code,
      stdout_sha256: execution.stdout_sha256,
      stderr_sha256: execution.stderr_sha256,
    },
    proof: {
      exit_code: proof.exit_code,
      stdout_sha256: proof.stdout_sha256,
      stderr_sha256: proof.stderr_sha256,
    },
    mutations: [],
    detail:
      command.disposition === "RUNNABLE"
        ? "command and dedicated positive-unit proof executed"
        : "blocker precondition and dedicated positive-unit proof executed",
  };
}

async function parseResearchGaps(
  raw: unknown,
  root: string,
  head: string,
  expectedItem: string,
): Promise<ResearchGap[]> {
  const manifest = object(raw, "research_gaps");
  exactKeys(manifest, ["$schema", "item", "plannedAt", "gaps"], "research_gaps");
  if (manifest.$schema !== researchGapsSchema || !Array.isArray(manifest.gaps) || manifest.gaps.length > 256)
    throw new Error("research gaps manifest is invalid");
  const item = line(manifest.item, "research_gaps.item", 128);
  if (item !== expectedItem || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item) || manifest.plannedAt !== head)
    throw new Error("research gaps binding is invalid");
  const itemFile = path.join(root, "roadmap", item, "README.md");
  const itemInfo = await lstat(itemFile);
  if (!itemInfo.isFile() || itemInfo.isSymbolicLink() || (await realpath(itemFile)) !== itemFile)
    throw new Error("research gaps item is unsafe");
  const gaps = manifest.gaps.map((rawGap, index) => {
    const value = object(rawGap, `research_gaps.gaps[${index}]`);
    exactKeys(
      value,
      ["id", "question", "requiredEvidence", "status", "resolution", "deferral"],
      `research gap ${index}`,
    );
    const id = line(value.id, `research gap ${index}.id`, 64),
      question = line(value.question, `research gap ${index}.question`),
      status = value.status,
      requiredEvidence = Array.isArray(value.requiredEvidence)
        ? value.requiredEvidence.map((entry, evidenceIndex) =>
            line(entry, `research gap ${index}.requiredEvidence[${evidenceIndex}]`),
          )
        : [];
    if (
      requiredEvidence.length === 0 ||
      requiredEvidence.length > 64 ||
      new Set(requiredEvidence).size !== requiredEvidence.length
    )
      throw new Error(`research gap ${id} requiredEvidence is invalid`);
    if (!/^RG[1-9]\d*$/.test(id) || !["OPEN", "RESOLVED", "DEFERRED"].includes(status as string))
      throw new Error(`research gap ${index} is invalid`);
    let resolution: string[] | null = null;
    if (value.resolution !== null) {
      if (!Array.isArray(value.resolution) || value.resolution.length === 0 || value.resolution.length > 64)
        throw new Error(`research gap ${id} resolution is invalid`);
      resolution = value.resolution.map((entry, resolutionIndex) =>
        line(entry, `research gap ${index}.resolution[${resolutionIndex}]`, 4096),
      );
      if (
        new Set(resolution).size !== resolution.length ||
        resolution.some((entry) => !/^research\/.+(?:#|:\d)/.test(entry))
      )
        throw new Error(`research gap ${id} resolution anchor is invalid`);
    }
    let deferral: ResearchGap["deferral"] = null;
    if (value.deferral !== null) {
      const rawDeferral = object(value.deferral, `research gap ${id}.deferral`);
      exactKeys(rawDeferral, ["decision", "reason", "revisitWhen"], `research gap ${id}.deferral`);
      const decision = line(rawDeferral.decision, `research gap ${id}.deferral.decision`, 64);
      if (!/^D[1-9]\d*$/.test(decision)) throw new Error(`research gap ${id} decision is invalid`);
      deferral = {
        decision,
        reason: line(rawDeferral.reason, `research gap ${id}.deferral.reason`),
        revisitWhen: line(rawDeferral.revisitWhen, `research gap ${id}.deferral.revisitWhen`),
      };
    }
    if (status === "OPEN" && (resolution !== null || deferral !== null))
      throw new Error(`open research gap ${id} has premature resolution`);
    if (status === "RESOLVED" && (resolution === null || deferral !== null))
      throw new Error(`resolved research gap ${id} lacks resolution`);
    if (status === "DEFERRED" && (resolution !== null || deferral === null))
      throw new Error(`deferred research gap ${id} lacks decision`);
    return { id, question, requiredEvidence, status: status as ResearchGap["status"], resolution, deferral };
  });
  if (new Set(gaps.map((gap) => gap.id)).size !== gaps.length)
    throw new Error("research gap ids must be unique");
  if (gaps.some((gap, index) => gap.id !== `RG${index + 1}`))
    throw new Error("research gap ids must be monotonic and sorted");
  for (const gap of gaps) {
    for (const anchor of gap.resolution ?? []) {
      const match = /^(research\/[a-z0-9][a-z0-9/_-]*\.md)(?:(#[-a-z0-9]+)|:(\d+))$/.exec(anchor);
      if (!match) throw new Error(`research gap ${gap.id} resolution anchor is invalid`);
      const absolute = path.join(root, match[1]!);
      const info = await lstat(absolute);
      if (!info.isFile() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
        throw new Error(`research gap ${gap.id} resolution is unsafe`);
      const content = await readFile(absolute, "utf8");
      if (match[2]) {
        const slug = match[2]!.slice(1);
        const headings = content
          .split(/\r?\n/)
          .filter((line) => /^#{1,6} /.test(line))
          .map((line) =>
            line
              .replace(/^#{1,6} /, "")
              .toLowerCase()
              .replace(/[^a-z0-9 -]/g, "")
              .trim()
              .replace(/ +/g, "-"),
          );
        if (!headings.includes(slug)) throw new Error(`research gap ${gap.id} heading is missing`);
      } else if (Number(match[3]) > content.split(/\r?\n/).length)
        throw new Error(`research gap ${gap.id} line is missing`);
    }
  }
  return gaps;
}

function validateProofReceipt(
  raw: unknown,
  command: PlannedCommand,
  root: string,
  head: string,
  index: number,
): void {
  const receipt = object(raw, `receipts[${index}]`);
  exactKeys(
    receipt,
    [
      "schema",
      "operation",
      "outcome",
      "root",
      "head",
      "command_id",
      "command_sha256",
      "disposition",
      "enabling_slice",
      "units",
      "execution",
      "proof",
      "mutations",
      "detail",
    ],
    `receipts[${index}]`,
  );
  if (
    receipt.schema !== planPackageReceiptSchema ||
    receipt.operation !== "prove" ||
    receipt.root !== root ||
    receipt.head !== head ||
    receipt.command_id !== command.id ||
    receipt.command_sha256 !== commandDigest(command) ||
    receipt.disposition !== command.disposition
  )
    throw new Error(`receipt binding is invalid: ${command.id}`);
  if (
    receipt.outcome !== (command.disposition === "RUNNABLE" ? "PROVEN" : "DEFERRED") ||
    receipt.enabling_slice !== (command.disposition === "DEFERRED" ? command.enabling_slice : null) ||
    !Number.isSafeInteger(receipt.units) ||
    (receipt.units as number) <= 0
  )
    throw new Error(`receipt outcome is invalid: ${command.id}`);
  if (
    !Array.isArray(receipt.mutations) ||
    receipt.mutations.length !== 0 ||
    typeof receipt.detail !== "string"
  )
    throw new Error(`receipt authority is invalid: ${command.id}`);
  for (const [name, rawResult] of [
    ["execution", receipt.execution],
    ["proof", receipt.proof],
  ] as const) {
    const result = object(rawResult, `receipt ${command.id}.${name}`);
    exactKeys(result, ["exit_code", "stdout_sha256", "stderr_sha256"], `receipt ${command.id}.${name}`);
    if (
      result.exit_code !== 0 ||
      typeof result.stdout_sha256 !== "string" ||
      !digestPattern.test(result.stdout_sha256) ||
      typeof result.stderr_sha256 !== "string" ||
      !digestPattern.test(result.stderr_sha256)
    )
      throw new Error(`receipt ${name} is invalid: ${command.id}`);
  }
}

async function validate(
  raw: Record<string, unknown>,
  runtime: PlanPackageRuntime,
): Promise<Record<string, unknown>> {
  exactKeys(
    raw,
    ["schema", "operation", "root", "expected_head", "item", "research_gaps", "commands", "receipts"],
    "input",
  );
  const expectedItem = line(raw.item, "item", 128);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(expectedItem)) throw new Error("item is invalid");
  const binding = await safeRoot(raw.root, raw.expected_head, runtime);
  const before = await workspaceDigest(binding.root, []);
  const gaps = await parseResearchGaps(raw.research_gaps, binding.root, binding.head, expectedItem);
  if (!Array.isArray(raw.commands) || raw.commands.length > 512)
    throw new Error("commands must be a bounded partition");
  const commands = raw.commands.map((command, index) => parseCommand(command, `commands[${index}]`));
  if (new Set(commands.map((command) => command.id)).size !== commands.length)
    throw new Error("command ids must be unique");
  const open = gaps.filter((gap) => gap.status === "OPEN").map((gap) => gap.id);
  if (commands.length === 0 && open.length === 0)
    throw new Error("resolved research requires a non-empty command partition");
  for (const command of commands) await commandCwd(binding.root, command.cwd);
  if (!Array.isArray(raw.receipts) || raw.receipts.length !== commands.length)
    throw new Error("proof receipts must cover the command partition exactly");
  const receipts = new Map<string, unknown>();
  for (const [index, rawReceipt] of raw.receipts.entries()) {
    const candidate = object(rawReceipt, `receipts[${index}]`),
      id = line(candidate.command_id, `receipts[${index}].command_id`, 64);
    if (receipts.has(id)) throw new Error("proof receipt command ids must be unique");
    receipts.set(id, rawReceipt);
  }
  for (const [index, command] of commands.entries()) {
    if (!receipts.has(command.id)) throw new Error(`proof receipt missing: ${command.id}`);
    validateProofReceipt(receipts.get(command.id), command, binding.root, binding.head, index);
  }
  await safeRoot(binding.root, binding.head, runtime);
  if ((await workspaceDigest(binding.root, [])) !== before)
    throw new Error("validation inputs changed during inspection");
  return {
    schema: planPackageReceiptSchema,
    operation: "validate",
    outcome: open.length ? "RESEARCH_REQUIRED" : "VALIDATED",
    root: binding.root,
    head: binding.head,
    item: expectedItem,
    research_gaps_sha256: digest(JSON.stringify(raw.research_gaps)),
    command_partition_sha256: digest(JSON.stringify(commands)),
    runnable: commands.filter((command) => command.disposition === "RUNNABLE").map((command) => command.id),
    deferred: commands.filter((command) => command.disposition === "DEFERRED").map((command) => command.id),
    open_research_gaps: open,
    mutations: [],
    detail: open.length
      ? "research owner must close listed gaps before planning resumes"
      : "research gaps and command partition validated",
  };
}

interface PlanRow {
  readonly id: string;
  readonly file: string;
  readonly dependencies: readonly string[];
  readonly status: "TODO" | "IN PROGRESS" | "DONE" | "BLOCKED" | "REJECTED" | "STALE";
}

async function verifyGoalContract(
  root: string,
  manifestPath: string,
  runtime: PlanPackageRuntime,
  gitEnvironment: Readonly<Record<string, string>>,
): Promise<void> {
  const item = manifestPath.slice(0, -"/plan/README.md".length);
  const target = path.join(root, item, "goal/check.sh");
  const canonical = path.join(import.meta.dir, "../skills/tailrocks-plan/templates/check.sh");
  const targetInfo = await lstat(target);
  if (
    !targetInfo.isFile() ||
    targetInfo.isSymbolicLink() ||
    (await realpath(target)) !== target ||
    !(await readFile(target)).equals(await readFile(canonical))
  )
    throw new Error("goal checker identity is invalid");
  const checked = await runtime.run(["/bin/sh", target, path.basename(item)], root, 120_000, gitEnvironment);
  const verdict = checked.stdout.trim().split(/\r?\n/).at(-1) ?? "";
  if (
    !/^TAILROCKS GOAL: (?:PASS [a-f0-9]+|BLOCKED nonterminal-rows=[1-9]\d*)$/.test(verdict) ||
    (checked.exit_code !== 0 && checked.exit_code !== 1)
  )
    throw new Error(`goal contract refused resume: ${verdict || "no verdict"}`);
}

function parseStatus(raw: string): PlanRow["status"] {
  if (["TODO", "IN PROGRESS", "DONE"].includes(raw)) return raw as PlanRow["status"];
  for (const status of ["BLOCKED", "REJECTED", "STALE"] as const)
    if (raw.startsWith(`${status} (`) && raw.endsWith(")") && raw.length > status.length + 3) return status;
  throw new Error(`manifest status is invalid: ${raw}`);
}

async function parseManifest(
  root: string,
  manifestPath: unknown,
): Promise<{ rows: PlanRow[]; bytes: string }> {
  const relative = line(manifestPath, "manifest_path", 4096);
  if (path.isAbsolute(relative) || !/^roadmap\/[a-z0-9]+(?:-[a-z0-9]+)*\/plan\/README\.md$/.test(relative))
    throw new Error("manifest_path is invalid");
  const absolute = path.join(root, relative),
    parent = path.dirname(absolute),
    canonicalParent = await realpath(parent);
  if (canonicalParent !== parent) throw new Error("manifest parent is unsafe");
  const info = await lstat(absolute);
  if (!info.isFile() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
    throw new Error("manifest is unsafe");
  const bytes = await readFile(absolute, "utf8"),
    lines = bytes.split(/\r?\n/),
    heading = "| Plan | Title | Covers | Priority | Effort | Depends on | Status |",
    headingIndexes = lines.flatMap((entry, index) => (entry === heading ? [index] : []));
  if (headingIndexes.length !== 1) throw new Error("manifest must contain one exact plan table");
  const start = headingIndexes[0]!;
  if (!/^\|(?:\s*:?-+:?\s*\|){7}$/.test(lines[start + 1] ?? ""))
    throw new Error("manifest table separator is invalid");
  const rawRows: string[] = [];
  for (let index = start + 2; index < lines.length && lines[index]!.startsWith("|"); index += 1)
    rawRows.push(lines[index]!);
  if (rawRows.length === 0 || rawRows.length > 256)
    throw new Error("manifest plan table is empty or too large");
  const files = (await readdir(parent)).filter((name) => /^\d{3}-.+\.md$/.test(name)).sort();
  const rows = rawRows.map((rawRow, index) => {
    const cells = rawRow
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length !== 7) throw new Error(`manifest row ${index + 1} must have seven columns`);
    const id = cells[0]!;
    if (!slicePattern.test(id)) throw new Error(`manifest plan id is invalid: ${id}`);
    for (const [cellIndex, cell] of cells.entries())
      if (cellIndex !== 5 && cellIndex !== 6) line(cell, `manifest ${id} column ${cellIndex + 1}`);
    const matches = files.filter((name) => name.startsWith(`${id}-`));
    if (matches.length !== 1) throw new Error(`manifest plan ${id} must own exactly one file`);
    const dependencies = cells[5] === "—" ? [] : cells[5]!.split(",").map((entry) => entry.trim());
    if (
      dependencies.some((dependency) => !slicePattern.test(dependency)) ||
      new Set(dependencies).size !== dependencies.length
    )
      throw new Error(`manifest dependencies are invalid: ${id}`);
    return {
      id,
      file: matches[0]!,
      dependencies,
      status: parseStatus(cells[6]!),
      absolute: path.join(parent, matches[0]!),
    };
  });
  if (rows.some((row, index) => index > 0 && Number(row.id) <= Number(rows[index - 1]!.id)))
    throw new Error("manifest plan ids must be monotonic");
  for (const row of rows) {
    const planInfo = await lstat(row.absolute);
    if (!planInfo.isFile() || planInfo.isSymbolicLink() || (await realpath(row.absolute)) !== row.absolute)
      throw new Error(`manifest plan file is unsafe: ${row.id}`);
  }
  const ids = new Set(rows.map((row) => row.id));
  if (ids.size !== rows.length) throw new Error("manifest plan ids must be unique");
  if (files.length !== rows.length) throw new Error("plan files and manifest rows differ");
  for (const row of rows)
    if (row.dependencies.includes(row.id) || row.dependencies.some((dependency) => !ids.has(dependency)))
      throw new Error(`manifest dependency is unknown or self-referential: ${row.id}`);
  const visiting = new Set<string>(),
    visited = new Set<string>(),
    byId = new Map(rows.map((row) => [row.id, row]));
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error("manifest dependency graph is cyclic");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)!.dependencies) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const row of rows) visit(row.id);
  return { rows: rows.map(({ absolute: _, ...row }) => row), bytes };
}

async function resume(
  raw: Record<string, unknown>,
  runtime: PlanPackageRuntime,
): Promise<Record<string, unknown>> {
  exactKeys(raw, ["schema", "operation", "root", "expected_head", "manifest_path"], "input");
  const binding = await safeRoot(raw.root, raw.expected_head, runtime);
  const before = await workspaceDigest(binding.root, []);
  const gitEnvironment = await repositoryGitEnvironment(binding.root, runtime);
  const git = await resolveExecutable("git");
  const dirty = await runtime.run(
    [git, "-c", "core.fsmonitor=false", "status", "--porcelain=v1", "--untracked-files=all"],
    binding.root,
    10_000,
    gitEnvironment,
  );
  if (dirty.exit_code !== 0 || dirty.stdout.length !== 0) throw new Error("worktree is dirty");
  const manifest = await parseManifest(binding.root, raw.manifest_path);
  await verifyGoalContract(binding.root, raw.manifest_path as string, runtime, gitEnvironment);
  const manifestDigest = digest(manifest.bytes);
  const latestCommit = await runtime.run(
    [git, "-c", "core.fsmonitor=false", "log", "-1", "--format=%B", "HEAD"],
    binding.root,
    10_000,
    gitEnvironment,
  );
  if (latestCommit.exit_code !== 0) throw new Error("latest commit identity failed");
  const reconciled = latestCommit.stdout
    .split(/\r?\n/)
    .some((entry) => entry === "Tailrocks-Skill: tailrocks-reconcile");
  const inProgress = manifest.rows.filter((row) => row.status === "IN PROGRESS");
  if (inProgress.length > 1) throw new Error("multiple plans are in progress");
  const statuses = new Map(manifest.rows.map((row) => [row.id, row.status]));
  for (const row of manifest.rows)
    if (
      (row.status === "DONE" || row.status === "IN PROGRESS") &&
      row.dependencies.some((dependency) => statuses.get(dependency) !== "DONE")
    )
      throw new Error(`manifest status contradicts dependencies: ${row.id}`);
  let state: ResumeState,
    next: string | null = null;
  if (manifest.rows.some((row) => row.status === "STALE")) state = "REPLAN_REQUIRED";
  else if (manifest.rows.some((row) => row.status === "BLOCKED")) state = "BLOCKED";
  else if (inProgress.length === 1) {
    state = "CONTINUE";
    next = inProgress[0]!.id;
  } else if (
    !reconciled &&
    (manifest.rows.some((row) => row.status === "DONE") ||
      manifest.rows.every((row) => row.status === "DONE" || row.status === "REJECTED"))
  )
    state = "RECONCILE_REQUIRED";
  else if (manifest.rows.every((row) => row.status === "DONE" || row.status === "REJECTED"))
    state = "COMPLETE";
  else {
    const eligible = manifest.rows.filter(
      (row) =>
        row.status === "TODO" && row.dependencies.every((dependency) => statuses.get(dependency) === "DONE"),
    );
    if (eligible.length === 0) throw new Error("no eligible plan exists");
    state = "START";
    next = eligible[0]!.id;
  }
  await safeRoot(binding.root, binding.head, runtime);
  if ((await workspaceDigest(binding.root, [])) !== before)
    throw new Error("resume inspection mutated repository state");
  if ((await readFile(path.join(binding.root, raw.manifest_path as string), "utf8")) !== manifest.bytes)
    throw new Error("manifest changed during resume inspection");
  return {
    schema: planPackageReceiptSchema,
    operation: "resume",
    outcome: state,
    root: binding.root,
    head: binding.head,
    manifest_sha256: manifestDigest,
    plans: manifest.rows.map((row) => ({
      id: row.id,
      file: row.file,
      dependencies: row.dependencies,
      status: row.status,
    })),
    next_plan: next,
    mutations: [],
    detail: `deterministic resume state: ${state}`,
  };
}

export async function runPlanPackage(
  raw: unknown,
  runtime: PlanPackageRuntime = { run: runBoundedCommand },
): Promise<Record<string, unknown>> {
  const input = object(raw, "input");
  if (input.schema !== planPackageInputSchema) throw new Error("input schema is invalid");
  if (input.operation === "prove") return prove(input, runtime);
  if (input.operation === "validate") return validate(input, runtime);
  if (input.operation === "resume") return resume(input, runtime);
  throw new Error("operation is invalid");
}

export async function runBoundedCommand(
  argv: readonly string[],
  cwd: string,
  timeout_ms: number,
  env?: Readonly<Record<string, string>>,
): Promise<CommandResult> {
  const result = await runSharedBoundedCommand({
    command: argv,
    cwd,
    timeoutMilliseconds: timeout_ms,
    killGraceMilliseconds: 100,
    maximumOutputBytes: 1_000_000,
    ...(env ? { env: { ...env }, inheritEnvironment: false } : {}),
  });
  return {
    exit_code: result.code,
    stdout: result.stdout,
    stderr: result.stderr,
    stdout_sha256: digest(result.stdout),
    stderr_sha256: digest(result.stderr),
  };
}
