import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, realpath, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";

export const postReviewSchema = "tailrocks.post-pr-review/v1";
export const reviewReportSchema = "tailrocks.pr-review-report/v1";

type Side = "LEFT" | "RIGHT";
type Verdict = "no_findings" | "findings_nonblocking" | "blocked";
type ItemStatus = "pending" | "posted" | "duplicate" | "not_attempted" | "uncertain";

interface ReviewFinding {
  readonly id: string;
  readonly path: string;
  readonly line: number;
  readonly side: Side;
  readonly startLine?: number;
  readonly startSide?: Side;
  readonly body: string;
}

interface ReviewReport {
  readonly schema: typeof reviewReportSchema;
  readonly target: { readonly repository: string; readonly number: number; readonly headSha: string };
  readonly verdict: Verdict;
  readonly findings: readonly ReviewFinding[];
  readonly cleanBody?: string;
}

interface ReviewItem {
  readonly id: string;
  readonly fingerprint: string;
  readonly status: ItemStatus;
  readonly commentId?: number;
  readonly url?: string;
}

export type PostReviewCode =
  | "prepared"
  | "posted"
  | "already_posted"
  | "partial"
  | "invalid_arguments"
  | "invalid_report"
  | "target_mismatch"
  | "not_git_repo"
  | "closed"
  | "head_changed"
  | "actor_changed"
  | "authority_missing"
  | "authority_expired"
  | "dedupe_saturated"
  | "lookup_failed"
  | "post_failed"
  | "post_uncertain";

export interface PostReviewReceipt {
  readonly schema: typeof postReviewSchema;
  readonly outcome: "prepared" | "success" | "refused" | "failed";
  readonly code: PostReviewCode;
  readonly repository?: string;
  readonly pr?: number;
  readonly head?: string;
  readonly actor?: string;
  readonly reportDigest?: string;
  readonly authority?: string;
  readonly expiresAt?: string;
  readonly items: readonly ReviewItem[];
  readonly commands: readonly (readonly string[])[];
  readonly detail: string;
}

export interface RunRequest {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly stdin?: string;
}

export interface RunResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut?: boolean;
}

export type ReviewRunner = (request: RunRequest) => Promise<RunResult>;

interface Runtime {
  readonly runner?: ReviewRunner;
  readonly now?: () => number;
  readonly authorityDirectory?: string;
}

interface Challenge {
  readonly schema: "tailrocks.post-pr-review-challenge/v1";
  readonly root: string;
  readonly actor: string;
  readonly reportDigest: string;
  readonly report: ReviewReport;
  readonly expiresAt: number;
}

const markerPrefix = "<!-- tailrocks-review:v1:";

export const defaultReviewRunner: ReviewRunner = ({ command, cwd, stdin }) =>
  runBoundedCommand({ command, cwd, stdin });

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted))
    throw new Error(`${label} has unknown or missing keys`);
}

function safeString(value: unknown, label: string, maximum = 16_000): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    Buffer.byteLength(value) > maximum ||
    /[\0\u0001-\u0008\u000b\u000c\u000e-\u001f]/.test(value) ||
    value.includes(markerPrefix)
  )
    throw new Error(`${label} is invalid`);
  return value;
}

function safePath(value: unknown): string {
  const result = safeString(value, "finding path", 1_024);
  if (
    path.posix.isAbsolute(result) ||
    result.includes("\\") ||
    result.split("/").some((part) => part === "" || part === "." || part === "..")
  )
    throw new Error("finding path must be a normalized repository-relative POSIX path");
  return result;
}

function positiveInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1)
    throw new Error(`${label} must be a positive integer`);
  return value as number;
}

function parseReportValue(value: unknown): ReviewReport {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("report must be an object");
  const record = value as Record<string, unknown>;
  const hasClean = Object.hasOwn(record, "cleanBody");
  exactKeys(
    record,
    hasClean
      ? ["schema", "target", "verdict", "findings", "cleanBody"]
      : ["schema", "target", "verdict", "findings"],
    "report",
  );
  if (record.schema !== reviewReportSchema) throw new Error("report schema is invalid");
  if (!record.target || typeof record.target !== "object" || Array.isArray(record.target))
    throw new Error("report target is invalid");
  const target = record.target as Record<string, unknown>;
  exactKeys(target, ["repository", "number", "headSha"], "report target");
  const repository = safeString(target.repository, "repository", 200);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))
    throw new Error("repository must be OWNER/REPOSITORY");
  const number = positiveInteger(target.number, "PR number");
  const headSha = safeString(target.headSha, "head SHA", 40).toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(headSha)) throw new Error("head SHA must be 40 hexadecimal characters");
  if (
    !(
      record.verdict === "no_findings" ||
      record.verdict === "findings_nonblocking" ||
      record.verdict === "blocked"
    )
  )
    throw new Error("verdict is invalid");
  if (!Array.isArray(record.findings)) throw new Error("findings must be an array");
  if (record.findings.length > 50) throw new Error("findings exceed the 50-item posting bound");
  const ids = new Set<string>();
  const findings = record.findings.map((raw, index): ReviewFinding => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error(`finding ${index + 1} is invalid`);
    const finding = raw as Record<string, unknown>;
    const multiline = Object.hasOwn(finding, "startLine") || Object.hasOwn(finding, "startSide");
    exactKeys(
      finding,
      multiline
        ? ["id", "path", "line", "side", "startLine", "startSide", "body"]
        : ["id", "path", "line", "side", "body"],
      `finding ${index + 1}`,
    );
    const id = safeString(finding.id, "finding id", 80);
    if (!/^[A-Z][A-Z0-9_-]*$/.test(id) || ids.has(id))
      throw new Error("finding IDs must be unique stable identifiers");
    ids.add(id);
    const line = positiveInteger(finding.line, "finding line");
    if (!(finding.side === "LEFT" || finding.side === "RIGHT")) throw new Error("finding side is invalid");
    const base = {
      id,
      path: safePath(finding.path),
      line,
      side: finding.side,
      body: safeString(finding.body, "finding body"),
    };
    if (!multiline) return base;
    const startLine = positiveInteger(finding.startLine, "finding startLine");
    if (startLine > line || !(finding.startSide === "LEFT" || finding.startSide === "RIGHT"))
      throw new Error("finding multiline range is invalid");
    return { ...base, startLine, startSide: finding.startSide };
  });
  const cleanBody = hasClean ? safeString(record.cleanBody, "clean body") : undefined;
  if (
    record.verdict === "no_findings"
      ? findings.length !== 0 || !cleanBody
      : findings.length === 0 || cleanBody
  )
    throw new Error("verdict, findings, and cleanBody disagree");
  const report: ReviewReport = {
    schema: reviewReportSchema,
    target: { repository, number, headSha },
    verdict: record.verdict,
    findings,
    ...(cleanBody ? { cleanBody } : {}),
  };
  const fingerprints = report.findings.map((finding) => fingerprint(report, finding));
  if (new Set(fingerprints).size !== fingerprints.length)
    throw new Error("findings contain duplicate issue content");
  return report;
}

async function parseReportFile(file: string): Promise<ReviewReport> {
  const absolute = path.resolve(file);
  const stats = await lstat(absolute);
  if (!stats.isFile() || stats.isSymbolicLink() || stats.size > 1_000_000)
    throw new Error("report must be a regular non-symlink file no larger than 1 MB");
  return parseReportValue(JSON.parse(await readFile(absolute, "utf8")));
}

function canonicalReport(report: ReviewReport): string {
  return JSON.stringify({
    schema: report.schema,
    target: report.target,
    verdict: report.verdict,
    findings: [...report.findings].sort((left, right) =>
      left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
    ),
    ...(report.cleanBody ? { cleanBody: report.cleanBody } : {}),
  });
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function fingerprint(report: ReviewReport, finding?: ReviewFinding): string {
  const issue = finding
    ? {
        path: finding.path,
        line: finding.line,
        side: finding.side,
        ...(finding.startLine ? { startLine: finding.startLine, startSide: finding.startSide } : {}),
        body: finding.body,
      }
    : undefined;
  return digest(
    JSON.stringify(
      issue
        ? { target: report.target, finding: issue }
        : { target: report.target, verdict: report.verdict, cleanBody: report.cleanBody },
    ),
  );
}

function marker(report: ReviewReport, itemFingerprint: string): string {
  return `${markerPrefix}${report.target.headSha}:${itemFingerprint} -->`;
}

async function safeRoot(input: string): Promise<string> {
  const absolute = path.resolve(input);
  const stats = await lstat(absolute);
  if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("root must be a real directory");
  if ((await realpath(absolute)) !== absolute) throw new Error("root path may not traverse a symlink");
  return absolute;
}

async function run(
  runner: ReviewRunner,
  commands: (readonly string[])[],
  cwd: string,
  command: readonly string[],
  stdin?: string,
): Promise<RunResult> {
  commands.push(command);
  try {
    return await runner({ command, cwd, stdin });
  } catch (error) {
    return { code: 127, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

async function requireRun(
  runner: ReviewRunner,
  commands: (readonly string[])[],
  cwd: string,
  command: readonly string[],
): Promise<string> {
  const result = await run(runner, commands, cwd, command);
  if (result.code !== 0 || result.timedOut) throw new Error(`command failed: ${command.join(" ")}`);
  return result.stdout;
}

interface TargetState {
  readonly actor: string;
  readonly url: string;
}

async function verifyTarget(
  root: string,
  report: ReviewReport,
  runner: ReviewRunner,
  commands: (readonly string[])[],
  expectedActor?: string,
): Promise<TargetState> {
  const top = (await requireRun(runner, commands, root, ["git", "rev-parse", "--show-toplevel"])).trim();
  if ((await realpath(top)) !== root) throw new Error("root must be the repository top level");
  const head = (await requireRun(runner, commands, root, ["git", "rev-parse", "HEAD"])).trim();
  if (head !== report.target.headSha) throw new Error("HEAD_CHANGED: local HEAD differs from report");
  const repositoryValue = JSON.parse(
    await requireRun(runner, commands, root, ["gh", "repo", "view", "--json", "nameWithOwner"]),
  ) as Record<string, unknown>;
  if (repositoryValue.nameWithOwner !== report.target.repository)
    throw new Error("TARGET_MISMATCH: local repository differs from report");
  const actor = (await requireRun(runner, commands, root, ["gh", "api", "user", "--jq", ".login"])).trim();
  if (!/^[A-Za-z0-9-]+(?:\[bot\])?$/.test(actor)) throw new Error("authenticated actor is invalid");
  if (expectedActor && actor !== expectedActor) throw new Error("ACTOR_CHANGED: authenticated actor changed");
  const raw = await requireRun(runner, commands, root, [
    "gh",
    "pr",
    "view",
    String(report.target.number),
    "--repo",
    report.target.repository,
    "--json",
    "state,headRefOid,url",
  ]);
  const value = JSON.parse(raw) as Record<string, unknown>;
  if (value.state !== "OPEN") throw new Error("CLOSED: pull request is not open");
  if (value.headRefOid !== report.target.headSha)
    throw new Error("HEAD_CHANGED: pull request HEAD differs from report");
  if (typeof value.url !== "string" || !value.url.startsWith("https://"))
    throw new Error("pull request URL is invalid");
  return { actor, url: value.url };
}

interface RemoteComment {
  readonly body: string;
  readonly actor: string;
}

function parseComments(raw: string): RemoteComment[] {
  const value = JSON.parse(raw) as unknown;
  if (!Array.isArray(value)) throw new Error("comment listing must be an array");
  return value.map((comment) => {
    if (!comment || typeof comment !== "object" || Array.isArray(comment))
      throw new Error("comment is invalid");
    const record = comment as Record<string, unknown>;
    const user = record.user as Record<string, unknown> | undefined;
    if (typeof record.body !== "string" || !user || typeof user.login !== "string")
      throw new Error("comment body or actor is invalid");
    return { body: record.body, actor: user.login };
  });
}

async function existingMarkers(
  root: string,
  report: ReviewReport,
  actor: string,
  runner: ReviewRunner,
  commands: (readonly string[])[],
): Promise<Set<string>> {
  const endpoints = [
    `repos/${report.target.repository}/pulls/${report.target.number}/comments?per_page=100`,
    `repos/${report.target.repository}/issues/${report.target.number}/comments?per_page=100`,
  ];
  const found = new Set<string>();
  for (const endpoint of endpoints) {
    const comments = parseComments(await requireRun(runner, commands, root, ["gh", "api", endpoint]));
    if (comments.length >= 100) throw new Error("DEDUPE_SATURATED: comment lookup reached its bound");
    for (const comment of comments) {
      if (comment.actor !== actor) continue;
      for (const match of comment.body.matchAll(/<!-- tailrocks-review:v1:[0-9a-f]{40}:([0-9a-f]{64}) -->/g))
        found.add(match[1]!);
    }
  }
  return found;
}

function itemsFor(report: ReviewReport, existing: ReadonlySet<string>): ReviewItem[] {
  const sources: { id: string; fingerprint: string }[] =
    report.findings.length > 0
      ? report.findings.map((finding) => ({ id: finding.id, fingerprint: fingerprint(report, finding) }))
      : [{ id: "CLEAN", fingerprint: fingerprint(report) }];
  return sources.map((item) => ({
    ...item,
    status: existing.has(item.fingerprint) ? "duplicate" : "pending",
  }));
}

async function authorityRoot(input?: string): Promise<string> {
  const directory = input ? path.resolve(input) : path.join(tmpdir(), "tailrocks-post-pr-review");
  await mkdir(directory, { mode: 0o700, recursive: true });
  const stats = await lstat(directory);
  if (!stats.isDirectory() || stats.isSymbolicLink() || (stats.mode & 0o777) !== 0o700)
    throw new Error("authority directory must be a real owner-only directory");
  if (typeof process.getuid === "function" && stats.uid !== process.getuid())
    throw new Error("authority directory has the wrong owner");
  return directory;
}

function baseReceipt(
  code: PostReviewCode,
  outcome: PostReviewReceipt["outcome"],
  commands: readonly (readonly string[])[],
  detail: string,
  report?: ReviewReport,
): PostReviewReceipt {
  return {
    schema: postReviewSchema,
    outcome,
    code,
    ...(report
      ? {
          repository: report.target.repository,
          pr: report.target.number,
          head: report.target.headSha,
          reportDigest: digest(canonicalReport(report)),
        }
      : {}),
    items: [],
    commands,
    detail,
  };
}

function classifiedError(error: unknown): {
  code: PostReviewCode;
  outcome: "refused" | "failed";
  detail: string;
} {
  const detail = error instanceof Error ? error.message : String(error);
  if (detail.startsWith("HEAD_CHANGED:")) return { code: "head_changed", outcome: "refused", detail };
  if (detail.startsWith("ACTOR_CHANGED:")) return { code: "actor_changed", outcome: "refused", detail };
  if (detail.startsWith("CLOSED:")) return { code: "closed", outcome: "refused", detail };
  if (detail.startsWith("TARGET_MISMATCH:")) return { code: "target_mismatch", outcome: "refused", detail };
  if (detail.startsWith("DEDUPE_SATURATED:")) return { code: "dedupe_saturated", outcome: "refused", detail };
  return { code: "lookup_failed", outcome: "failed", detail };
}

export async function preparePostReview(
  rootInput: string,
  reportFile: string,
  runtime: Runtime = {},
): Promise<PostReviewReceipt> {
  const commands: (readonly string[])[] = [];
  let root: string;
  let report: ReviewReport;
  try {
    root = await safeRoot(rootInput);
  } catch (error) {
    return baseReceipt("not_git_repo", "refused", commands, String(error));
  }
  try {
    report = await parseReportFile(reportFile);
  } catch (error) {
    return baseReceipt(
      "invalid_report",
      "refused",
      commands,
      error instanceof Error ? error.message : String(error),
    );
  }
  const runner = runtime.runner ?? defaultReviewRunner;
  try {
    const target = await verifyTarget(root, report, runner, commands);
    const existing = await existingMarkers(root, report, target.actor, runner, commands);
    const items = itemsFor(report, existing);
    if (items.every((item) => item.status === "duplicate"))
      return {
        ...baseReceipt("already_posted", "success", commands, "every review item already exists", report),
        actor: target.actor,
        items,
      };
    const now = (runtime.now ?? Date.now)();
    const authorityId = randomUUID();
    const challenge: Challenge = {
      schema: "tailrocks.post-pr-review-challenge/v1",
      root,
      actor: target.actor,
      reportDigest: digest(canonicalReport(report)),
      report,
      expiresAt: now + 5 * 60_000,
    };
    const directory = await authorityRoot(runtime.authorityDirectory);
    const challengeBytes = JSON.stringify(challenge);
    await writeFile(path.join(directory, `${authorityId}.json`), challengeBytes, {
      flag: "wx",
      mode: 0o600,
    });
    const authority = `${authorityId}.${digest(challengeBytes)}`;
    return {
      ...baseReceipt(
        "prepared",
        "prepared",
        commands,
        "fresh user approval must quote this one-use authority",
        report,
      ),
      actor: target.actor,
      authority,
      expiresAt: new Date(challenge.expiresAt).toISOString(),
      items,
    };
  } catch (error) {
    const classified = classifiedError(error);
    return baseReceipt(classified.code, classified.outcome, commands, classified.detail, report);
  }
}

function parseChallenge(value: unknown): Challenge {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("authority challenge is invalid");
  const record = value as Record<string, unknown>;
  exactKeys(
    record,
    ["schema", "root", "actor", "reportDigest", "report", "expiresAt"],
    "authority challenge",
  );
  if (record.schema !== "tailrocks.post-pr-review-challenge/v1")
    throw new Error("authority challenge schema is invalid");
  const report = parseReportValue(record.report);
  const root = safeString(record.root, "challenge root", 4_096);
  const actor = safeString(record.actor, "challenge actor", 200);
  const reportDigest = safeString(record.reportDigest, "challenge digest", 64);
  if (reportDigest !== digest(canonicalReport(report)))
    throw new Error("authority challenge report digest changed");
  if (!Number.isSafeInteger(record.expiresAt)) throw new Error("authority challenge expiry is invalid");
  return {
    schema: "tailrocks.post-pr-review-challenge/v1",
    root,
    actor,
    reportDigest,
    report,
    expiresAt: record.expiresAt as number,
  };
}

function commentLink(prUrl: string, report: ReviewReport, finding: ReviewFinding): string {
  const url = new URL(prUrl);
  const encoded = finding.path.split("/").map(encodeURIComponent).join("/");
  const start = Math.max(1, (finding.startLine ?? finding.line) - 1);
  const end = finding.line + 1;
  return `${url.origin}/${report.target.repository}/blob/${report.target.headSha}/${encoded}#L${start}-L${end}`;
}

function parsePosted(
  raw: string,
  finding: ReviewFinding | undefined,
  report: ReviewReport,
  expectedBody: string,
): { commentId: number; url: string } {
  const value = JSON.parse(raw) as Record<string, unknown>;
  if (!Number.isSafeInteger(value.id) || (value.id as number) < 1 || typeof value.html_url !== "string")
    throw new Error("post response lacks a valid comment ID or HTTPS permalink");
  let permalink: URL;
  try {
    permalink = new URL(value.html_url);
  } catch {
    throw new Error("post response lacks a valid comment ID or HTTPS permalink");
  }
  if (permalink.protocol !== "https:" || !permalink.hostname)
    throw new Error("post response lacks a valid comment ID or HTTPS permalink");
  if (value.body !== expectedBody) throw new Error("post response does not prove the requested body");
  if (
    finding &&
    (value.commit_id !== report.target.headSha ||
      value.path !== finding.path ||
      value.line !== finding.line ||
      value.side !== finding.side ||
      (finding.startLine !== undefined &&
        (value.start_line !== finding.startLine || value.start_side !== finding.startSide)))
  )
    throw new Error("post response does not prove the requested commit and location");
  return { commentId: value.id as number, url: value.html_url };
}

export async function postPreparedReview(
  authority: string,
  runtime: Runtime = {},
): Promise<PostReviewReceipt> {
  const commands: (readonly string[])[] = [];
  const authorityMatch = authority.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.([0-9a-f]{64})$/i,
  );
  if (!authorityMatch)
    return baseReceipt("authority_missing", "refused", commands, "authority token is malformed");
  let challenge: Challenge;
  let claimed: string;
  try {
    const directory = await authorityRoot(runtime.authorityDirectory);
    const source = path.join(directory, `${authorityMatch[1]}.json`);
    claimed = path.join(directory, `${authorityMatch[1]}.claimed-${randomUUID()}.json`);
    await rename(source, claimed);
    const stats = await lstat(claimed);
    if (!stats.isFile() || stats.isSymbolicLink() || (stats.mode & 0o777) !== 0o600)
      throw new Error("claimed authority is not an owner-only regular file");
    const challengeBytes = await readFile(claimed, "utf8");
    if (digest(challengeBytes) !== authorityMatch[2]) throw new Error("authority challenge bytes changed");
    challenge = parseChallenge(JSON.parse(challengeBytes));
  } catch (error) {
    return baseReceipt(
      "authority_missing",
      "refused",
      commands,
      error instanceof Error ? error.message : String(error),
    );
  }
  const report = challenge.report;
  if ((runtime.now ?? Date.now)() >= challenge.expiresAt)
    return baseReceipt("authority_expired", "refused", commands, "authority expired before posting", report);
  const runner = runtime.runner ?? defaultReviewRunner;
  let target: TargetState;
  let existing: Set<string>;
  try {
    target = await verifyTarget(challenge.root, report, runner, commands, challenge.actor);
    existing = await existingMarkers(challenge.root, report, challenge.actor, runner, commands);
  } catch (error) {
    const classified = classifiedError(error);
    return baseReceipt(classified.code, classified.outcome, commands, classified.detail, report);
  }
  const items = itemsFor(report, existing);
  if (items.every((item) => item.status === "duplicate"))
    return {
      ...baseReceipt("already_posted", "success", commands, "every review item already exists", report),
      actor: challenge.actor,
      items,
    };
  const results: ReviewItem[] = [];
  for (const item of items) {
    if (item.status === "duplicate") {
      results.push(item);
      continue;
    }
    if ((runtime.now ?? Date.now)() >= challenge.expiresAt) {
      const partial = results.some((entry) => entry.status === "posted");
      return {
        ...baseReceipt(
          partial ? "partial" : "authority_expired",
          partial ? "failed" : "refused",
          commands,
          "authority expired before the next posting mutation",
          report,
        ),
        actor: challenge.actor,
        items: [
          ...results,
          { ...item, status: "not_attempted" },
          ...items.slice(results.length + 1).map((entry) => ({ ...entry, status: "not_attempted" as const })),
        ],
      };
    }
    try {
      target = await verifyTarget(challenge.root, report, runner, commands, challenge.actor);
    } catch (error) {
      const classified = classifiedError(error);
      return {
        ...baseReceipt(
          results.some((entry) => entry.status === "posted") ? "partial" : classified.code,
          results.some((entry) => entry.status === "posted") ? "failed" : classified.outcome,
          commands,
          classified.detail,
          report,
        ),
        actor: challenge.actor,
        items: [
          ...results,
          { ...item, status: "not_attempted" },
          ...items.slice(results.length + 1).map((entry) => ({ ...entry, status: "not_attempted" as const })),
        ],
      };
    }
    if ((runtime.now ?? Date.now)() >= challenge.expiresAt) {
      const partial = results.some((entry) => entry.status === "posted");
      return {
        ...baseReceipt(
          partial ? "partial" : "authority_expired",
          partial ? "failed" : "refused",
          commands,
          "authority expired immediately before the posting mutation",
          report,
        ),
        actor: challenge.actor,
        items: [
          ...results,
          { ...item, status: "not_attempted" },
          ...items.slice(results.length + 1).map((entry) => ({ ...entry, status: "not_attempted" as const })),
        ],
      };
    }
    const finding = report.findings.find((entry) => entry.id === item.id);
    const body = finding
      ? `${finding.body}\n\n[Code](${commentLink(target.url, report, finding)})\n\n${marker(report, item.fingerprint)}`
      : `${report.cleanBody}\n\n${marker(report, item.fingerprint)}`;
    const endpoint = finding
      ? `repos/${report.target.repository}/pulls/${report.target.number}/comments`
      : `repos/${report.target.repository}/issues/${report.target.number}/comments`;
    const payload = finding
      ? {
          body,
          commit_id: report.target.headSha,
          path: finding.path,
          line: finding.line,
          side: finding.side,
          ...(finding.startLine ? { start_line: finding.startLine, start_side: finding.startSide } : {}),
        }
      : { body };
    const posted = await run(
      runner,
      commands,
      challenge.root,
      ["gh", "api", "--method", "POST", endpoint, "--input", "-"],
      JSON.stringify(payload),
    );
    if (posted.code !== 0 || posted.timedOut) {
      results.push({ ...item, status: "uncertain" });
      return {
        ...baseReceipt(
          results.some((entry) => entry.status === "posted") ? "partial" : "post_uncertain",
          "failed",
          commands,
          "posting failed or timed out; rerun prepare to deduplicate before retry",
          report,
        ),
        actor: challenge.actor,
        items: [
          ...results,
          ...items.slice(results.length).map((entry) => ({ ...entry, status: "not_attempted" as const })),
        ],
      };
    }
    try {
      const proof = parsePosted(posted.stdout, finding, report, body);
      results.push({ ...item, status: "posted", ...proof });
    } catch (error) {
      results.push({ ...item, status: "uncertain" });
      return {
        ...baseReceipt(
          results.some((entry) => entry.status === "posted") ? "partial" : "post_uncertain",
          "failed",
          commands,
          error instanceof Error ? error.message : String(error),
          report,
        ),
        actor: challenge.actor,
        items: [
          ...results,
          ...items.slice(results.length).map((entry) => ({ ...entry, status: "not_attempted" as const })),
        ],
      };
    }
  }
  try {
    await verifyTarget(challenge.root, report, runner, commands, challenge.actor);
  } catch (error) {
    return {
      ...baseReceipt(
        "partial",
        "failed",
        commands,
        `post-check failed: ${error instanceof Error ? error.message : String(error)}`,
        report,
      ),
      actor: challenge.actor,
      items: results,
    };
  }
  return {
    ...baseReceipt(
      "posted",
      "success",
      commands,
      "all unique review items posted and target reverified",
      report,
    ),
    actor: challenge.actor,
    items: results,
  };
}

async function main(args: readonly string[]): Promise<PostReviewReceipt> {
  if (args[0] === "prepare" && args.length === 5 && args[1] === "--root" && args[3] === "--report")
    return preparePostReview(args[2]!, args[4]!);
  if (args[0] === "post" && args.length === 3 && args[1] === "--authority")
    return postPreparedReview(args[2]!);
  return baseReceipt(
    "invalid_arguments",
    "refused",
    [],
    "usage: post-pr-review.ts prepare --root <repository> --report <file> | post --authority <uuid>",
  );
}

if (import.meta.main) {
  const result = await main(process.argv.slice(2));
  console.log(JSON.stringify(result));
  process.exit(
    result.outcome === "prepared" || result.outcome === "success" ? 0 : result.outcome === "refused" ? 2 : 1,
  );
}
