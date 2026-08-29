import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicRecoveryArtifacts, atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";
import { runBoundedCommand } from "./bounded-command";
import { resolveExecutable } from "./resolve-executable";

export const contributionStageInputSchema = "tailrocks.contribution-stage-input/v1" as const;
export const contributionStageReceiptSchema = "tailrocks.contribution-stage/v1" as const;

export type ContributionStage = "recon" | "propose" | "prepare" | "submit" | "respond";

interface RepositoryBinding {
  readonly root: string;
  readonly base: string;
  readonly head: string;
  readonly changed_paths: readonly string[];
  readonly fork_remote_url: string;
  readonly target_remote_url: string;
}

interface FileIdentity {
  readonly name: string;
  readonly sha256: string;
}

interface FileWrite {
  readonly name: string;
  readonly expected_sha256: string | null;
  readonly content: string;
}

interface ActionBinding {
  readonly id: string;
  readonly kind: string;
  readonly host: string;
  readonly target: string;
  readonly actor: string;
  readonly credential_scope: string;
  readonly purpose: string;
  readonly payload_sha256: string;
  readonly before_sha256: string;
}

interface ActionApproval {
  readonly action_id: string;
  readonly binding_sha256: string;
  readonly approval_id: string;
  readonly approved_at: string;
  readonly expires_at: string;
}

interface ActionReceipt {
  readonly action_id: string;
  readonly binding_sha256: string;
  readonly outcome: "success";
  readonly remote_id: string;
  readonly after_sha256: string;
}

interface ContributionStageInput {
  readonly schema: typeof contributionStageInputSchema;
  readonly contribution_id: string;
  readonly repository: string;
  readonly repo: RepositoryBinding;
  readonly handoff_root: string;
  readonly predecessors: readonly FileIdentity[];
  readonly writes: readonly FileWrite[];
  readonly actions: readonly ActionBinding[];
  readonly approvals: readonly ActionApproval[];
  readonly receipts: readonly ActionReceipt[];
  readonly now: string;
}

export interface ContributionMutation {
  readonly path: string;
  readonly before_sha256: string | null;
  readonly after_sha256: string;
}

export interface ContributionActionProof {
  readonly action_id: string;
  readonly kind: string;
  readonly binding_sha256: string;
  readonly approval_id: string;
  readonly receipt_id: string;
  readonly after_sha256: string;
}

export interface ContributionPartialState {
  readonly path: string;
  readonly observed_sha256: string;
  readonly ownership: "owned_postimage" | "concurrent_replacement";
}

export interface ContributionRuntimeIdentity {
  readonly skill_sha256: string;
  readonly entrypoint_sha256: string;
  readonly core_sha256: string;
  readonly bounded_command_sha256: string;
  readonly atomic_transaction_sha256: string;
  readonly plugin_manifest_sha256: string;
  readonly git_sha256: string;
}

export interface ContributionStageReceipt {
  readonly schema: typeof contributionStageReceiptSchema;
  readonly stage: ContributionStage;
  readonly outcome: "success" | "refused" | "recovery_required";
  readonly code: "transitioned" | "invalid_input" | "state_drift" | "repository_drift" | "recovery_required";
  readonly contribution_id: string;
  readonly repository: string;
  readonly head: string;
  readonly actions: readonly ContributionActionProof[];
  readonly mutations: readonly ContributionMutation[];
  readonly partial_state: readonly ContributionPartialState[];
  readonly recovery_artifacts: readonly string[];
  readonly runtime: ContributionRuntimeIdentity | null;
  readonly detail: string;
}

export interface ContributionStageRuntime extends AtomicFileRuntime {
  readonly now?: () => Date;
  readonly runGit?: (
    args: readonly string[],
    cwd: string,
  ) => Promise<{
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
    readonly timedOut: boolean;
    readonly saturated: boolean;
  }>;
}

const shaPattern = /^[a-f0-9]{64}$/;
const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const repositoryPattern =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$/;
const contributionPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const maximumInputBytes = 1_000_000;
const maximumEntries = 1_000;
const maximumContentBytes = 500_000;

const outputNames: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: ["target.json", "recon-report.md", "log.md"],
  propose: ["proposal.md", "log.md"],
  prepare: ["prepare-receipt.json", "pr_description.md", "log.md"],
  submit: ["submission.json", "log.md"],
  respond: ["response.json", "log.md"],
};
const handoffNames = new Set([
  "target.json",
  "recon-report.md",
  "proposal.md",
  "prepare-receipt.json",
  "pr_description.md",
  "submission.json",
  "response.json",
  "log.md",
]);

const predecessorNames: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: [],
  propose: ["target.json", "recon-report.md"],
  prepare: ["target.json", "recon-report.md", "proposal.md"],
  submit: ["target.json", "recon-report.md", "proposal.md", "prepare-receipt.json"],
  respond: ["target.json", "submission.json"],
};

const producerStage: Readonly<Record<string, ContributionStage>> = {
  "target.json": "recon",
  "recon-report.md": "recon",
  "proposal.md": "propose",
  "prepare-receipt.json": "prepare",
  "pr_description.md": "prepare",
  "submission.json": "submit",
  "response.json": "respond",
};

const forbiddenSuccessors: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: [],
  propose: ["proposal.md", "prepare-receipt.json", "pr_description.md", "submission.json", "response.json"],
  prepare: ["prepare-receipt.json", "pr_description.md", "submission.json", "response.json"],
  submit: ["submission.json", "response.json"],
  respond: [],
};

const actionKinds: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: ["GET"],
  propose: [],
  prepare: [],
  submit: ["GET", "SIGN", "PUSH", "CREATE_PR"],
  respond: ["GET", "PUSH", "REPLY", "RETEST", "CLOSE", "WITHDRAW"],
};

const requiredActionKinds: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: ["GET"],
  propose: [],
  prepare: [],
  submit: ["PUSH", "CREATE_PR"],
  respond: ["GET"],
};

function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index]))
    throw new Error(`${label} has unknown or missing fields`);
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function strings(value: unknown, label: string): readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length > maximumEntries ||
    value.some((item) => typeof item !== "string")
  )
    throw new Error(`${label} must be a bounded string array`);
  return value as string[];
}

function parseDate(value: unknown, label: string): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))
    throw new Error(`${label} must be an ISO UTC timestamp`);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString() !== value)
    throw new Error(`${label} is invalid`);
  return parsed;
}

function safeRelative(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 512 &&
    !/[\u0000-\u001f\u007f]/.test(value) &&
    !path.isAbsolute(value) &&
    !value.includes("\\") &&
    value.split("/").every((part) => part && part !== "." && part !== "..")
  );
}

function sortedUnique(values: readonly string[], label: string): readonly string[] {
  if (values.some((value) => !safeRelative(value))) throw new Error(`${label} contains an unsafe path`);
  const sorted = [...values].sort();
  if (new Set(sorted).size !== sorted.length) throw new Error(`${label} contains duplicates`);
  if (values.some((value, index) => value !== sorted[index])) throw new Error(`${label} must be sorted`);
  return values;
}

function canonicalGithubRemote(value: unknown, label: string): string {
  if (typeof value !== "string" || /[\u0000-\u001f\u007f%?#]/.test(value))
    throw new Error(`${label} is invalid`);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} is invalid`);
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "github.com" ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  )
    throw new Error(`${label} is invalid`);
  const repository = parsed.pathname.replace(/^\//, "").replace(/\.git$/, "");
  const [, repositoryName = ""] = repository.split("/");
  if (
    !repositoryPattern.test(repository) ||
    repositoryName.includes("..") ||
    repositoryName === "." ||
    repositoryName.endsWith(".")
  )
    throw new Error(`${label} is invalid`);
  return `https://github.com/${repository}.git`;
}

function parseInput(raw: unknown, stage: ContributionStage): ContributionStageInput {
  const value = object(raw, "input");
  exactKeys(
    value,
    [
      "schema",
      "contribution_id",
      "repository",
      "repo",
      "handoff_root",
      "predecessors",
      "writes",
      "actions",
      "approvals",
      "receipts",
      "now",
    ],
    "input",
  );
  if (value.schema !== contributionStageInputSchema) throw new Error("input schema is invalid");
  if (typeof value.contribution_id !== "string" || !contributionPattern.test(value.contribution_id))
    throw new Error("contribution_id is invalid");
  if (typeof value.repository !== "string" || !repositoryPattern.test(value.repository))
    throw new Error("repository is invalid");
  const [, repositoryName = ""] = (value.repository as string).split("/");
  if (repositoryName.includes("..") || repositoryName === "." || repositoryName.endsWith("."))
    throw new Error("repository is invalid");
  if (typeof value.handoff_root !== "string" || !path.isAbsolute(value.handoff_root))
    throw new Error("handoff_root must be absolute");
  const repo = object(value.repo, "repo");
  exactKeys(repo, ["root", "base", "head", "changed_paths", "fork_remote_url", "target_remote_url"], "repo");
  if (typeof repo.root !== "string" || !path.isAbsolute(repo.root))
    throw new Error("repo.root must be absolute");
  if (typeof repo.base !== "string" || !revisionPattern.test(repo.base))
    throw new Error("repo.base is invalid");
  if (typeof repo.head !== "string" || !revisionPattern.test(repo.head))
    throw new Error("repo.head is invalid");
  const changedPaths = sortedUnique(strings(repo.changed_paths, "repo.changed_paths"), "repo.changed_paths");
  const forkRemoteUrl = canonicalGithubRemote(repo.fork_remote_url, "repo.fork_remote_url");
  const targetRemoteUrl = canonicalGithubRemote(repo.target_remote_url, "repo.target_remote_url");
  if (targetRemoteUrl !== `https://github.com/${value.repository}.git` || forkRemoteUrl === targetRemoteUrl)
    throw new Error("fork and target remote identities are invalid");
  const predecessors = (Array.isArray(value.predecessors) ? value.predecessors : []).map((entry, index) => {
    const item = object(entry, `predecessors[${index}]`);
    exactKeys(item, ["name", "sha256"], `predecessors[${index}]`);
    if (typeof item.name !== "string" || !outputName(item.name))
      throw new Error("predecessor name is invalid");
    if (typeof item.sha256 !== "string" || !shaPattern.test(item.sha256))
      throw new Error("predecessor hash is invalid");
    return item as unknown as FileIdentity;
  });
  const writes = (Array.isArray(value.writes) ? value.writes : []).map((entry, index) => {
    const item = object(entry, `writes[${index}]`);
    exactKeys(item, ["name", "expected_sha256", "content"], `writes[${index}]`);
    if (typeof item.name !== "string" || !outputName(item.name)) throw new Error("write name is invalid");
    if (
      item.expected_sha256 !== null &&
      (typeof item.expected_sha256 !== "string" || !shaPattern.test(item.expected_sha256))
    )
      throw new Error("write preimage hash is invalid");
    if (
      typeof item.content !== "string" ||
      !item.content ||
      Buffer.byteLength(item.content) > maximumContentBytes
    )
      throw new Error("write content is empty or too large");
    if (item.name.endsWith(".json")) {
      const parsed = JSON.parse(item.content) as unknown;
      object(parsed, `${item.name} content`);
    }
    return item as unknown as FileWrite;
  });
  const actions = (Array.isArray(value.actions) ? value.actions : []).map((entry, index) => {
    const item = object(entry, `actions[${index}]`);
    exactKeys(
      item,
      [
        "id",
        "kind",
        "host",
        "target",
        "actor",
        "credential_scope",
        "purpose",
        "payload_sha256",
        "before_sha256",
      ],
      `actions[${index}]`,
    );
    if (
      typeof item.id !== "string" ||
      !idPattern.test(item.id) ||
      typeof item.kind !== "string" ||
      !actionKinds[stage].includes(item.kind) ||
      typeof item.host !== "string" ||
      item.host !== "github.com" ||
      typeof item.target !== "string" ||
      !item.target ||
      item.target.length > 512 ||
      /[\u0000-\u001f\u007f]/.test(item.target) ||
      typeof item.actor !== "string" ||
      !idPattern.test(item.actor) ||
      typeof item.credential_scope !== "string" ||
      !idPattern.test(item.credential_scope) ||
      typeof item.purpose !== "string" ||
      !item.purpose ||
      item.purpose.length > 256 ||
      /[\u0000-\u001f\u007f]/.test(item.purpose) ||
      typeof item.payload_sha256 !== "string" ||
      !shaPattern.test(item.payload_sha256) ||
      typeof item.before_sha256 !== "string" ||
      !shaPattern.test(item.before_sha256)
    )
      throw new Error("action binding is invalid");
    return {
      id: item.id as string,
      kind: item.kind as string,
      host: item.host as string,
      target: item.target as string,
      actor: item.actor as string,
      credential_scope: item.credential_scope as string,
      purpose: item.purpose as string,
      payload_sha256: item.payload_sha256 as string,
      before_sha256: item.before_sha256 as string,
    };
  });
  const approvals = (Array.isArray(value.approvals) ? value.approvals : []).map((entry, index) => {
    const item = object(entry, `approvals[${index}]`);
    exactKeys(
      item,
      ["action_id", "binding_sha256", "approval_id", "approved_at", "expires_at"],
      `approvals[${index}]`,
    );
    if (
      typeof item.action_id !== "string" ||
      !idPattern.test(item.action_id) ||
      typeof item.binding_sha256 !== "string" ||
      !shaPattern.test(item.binding_sha256) ||
      typeof item.approval_id !== "string" ||
      !idPattern.test(item.approval_id)
    )
      throw new Error("approval identity is invalid");
    parseDate(item.approved_at, "approved_at");
    parseDate(item.expires_at, "expires_at");
    return {
      action_id: item.action_id as string,
      binding_sha256: item.binding_sha256 as string,
      approval_id: item.approval_id as string,
      approved_at: item.approved_at as string,
      expires_at: item.expires_at as string,
    };
  });
  const receipts = (Array.isArray(value.receipts) ? value.receipts : []).map((entry, index) => {
    const item = object(entry, `receipts[${index}]`);
    exactKeys(
      item,
      ["action_id", "binding_sha256", "outcome", "remote_id", "after_sha256"],
      `receipts[${index}]`,
    );
    if (
      typeof item.action_id !== "string" ||
      !idPattern.test(item.action_id) ||
      typeof item.binding_sha256 !== "string" ||
      !shaPattern.test(item.binding_sha256) ||
      item.outcome !== "success" ||
      typeof item.remote_id !== "string" ||
      !idPattern.test(item.remote_id) ||
      typeof item.after_sha256 !== "string" ||
      !shaPattern.test(item.after_sha256)
    )
      throw new Error("external receipt is invalid");
    return {
      action_id: item.action_id as string,
      binding_sha256: item.binding_sha256 as string,
      outcome: "success" as const,
      remote_id: item.remote_id as string,
      after_sha256: item.after_sha256 as string,
    };
  });
  parseDate(value.now, "now");
  if ([predecessors, writes, actions, approvals, receipts].some((items) => items.length > maximumEntries))
    throw new Error("input collection is too large");
  return {
    schema: contributionStageInputSchema,
    contribution_id: value.contribution_id as string,
    repository: value.repository as string,
    repo: {
      root: repo.root as string,
      base: repo.base as string,
      head: repo.head as string,
      changed_paths: changedPaths,
      fork_remote_url: forkRemoteUrl,
      target_remote_url: targetRemoteUrl,
    },
    handoff_root: value.handoff_root as string,
    predecessors,
    writes,
    actions,
    approvals,
    receipts,
    now: value.now as string,
  };
}

function outputName(name: string): boolean {
  return [
    "target.json",
    "recon-report.md",
    "proposal.md",
    "prepare-receipt.json",
    "pr_description.md",
    "submission.json",
    "response.json",
    "log.md",
  ].includes(name);
}

function exactNames(actual: readonly string[], expected: readonly string[], label: string): void {
  const sorted = [...actual].sort();
  const wanted = [...expected].sort();
  if (
    sorted.length !== wanted.length ||
    sorted.some((name, index) => name !== wanted[index]) ||
    new Set(actual).size !== actual.length
  )
    throw new Error(`${label} must contain exactly ${wanted.join(", ") || "no files"}`);
}

function validateWriteContent(
  write: FileWrite,
  input: ContributionStageInput,
  stage: ContributionStage,
): void {
  const actionIds = input.actions.map(({ id }) => id);
  if (write.name.endsWith(".json")) {
    const artifact = object(JSON.parse(write.content) as unknown, `${write.name} content`);
    exactKeys(
      artifact,
      [
        "schema",
        "contribution_id",
        "repository",
        "stage",
        "head",
        "actions",
        "approval_ids",
        "receipt_ids",
        "data",
      ],
      `${write.name} content`,
    );
    if (
      artifact.schema !== "tailrocks.contribution-artifact/v1" ||
      artifact.contribution_id !== input.contribution_id ||
      artifact.repository !== input.repository ||
      artifact.stage !== stage ||
      artifact.head !== input.repo.head ||
      JSON.stringify(artifact.actions) !== JSON.stringify(actionIds) ||
      JSON.stringify(artifact.approval_ids) !==
        JSON.stringify(input.approvals.map(({ approval_id }) => approval_id)) ||
      JSON.stringify(artifact.receipt_ids) !==
        JSON.stringify(input.receipts.map(({ remote_id }) => remote_id))
    )
      throw new Error(`${write.name} content is not bound to this transition`);
    object(artifact.data, `${write.name}.data`);
    return;
  }
  for (const marker of [
    `Contribution-ID: ${input.contribution_id}`,
    `Repository: ${input.repository}`,
    `Stage: ${stage}`,
    `Head: ${input.repo.head}`,
  ])
    if (!write.content.includes(marker)) throw new Error(`${write.name} lacks exact ${marker}`);
}

async function rejectReusedActionEvidence(root: string, input: ContributionStageInput): Promise<void> {
  const priorActions = new Set<string>();
  const priorApprovals = new Set<string>();
  const priorReceipts = new Set<string>();
  for (const name of ["target.json", "prepare-receipt.json", "submission.json", "response.json"]) {
    const body = await currentFile(root, name);
    if (body === null) continue;
    const artifact = object(JSON.parse(body) as unknown, `${name} action history`);
    validatePredecessorContent(name, body, input);
    for (const id of strings(artifact.actions, `${name}.actions`)) priorActions.add(id);
    for (const id of strings(artifact.approval_ids, `${name}.approval_ids`)) priorApprovals.add(id);
    for (const id of strings(artifact.receipt_ids, `${name}.receipt_ids`)) priorReceipts.add(id);
  }
  if (input.actions.some(({ id }) => priorActions.has(id)))
    throw new Error("action identity was already consumed");
  if (input.approvals.some(({ approval_id }) => priorApprovals.has(approval_id)))
    throw new Error("approval identity was already consumed");
  if (input.receipts.some(({ remote_id }) => priorReceipts.has(remote_id)))
    throw new Error("remote receipt identity was already consumed");
}

function validatePredecessorContent(name: string, body: string, input: ContributionStageInput): void {
  if (name.endsWith(".json")) {
    const artifact = object(JSON.parse(body) as unknown, `${name} predecessor`);
    if (
      artifact.schema !== "tailrocks.contribution-artifact/v1" ||
      artifact.contribution_id !== input.contribution_id ||
      artifact.repository !== input.repository ||
      artifact.stage !== producerStage[name]
    )
      throw new Error(`${name} has the wrong contribution or producer stage`);
    return;
  }
  for (const marker of [
    `Contribution-ID: ${input.contribution_id}`,
    `Repository: ${input.repository}`,
    `Stage: ${producerStage[name]}`,
  ])
    if (!body.includes(marker)) throw new Error(`${name} has the wrong contribution or producer stage`);
}

function bindActions(input: ContributionStageInput, stage: ContributionStage, now: Date): void {
  exactNames(
    input.actions.map(({ id }) => id),
    input.approvals.map(({ action_id }) => action_id),
    "approval action IDs",
  );
  exactNames(
    input.actions.map(({ id }) => id),
    input.receipts.map(({ action_id }) => action_id),
    "receipt action IDs",
  );
  for (const kind of requiredActionKinds[stage])
    if (!input.actions.some((action) => action.kind === kind))
      throw new Error(`${stage} requires a ${kind} receipt`);
  if (actionKinds[stage].length === 0 && input.actions.length !== 0)
    throw new Error(`${stage} is local-only and accepts no external action`);
  if (
    input.actions.some(
      ({ target }) => target !== input.repository && !target.startsWith(`${input.repository}/`),
    )
  )
    throw new Error("external action target differs from the bound repository");
  const kinds = input.actions.map(({ kind }) => kind);
  if (stage === "submit") {
    if (
      kinds.filter((kind) => kind === "SIGN").length > 1 ||
      kinds.filter((kind) => kind === "PUSH").length !== 1 ||
      kinds.filter((kind) => kind === "CREATE_PR").length !== 1
    )
      throw new Error("submit requires exactly one push and PR receipt and at most one signoff");
    if (
      kinds.indexOf("PUSH") > kinds.indexOf("CREATE_PR") ||
      (kinds.includes("SIGN") && kinds.indexOf("SIGN") > kinds.indexOf("PUSH"))
    )
      throw new Error("submit action order is invalid");
  }
  if (stage === "respond") {
    if (kinds[0] !== "GET") throw new Error("respond must refresh before any mutation");
    if (kinds.includes("CLOSE") && kinds.includes("WITHDRAW"))
      throw new Error("respond terminal actions conflict");
    const terminal = Math.max(kinds.indexOf("CLOSE"), kinds.indexOf("WITHDRAW"));
    if (terminal >= 0 && terminal !== kinds.length - 1)
      throw new Error("respond terminal action must be last");
  }
  const approvalIds = new Set<string>();
  const remoteIds = new Set<string>();
  for (const action of input.actions) {
    const bindingSha = digest(JSON.stringify(action));
    const approval = input.approvals.find((item) => item.action_id === action.id)!;
    const receipt = input.receipts.find((item) => item.action_id === action.id)!;
    if (approval.binding_sha256 !== bindingSha || receipt.binding_sha256 !== bindingSha)
      throw new Error(`action ${action.id} is not bound to exact approval and receipt`);
    const approvedAt = parseDate(approval.approved_at, "approved_at");
    const expiresAt = parseDate(approval.expires_at, "expires_at");
    if (approvedAt > now || expiresAt <= now || expiresAt.valueOf() - approvedAt.valueOf() > 5 * 60_000)
      throw new Error(`action ${action.id} approval is stale or overlong`);
    if (approvalIds.has(approval.approval_id) || remoteIds.has(receipt.remote_id))
      throw new Error("approval and remote receipt identities must be one-use");
    approvalIds.add(approval.approval_id);
    remoteIds.add(receipt.remote_id);
  }
}

async function safeDirectory(directory: string, label: string): Promise<string> {
  const resolved = path.resolve(directory);
  const info = await lstat(resolved);
  if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(resolved)) !== resolved)
    throw new Error(`${label} is not a canonical regular directory`);
  return resolved;
}

async function currentFile(root: string, name: string): Promise<string | null> {
  const file = path.join(root, name);
  try {
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > maximumContentBytes)
      throw new Error(`unsafe handoff file: ${name}`);
    const before = await readFile(file, "utf8");
    const after = await lstat(file);
    if (
      info.dev !== after.dev ||
      info.ino !== after.ino ||
      info.size !== after.size ||
      info.mtimeMs !== after.mtimeMs
    )
      throw new Error(`handoff file changed while read: ${name}`);
    return before;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function defaultGit(args: readonly string[], cwd: string) {
  const executable = await trustedGitExecutable();
  return runBoundedCommand({
    command: [
      executable,
      "-c",
      "core.fsmonitor=false",
      "-c",
      "core.hooksPath=/dev/null",
      "-c",
      "diff.external=",
      ...args,
    ],
    cwd,
    timeoutMilliseconds: 10_000,
    maximumOutputBytes: 1_000_000,
    inheritEnvironment: false,
    env: {
      PATH: "/usr/bin:/bin",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
      GIT_OPTIONAL_LOCKS: "0",
    },
  });
}

async function trustedGitExecutable(): Promise<string> {
  return resolveExecutable("git");
}

async function verifyRepository(
  input: ContributionStageInput,
  runtime: ContributionStageRuntime,
): Promise<void> {
  const root = await safeDirectory(input.repo.root, "repository root");
  const handoff = await safeDirectory(input.handoff_root, "handoff root");
  if (
    handoff === root ||
    handoff.startsWith(`${root}${path.sep}`) ||
    root.startsWith(`${handoff}${path.sep}`)
  )
    throw new Error("handoff and target repository must be separate trees");
  if (
    path.basename(path.dirname(handoff)) !== "contrib" ||
    path.basename(handoff) !== input.repository.replace("/", "-")
  )
    throw new Error("handoff root does not match contrib/<owner>-<repo>");
  const run = runtime.runGit ?? defaultGit;
  const invoke = async (args: readonly string[]): Promise<string> => {
    const result = await run(args, root);
    if (result.code !== 0 || result.timedOut || result.saturated)
      throw new Error("repository identity command failed");
    return result.stdout;
  };
  const top = (await invoke(["rev-parse", "--show-toplevel"])).trim();
  if (top !== root) throw new Error("repository root is not the exact Git top level");
  const head = (await invoke(["rev-parse", "HEAD"])).trim();
  if (head !== input.repo.head) throw new Error("repository HEAD drifted");
  await invoke(["merge-base", "--is-ancestor", input.repo.base, input.repo.head]);
  const forkRemote = (await invoke(["remote", "get-url", "origin"])).trim();
  const targetRemote = (await invoke(["remote", "get-url", "upstream"])).trim();
  if (forkRemote !== input.repo.fork_remote_url || targetRemote !== input.repo.target_remote_url)
    throw new Error("repository remote identity drifted");
  if ((await invoke(["status", "--porcelain=v1", "--untracked-files=all"])).length !== 0)
    throw new Error("repository is dirty");
  const changed = (
    await invoke(["diff", "--name-only", "-z", "--no-renames", input.repo.base, input.repo.head])
  )
    .split("\0")
    .filter(Boolean)
    .sort();
  if (
    changed.length !== input.repo.changed_paths.length ||
    changed.some((name, index) => name !== input.repo.changed_paths[index])
  )
    throw new Error("repository changed-path binding drifted");
  if (changed.some((name) => forbiddenTargetPath(name)))
    throw new Error("target diff contains handoff or agent metadata");
}

function forbiddenTargetPath(name: string): boolean {
  const parts = name.split("/");
  const root = parts[0]!;
  return (
    root === "contrib" ||
    new Set([".agents", ".claude", ".codex", ".kimi", ".opencode"]).has(root) ||
    /^(?:AGENTS|CLAUDE|GEMINI)\.md$/.test(parts.at(-1)!)
  );
}

function refused(
  stage: ContributionStage,
  code: ContributionStageReceipt["code"],
  detail: string,
): ContributionStageReceipt {
  return {
    schema: contributionStageReceiptSchema,
    stage,
    outcome: code === "recovery_required" ? "recovery_required" : "refused",
    code,
    contribution_id: "",
    repository: "",
    head: "",
    actions: [],
    mutations: [],
    partial_state: [],
    recovery_artifacts: [],
    runtime: null,
    detail,
  };
}

export async function runContributionStage(
  raw: unknown,
  stage: ContributionStage,
  runtime: ContributionStageRuntime = {},
): Promise<ContributionStageReceipt> {
  let input: ContributionStageInput;
  let actionProofs: ContributionActionProof[] = [];
  try {
    input = parseInput(raw, stage);
  } catch (error) {
    return refused(stage, "invalid_input", error instanceof Error ? error.message : "invalid input");
  }
  try {
    const now = runtime.now?.() ?? new Date();
    const boundNow = new Date(input.now);
    if (Math.abs(now.valueOf() - boundNow.valueOf()) > 5_000) throw new Error("bound time is not current");
    bindActions(input, stage, now);
    actionProofs = input.actions.map((action) => ({
      action_id: action.id,
      kind: action.kind,
      binding_sha256: digest(JSON.stringify(action)),
      approval_id: input.approvals.find((item) => item.action_id === action.id)!.approval_id,
      receipt_id: input.receipts.find((item) => item.action_id === action.id)!.remote_id,
      after_sha256: input.receipts.find((item) => item.action_id === action.id)!.after_sha256,
    }));
    await verifyRepository(input, runtime);
    const handoff = await safeDirectory(input.handoff_root, "handoff root");
    const handoffEntries = await readdir(handoff);
    if (stage === "recon") {
      if (handoffEntries.length !== 0) throw new Error("recon requires an empty one-contribution handoff");
    }
    if (handoffEntries.some((name) => !handoffNames.has(name)))
      throw new Error("handoff contains unknown or recovery residue");
    for (const name of forbiddenSuccessors[stage])
      if ((await currentFile(handoff, name)) !== null)
        throw new Error(`${stage} cannot run after ${name} exists`);
    await rejectReusedActionEvidence(handoff, input);
    exactNames(
      input.predecessors.map(({ name }) => name),
      predecessorNames[stage],
      "predecessors",
    );
    exactNames(
      input.writes.map(({ name }) => name),
      outputNames[stage],
      "writes",
    );
    const readSet = [];
    for (const predecessor of input.predecessors) {
      const body = await currentFile(handoff, predecessor.name);
      if (body === null || digest(body) !== predecessor.sha256)
        throw new Error(`predecessor drift: ${predecessor.name}`);
      validatePredecessorContent(predecessor.name, body, input);
      readSet.push({ file: path.join(handoff, predecessor.name), expected: body });
    }
    const writes = [];
    const mutations: ContributionMutation[] = [];
    for (const write of input.writes) {
      validateWriteContent(write, input, stage);
      const before = await currentFile(handoff, write.name);
      const beforeSha = before === null ? null : digest(before);
      if (beforeSha !== write.expected_sha256) throw new Error(`write preimage drift: ${write.name}`);
      if (
        write.name === "log.md" &&
        before !== null &&
        (!write.content.startsWith(before) || write.content.length <= before.length)
      )
        throw new Error("log.md must append to exact prior bytes");
      writes.push({ file: path.join(handoff, write.name), expected: before, content: write.content });
      mutations.push({
        path: path.join(handoff, write.name),
        before_sha256: beforeSha,
        after_sha256: digest(write.content),
      });
    }
    await atomicWriteFiles(writes, runtime, readSet);
    return {
      schema: contributionStageReceiptSchema,
      stage,
      outcome: "success",
      code: "transitioned",
      contribution_id: input.contribution_id,
      repository: input.repository,
      head: input.repo.head,
      actions: actionProofs,
      mutations,
      partial_state: [],
      recovery_artifacts: [],
      runtime: null,
      detail: `${stage} transition and exact receipts proved`,
    };
  } catch (error) {
    const recovery = atomicRecoveryArtifacts(error);
    const partialState: ContributionPartialState[] = [];
    const survivingMutations: ContributionMutation[] = [];
    try {
      const handoff = await safeDirectory(input.handoff_root, "handoff root");
      for (const write of input.writes) {
        const body = await currentFile(handoff, write.name);
        const observed = body === null ? null : digest(body);
        if (observed === write.expected_sha256 || observed === null) continue;
        const after = digest(write.content);
        partialState.push({
          path: path.join(handoff, write.name),
          observed_sha256: observed,
          ownership: observed === after ? "owned_postimage" : "concurrent_replacement",
        });
        if (observed === after)
          survivingMutations.push({
            path: path.join(handoff, write.name),
            before_sha256: write.expected_sha256,
            after_sha256: after,
          });
      }
    } catch {
      // The original failure remains authoritative; unsafe paths are never re-read through aliases.
    }
    return {
      ...refused(
        stage,
        recovery.length
          ? "recovery_required"
          : /repository|Git|HEAD|changed-path|dirty/.test(String(error))
            ? "repository_drift"
            : "state_drift",
        error instanceof Error ? error.message : "stage refused",
      ),
      contribution_id: input.contribution_id,
      repository: input.repository,
      head: input.repo.head,
      actions: actionProofs,
      mutations: survivingMutations,
      partial_state: partialState,
      recovery_artifacts: recovery,
    };
  }
}

export async function verifyContributionStageEntrypoint(
  entrypoint: string,
  stage: ContributionStage,
  skillFile: string,
): Promise<ContributionRuntimeIdentity> {
  if (!path.isAbsolute(entrypoint) || !path.isAbsolute(skillFile))
    throw new Error("contribution stage entrypoint and loader skill must be absolute");
  const resolved = path.resolve(entrypoint);
  const expectedName = `contribute-${stage}.ts`;
  if (path.basename(resolved) !== expectedName) throw new Error(`wrong ${stage} entrypoint name`);
  const scripts = path.dirname(resolved);
  const skill = path.dirname(scripts);
  const skills = path.dirname(skill);
  const plugin = path.dirname(skills);
  const core = path.join(plugin, "scripts", "contribution-stage-core.ts");
  const bounded = path.join(plugin, "scripts", "bounded-command.ts");
  const atomic = path.join(plugin, "scripts", "atomic-file-transaction.ts");
  const resolver = path.join(plugin, "scripts", "resolve-executable.ts");
  const manifest = path.join(plugin, ".codex-plugin", "plugin.json");
  const expectedSkillFile = path.join(skill, "SKILL.md");
  if (path.resolve(skillFile) !== expectedSkillFile)
    throw new Error("entrypoint is not owned by the loader-provided skill package");
  if (path.basename(skill) !== `tailrocks-contribute-${stage}` || path.basename(skills) !== "skills")
    throw new Error("contribution entrypoint package identity is invalid");
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [skills, "directory"],
    [skill, "directory"],
    [scripts, "directory"],
    [resolved, "file"],
    [expectedSkillFile, "file"],
    [core, "file"],
    [bounded, "file"],
    [atomic, "file"],
    [resolver, "file"],
    [manifest, "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (info.isSymbolicLink() || (kind === "directory" ? !info.isDirectory() : !info.isFile()))
      throw new Error(`unsafe installed contribution ${kind}: ${candidate}`);
    if ((await realpath(candidate)) !== candidate)
      throw new Error(`non-canonical installed contribution path: ${candidate}`);
  }
  const manifestValue = object(JSON.parse(await readFile(manifest, "utf8")) as unknown, "plugin manifest");
  if (manifestValue.name !== "tailrocks-skills" || manifestValue.skills !== "./skills/")
    throw new Error("installed contribution plugin manifest is invalid");
  const hashFile = async (file: string): Promise<string> => digest(await readFile(file));
  return {
    skill_sha256: await hashFile(expectedSkillFile),
    entrypoint_sha256: await hashFile(resolved),
    core_sha256: await hashFile(core),
    bounded_command_sha256: await hashFile(bounded),
    atomic_transaction_sha256: await hashFile(atomic),
    plugin_manifest_sha256: await hashFile(manifest),
    git_sha256: await hashFile(await trustedGitExecutable()),
  };
}

export async function readBoundedContributionStdin(
  stream: ReadableStream<Uint8Array>,
  maximumBytes = maximumInputBytes,
  timeoutMilliseconds = 5_000,
): Promise<string> {
  if (
    !Number.isSafeInteger(maximumBytes) ||
    maximumBytes < 1 ||
    !Number.isSafeInteger(timeoutMilliseconds) ||
    timeoutMilliseconds < 1
  )
    throw new Error("stdin bounds are invalid");
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("stdin deadline exceeded")), timeoutMilliseconds);
  });
  try {
    while (true) {
      const result = await Promise.race([reader.read(), deadline]);
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > maximumBytes) throw new Error("stdin is too large");
      chunks.push(result.value);
    }
  } finally {
    if (timer) clearTimeout(timer);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
  if (bytes === 0) throw new Error("stdin is empty");
  return Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    bytes,
  ).toString("utf8");
}

export async function contributionStageCli(
  stage: ContributionStage,
  entrypoint: string,
  skillFile: string,
): Promise<number> {
  let receipt: ContributionStageReceipt;
  try {
    const runtime = await verifyContributionStageEntrypoint(entrypoint, stage, skillFile);
    const stdin = await readBoundedContributionStdin(Bun.stdin.stream());
    receipt = { ...(await runContributionStage(JSON.parse(stdin), stage)), runtime };
  } catch (error) {
    receipt = refused(stage, "invalid_input", error instanceof Error ? error.message : "CLI refused");
  }
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
  return receipt.outcome === "success" ? 0 : receipt.outcome === "recovery_required" ? 3 : 2;
}
