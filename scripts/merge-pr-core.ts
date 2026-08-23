import { createHash } from "node:crypto";

import { runBoundedCommand } from "./bounded-command";
import {
  runMergePreflight,
  type CommandResult as PreflightCommandResult,
  type MergePreflightReceipt,
} from "./merge-preflight";

export const mergeRequestSchema = "tailrocks.merge-pr-request/v1" as const;
export const mergeReceiptSchema = "tailrocks.merge-pr/v1" as const;

type MergeMethod = "merge" | "rebase" | "squash";

export interface MergeRequest {
  readonly schema: typeof mergeRequestSchema;
  readonly root: string;
  readonly repository: string;
  readonly pr: number;
  readonly head: string;
  readonly base: string;
  readonly mergeBase: string;
  readonly method: MergeMethod;
  readonly expectedTitle: string;
  readonly expectedBody: string;
  readonly mergeSubject: string;
  readonly mergeBody: string;
  readonly blastRadius: "normal" | "high";
  readonly highBlastRadiusConfirmed: boolean;
  readonly waivers: readonly {
    readonly gate: "delivery" | "documentation";
    readonly reason: string;
  }[];
  readonly adminCheck?: string;
}

export interface MergeCommandRequest {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly stdin?: string;
}

export interface MergeCommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut?: boolean;
  readonly saturated?: boolean;
}

export type MergeRunner = (request: MergeCommandRequest) => Promise<MergeCommandResult>;

interface MergeProof {
  readonly number: number;
  readonly merged: true;
  readonly mergedAt: string;
  readonly headRefOid: string;
  readonly baseRefOid: string;
  readonly mergeCommit: { readonly oid: string };
  readonly method: MergeMethod;
  readonly commitText: "applied" | "not_applicable_for_rebase";
}

export interface MergeReceipt {
  readonly schema: typeof mergeReceiptSchema;
  readonly outcome: "success" | "blocked" | "refused" | "failed" | "uncertain";
  readonly code:
    | "merged"
    | "invalid_request"
    | "authority_missing"
    | "target_mismatch"
    | "metadata_mismatch"
    | "preflight_blocked"
    | "lookup_failed"
    | "merge_uncertain";
  readonly repository?: string;
  readonly pr?: number;
  readonly head?: string;
  readonly base?: string;
  readonly mergeBase?: string;
  readonly method?: MergeMethod;
  readonly titleDigest?: string;
  readonly prBodyDigest?: string;
  readonly subjectDigest?: string;
  readonly bodyDigest?: string;
  readonly adminCheck?: string;
  readonly waivers?: MergeRequest["waivers"];
  readonly preflight?: MergePreflightReceipt;
  readonly mergeAttempted: boolean;
  readonly mergeCommand?: readonly string[];
  readonly mergeExitCode?: number;
  readonly mergeTimedOut?: boolean;
  readonly proof?: MergeProof;
  readonly commands: readonly (readonly string[])[];
  readonly detail: string;
}

interface Runtime {
  readonly runner?: MergeRunner;
}

export const defaultMergeRunner: MergeRunner = ({ command, cwd, stdin }) =>
  runBoundedCommand({ command, cwd, stdin, timeoutMilliseconds: 120_000 });

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted))
    throw new Error(`${label} has unknown or missing keys`);
}

function safeText(value: unknown, label: string, maximum: number): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    Buffer.byteLength(value) > maximum ||
    /[\0\u0001-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  )
    throw new Error(`${label} is invalid`);
  return value;
}

function safeSha(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[0-9a-f]{40}$/.test(value)) throw new Error(`${label} is invalid`);
  return value;
}

function parseRequest(value: unknown): MergeRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("request is not an object");
  const input = value as Record<string, unknown>;
  const expected = [
    "base",
    "blastRadius",
    "expectedBody",
    "expectedTitle",
    "head",
    "highBlastRadiusConfirmed",
    "mergeBase",
    "mergeBody",
    "mergeSubject",
    "method",
    "pr",
    "repository",
    "root",
    "schema",
    "waivers",
    ...(input.adminCheck === undefined ? [] : ["adminCheck"]),
  ];
  exactKeys(input, expected, "request");
  if (input.schema !== mergeRequestSchema) throw new Error("request schema is invalid");
  if (typeof input.root !== "string" || input.root.length === 0 || Buffer.byteLength(input.root) > 4_096)
    throw new Error("root is invalid");
  if (typeof input.repository !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repository))
    throw new Error("repository is invalid");
  if (!Number.isSafeInteger(input.pr) || (input.pr as number) < 1) throw new Error("PR is invalid");
  const method = input.method;
  if (method !== "merge" && method !== "rebase" && method !== "squash")
    throw new Error("merge method is invalid");
  if (input.blastRadius !== "normal" && input.blastRadius !== "high")
    throw new Error("blast radius is invalid");
  if (typeof input.highBlastRadiusConfirmed !== "boolean")
    throw new Error("high-blast confirmation is invalid");
  const adminCheck =
    input.adminCheck === undefined ? undefined : safeText(input.adminCheck, "admin check", 256);
  if (!Array.isArray(input.waivers) || input.waivers.length > 2) throw new Error("waivers are invalid");
  const waivers = input.waivers.map((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error(`waiver ${index + 1} is invalid`);
    const waiver = value as Record<string, unknown>;
    exactKeys(waiver, ["gate", "reason"], `waiver ${index + 1}`);
    if (waiver.gate !== "delivery" && waiver.gate !== "documentation")
      throw new Error(`waiver ${index + 1} gate is invalid`);
    return { gate: waiver.gate, reason: safeText(waiver.reason, `waiver ${index + 1} reason`, 2_000) };
  });
  if (new Set(waivers.map((waiver) => waiver.gate)).size !== waivers.length)
    throw new Error("waivers contain duplicate gates");
  return {
    schema: mergeRequestSchema,
    root: input.root,
    repository: input.repository,
    pr: input.pr as number,
    head: safeSha(input.head, "head"),
    base: safeSha(input.base, "base"),
    mergeBase: safeSha(input.mergeBase, "merge base"),
    method,
    expectedTitle: safeText(input.expectedTitle, "expected title", 512),
    expectedBody: safeText(input.expectedBody, "expected body", 1_000_000),
    mergeSubject: safeText(input.mergeSubject, "merge subject", 512),
    mergeBody: safeText(input.mergeBody, "merge body", 1_000_000),
    blastRadius: input.blastRadius,
    highBlastRadiusConfirmed: input.highBlastRadiusConfirmed,
    waivers,
    ...(adminCheck ? { adminCheck } : {}),
  };
}

function baseReceipt(
  outcome: MergeReceipt["outcome"],
  code: MergeReceipt["code"],
  commands: readonly (readonly string[])[],
  detail: string,
): MergeReceipt {
  return { schema: mergeReceiptSchema, outcome, code, mergeAttempted: false, commands, detail };
}

async function invoke(
  runner: MergeRunner,
  commands: (readonly string[])[],
  root: string,
  command: readonly string[],
  stdin?: string,
): Promise<MergeCommandResult> {
  commands.push(command);
  try {
    return await runner({ command, cwd: root, ...(stdin === undefined ? {} : { stdin }) });
  } catch (error) {
    return { code: 127, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

function parseMetadata(raw: string, request: MergeRequest): string {
  const value = JSON.parse(raw) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("metadata is invalid");
  const record = value as Record<string, unknown>;
  exactKeys(record, ["baseRefOid", "body", "headRefOid", "id", "number", "state", "title"], "metadata");
  if (
    record.number !== request.pr ||
    record.state !== "OPEN" ||
    record.headRefOid !== request.head ||
    record.baseRefOid !== request.base
  )
    throw new Error("TARGET_MISMATCH: pull request metadata identity changed");
  if (record.title !== request.expectedTitle || record.body !== request.expectedBody)
    throw new Error("METADATA_MISMATCH: title or body differs from the authorized bytes");
  return safeText(record.id, "pull request node ID", 512);
}

function parseProof(raw: string, request: MergeRequest): MergeProof | undefined {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
    const record = value as Record<string, unknown>;
    exactKeys(record, ["data"], "merge proof");
    if (!record.data || typeof record.data !== "object" || Array.isArray(record.data)) return undefined;
    const data = record.data as Record<string, unknown>;
    exactKeys(data, ["mergePullRequest"], "merge proof data");
    if (
      !data.mergePullRequest ||
      typeof data.mergePullRequest !== "object" ||
      Array.isArray(data.mergePullRequest)
    )
      return undefined;
    const payload = data.mergePullRequest as Record<string, unknown>;
    exactKeys(payload, ["pullRequest"], "merge proof payload");
    if (!payload.pullRequest || typeof payload.pullRequest !== "object" || Array.isArray(payload.pullRequest))
      return undefined;
    const pullRequest = payload.pullRequest as Record<string, unknown>;
    exactKeys(
      pullRequest,
      ["baseRefOid", "headRefOid", "mergeCommit", "merged", "mergedAt", "number"],
      "merge proof pull request",
    );
    if (
      pullRequest.number !== request.pr ||
      pullRequest.merged !== true ||
      pullRequest.headRefOid !== request.head ||
      typeof pullRequest.mergedAt !== "string" ||
      !Number.isFinite(Date.parse(pullRequest.mergedAt)) ||
      typeof pullRequest.baseRefOid !== "string" ||
      !pullRequest.mergeCommit ||
      typeof pullRequest.mergeCommit !== "object" ||
      Array.isArray(pullRequest.mergeCommit)
    )
      return undefined;
    const mergeCommit = pullRequest.mergeCommit as Record<string, unknown>;
    exactKeys(mergeCommit, ["oid"], "merge proof commit");
    return {
      number: request.pr,
      merged: true,
      mergedAt: pullRequest.mergedAt,
      headRefOid: request.head,
      baseRefOid: safeSha(pullRequest.baseRefOid, "proof base"),
      mergeCommit: { oid: safeSha(mergeCommit.oid, "merge commit") },
      method: request.method,
      commitText: request.method === "rebase" ? "not_applicable_for_rebase" : "applied",
    };
  } catch {
    return undefined;
  }
}

function targetFields(request: MergeRequest) {
  return {
    repository: request.repository,
    pr: request.pr,
    head: request.head,
    base: request.base,
    mergeBase: request.mergeBase,
    method: request.method,
    titleDigest: createHash("sha256").update(request.expectedTitle).digest("hex"),
    prBodyDigest: createHash("sha256").update(request.expectedBody).digest("hex"),
    subjectDigest: createHash("sha256").update(request.mergeSubject).digest("hex"),
    bodyDigest: createHash("sha256").update(request.mergeBody).digest("hex"),
    waivers: request.waivers,
    ...(request.adminCheck ? { adminCheck: request.adminCheck } : {}),
  };
}

export async function mergePullRequest(value: unknown, runtime: Runtime = {}): Promise<MergeReceipt> {
  const commands: (readonly string[])[] = [];
  let request: MergeRequest;
  try {
    request = parseRequest(value);
  } catch (error) {
    return baseReceipt(
      "refused",
      "invalid_request",
      commands,
      error instanceof Error ? error.message : String(error),
    );
  }
  const fields = targetFields(request);
  if (
    (request.blastRadius === "high" || request.adminCheck !== undefined) &&
    !request.highBlastRadiusConfirmed
  )
    return {
      ...baseReceipt("refused", "authority_missing", commands, "fresh high-blast confirmation is required"),
      ...fields,
    };
  if (request.adminCheck !== undefined && request.blastRadius !== "high")
    return {
      ...baseReceipt("refused", "authority_missing", commands, "admin bypass requires high blast radius"),
      ...fields,
    };
  const runner = runtime.runner ?? defaultMergeRunner;
  const preflightRunner = async ({
    command,
    cwd,
  }: {
    command: readonly string[];
    cwd: string;
  }): Promise<PreflightCommandResult> => runner({ command, cwd });
  const preflight = await runMergePreflight(
    { root: request.root, pr: request.pr, noPoll: true },
    { runner: preflightRunner },
  );
  commands.push(...preflight.commands);
  const bindingMatches =
    preflight.repository === request.repository &&
    preflight.pr === request.pr &&
    preflight.head === request.head &&
    preflight.base === request.base &&
    preflight.mergeBase === request.mergeBase;
  if (!bindingMatches)
    return {
      ...baseReceipt("refused", "target_mismatch", commands, "preflight does not match authorized target"),
      ...fields,
      preflight,
    };
  const failedChecks = preflight.checks.filter(
    (check) => check.bucket === "fail" || check.bucket === "cancel",
  );
  const pendingChecks = preflight.checks.filter((check) => check.bucket === "pending");
  const waived = new Set(request.waivers.map((waiver) => waiver.gate));
  const deliveryBlocked = preflight.delivery?.status === "blocked";
  const documentationBlocked = preflight.documentation?.status === "blocked";
  const staticAllowed =
    (!deliveryBlocked || waived.has("delivery")) && (!documentationBlocked || waived.has("documentation"));
  const unusedWaiver =
    (waived.has("delivery") && !deliveryBlocked) || (waived.has("documentation") && !documentationBlocked);
  const adminAuthorized =
    request.adminCheck !== undefined &&
    preflight.code === "checks_failed" &&
    failedChecks.length === 1 &&
    failedChecks[0]!.name === request.adminCheck &&
    staticAllowed;
  const checksPass = failedChecks.length === 0 && pendingChecks.length === 0;
  const preflightShapeAllowsMerge =
    preflight.outcome === "ready" ||
    preflight.code === "delivery_blocked" ||
    preflight.code === "documentation_blocked" ||
    preflight.code === "multiple_blockers" ||
    preflight.code === "checks_failed";
  if (unusedWaiver)
    return {
      ...baseReceipt("refused", "authority_missing", commands, "waiver names a gate that is not blocking"),
      ...fields,
      preflight,
    };
  if (!preflightShapeAllowsMerge || !staticAllowed || (!checksPass && !adminAuthorized))
    return {
      ...baseReceipt("blocked", "preflight_blocked", commands, "fresh preflight does not authorize merge"),
      ...fields,
      preflight,
    };
  if (failedChecks.length === 0 && request.adminCheck !== undefined)
    return {
      ...baseReceipt(
        "refused",
        "authority_missing",
        commands,
        "admin bypass was requested without its named failing check",
      ),
      ...fields,
      preflight,
    };
  const metadataCommand = [
    "gh",
    "pr",
    "view",
    String(request.pr),
    "--repo",
    request.repository,
    "--json",
    "number,state,headRefOid,baseRefOid,id,title,body",
  ];
  const metadata = await invoke(runner, commands, request.root, metadataCommand);
  if (metadata.code !== 0 || metadata.timedOut || metadata.saturated)
    return {
      ...baseReceipt("failed", "lookup_failed", commands, "final metadata lookup failed"),
      ...fields,
      preflight,
    };
  let pullRequestId: string;
  try {
    pullRequestId = parseMetadata(metadata.stdout, request);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      ...baseReceipt(
        "refused",
        detail.startsWith("METADATA_MISMATCH") ? "metadata_mismatch" : "target_mismatch",
        commands,
        detail,
      ),
      ...fields,
      preflight,
    };
  }
  const mergeCommand = ["gh", "api", "graphql", "--input", "-"];
  const mutation = `mutation MergePullRequest($input: MergePullRequestInput!) {
  mergePullRequest(input: $input) {
    pullRequest {
      number
      merged
      mergedAt
      headRefOid
      baseRefOid
      mergeCommit { oid }
    }
  }
}`;
  const mutationInput = JSON.stringify({
    query: mutation,
    variables: {
      input: {
        pullRequestId,
        expectedHeadOid: request.head,
        mergeMethod: request.method.toUpperCase(),
        ...(request.method === "rebase"
          ? {}
          : { commitHeadline: request.mergeSubject, commitBody: request.mergeBody }),
      },
    },
  });
  const merge = await invoke(runner, commands, request.root, mergeCommand, mutationInput);
  const proof =
    merge.code === 0 && !merge.timedOut && !merge.saturated ? parseProof(merge.stdout, request) : undefined;
  const attempted = {
    ...fields,
    preflight,
    mergeAttempted: true,
    mergeCommand,
    mergeExitCode: merge.code,
    mergeTimedOut: merge.timedOut === true,
    commands,
  };
  if (proof)
    return {
      schema: mergeReceiptSchema,
      outcome: "success",
      code: "merged",
      ...attempted,
      proof,
      detail: "expected-head merge mutation returned its exact commit receipt",
    };
  return {
    schema: mergeReceiptSchema,
    outcome: "uncertain",
    code: "merge_uncertain",
    ...attempted,
    detail: "merge was attempted but exact merged-state proof is unavailable; do not retry blindly",
  };
}

async function readStdin(maximumBytes = 4_000_000, timeoutMilliseconds = 5_000): Promise<string> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("stdin timed out")), timeoutMilliseconds);
    process.stdin.on("data", (chunk: Buffer) => {
      bytes += chunk.byteLength;
      if (bytes > maximumBytes) {
        clearTimeout(timer);
        process.stdin.destroy();
        reject(new Error("stdin is saturated"));
      } else chunks.push(chunk);
    });
    process.stdin.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString());
    });
    process.stdin.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export const readMergeRequestStdin = readStdin;
