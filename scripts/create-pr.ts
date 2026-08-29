import { createHash } from "node:crypto";
import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";
import { resolveExecutable } from "./resolve-executable";

export const createPrInputSchema = "tailrocks.create-pr-input/v1" as const;
export const createPrReceiptSchema = "tailrocks.create-pr/v1" as const;
export const gateProofSchema = "tailrocks.gate-proof/v1" as const;

interface GateInput {
  readonly id: string;
  readonly command: readonly string[];
  readonly proof_command: readonly string[];
}

interface CreatePrInput {
  readonly schema: typeof createPrInputSchema;
  readonly repo_root: string;
  readonly repository: string;
  readonly actor: string;
  readonly head_owner: string;
  readonly remote_name: string;
  readonly remote_url: string;
  readonly base_branch: string;
  readonly base_sha: string;
  readonly head_branch: string;
  readonly head_sha: string;
  readonly title: string;
  readonly body_file: string;
  readonly body_sha256: string;
  readonly draft: boolean;
  readonly required_trailers: readonly string[];
  readonly gates: readonly GateInput[];
}

export interface CreatePrCommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut?: boolean;
  readonly saturated?: boolean;
}

export interface CreatePrCommandRequest {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly stdin?: string | Uint8Array;
}

export type CreatePrRunner = (request: CreatePrCommandRequest) => Promise<CreatePrCommandResult>;

export interface CreatePrRuntime {
  readonly localRunner?: CreatePrRunner;
  readonly gateRunner?: CreatePrRunner;
  readonly remoteRunner?: CreatePrRunner;
  readonly gitExecutable?: string;
  readonly ghExecutable?: string;
}

interface GateReceipt {
  readonly id: string;
  readonly command: readonly string[];
  readonly proof_command: readonly string[];
  readonly outcome: "passed" | "failed" | "vacuous";
  readonly units: number;
  readonly output_sha256: string;
}

interface ExternalReceipt {
  readonly kind: "actor" | "base_ref" | "existing_pr" | "push" | "remote_ref" | "create" | "render";
  readonly command: readonly string[];
  readonly outcome: "success" | "failed" | "uncertain";
  readonly proof: string;
}

export interface CreatePrReceipt {
  readonly schema: typeof createPrReceiptSchema;
  readonly outcome: "success" | "refused" | "recovery_required";
  readonly code:
    | "opened"
    | "invalid_input"
    | "state_drift"
    | "gate_failed"
    | "gate_vacuous"
    | "push_failed"
    | "remote_ref_failed"
    | "create_failed"
    | "render_failed";
  readonly repository: string;
  readonly branch: string;
  readonly head: string;
  readonly url: string;
  readonly executed_units: number;
  readonly gates: readonly GateReceipt[];
  readonly external_actions: readonly ExternalReceipt[];
  readonly detail: string;
}

const shaPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const digestPattern = /^[a-f0-9]{64}$/;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const repositoryPattern =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$/;
const maximumInputBytes = 1_000_000;
const maximumBodyBytes = 1_000_000;
const maximumGates = 32;

function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index]))
    throw new Error(`${label} has unknown or missing fields`);
}

function safeText(value: unknown, label: string, maximum: number): string {
  const hasControl =
    typeof value === "string" &&
    [...value].some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    });
  if (typeof value !== "string" || !value || Buffer.byteLength(value) > maximum || hasControl)
    throw new Error(`${label} is invalid`);
  return value;
}

function safeRef(value: unknown, label: string): string {
  const ref = safeText(value, label, 240);
  if (
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref) ||
    ref.includes("..") ||
    ref.includes("@{") ||
    ref.endsWith("/") ||
    ref.endsWith(".") ||
    ref.endsWith(".lock") ||
    ref.split("/").some((part) => !part || part === ".")
  )
    throw new Error(`${label} is invalid`);
  return ref;
}

function canonicalRepository(value: unknown): string {
  const repository = safeText(value, "repository", 140);
  const [, name = ""] = repository.split("/");
  if (!repositoryPattern.test(repository) || name.includes("..") || name.endsWith("."))
    throw new Error("repository is invalid");
  return repository;
}

function canonicalRemote(value: unknown): string {
  const raw = safeText(value, "remote_url", 300);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("remote_url is invalid");
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
    throw new Error("remote_url is invalid");
  const repository = url.pathname.replace(/^\//, "").replace(/\.git$/, "");
  canonicalRepository(repository);
  return `https://github.com/${repository}.git`;
}

function parseCommand(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 64)
    throw new Error(`${label} must be a bounded argv array`);
  const command = value.map((part, index) => safeText(part, `${label}[${index}]`, 8_192));
  if (!path.isAbsolute(command[0]!)) throw new Error(`${label} executable must be absolute`);
  if (command.reduce((total, part) => total + Buffer.byteLength(part), 0) > 64_000)
    throw new Error(`${label} is too large`);
  return command;
}

function parseInput(raw: unknown): CreatePrInput {
  const value = object(raw, "input");
  exactKeys(
    value,
    [
      "schema",
      "repo_root",
      "repository",
      "actor",
      "head_owner",
      "remote_name",
      "remote_url",
      "base_branch",
      "base_sha",
      "head_branch",
      "head_sha",
      "title",
      "body_file",
      "body_sha256",
      "draft",
      "required_trailers",
      "gates",
    ],
    "input",
  );
  if (value.schema !== createPrInputSchema) throw new Error("input schema is invalid");
  if (typeof value.repo_root !== "string" || !path.isAbsolute(value.repo_root))
    throw new Error("repo_root must be absolute");
  const repository = canonicalRepository(value.repository);
  const actor = safeText(value.actor, "actor", 39);
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(actor)) throw new Error("actor is invalid");
  const headOwner = safeText(value.head_owner, "head_owner", 39);
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(headOwner)) throw new Error("head_owner is invalid");
  const remoteName = safeText(value.remote_name, "remote_name", 64);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(remoteName)) throw new Error("remote_name is invalid");
  const remoteUrl = canonicalRemote(value.remote_url);
  const repositoryName = repository.split("/")[1]!;
  if (remoteUrl !== `https://github.com/${headOwner}/${repositoryName}.git`)
    throw new Error("remote_url differs from head owner and repository");
  const baseBranch = safeRef(value.base_branch, "base_branch");
  const headBranch = safeRef(value.head_branch, "head_branch");
  if (baseBranch === headBranch) throw new Error("head branch must differ from base branch");
  if (typeof value.base_sha !== "string" || !shaPattern.test(value.base_sha))
    throw new Error("base_sha is invalid");
  if (typeof value.head_sha !== "string" || !shaPattern.test(value.head_sha))
    throw new Error("head_sha is invalid");
  const title = safeText(value.title, "title", 256);
  if (typeof value.body_file !== "string" || !path.isAbsolute(value.body_file))
    throw new Error("body_file must be absolute");
  if (typeof value.body_sha256 !== "string" || !digestPattern.test(value.body_sha256))
    throw new Error("body_sha256 is invalid");
  if (typeof value.draft !== "boolean") throw new Error("draft must be boolean");
  if (!Array.isArray(value.required_trailers) || value.required_trailers.length > 16)
    throw new Error("required_trailers must be a bounded array");
  const requiredTrailers = value.required_trailers.map((entry, index) => {
    const trailer = safeText(entry, `required_trailers[${index}]`, 64);
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(trailer)) throw new Error("required trailer is invalid");
    return trailer;
  });
  if (new Set(requiredTrailers).size !== requiredTrailers.length)
    throw new Error("required trailers must be unique");
  if (!Array.isArray(value.gates) || value.gates.length === 0 || value.gates.length > maximumGates)
    throw new Error("at least one bounded gate is required");
  const gateIds = new Set<string>();
  const gates = value.gates.map((entry, index) => {
    const gate = object(entry, `gates[${index}]`);
    exactKeys(gate, ["id", "command", "proof_command"], `gates[${index}]`);
    if (typeof gate.id !== "string" || !idPattern.test(gate.id) || gateIds.has(gate.id))
      throw new Error("gate id is invalid or duplicated");
    gateIds.add(gate.id);
    return {
      id: gate.id,
      command: parseCommand(gate.command, `gates[${index}].command`),
      proof_command: parseCommand(gate.proof_command, `gates[${index}].proof_command`),
    };
  });
  return {
    schema: createPrInputSchema,
    repo_root: value.repo_root,
    repository,
    actor,
    head_owner: headOwner,
    remote_name: remoteName,
    remote_url: remoteUrl,
    base_branch: baseBranch,
    base_sha: value.base_sha,
    head_branch: headBranch,
    head_sha: value.head_sha,
    title,
    body_file: value.body_file,
    body_sha256: value.body_sha256,
    draft: value.draft,
    required_trailers: requiredTrailers,
    gates,
  } as CreatePrInput;
}

async function safeRegularFile(file: string, maximumBytes: number, label: string): Promise<Buffer> {
  const resolved = path.resolve(file);
  const before = await lstat(resolved);
  if (
    !before.isFile() ||
    before.isSymbolicLink() ||
    before.size > maximumBytes ||
    (await realpath(resolved)) !== resolved
  )
    throw new Error(`${label} is not a bounded canonical regular file`);
  const body = await readFile(resolved);
  const after = await lstat(resolved);
  if (
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs
  )
    throw new Error(`${label} changed while read`);
  return body;
}

async function safeExecutable(file: string): Promise<void> {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink() || (await realpath(file)) !== file)
    throw new Error(`unsafe command executable: ${file}`);
}

const defaultLocalRunner: CreatePrRunner = async ({ command, cwd }) => {
  await safeExecutable(command[0]!);
  return runBoundedCommand({
    command,
    cwd,
    timeoutMilliseconds: 120_000,
    maximumOutputBytes: 4_000_000,
    env: {
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
    },
    inheritEnvironment: false,
  });
};

const defaultRemoteRunner: CreatePrRunner = ({ command, cwd, stdin }) =>
  runBoundedCommand({
    command,
    cwd,
    stdin,
    timeoutMilliseconds: 120_000,
    maximumOutputBytes: 4_000_000,
    env: { GIT_TERMINAL_PROMPT: "0", GH_PROMPT_DISABLED: "1" },
  });

function sandboxPath(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function isolatedGateRunner(workspace: string): CreatePrRunner {
  const environment = {
    PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
    HOME: path.join(workspace, ".gate-home"),
    TMPDIR: path.join(workspace, ".gate-tmp"),
    CI: "1",
  };
  if (process.platform === "darwin") {
    const sandbox = "/usr/bin/sandbox-exec";
    const profile = [
      "(version 1)",
      '(import "system.sb")',
      "(allow process*)",
      "(allow file-read*)",
      "(deny network*)",
      `(allow file-write* (subpath "${sandboxPath(workspace)}"))`,
    ].join(" ");
    return ({ command }) =>
      runBoundedCommand({
        command: [sandbox, "-p", profile, "--", ...command],
        cwd: workspace,
        timeoutMilliseconds: 120_000,
        maximumOutputBytes: 4_000_000,
        env: environment,
        inheritEnvironment: false,
      });
  }
  if (process.platform === "linux") {
    const bubblewrap = "/usr/bin/bwrap";
    return async ({ command }) => {
      await safeExecutable(bubblewrap);
      return runBoundedCommand({
        command: [
          bubblewrap,
          "--unshare-net",
          "--die-with-parent",
          "--new-session",
          "--ro-bind",
          "/",
          "/",
          "--bind",
          workspace,
          workspace,
          "--chdir",
          workspace,
          ...command,
        ],
        cwd: workspace,
        timeoutMilliseconds: 120_000,
        maximumOutputBytes: 4_000_000,
        env: environment,
        inheritEnvironment: false,
      });
    };
  }
  throw new Error("a supported network-denied gate sandbox is unavailable");
}

async function prepareGateWorkspace(
  input: CreatePrInput,
  gitExecutable: string,
  runner: CreatePrRunner,
): Promise<string> {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-create-pr-gates-")));
  await chmod(parent, 0o700);
  const template = path.join(parent, "empty-template");
  await mkdir(template, { mode: 0o700 });
  const workspace = path.join(parent, "subject");
  const clone = await runner({
    command: [
      gitExecutable,
      "clone",
      "--quiet",
      "--local",
      "--no-hardlinks",
      "--no-checkout",
      "--template",
      template,
      input.repo_root,
      workspace,
    ],
    cwd: parent,
  });
  if (!commandSucceeded(clone)) {
    await rm(parent, { recursive: true, force: true });
    throw new Error("failed to create isolated gate workspace");
  }
  const checkout = await runner({
    command: [
      gitExecutable,
      "-c",
      "filter.lfs.smudge=",
      "-c",
      "filter.lfs.process=",
      "-c",
      "filter.lfs.required=false",
      "checkout",
      "--quiet",
      "--detach",
      input.head_sha,
    ],
    cwd: workspace,
  });
  if (!commandSucceeded(checkout)) {
    await rm(parent, { recursive: true, force: true });
    throw new Error("failed to materialize exact gate revision");
  }
  await Promise.all([
    mkdir(path.join(workspace, ".gate-home"), { mode: 0o700 }),
    mkdir(path.join(workspace, ".gate-tmp"), { mode: 0o700 }),
  ]);
  return workspace;
}

function baseReceipt(code: CreatePrReceipt["code"], detail: string): CreatePrReceipt {
  return {
    schema: createPrReceiptSchema,
    outcome: "refused",
    code,
    repository: "",
    branch: "",
    head: "",
    url: "",
    executed_units: 0,
    gates: [],
    external_actions: [],
    detail,
  };
}

function commandSucceeded(result: CreatePrCommandResult): boolean {
  return result.code === 0 && !result.timedOut && !result.saturated;
}

async function repositorySnapshot(
  input: CreatePrInput,
  gitExecutable: string,
  runner: CreatePrRunner,
): Promise<void> {
  const run = async (args: readonly string[]): Promise<string> => {
    const result = await runner({ command: [gitExecutable, ...args], cwd: input.repo_root });
    if (!commandSucceeded(result)) throw new Error("repository identity command failed");
    return result.stdout;
  };
  if ((await run(["rev-parse", "--show-toplevel"])).trim() !== input.repo_root)
    throw new Error("repo_root is not the exact Git top level");
  if ((await run(["symbolic-ref", "--short", "HEAD"])).trim() !== input.head_branch)
    throw new Error("current branch drifted");
  if ((await run(["rev-parse", "HEAD"])).trim() !== input.head_sha) throw new Error("HEAD drifted");
  if ((await run(["status", "--porcelain=v1", "--untracked-files=all"])).length !== 0)
    throw new Error("working tree is dirty");
  await run(["merge-base", "--is-ancestor", input.base_sha, input.head_sha]);
  const count = Number((await run(["rev-list", "--count", `${input.base_sha}..${input.head_sha}`])).trim());
  if (!Number.isSafeInteger(count) || count < 1) throw new Error("pull request commit range is empty");
  const commitBodies = (await run(["log", "--format=%B%x00", `${input.base_sha}..${input.head_sha}`]))
    .split("\0")
    .map((body) => body.trim())
    .filter(Boolean);
  if (commitBodies.length !== count) throw new Error("commit range proof is inconsistent");
  for (const trailer of input.required_trailers) {
    const pattern = new RegExp(`^${trailer}:\\s+\\S`, "mi");
    if (commitBodies.some((body) => !pattern.test(body)))
      throw new Error(`commit is missing required trailer: ${trailer}`);
  }
  if ((await run(["remote", "get-url", input.remote_name])).trim() !== input.remote_url)
    throw new Error("push remote identity drifted");
}

function parseProof(stdout: string): number {
  const lines = stdout.trim().split("\n");
  if (lines.length !== 1) return 0;
  try {
    const value = object(JSON.parse(lines[0]!) as unknown, "gate proof");
    exactKeys(value, ["schema", "units"], "gate proof");
    return value.schema === gateProofSchema &&
      Number.isSafeInteger(value.units) &&
      (value.units as number) > 0
      ? (value.units as number)
      : 0;
  } catch {
    return 0;
  }
}

function external(
  kind: ExternalReceipt["kind"],
  command: readonly string[],
  outcome: ExternalReceipt["outcome"],
  proof: string,
): ExternalReceipt {
  return { kind, command, outcome, proof };
}

async function proveRemotePreconditions(
  input: CreatePrInput,
  ghExecutable: string,
  root: string,
  runner: CreatePrRunner,
  receipts: ExternalReceipt[],
): Promise<void> {
  const actorCommand = [ghExecutable, "api", "user", "--jq", ".login"];
  const actorResult = await runner({ command: actorCommand, cwd: root });
  if (!commandSucceeded(actorResult) || actorResult.stdout.trim() !== input.actor) {
    receipts.push(external("actor", actorCommand, "failed", digest(actorResult.stdout)));
    throw new Error("authenticated GitHub actor differs from declared actor");
  }
  receipts.push(external("actor", actorCommand, "success", input.actor));
  const baseCommand = [
    ghExecutable,
    "api",
    `repos/${input.repository}/git/ref/heads/${encodeURIComponent(input.base_branch)}`,
    "--jq",
    "{ref:.ref,sha:.object.sha,type:.object.type}",
  ];
  const baseResult = await runner({ command: baseCommand, cwd: root });
  let base: Record<string, unknown> | null = null;
  try {
    base = object(JSON.parse(baseResult.stdout) as unknown, "base ref receipt");
    exactKeys(base, ["ref", "sha", "type"], "base ref receipt");
  } catch {
    base = null;
  }
  if (
    !commandSucceeded(baseResult) ||
    !base ||
    base.ref !== `refs/heads/${input.base_branch}` ||
    base.sha !== input.base_sha ||
    base.type !== "commit"
  ) {
    receipts.push(external("base_ref", baseCommand, "failed", digest(baseResult.stdout)));
    throw new Error("target repository base ref differs from declared base SHA");
  }
  receipts.push(external("base_ref", baseCommand, "success", input.base_sha));
  const existingCommand = [
    ghExecutable,
    "api",
    `repos/${input.repository}/pulls`,
    "--method",
    "GET",
    "-f",
    "state=open",
    "-f",
    `head=${input.head_owner}:${input.head_branch}`,
    "-f",
    "per_page=100",
    "--paginate",
    "--slurp",
  ];
  const existingResult = await runner({ command: existingCommand, cwd: root });
  let existing: unknown = null;
  try {
    existing = JSON.parse(existingResult.stdout) as unknown;
  } catch {
    // The exact empty array below remains the only accepted proof.
  }
  const pages = Array.isArray(existing) ? existing : [];
  const pullRequests = pages.flatMap((page) => (Array.isArray(page) ? page : [page]));
  if (!commandSucceeded(existingResult) || !Array.isArray(existing) || pullRequests.length !== 0) {
    receipts.push(external("existing_pr", existingCommand, "failed", digest(existingResult.stdout)));
    throw new Error("absence of an existing open pull request is unproven");
  }
  receipts.push(external("existing_pr", existingCommand, "success", "none"));
}

export async function createPullRequest(
  raw: unknown,
  runtime: CreatePrRuntime = {},
): Promise<CreatePrReceipt> {
  let input: CreatePrInput;
  try {
    input = parseInput(raw);
  } catch (error) {
    return baseReceipt("invalid_input", error instanceof Error ? error.message : "invalid input");
  }
  const gates: GateReceipt[] = [];
  const externalActions: ExternalReceipt[] = [];
  let executedUnits = 0;
  let pushed = false;
  let created = false;
  let url = "";
  let gateParent = "";
  try {
    const root = path.resolve(input.repo_root);
    const rootInfo = await lstat(root);
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || (await realpath(root)) !== root)
      throw new Error("repo_root is unsafe");
    const bodyPath = path.resolve(input.body_file);
    if (bodyPath === root || bodyPath.startsWith(`${root}${path.sep}`))
      throw new Error("body_file must stay outside the repository tree");
    const bodyBytes = await safeRegularFile(bodyPath, maximumBodyBytes, "body_file");
    const body = new TextDecoder("utf-8", { fatal: true }).decode(bodyBytes);
    if (digest(bodyBytes) !== input.body_sha256) throw new Error("body_file hash drifted");
    if (!body.trim() || /<!--|<placeholder>|{{[^}\n]+}}|\b(?:TODO|TBD)\b/i.test(body))
      throw new Error("body_file contains an empty or unfilled template");
    const gitExecutable = runtime.gitExecutable ?? (await resolveExecutable("git"));
    await safeExecutable(gitExecutable);
    const ghExecutable = runtime.ghExecutable ?? (await resolveExecutable("gh"));
    await safeExecutable(ghExecutable);
    const localRunner = runtime.localRunner ?? defaultLocalRunner;
    const remoteRunner = runtime.remoteRunner ?? defaultRemoteRunner;
    await repositorySnapshot(input, gitExecutable, localRunner);
    const gateWorkspace = await prepareGateWorkspace(input, gitExecutable, localRunner);
    gateParent = path.dirname(gateWorkspace);
    const gateRunner = runtime.gateRunner ?? isolatedGateRunner(gateWorkspace);
    for (const gate of input.gates) {
      await safeExecutable(gate.command[0]!);
      await safeExecutable(gate.proof_command[0]!);
      const result = await gateRunner({ command: gate.command, cwd: gateWorkspace });
      if (!commandSucceeded(result)) {
        gates.push({
          id: gate.id,
          command: gate.command,
          proof_command: gate.proof_command,
          outcome: "failed",
          units: 0,
          output_sha256: digest(result.stdout),
        });
        return {
          ...baseReceipt("gate_failed", `gate failed: ${gate.id}`),
          repository: input.repository,
          branch: input.head_branch,
          head: input.head_sha,
          gates,
        };
      }
      const proof = await gateRunner({ command: gate.proof_command, cwd: gateWorkspace });
      const units = commandSucceeded(proof) ? parseProof(proof.stdout) : 0;
      gates.push({
        id: gate.id,
        command: gate.command,
        proof_command: gate.proof_command,
        outcome: units > 0 ? "passed" : "vacuous",
        units,
        output_sha256: digest(result.stdout),
      });
      if (units === 0)
        return {
          ...baseReceipt("gate_vacuous", `gate proof is zero or malformed: ${gate.id}`),
          repository: input.repository,
          branch: input.head_branch,
          head: input.head_sha,
          gates,
        };
      executedUnits += units;
    }
    await repositorySnapshot(input, gitExecutable, localRunner);
    await proveRemotePreconditions(input, ghExecutable, root, remoteRunner, externalActions);
    await repositorySnapshot(input, gitExecutable, localRunner);

    const push = [
      gitExecutable,
      "push",
      input.remote_url,
      `${input.head_sha}:refs/heads/${input.head_branch}`,
    ];
    const pushResult = await remoteRunner({ command: push, cwd: root });
    externalActions.push(
      external(
        "push",
        push,
        commandSucceeded(pushResult) ? "success" : "uncertain",
        digest(pushResult.stdout),
      ),
    );
    const remoteRef = [
      gitExecutable,
      "ls-remote",
      "--heads",
      input.remote_url,
      `refs/heads/${input.head_branch}`,
    ];
    const remoteRefResult = await remoteRunner({ command: remoteRef, cwd: root });
    const expectedRef = `${input.head_sha}\trefs/heads/${input.head_branch}`;
    if (!commandSucceeded(remoteRefResult) || remoteRefResult.stdout.trim() !== expectedRef) {
      const absent = commandSucceeded(remoteRefResult) && remoteRefResult.stdout.trim() === "";
      externalActions.push(
        external(
          "remote_ref",
          remoteRef,
          absent ? "success" : "uncertain",
          absent ? "absent" : digest(remoteRefResult.stdout),
        ),
      );
      return {
        ...baseReceipt(
          commandSucceeded(pushResult) ? "remote_ref_failed" : "push_failed",
          absent && !commandSucceeded(pushResult)
            ? "push failed and exact remote discovery proved the branch absent"
            : "pushed branch identity is foreign or unproven",
        ),
        outcome: absent && !commandSucceeded(pushResult) ? "refused" : "recovery_required",
        repository: input.repository,
        branch: input.head_branch,
        head: input.head_sha,
        executed_units: executedUnits,
        gates,
        external_actions: externalActions,
      };
    }
    pushed = true;
    externalActions.push(external("remote_ref", remoteRef, "success", input.head_sha));
    await proveRemotePreconditions(input, ghExecutable, root, remoteRunner, externalActions);
    const finalRemoteRefResult = await remoteRunner({ command: remoteRef, cwd: root });
    if (!commandSucceeded(finalRemoteRefResult) || finalRemoteRefResult.stdout.trim() !== expectedRef) {
      externalActions.push(
        external("remote_ref", remoteRef, "uncertain", digest(finalRemoteRefResult.stdout)),
      );
      return {
        ...baseReceipt("remote_ref_failed", "remote head changed immediately before PR creation"),
        outcome: "recovery_required",
        repository: input.repository,
        branch: input.head_branch,
        head: input.head_sha,
        executed_units: executedUnits,
        gates,
        external_actions: externalActions,
      };
    }
    externalActions.push(external("remote_ref", remoteRef, "success", input.head_sha));
    const create = [
      ghExecutable,
      "pr",
      "create",
      "--repo",
      input.repository,
      "--base",
      input.base_branch,
      "--head",
      `${input.head_owner}:${input.head_branch}`,
      "--title",
      input.title,
      "--body-file",
      "-",
      ...(input.draft ? ["--draft"] : []),
    ];
    const createResult = await remoteRunner({ command: create, cwd: root, stdin: bodyBytes });
    url = createResult.stdout.trim();
    if (!commandSucceeded(createResult) || !exactPrUrl(url, input.repository)) {
      externalActions.push(external("create", create, createResult.timedOut ? "uncertain" : "failed", ""));
      return {
        ...baseReceipt("create_failed", "PR creation failed or returned an untrusted URL"),
        outcome: "recovery_required",
        repository: input.repository,
        branch: input.head_branch,
        head: input.head_sha,
        executed_units: executedUnits,
        gates,
        external_actions: externalActions,
      };
    }
    created = true;
    externalActions.push(external("create", create, "success", url));
    const render = [
      ghExecutable,
      "pr",
      "view",
      url,
      "--repo",
      input.repository,
      "--json",
      "body,headRefName,headRefOid,baseRefName,baseRefOid,url,title,isDraft,author,state",
    ];
    const renderResult = await remoteRunner({ command: render, cwd: root });
    let rendered: Record<string, unknown> | null = null;
    try {
      rendered = object(JSON.parse(renderResult.stdout) as unknown, "render receipt");
      exactKeys(
        rendered,
        [
          "body",
          "headRefName",
          "headRefOid",
          "baseRefName",
          "baseRefOid",
          "url",
          "title",
          "isDraft",
          "author",
          "state",
        ],
        "render receipt",
      );
    } catch {
      rendered = null;
    }
    if (
      !commandSucceeded(renderResult) ||
      !rendered ||
      rendered.body !== body ||
      rendered.headRefName !== input.head_branch ||
      rendered.headRefOid !== input.head_sha ||
      rendered.baseRefName !== input.base_branch ||
      rendered.baseRefOid !== input.base_sha ||
      rendered.url !== url ||
      rendered.title !== input.title ||
      rendered.isDraft !== input.draft ||
      rendered.state !== "OPEN" ||
      !rendered.author ||
      typeof rendered.author !== "object" ||
      Array.isArray(rendered.author) ||
      (rendered.author as Record<string, unknown>).login !== input.actor
    ) {
      externalActions.push(external("render", render, "uncertain", digest(renderResult.stdout)));
      return {
        ...baseReceipt("render_failed", "created PR render or identity is unproven"),
        outcome: "recovery_required",
        repository: input.repository,
        branch: input.head_branch,
        head: input.head_sha,
        url,
        executed_units: executedUnits,
        gates,
        external_actions: externalActions,
      };
    }
    externalActions.push(external("render", render, "success", digest(body)));
    return {
      schema: createPrReceiptSchema,
      outcome: "success",
      code: "opened",
      repository: input.repository,
      branch: input.head_branch,
      head: input.head_sha,
      url,
      executed_units: executedUnits,
      gates,
      external_actions: externalActions,
      detail: "non-vacuous gates, exact push, PR creation, and render proved",
    };
  } catch (error) {
    return {
      ...baseReceipt("state_drift", error instanceof Error ? error.message : "pre-open state drifted"),
      outcome: pushed || created ? "recovery_required" : "refused",
      repository: input.repository,
      branch: input.head_branch,
      head: input.head_sha,
      url,
      executed_units: executedUnits,
      gates,
      external_actions: externalActions,
    };
  } finally {
    if (gateParent) await rm(gateParent, { recursive: true, force: true });
  }
}

function exactPrUrl(value: string, repository: string): boolean {
  const escaped = repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^https://github\\.com/${escaped}/pull/[1-9]\\d*$`).test(value);
}

async function verifyEntrypoint(entrypoint: string, skillFile: string): Promise<void> {
  if (!path.isAbsolute(entrypoint) || !path.isAbsolute(skillFile))
    throw new Error("entrypoint and skill file must be absolute");
  const resolved = path.resolve(entrypoint);
  const plugin = path.dirname(path.dirname(resolved));
  const expectedSkill = path.join(plugin, "skills", "tailrocks-create-pr", "SKILL.md");
  if (path.resolve(skillFile) !== expectedSkill)
    throw new Error("loader skill does not own create-pr entrypoint");
  for (const [candidate, kind] of [
    [resolved, "file"],
    [expectedSkill, "file"],
    [path.join(path.dirname(resolved), "resolve-executable.ts"), "file"],
    [path.dirname(resolved), "directory"],
    [plugin, "directory"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("installed create-pr package is unsafe");
  }
}

async function readBoundedStdin(): Promise<string> {
  const reader = Bun.stdin.stream().getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  const timer = setTimeout(() => reader.cancel("stdin deadline exceeded"), 5_000);
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > maximumInputBytes) throw new Error("stdin is too large");
      chunks.push(result.value);
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  if (bytes === 0) throw new Error("stdin is empty");
  return Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    bytes,
  ).toString("utf8");
}

if (import.meta.main) {
  let receipt: CreatePrReceipt;
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--skill-file")
      throw new Error("usage: create-pr --skill-file <loader-provided-absolute-SKILL.md>");
    await verifyEntrypoint(process.argv[1]!, args[1]!);
    receipt = await createPullRequest(JSON.parse(await readBoundedStdin()));
  } catch (error) {
    receipt = baseReceipt("invalid_input", error instanceof Error ? error.message : "CLI refused");
  }
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
  process.exit(receipt.outcome === "success" ? 0 : receipt.outcome === "recovery_required" ? 3 : 2);
}
