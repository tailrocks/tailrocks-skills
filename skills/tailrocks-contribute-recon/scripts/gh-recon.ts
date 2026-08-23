import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "../../../scripts/bounded-command";

export const reconSchema = "tailrocks.github-recon/v1" as const;
const maximumCalls = 64;
const maximumAggregateBytes = 4_000_000;
const maximumJsonDepth = 64;
const maximumJsonNodes = 100_000;
const maximumTextBytes = 256_000;

export interface CommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly saturated: boolean;
}

export type CommandRunner = (command: readonly string[]) => Promise<CommandResult>;
export interface RuntimeIdentity {
  readonly entrypoint_sha256: string;
  readonly command_runner_sha256: string;
}
export type IdentityReader = () => Promise<RuntimeIdentity>;

export interface ReconPlan {
  readonly schema: "tailrocks.github-recon-plan/v1";
  readonly outcome: "planned" | "refused";
  readonly command: string;
  readonly target: string;
  readonly subject: string;
  readonly method: "GET";
  readonly host: "github.com";
  readonly endpoints: string[];
  readonly runtime: RuntimeIdentity | null;
  readonly plan_hash: string;
  readonly mutations: [];
  readonly detail: string;
}

interface RequestReceipt {
  readonly method: "GET";
  readonly host: "github.com";
  readonly endpoint: string;
  readonly outcome: "ok" | "missing" | "failed";
}

export interface ReconEnvelope {
  readonly schema: typeof reconSchema;
  readonly outcome: "success" | "refused" | "failed";
  readonly code: "scanned" | "invalid_arguments" | "target_not_public" | "lookup_failed";
  readonly command: string;
  readonly target: string;
  readonly approved_plan_hash: string;
  readonly runtime: RuntimeIdentity | null;
  readonly planned_endpoints: string[];
  readonly requests: RequestReceipt[];
  readonly data: unknown;
  readonly warnings: string[];
  readonly errors: string[];
  readonly mutations: [];
  readonly detail: string;
}

const subjectCommands = new Set(["issue", "issue-comments", "related-prs"]);
const knownCommands = new Set([
  "repo-scan",
  "ai-policy",
  "legal",
  "liveness",
  "issue",
  "issue-comments",
  "related-prs",
  "prs-closed",
  "templates-issue",
  "templates-pr",
  "commit-log",
  "pr-stats",
  "codeowners",
  "pr-caps",
]);
const files = [
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "LICENSE",
  "AI_POLICY.md",
  "DCO",
  "MAINTAINERS",
  "CODEOWNERS",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/workflows",
  "AGENTS.md",
  "CLAUDE.md",
  ".cursorrules",
] as const;

function validOwner(value: string): boolean {
  return value.length > 0 && value.length <= 39 && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(value);
}

function validRepository(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 100 &&
    /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/.test(value) &&
    !value.includes("..")
  );
}

export function canonicalRepository(raw: string): string | null {
  if (!raw || /[\u0000-\u001f\u007f%?#]/.test(raw)) return null;
  let candidate = raw;
  if (raw.includes(":")) {
    if (!raw.startsWith("https://github.com/")) return null;
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return null;
    }
    if (
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return null;
    candidate = url.pathname.replace(/^\//, "").replace(/\.git$/, "");
  }
  const parts = candidate.split("/");
  if (parts.length !== 2 || !validOwner(parts[0]!) || !validRepository(parts[1]!)) return null;
  return `${parts[0]}/${parts[1]}`;
}

function endpointPlan(command: string, repository: string, subject: string): string[] {
  const metadata = `repos/${repository}`;
  const content = (relative: string): string => `repos/${repository}/contents/${relative}`;
  switch (command) {
    case "repo-scan":
      return [metadata, ...files.map(content)];
    case "ai-policy":
      return [metadata, content("AI_POLICY.md"), content("CONTRIBUTING.md"), content("CODE_OF_CONDUCT.md")];
    case "legal":
      return [
        metadata,
        `repos/${repository}/commits?per_page=30`,
        content("LICENSE"),
        content("DCO"),
        content(".github/workflows"),
      ];
    case "liveness":
      return [
        metadata,
        `repos/${repository}/releases/latest`,
        `repos/${repository}/pulls?state=open&per_page=100`,
        `repos/${repository}/pulls?state=closed&per_page=100`,
      ];
    case "issue":
      return [metadata, `repos/${repository}/issues/${subject}`];
    case "issue-comments":
      return [metadata, `repos/${repository}/issues/${subject}/comments?per_page=100`];
    case "related-prs":
      return [metadata, `search/issues?q=repo:${repository}+type:pr+${encodeURIComponent(subject)}`];
    case "prs-closed":
      return [metadata, `repos/${repository}/pulls?state=closed&per_page=100`];
    case "templates-issue":
      return [metadata, content(".github/ISSUE_TEMPLATE")];
    case "templates-pr":
      return [metadata, content(".github/PULL_REQUEST_TEMPLATE.md")];
    case "commit-log":
      return [metadata, `repos/${repository}/commits?per_page=50`];
    case "pr-stats":
      return [metadata, `repos/${repository}/pulls?state=closed&per_page=50`];
    case "codeowners":
      return [metadata, content("CODEOWNERS"), content(".github/CODEOWNERS")];
    case "pr-caps":
      return [metadata, `search/issues?q=repo:${repository}+type:pr+state:open+author:@me`];
    default:
      return [];
  }
}

async function hashRegularSource(sourcePath: string): Promise<string> {
  const resolved = await realpath(sourcePath);
  if (resolved !== sourcePath) throw new Error("runtime source is not canonical");
  const stat = await lstat(sourcePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2_000_000)
    throw new Error("runtime source is not a bounded regular file");
  return createHash("sha256")
    .update(await readFile(sourcePath))
    .digest("hex");
}

export const readRuntimeIdentity: IdentityReader = async () => {
  const entrypoint = path.resolve(import.meta.dir, "gh-recon.ts");
  const commandRunner = path.resolve(import.meta.dir, "../../../scripts/bounded-command.ts");
  return {
    entrypoint_sha256: await hashRegularSource(entrypoint),
    command_runner_sha256: await hashRegularSource(commandRunner),
  };
};

export function digestReconPlan(plan: Omit<ReconPlan, "plan_hash" | "detail">): string {
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex");
}

function refusedPlan(command: string, detail: string): ReconPlan {
  return {
    schema: "tailrocks.github-recon-plan/v1",
    outcome: "refused",
    command,
    target: "",
    subject: "",
    method: "GET",
    host: "github.com",
    endpoints: [],
    runtime: null,
    plan_hash: "",
    mutations: [],
    detail,
  };
}

export async function planRecon(
  args: readonly string[],
  identityReader: IdentityReader = readRuntimeIdentity,
): Promise<ReconPlan> {
  const [command = "", rawRepository = "", subject = ""] = args;
  const expectedArguments = subjectCommands.has(command) ? 3 : 2;
  if (!knownCommands.has(command) || args.length !== expectedArguments)
    return refusedPlan(command, "invalid or unmatched command arguments");
  const target = canonicalRepository(rawRepository);
  if (!target) return refusedPlan(command, "target must be exact owner/repo or HTTPS github.com URL");
  if (
    subjectCommands.has(command) &&
    (subject.length === 0 ||
      subject.length > 1_000 ||
      (new Set(["issue", "issue-comments"]).has(command) && !/^[1-9]\d*$/.test(subject)))
  )
    return refusedPlan(command, "subject is invalid for command");
  const endpoints = endpointPlan(command, target, subject);
  if (endpoints.length === 0 || endpoints.length > maximumCalls)
    return refusedPlan(command, "endpoint plan is invalid");
  let runtime: RuntimeIdentity;
  try {
    runtime = await identityReader();
  } catch {
    return refusedPlan(command, "runtime identity cannot be proven");
  }
  if (
    !/^[a-f0-9]{64}$/.test(runtime.entrypoint_sha256) ||
    !/^[a-f0-9]{64}$/.test(runtime.command_runner_sha256)
  )
    return refusedPlan(command, "runtime identity is invalid");
  const unsigned = {
    schema: "tailrocks.github-recon-plan/v1" as const,
    outcome: "planned" as const,
    command,
    target,
    subject,
    method: "GET" as const,
    host: "github.com" as const,
    endpoints,
    runtime,
    mutations: [] as [],
  };
  return {
    ...unsigned,
    plan_hash: digestReconPlan(unsigned),
    detail: "zero-network plan ready for explicit approval",
  };
}

function boundedJson(value: unknown): boolean {
  let nodes = 0;
  const visit = (current: unknown, depth: number): boolean => {
    nodes += 1;
    if (nodes > maximumJsonNodes || depth > maximumJsonDepth) return false;
    if (Array.isArray(current))
      return current.length <= 1_000 && current.every((item) => visit(item, depth + 1));
    if (current && typeof current === "object")
      return Object.values(current as Record<string, unknown>).every((item) => visit(item, depth + 1));
    return true;
  };
  return visit(value, 0);
}

function redact(value: string): string {
  return value
    .replace(/gh(?:p|o|u|s|r)_[A-Za-z0-9_]{16,}/g, "[REDACTED]")
    .replace(/github_pat_[A-Za-z0-9_]{16,}/g, "[REDACTED]")
    .replace(/AKIA[A-Z0-9]{16}/g, "[REDACTED]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/(token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, "[REDACTED]");
}

const allowedKeys = new Set([
  "id",
  "full_name",
  "private",
  "visibility",
  "default_branch",
  "archived",
  "disabled",
  "fork",
  "path",
  "sha",
  "size",
  "encoding",
  "number",
  "state",
  "title",
  "body",
  "user",
  "login",
  "assignee",
  "assignees",
  "labels",
  "name",
  "created_at",
  "updated_at",
  "closed_at",
  "merged_at",
  "tag_name",
  "published_at",
  "commit",
  "message",
  "author",
  "items",
  "total_count",
  "incomplete_results",
  "base",
  "head",
  "ref",
]);
const secretKeys = /token|secret|password|authorization|cookie|private_key|access_key/i;

function project(value: unknown): unknown {
  if (typeof value === "string") return redact(value.slice(0, maximumTextBytes));
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 200).map(project);
  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  if (input.encoding === "base64" && typeof input.content === "string") {
    const decoded = Buffer.from(input.content.replace(/\s/g, ""), "base64");
    if (decoded.byteLength <= maximumTextBytes) output.text = redact(decoded.toString("utf8"));
  }
  for (const [key, item] of Object.entries(input)) {
    if (key === "content") continue;
    if (secretKeys.test(key)) {
      output[key] = "[REDACTED]";
      continue;
    }
    if (allowedKeys.has(key)) output[key] = project(item);
  }
  return output;
}

function parseResponse(result: CommandResult): { status: number | null; value: unknown | null } {
  const header = result.stdout.match(/^HTTP\/\S+\s+(\d{3})[^\n]*\r?\n[\s\S]*?\r?\n\r?\n([\s\S]*)$/);
  const status = header ? Number(header[1]) : result.code === 0 ? 200 : null;
  const body = header ? header[2]! : result.stdout;
  if (status === 404) return { status, value: null };
  if (status !== 200 || result.code !== 0 || result.timedOut || result.saturated)
    return { status, value: null };
  try {
    const parsed: unknown = JSON.parse(body);
    return boundedJson(parsed) ? { status, value: parsed } : { status, value: null };
  } catch {
    return { status, value: null };
  }
}

function refusal(command: string, detail: string): ReconEnvelope {
  return {
    schema: reconSchema,
    outcome: "refused",
    code: "invalid_arguments",
    command,
    target: "",
    approved_plan_hash: "",
    runtime: null,
    planned_endpoints: [],
    requests: [],
    data: {},
    warnings: [],
    errors: [detail],
    mutations: [],
    detail,
  };
}

export async function runRecon(
  args: readonly string[],
  expectedPlanHash: string,
  runner: CommandRunner = (command) =>
    runBoundedCommand({
      command,
      cwd: process.cwd(),
      env: { GH_HOST: "github.com", GH_PROMPT_DISABLED: "1", GIT_TERMINAL_PROMPT: "0" },
      timeoutMilliseconds: 15_000,
      killGraceMilliseconds: 1_000,
      maximumOutputBytes: 512_000,
    }),
  identityReader: IdentityReader = readRuntimeIdentity,
): Promise<ReconEnvelope> {
  const plan = await planRecon(args, identityReader);
  if (plan.outcome !== "planned") return refusal(plan.command, plan.detail);
  if (!/^[a-f0-9]{64}$/.test(expectedPlanHash) || expectedPlanHash !== plan.plan_hash)
    return refusal(plan.command, "approved plan hash is missing or stale");
  const { command, target: requested, endpoints: planned } = plan;
  const requests: RequestReceipt[] = [];
  const errors: string[] = [];
  const values = new Map<string, unknown | null>();
  let aggregateBytes = 0;
  const fetchEndpoint = async (endpoint: string, missingAllowed: boolean): Promise<boolean> => {
    let result: CommandResult;
    try {
      result = await runner([
        "gh",
        "api",
        "--method",
        "GET",
        "--hostname",
        "github.com",
        "--include",
        endpoint,
      ]);
    } catch {
      requests.push({ method: "GET", host: "github.com", endpoint, outcome: "failed" });
      errors.push(`endpoint unavailable: ${endpoint}`);
      return false;
    }
    aggregateBytes += Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr);
    if (aggregateBytes > maximumAggregateBytes) {
      requests.push({ method: "GET", host: "github.com", endpoint, outcome: "failed" });
      errors.push("aggregate output limit reached");
      return false;
    }
    const parsed = parseResponse(result);
    if (parsed.status === 404 && missingAllowed) {
      requests.push({ method: "GET", host: "github.com", endpoint, outcome: "missing" });
      values.set(endpoint, null);
      return true;
    }
    if (parsed.status !== 200 || parsed.value === null) {
      requests.push({ method: "GET", host: "github.com", endpoint, outcome: "failed" });
      errors.push(`endpoint unavailable: ${endpoint}`);
      return false;
    }
    requests.push({ method: "GET", host: "github.com", endpoint, outcome: "ok" });
    values.set(endpoint, parsed.value);
    return true;
  };

  const immediate = await planRecon(args, identityReader);
  if (immediate.outcome !== "planned" || immediate.plan_hash !== expectedPlanHash)
    return refusal(command, "runtime or endpoint plan drifted after approval");
  const metadataEndpoint = planned[0]!;
  if (!(await fetchEndpoint(metadataEndpoint, false)))
    return failure(command, requested, planned, requests, errors, expectedPlanHash, plan.runtime);
  const metadata = values.get(metadataEndpoint) as Record<string, unknown>;
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const publicTarget =
    metadata.private === false &&
    (metadata.visibility === undefined || metadata.visibility === "public") &&
    (typeof metadata.id === "number" || typeof metadata.id === "string") &&
    fullName.toLowerCase() === requested.toLowerCase();
  if (!publicTarget) {
    return {
      schema: reconSchema,
      outcome: "refused",
      code: "target_not_public",
      command,
      target: fullName || requested,
      approved_plan_hash: expectedPlanHash,
      runtime: plan.runtime,
      planned_endpoints: planned,
      requests,
      data: {},
      warnings: [],
      errors: ["target is not a proven public repository"],
      mutations: [],
      detail: "target is not eligible for external open-source contribution",
    };
  }

  for (const endpoint of planned.slice(1)) {
    const missingAllowed = endpoint.includes("/contents/") || endpoint.endsWith("/releases/latest");
    if (!(await fetchEndpoint(endpoint, missingAllowed)))
      return failure(command, fullName, planned, requests, errors, expectedPlanHash, plan.runtime);
  }

  const get = (index: number): unknown | null => project(values.get(planned[index]!) ?? null);
  let data: unknown;
  switch (command) {
    case "repo-scan":
      data = {
        repository: project(metadata),
        found: files.filter((_, index) => values.get(planned[index + 1]!) !== null),
        missing: files.filter((_, index) => values.get(planned[index + 1]!) === null),
        sources: Object.fromEntries(
          files.map((relative, index) => [relative, get(index + 1)]).filter(([, value]) => value !== null),
        ),
      };
      break;
    case "legal": {
      const commits = values.get(planned[1]!) as unknown[];
      const messages = Array.isArray(commits)
        ? commits.map((item) => (item as { commit?: { message?: string } }).commit?.message ?? "")
        : [];
      data = {
        repository: project(metadata),
        commits: project(commits),
        signoff_density:
          messages.length === 0
            ? null
            : messages.filter((message) => /Signed-off-by:/i.test(message)).length / messages.length,
        license: get(2),
        dco: get(3),
        workflows: get(4),
      };
      break;
    }
    case "issue-comments": {
      const comments = get(1);
      const claim = /\b(I(?:'ll| will| am going to)|working on|claim(?:ing)?|assigned)\b/i;
      data = {
        repository: project(metadata),
        comments,
        claim_candidates: Array.isArray(comments)
          ? comments.filter((item) => claim.test((item as { body?: string }).body ?? ""))
          : [],
      };
      break;
    }
    default:
      data = { repository: project(metadata), results: planned.slice(1).map((_, index) => get(index + 1)) };
  }

  return {
    schema: reconSchema,
    outcome: "success",
    code: "scanned",
    command,
    target: fullName,
    approved_plan_hash: expectedPlanHash,
    runtime: plan.runtime,
    planned_endpoints: planned,
    requests,
    data,
    warnings: [],
    errors: [],
    mutations: [],
    detail: "reconnaissance complete",
  };
}

function failure(
  command: string,
  target: string,
  planned: string[],
  requests: RequestReceipt[],
  errors: string[],
  approvedPlanHash = "",
  runtime: RuntimeIdentity | null = null,
): ReconEnvelope {
  return {
    schema: reconSchema,
    outcome: "failed",
    code: "lookup_failed",
    command,
    target,
    approved_plan_hash: approvedPlanHash,
    runtime,
    planned_endpoints: planned,
    requests,
    data: {},
    warnings: [],
    errors,
    mutations: [],
    detail: "reconnaissance failed; unavailable evidence is UNKNOWN",
  };
}

if (import.meta.main) {
  const cliArgs = Bun.argv.slice(2);
  if (cliArgs[0] === "plan") {
    const plan = await planRecon(cliArgs.slice(1));
    console.log(JSON.stringify(plan));
    if (plan.outcome !== "planned") process.exit(2);
    process.exit(0);
  }
  let envelope: ReconEnvelope;
  try {
    envelope =
      cliArgs[0] === "run" && cliArgs[1] === "--expect-plan" && cliArgs.length >= 4
        ? await runRecon(cliArgs.slice(3), cliArgs[2]!)
        : refusal("", "use plan first, then run --expect-plan <approved-sha256>");
  } catch {
    envelope = failure("", "", [], [], ["unexpected recon failure"]);
  }
  let serialized = JSON.stringify(envelope);
  if (serialized.length > 1_000_000) {
    envelope = failure(envelope.command, envelope.target, envelope.planned_endpoints, envelope.requests, [
      "receipt output limit reached",
    ]);
    serialized = JSON.stringify(envelope);
  }
  console.log(serialized);
  if (envelope.outcome !== "success") process.exit(envelope.outcome === "refused" ? 2 : 1);
}
