import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";
import { resolveImproveRoute, type ImproveRouteResolution } from "./improve-route-resolver";
import { resolveExecutable } from "./resolve-executable";

export const improveReportInputSchema = "tailrocks.improve-report-input/v1" as const;
export const improveReportReceiptSchema = "tailrocks.improve-report/v1" as const;

const lanes = [
  "agent-legibility",
  "correctness",
  "dependencies",
  "direction",
  "docs",
  "dx",
  "liquid-glass",
  "perf",
  "tech-debt",
  "tests",
  "tui",
  "ux",
] as const;
const laneSet = new Set<string>(lanes);
const rejectionReasons = [
  "by-design",
  "contradicted",
  "current-decision",
  "duplicate",
  "out-of-scope",
  "unverified",
] as const;
const rejectionSet = new Set<string>(rejectionReasons);
const directRouteIds = new Set(["default", "quick", "category"]);
const directOwners = new Set(["tailrocks-improve-plan", "tailrocks-seed-roadmap"]);
const digestPattern = /^[a-f0-9]{64}$/u;
const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const idPattern = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/u;
const maximumFileBytes = 4_000_000;

type Lane = (typeof lanes)[number];
type RejectionReason = (typeof rejectionReasons)[number];
type RecordValue = Record<string, unknown>;

interface Citation {
  readonly path: string;
  readonly line: number;
  readonly line_sha256: string;
}

interface Candidate {
  readonly id: string;
  readonly kind: "defect" | "direction";
  readonly lane: Lane;
  readonly title: string;
  readonly impact: string;
  readonly correctness: boolean;
  readonly consistency: boolean;
  readonly goal_fit: boolean;
  readonly severity: "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";
  readonly confidence: "HIGH" | "MEDIUM" | "LOW";
  readonly fix_risk: "LOW" | "MEDIUM" | "HIGH";
  readonly effort: "S" | "M" | "L";
  readonly citations: readonly Citation[];
  readonly disposition:
    | { readonly outcome: "verified" }
    | { readonly outcome: "rejected"; readonly reason: RejectionReason; readonly detail: string };
  readonly next_owner: "tailrocks-improve-plan" | "tailrocks-seed-roadmap" | null;
}

interface LaneReceipt {
  readonly id: Lane;
  readonly outcome: "completed" | "skipped";
  readonly detail: string;
}

interface CommandReceipt {
  readonly id: string;
  readonly outcome: "ran" | "not_run";
  readonly units: number;
  readonly detail: string;
}

interface ParsedInput {
  readonly root: string;
  readonly revision: string;
  readonly dirty_sha256: string;
  readonly route: unknown;
  readonly lanes: readonly LaneReceipt[];
  readonly commands: readonly CommandReceipt[];
  readonly candidates: readonly Candidate[];
}

interface CommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut?: boolean;
  readonly saturated?: boolean;
}

export interface ImproveReportRuntime {
  readonly gitExecutable?: string;
  readonly runner?: (command: readonly string[], cwd: string) => Promise<CommandResult>;
  readonly afterEvidenceRead?: () => Promise<void>;
}

interface StatIdentity {
  readonly path: string;
  readonly dev: number;
  readonly ino: number;
  readonly size: number;
  readonly mtimeMs: number;
  readonly ctimeMs: number;
}

interface EvidenceIdentity {
  readonly citation: string;
  readonly file: StatIdentity;
  readonly parents: readonly StatIdentity[];
  readonly content_sha256: string;
}

export interface ImproveReportReceipt {
  readonly schema: typeof improveReportReceiptSchema;
  readonly outcome: "reported" | "routed" | "refused";
  readonly code: "reported" | "route" | "invalid_input" | "unsafe_target" | "evidence_changed";
  readonly root: string;
  readonly revision: string;
  readonly dirty_sha256: string;
  readonly route: ImproveRouteResolution | null;
  readonly lanes: readonly LaneReceipt[];
  readonly commands: readonly CommandReceipt[];
  readonly defects: readonly Candidate[];
  readonly directions: readonly Candidate[];
  readonly rejected: readonly Candidate[];
  readonly candidate_count: number;
  readonly mutations: readonly [];
  readonly detail: string;
}

function record(value: unknown, label: string): RecordValue {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    throw new Error(`${label} must be plain object`);
  return value as RecordValue;
}

function exact(value: RecordValue, keys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index]))
    throw new Error(`${label} has unknown or missing fields`);
}

function text(value: unknown, label: string, maximum = 1_000): string {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    !value ||
    Buffer.byteLength(value) > maximum ||
    /[\0\r\n]/u.test(value)
  )
    throw new Error(`${label} is invalid`);
  return value;
}

function enumeration<T extends string>(value: unknown, values: readonly T[], label: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) throw new Error(`${label} is invalid`);
  return value as T;
}

function parseCitation(raw: unknown, label: string): Citation {
  const value = record(raw, label);
  exact(value, ["path", "line", "line_sha256"], label);
  const relative = text(value.path, `${label}.path`, 512);
  const segments = relative.split(/[\\/]/u);
  if (
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    segments.some((part) => !part || part === "." || part === ".." || part === ".git")
  )
    throw new Error(`${label}.path is unsafe`);
  if (!Number.isSafeInteger(value.line) || (value.line as number) < 1)
    throw new Error(`${label}.line is invalid`);
  if (typeof value.line_sha256 !== "string" || !digestPattern.test(value.line_sha256))
    throw new Error(`${label}.line_sha256 is invalid`);
  return { path: relative, line: value.line as number, line_sha256: value.line_sha256 };
}

function parseCandidate(raw: unknown, index: number): Candidate {
  const label = `candidates[${index}]`;
  const value = record(raw, label);
  exact(
    value,
    [
      "id",
      "kind",
      "lane",
      "title",
      "impact",
      "correctness",
      "consistency",
      "goal_fit",
      "severity",
      "confidence",
      "fix_risk",
      "effort",
      "citations",
      "disposition",
      "next_owner",
    ],
    label,
  );
  const id = text(value.id, `${label}.id`, 80);
  if (!idPattern.test(id)) throw new Error(`${label}.id is invalid`);
  for (const field of ["correctness", "consistency", "goal_fit"] as const)
    if (typeof value[field] !== "boolean") throw new Error(`${label}.${field} is invalid`);
  if (!Array.isArray(value.citations) || value.citations.length < 2 || value.citations.length > 5)
    throw new Error(`${label}.citations is invalid`);
  const citations = value.citations.map((entry, citation) =>
    parseCitation(entry, `${label}.citations[${citation}]`),
  );
  if (new Set(citations.map((entry) => `${entry.path}:${entry.line}`)).size !== citations.length)
    throw new Error(`${label}.citations are duplicated`);
  const disposition = record(value.disposition, `${label}.disposition`);
  let parsedDisposition: Candidate["disposition"];
  if (disposition.outcome === "verified") {
    exact(disposition, ["outcome"], `${label}.disposition`);
    parsedDisposition = { outcome: "verified" };
  } else if (disposition.outcome === "rejected") {
    exact(disposition, ["outcome", "reason", "detail"], `${label}.disposition`);
    parsedDisposition = {
      outcome: "rejected",
      reason: enumeration(disposition.reason, rejectionReasons, `${label}.disposition.reason`),
      detail: text(disposition.detail, `${label}.disposition.detail`, 2_000),
    };
  } else throw new Error(`${label}.disposition is invalid`);
  let nextOwner: Candidate["next_owner"];
  if (parsedDisposition.outcome === "rejected") {
    if (value.next_owner !== null) throw new Error(`${label}.next_owner must be null when rejected`);
    nextOwner = null;
  } else {
    const parsedOwner = text(value.next_owner, `${label}.next_owner`, 80);
    if (!directOwners.has(parsedOwner)) throw new Error(`${label}.next_owner is invalid`);
    nextOwner = parsedOwner as Exclude<Candidate["next_owner"], null>;
  }
  return {
    id,
    kind: enumeration(value.kind, ["defect", "direction"], `${label}.kind`),
    lane: enumeration(value.lane, lanes, `${label}.lane`),
    title: text(value.title, `${label}.title`, 300),
    impact: text(value.impact, `${label}.impact`, 2_000),
    correctness: value.correctness as boolean,
    consistency: value.consistency as boolean,
    goal_fit: value.goal_fit as boolean,
    severity: enumeration(value.severity, ["BLOCKER", "HIGH", "MEDIUM", "LOW"], `${label}.severity`),
    confidence: enumeration(value.confidence, ["HIGH", "MEDIUM", "LOW"], `${label}.confidence`),
    fix_risk: enumeration(value.fix_risk, ["LOW", "MEDIUM", "HIGH"], `${label}.fix_risk`),
    effort: enumeration(value.effort, ["S", "M", "L"], `${label}.effort`),
    citations,
    disposition: parsedDisposition,
    next_owner: nextOwner,
  };
}

function parseInput(raw: unknown): ParsedInput {
  const value = record(raw, "input");
  exact(
    value,
    ["schema", "root", "revision", "dirty_sha256", "route", "lanes", "commands", "candidates"],
    "input",
  );
  if (value.schema !== improveReportInputSchema) throw new Error("input schema is invalid");
  const root = text(value.root, "root", 1_024);
  if (!path.isAbsolute(root)) throw new Error("root must be absolute");
  if (typeof value.revision !== "string" || !revisionPattern.test(value.revision))
    throw new Error("revision is invalid");
  if (typeof value.dirty_sha256 !== "string" || !digestPattern.test(value.dirty_sha256))
    throw new Error("dirty_sha256 is invalid");
  if (!Array.isArray(value.lanes) || value.lanes.length > lanes.length) throw new Error("lanes is invalid");
  const parsedLanes = value.lanes.map((rawLane, index) => {
    const lane = record(rawLane, `lanes[${index}]`);
    exact(lane, ["id", "outcome", "detail"], `lanes[${index}]`);
    return {
      id: enumeration(lane.id, lanes, `lanes[${index}].id`),
      outcome: enumeration(lane.outcome, ["completed", "skipped"], `lanes[${index}].outcome`),
      detail: text(lane.detail, `lanes[${index}].detail`, 2_000),
    } satisfies LaneReceipt;
  });
  if (new Set(parsedLanes.map(({ id }) => id)).size !== parsedLanes.length)
    throw new Error("lane ids are duplicated");
  if (!Array.isArray(value.commands) || value.commands.length > 64) throw new Error("commands is invalid");
  const commands = value.commands.map((rawCommand, index) => {
    const command = record(rawCommand, `commands[${index}]`);
    exact(command, ["id", "outcome", "units", "detail"], `commands[${index}]`);
    const id = text(command.id, `commands[${index}].id`, 128);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) throw new Error(`commands[${index}].id is invalid`);
    const outcome = enumeration(command.outcome, ["ran", "not_run"], `commands[${index}].outcome`);
    if (!Number.isSafeInteger(command.units) || (command.units as number) < 0)
      throw new Error(`commands[${index}].units is invalid`);
    if ((outcome === "ran") !== (command.units as number) > 0)
      throw new Error(`commands[${index}] is vacuous or contradictory`);
    return {
      id,
      outcome,
      units: command.units as number,
      detail: text(command.detail, `commands[${index}].detail`, 2_000),
    } satisfies CommandReceipt;
  });
  if (new Set(commands.map(({ id }) => id)).size !== commands.length)
    throw new Error("command ids are duplicated");
  if (!Array.isArray(value.candidates) || value.candidates.length > 1_000)
    throw new Error("candidates is invalid");
  const candidates = value.candidates.map(parseCandidate);
  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length)
    throw new Error("candidate ids are duplicated");
  return {
    root,
    revision: value.revision,
    dirty_sha256: value.dirty_sha256,
    route: value.route,
    lanes: parsedLanes,
    commands,
    candidates,
  };
}

function score(candidate: Candidate): readonly number[] {
  const severity = { LOW: 0, MEDIUM: 1, HIGH: 2, BLOCKER: 3 }[candidate.severity];
  const confidence = { LOW: 0, MEDIUM: 1, HIGH: 2 }[candidate.confidence];
  const risk = { LOW: 2, MEDIUM: 1, HIGH: 0 }[candidate.fix_risk];
  return [
    Number(candidate.correctness),
    Number(candidate.consistency),
    Number(candidate.goal_fit),
    severity,
    confidence,
    risk,
  ];
}

function rank(left: Candidate, right: Candidate): number {
  const a = score(left);
  const b = score(right);
  for (let index = 0; index < a.length; index += 1) if (a[index] !== b[index]) return b[index]! - a[index]!;
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function bytewise(left: { readonly id: string }, right: { readonly id: string }): number {
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function base(code: ImproveReportReceipt["code"], detail: string): ImproveReportReceipt {
  return {
    schema: improveReportReceiptSchema,
    outcome: "refused",
    code,
    root: "",
    revision: "",
    dirty_sha256: "",
    route: null,
    lanes: [],
    commands: [],
    defects: [],
    directions: [],
    rejected: [],
    candidate_count: 0,
    mutations: [],
    detail,
  };
}

function publicSelectionOnly(route: unknown): boolean {
  if (!route || typeof route !== "object" || Array.isArray(route)) return true;
  const primaries = (route as RecordValue).primaries;
  if (!Array.isArray(primaries)) return true;
  return primaries.every((primary) => {
    if (!primary || typeof primary !== "object" || Array.isArray(primary)) return true;
    const kind = (primary as RecordValue).kind;
    return kind === "default" || kind === "quick" || kind === "category";
  });
}

function hash(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function statIdentity(label: string, value: Awaited<ReturnType<typeof lstat>>): StatIdentity {
  return {
    path: label,
    dev: value.dev,
    ino: value.ino,
    size: value.size,
    mtimeMs: value.mtimeMs,
    ctimeMs: value.ctimeMs,
  };
}

async function parentIdentities(root: string, relative: string): Promise<StatIdentity[]> {
  const segments = relative.split("/").slice(0, -1);
  const result: StatIdentity[] = [];
  let current = root;
  for (const segment of ["", ...segments]) {
    if (segment) current = path.join(current, segment);
    const info = await lstat(current);
    if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(current)) !== current)
      throw new Error(`unsafe evidence parent: ${relative}`);
    result.push(statIdentity(path.relative(root, current) || ".", info));
  }
  return result;
}

async function evidenceIdentity(root: string, citation: Citation): Promise<EvidenceIdentity> {
  const file = path.resolve(root, citation.path);
  if (file === root || !file.startsWith(`${root}${path.sep}`))
    throw new Error(`evidence escapes target: ${citation.path}`);
  const parentsBefore = await parentIdentities(root, citation.path);
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  let bytes: Buffer;
  let openedBefore;
  let openedAfter;
  try {
    openedBefore = await handle.stat();
    if (!openedBefore.isFile() || openedBefore.size > maximumFileBytes)
      throw new Error(`unsafe evidence file: ${citation.path}`);
    bytes = await handle.readFile();
    openedAfter = await handle.stat();
  } finally {
    await handle.close();
  }
  const pathnameAfter = await lstat(file);
  const parentsAfter = await parentIdentities(root, citation.path);
  const beforeIdentity = statIdentity(citation.path, openedBefore);
  const afterIdentity = statIdentity(citation.path, openedAfter);
  const pathIdentity = statIdentity(citation.path, pathnameAfter);
  if (
    JSON.stringify(beforeIdentity) !== JSON.stringify(afterIdentity) ||
    JSON.stringify(afterIdentity) !== JSON.stringify(pathIdentity) ||
    JSON.stringify(parentsBefore) !== JSON.stringify(parentsAfter) ||
    pathnameAfter.isSymbolicLink() ||
    (await realpath(file)) !== file
  )
    throw new Error(`evidence identity changed: ${citation.path}`);
  const body = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const line = body.split("\n")[citation.line - 1];
  if (line === undefined || hash(line) !== citation.line_sha256)
    throw new Error(`evidence digest changed: ${citation.path}:${citation.line}`);
  return {
    citation: `${citation.path}:${citation.line}`,
    file: afterIdentity,
    parents: parentsAfter,
    content_sha256: hash(bytes),
  };
}

const defaultRunner = async (command: readonly string[], cwd: string): Promise<CommandResult> =>
  runBoundedCommand({
    command,
    cwd,
    timeoutMilliseconds: 30_000,
    maximumOutputBytes: 4_000_000,
    env: {
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
    },
    inheritEnvironment: false,
  });

async function repositoryIdentity(
  root: string,
  revision: string,
  dirtySha256: string,
  git: string,
  runner: NonNullable<ImproveReportRuntime["runner"]>,
): Promise<string> {
  const hardened = [
    "-c",
    "core.fsmonitor=false",
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "diff.external=",
    "-c",
    "core.attributesFile=/dev/null",
  ] as const;
  const run = async (args: readonly string[], trim: boolean): Promise<string> => {
    const result = await runner([git, ...hardened, ...args], root);
    if (result.code !== 0 || result.timedOut || result.saturated)
      throw new Error(`git identity command failed: ${args[0]}`);
    return trim ? result.stdout.trim() : result.stdout;
  };
  const localConfigKeys = async (pattern: string): Promise<string[]> => {
    const result = await runner(
      [git, ...hardened, "config", "--local", "--no-includes", "--name-only", "--get-regexp", pattern],
      root,
    );
    if (result.timedOut || result.saturated || ![0, 1].includes(result.code))
      throw new Error("local Git configuration is unproven");
    if (result.code === 1) {
      if (result.stdout !== "") throw new Error("local Git configuration refusal is malformed");
      return [];
    }
    return result.stdout
      .split("\n")
      .map((key) => key.trim())
      .filter(Boolean);
  };
  if ((await run(["rev-parse", "--show-toplevel"], true)) !== root)
    throw new Error("target is not exact Git top level");
  const head = await run(["rev-parse", "HEAD"], true);
  if (head !== revision) throw new Error("target revision mismatch");
  if ((await localConfigKeys("^(include|includeif)\\.")).length !== 0)
    throw new Error("local Git include directives are unsafe for read-only identity");
  const filterKeys = await localConfigKeys("^filter\\..*\\.(clean|process|required)$");
  if (filterKeys.some((key) => !/^filter\.[A-Za-z0-9._-]+\.(?:clean|process|required)$/u.test(key)))
    throw new Error("local Git filter key is unsafe");
  const filterOverrides = filterKeys.flatMap((key) => [
    "-c",
    `${key}=${key.endsWith(".required") ? "false" : ""}`,
  ]);
  const status = await run(
    [...filterOverrides, "-c", "core.quotepath=true", "status", "--porcelain=v1", "--untracked-files=all"],
    false,
  );
  if (hash(status) !== dirtySha256) throw new Error("target dirty-state mismatch");
  return hash(`${head}\0${status}`);
}

export async function finalizeImproveReport(
  rootInput: string,
  raw: unknown,
  runtime: ImproveReportRuntime = {},
): Promise<ImproveReportReceipt> {
  let input: ParsedInput;
  try {
    input = parseInput(raw);
  } catch (error) {
    return base("invalid_input", error instanceof Error ? error.message : "invalid input");
  }
  const route = resolveImproveRoute(input.route);
  if (!publicSelectionOnly(input.route))
    return { ...base("invalid_input", "retired improve selector"), route };
  if (route.outcome === "refused") return { ...base("invalid_input", route.detail), route };
  let root: string;
  let git: string;
  const runner = runtime.runner ?? defaultRunner;
  let initialRepositoryIdentity: string;
  try {
    root = path.resolve(rootInput);
    const info = await lstat(root);
    if (
      !info.isDirectory() ||
      info.isSymbolicLink() ||
      (await realpath(root)) !== root ||
      input.root !== root
    )
      throw new Error("target root identity mismatch");
    git = runtime.gitExecutable ?? (await resolveExecutable("git"));
    const gitInfo = await lstat(git);
    if (!gitInfo.isFile() || gitInfo.isSymbolicLink() || (await realpath(git)) !== git)
      throw new Error("unsafe git executable");
    initialRepositoryIdentity = await repositoryIdentity(
      root,
      input.revision,
      input.dirty_sha256,
      git,
      runner,
    );
  } catch (error) {
    return { ...base("unsafe_target", error instanceof Error ? error.message : "unsafe target"), route };
  }
  if (!directRouteIds.has(route.routeId)) {
    if (input.lanes.length || input.commands.length || input.candidates.length)
      return { ...base("invalid_input", "routed invocation must not emulate target work"), route };
    try {
      if (
        (await repositoryIdentity(root, input.revision, input.dirty_sha256, git, runner)) !==
        initialRepositoryIdentity
      )
        throw new Error("target identity changed during routing");
    } catch (error) {
      return {
        ...base("unsafe_target", error instanceof Error ? error.message : "target identity changed"),
        route,
      };
    }
    return {
      ...base("route", `invoke ${route.target} directly`),
      outcome: "routed",
      route,
      root,
      revision: input.revision,
      dirty_sha256: input.dirty_sha256,
    };
  }
  const completed = new Set(input.lanes.filter(({ outcome }) => outcome === "completed").map(({ id }) => id));
  const routeCategory = route.routeId === "category" ? route.targetArguments[0] : undefined;
  if (
    input.lanes.length === 0 ||
    (route.routeId === "default" && input.lanes.length !== lanes.length) ||
    (routeCategory && (input.lanes.length !== 1 || input.lanes[0]!.id !== routeCategory)) ||
    input.candidates.some(({ lane }) => !completed.has(lane))
  )
    return { ...base("invalid_input", "lane coverage does not match selection or candidates"), route };
  try {
    const before: EvidenceIdentity[] = [];
    for (const candidate of input.candidates)
      for (const citation of candidate.citations) before.push(await evidenceIdentity(root, citation));
    await runtime.afterEvidenceRead?.();
    const after: EvidenceIdentity[] = [];
    for (const candidate of input.candidates)
      for (const citation of candidate.citations) after.push(await evidenceIdentity(root, citation));
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("evidence identity changed");
    if (
      (await repositoryIdentity(root, input.revision, input.dirty_sha256, git, runner)) !==
      initialRepositoryIdentity
    )
      throw new Error("target identity changed during report finalization");
  } catch (error) {
    return {
      ...base("evidence_changed", error instanceof Error ? error.message : "evidence changed"),
      route,
    };
  }
  const verified = input.candidates.filter(({ disposition }) => disposition.outcome === "verified");
  if (
    verified.some((candidate) => {
      const expected =
        candidate.kind === "defect" && candidate.confidence === "HIGH" && candidate.fix_risk === "LOW"
          ? "tailrocks-improve-plan"
          : "tailrocks-seed-roadmap";
      return candidate.next_owner !== expected;
    })
  )
    return { ...base("invalid_input", "verified candidate has wrong exclusive next owner"), route };
  const rejected = input.candidates
    .filter(({ disposition }) => disposition.outcome === "rejected")
    .sort(bytewise);
  if (
    rejected.some(
      ({ disposition }) => disposition.outcome !== "rejected" || !rejectionSet.has(disposition.reason),
    )
  )
    return { ...base("invalid_input", "rejection partition is invalid"), route };
  return {
    schema: improveReportReceiptSchema,
    outcome: "reported",
    code: "reported",
    root,
    revision: input.revision,
    dirty_sha256: input.dirty_sha256,
    route,
    lanes: [...input.lanes].sort(bytewise),
    commands: [...input.commands].sort(bytewise),
    defects: verified.filter(({ kind }) => kind === "defect").sort(rank),
    directions: verified.filter(({ kind }) => kind === "direction").sort(rank),
    rejected,
    candidate_count: input.candidates.length,
    mutations: [],
    detail: "all candidates partitioned; verified findings ranked correctness-first",
  };
}
