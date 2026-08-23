import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";
import {
  discoverDocumentation,
  type DocumentationDiscovery,
  type DocumentationTreeEntry,
} from "./documentation-discovery";

export const mergePreflightSchema = "tailrocks.merge-preflight/v1";

type Outcome = "ready" | "blocked" | "pending" | "refused" | "failed";
type Code =
  | "ready"
  | "invalid_arguments"
  | "not_git_repo"
  | "target_mismatch"
  | "head_changed"
  | "closed"
  | "lookup_failed"
  | "checks_failed"
  | "checks_pending"
  | "delivery_blocked"
  | "documentation_blocked"
  | "multiple_blockers"
  | "state_unmatched";

export interface CommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut?: boolean;
}

export interface CommandRequest {
  readonly command: readonly string[];
  readonly cwd: string;
}

export type CommandRunner = (request: CommandRequest) => Promise<CommandResult>;

interface Runtime {
  readonly runner?: CommandRunner;
  readonly now?: () => number;
  readonly sleep?: (milliseconds: number) => Promise<void>;
}

export interface CheckState {
  readonly name: string;
  readonly workflow: string;
  readonly link: string;
  readonly state: string;
  readonly bucket: "pass" | "fail" | "pending" | "skipping" | "cancel";
}

export interface DeliveryFinding {
  readonly case: 1 | 2 | 3 | 4 | 5 | 6 | "invalid_shape";
  readonly slug?: string;
  readonly paths: readonly string[];
  readonly route: "tailrocks-prove" | "tailrocks-reconcile";
  readonly detail: string;
}

export interface DeliveryInput {
  readonly changed: readonly { readonly status: "A" | "M" | "D"; readonly path: string }[];
  readonly baseFiles: ReadonlyMap<string, string>;
  readonly headFiles: ReadonlyMap<string, string>;
}

export interface CommitState {
  readonly sha: string;
  readonly message: string;
  readonly paths: readonly string[];
  readonly parents: readonly string[];
}

export interface DocumentationResult {
  readonly docWorthyCommits: readonly string[];
  readonly headCovered: boolean;
  readonly trailerCommit?: string;
  readonly reason: string;
}

export interface MergePreflightReceipt {
  readonly schema: typeof mergePreflightSchema;
  readonly outcome: Outcome;
  readonly code: Code;
  readonly repository?: string;
  readonly pr?: number;
  readonly head?: string;
  readonly base?: string;
  readonly mergeBase?: string;
  readonly checkAttempts: number;
  readonly checks: readonly CheckState[];
  readonly delivery?: {
    readonly status: "not_applicable" | "pass" | "blocked";
    readonly touched: boolean;
    readonly findings: readonly DeliveryFinding[];
  };
  readonly documentation?: DocumentationResult & {
    readonly status: "not_needed" | "pass" | "blocked";
    readonly discovery: DocumentationDiscovery;
  };
  readonly commands: readonly (readonly string[])[];
  readonly detail: string;
}

interface Options {
  readonly root: string;
  readonly pr: number;
  readonly noPoll: boolean;
  readonly pollWithStaticBlockers?: boolean;
}

interface PullRequest {
  readonly repository: string;
  readonly pr: number;
  readonly head: string;
  readonly base: string;
  readonly mergeBase: string;
}

const maxChecks = 500;
const maxPaths = 2_000;
const maxFileBytes = 1_000_000;
const maximumAttempts = 30;
const pollIntervalMs = 10_000;
const wallClockLimitMs = 300_000;

export const defaultRunner: CommandRunner = ({ command, cwd }) => runBoundedCommand({ command, cwd });

function baseReceipt(code: Code, outcome: Outcome, commands: readonly (readonly string[])[], detail: string) {
  return {
    schema: mergePreflightSchema,
    outcome,
    code,
    checkAttempts: 0,
    checks: [],
    commands,
    detail,
  } satisfies MergePreflightReceipt;
}

async function safeRoot(input: string): Promise<string> {
  const absolute = path.resolve(input);
  const stats = await lstat(absolute);
  if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("root must be a real directory");
  if ((await realpath(absolute)) !== absolute) throw new Error("root path may not traverse a symlink");
  return absolute;
}

async function invoke(
  runner: CommandRunner,
  commands: (readonly string[])[],
  cwd: string,
  command: readonly string[],
): Promise<CommandResult> {
  commands.push(command);
  try {
    return await runner({ command, cwd });
  } catch (error) {
    return { code: 127, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

async function requireCommand(
  runner: CommandRunner,
  commands: (readonly string[])[],
  cwd: string,
  command: readonly string[],
): Promise<string> {
  const result = await invoke(runner, commands, cwd, command);
  if (result.code !== 0 || result.timedOut) throw new Error(`command failed: ${command.join(" ")}`);
  if (Buffer.byteLength(result.stdout) > 10_000_000) throw new Error("command output is saturated");
  return result.stdout;
}

function strictObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} is invalid`);
  return value as Record<string, unknown>;
}

function requireExactKeys(record: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} has an unmatched shape`);
}

function safeSha(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[0-9a-f]{40}$/.test(value)) throw new Error(`${label} is invalid`);
  return value;
}

async function verifyTarget(
  root: string,
  pr: number,
  expected: PullRequest | undefined,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<PullRequest> {
  const top = (await requireCommand(runner, commands, root, ["git", "rev-parse", "--show-toplevel"])).trim();
  if ((await realpath(top)) !== root) throw new Error("NOT_GIT_REPO: root is not the repository top level");
  const head = (await requireCommand(runner, commands, root, ["git", "rev-parse", "HEAD"])).trim();
  const repositoryRecord = strictObject(
    JSON.parse(
      await requireCommand(runner, commands, root, ["gh", "repo", "view", "--json", "nameWithOwner"]),
    ),
    "repository response",
  );
  requireExactKeys(repositoryRecord, ["nameWithOwner"], "repository response");
  const repo = repositoryRecord.nameWithOwner;
  if (typeof repo !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
    throw new Error("TARGET_MISMATCH: repository identity is invalid");
  const value = strictObject(
    JSON.parse(
      await requireCommand(runner, commands, root, [
        "gh",
        "pr",
        "view",
        String(pr),
        "--repo",
        repo,
        "--json",
        "number,state,headRefOid,baseRefOid",
      ]),
    ),
    "pull request response",
  );
  requireExactKeys(value, ["number", "state", "headRefOid", "baseRefOid"], "pull request response");
  if (value.number !== pr) throw new Error("TARGET_MISMATCH: pull request number changed");
  if (value.state !== "OPEN") throw new Error("CLOSED: pull request is not open");
  const remoteHead = safeSha(value.headRefOid, "pull request head");
  const base = safeSha(value.baseRefOid, "pull request base");
  if (head !== remoteHead) throw new Error("HEAD_CHANGED: local HEAD differs from pull request HEAD");
  const mergeBase = safeSha(
    (await requireCommand(runner, commands, root, ["git", "merge-base", base, remoteHead])).trim(),
    "merge base",
  );
  const target = { repository: repo, pr, head: remoteHead, base, mergeBase };
  if (
    expected &&
    (expected.repository !== target.repository ||
      expected.pr !== target.pr ||
      expected.head !== target.head ||
      expected.base !== target.base ||
      expected.mergeBase !== target.mergeBase)
  )
    throw new Error("HEAD_CHANGED: pull request identity changed during preflight");
  return target;
}

function parseChecks(raw: string): CheckState[] {
  const value = JSON.parse(raw) as unknown;
  if (!Array.isArray(value) || value.length > maxChecks)
    throw new Error("check response is invalid or saturated");
  const checks = value.map((entry, index) => {
    const check = strictObject(entry, `check ${index + 1}`);
    requireExactKeys(check, ["bucket", "link", "name", "state", "workflow"], `check ${index + 1}`);
    if (
      typeof check.name !== "string" ||
      check.name.length === 0 ||
      typeof check.workflow !== "string" ||
      typeof check.link !== "string" ||
      typeof check.state !== "string" ||
      check.state.length === 0 ||
      !(
        check.bucket === "pass" ||
        check.bucket === "fail" ||
        check.bucket === "pending" ||
        check.bucket === "skipping" ||
        check.bucket === "cancel"
      )
    )
      throw new Error(`check ${index + 1} has an unmatched shape`);
    if (check.link !== "") {
      let url: URL;
      try {
        url = new URL(check.link);
      } catch {
        throw new Error(`check ${index + 1} has an unmatched shape`);
      }
      if (url.protocol !== "https:" || !url.hostname)
        throw new Error(`check ${index + 1} has an unmatched shape`);
    }
    return {
      name: check.name,
      workflow: check.workflow,
      link: check.link,
      state: check.state,
      bucket: check.bucket,
    };
  });
  const identities = checks.map((check) => `${check.workflow}\0${check.name}\0${check.link}`);
  if (new Set(identities).size !== identities.length)
    throw new Error("required checks have duplicate identities");
  if (new Set(checks.map((check) => check.name)).size !== checks.length)
    throw new Error("required checks have duplicate names");
  return checks.sort((left, right) => {
    const leftIdentity = `${left.workflow}\0${left.name}\0${left.link}`;
    const rightIdentity = `${right.workflow}\0${right.name}\0${right.link}`;
    return leftIdentity < rightIdentity ? -1 : leftIdentity > rightIdentity ? 1 : 0;
  });
}

function section(markdown: string, heading: string): string | undefined {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return undefined;
  const end = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}

function itemStatus(markdown: string): string | undefined {
  const value = markdown.match(/^- \*\*Status\*\*: (.+)$/m)?.[1]?.trim();
  return value && /^(DRAFT|SHAPING|READY|PLANNED|IN EXECUTION|DONE|PARKED \(.+; was: .+\))$/.test(value)
    ? value
    : undefined;
}

function remainingIsEmpty(markdown: string): boolean | undefined {
  const value = section(markdown, "Remaining");
  if (value === undefined) return undefined;
  return value
    .replace(/<!--[^]*?-->/g, "")
    .split("\n")
    .every((line) => line.trim() === "");
}

function planStatuses(markdown: string): string[] {
  const allowed = /^(TODO|IN PROGRESS|DONE|BLOCKED \(.+\)|REJECTED \(.+\)|STALE \(.+\))$/;
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = tableCells(lines[index]!);
    const separator = tableCells(lines[index + 1]!);
    if (!header || !separator || header.length !== separator.length) continue;
    const statusColumns = header.flatMap((cell, column) => (cell === "Status" ? [column] : []));
    if (statusColumns.length !== 1 || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    const statuses: string[] = [];
    for (let row = index + 2; row < lines.length; row += 1) {
      const cells = tableCells(lines[row]!);
      if (!cells) break;
      if (cells.length !== header.length || !allowed.test(cells[statusColumns[0]!]!)) return [];
      statuses.push(cells[statusColumns[0]!]!);
    }
    return statuses;
  }
  return [];
}

function tableCells(line: string): string[] | undefined {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return undefined;
  return trimmed
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function newestRound(
  files: ReadonlyMap<string, string>,
  slug: string,
): { path: string; defects: string[] } | undefined {
  const prefix = `roadmap/${slug}/verification/`;
  const candidates = [...files.keys()]
    .filter((file) => new RegExp(`^${prefix.replaceAll("/", "\\/")}\\d{2}-report\\.md$`).test(file))
    .sort();
  const selected = candidates.at(-1);
  if (!selected) return undefined;
  const blocking = section(files.get(selected)!, "Blocking defects");
  if (blocking === undefined) return { path: selected, defects: ["UNMATCHED_BLOCKING_SECTION"] };
  const defects = [...blocking.matchAll(/^#{3,6}\s+(B[1-9][0-9]*)\b/gm)].map((match) => match[1]!);
  return { path: selected, defects: [...new Set(defects)].sort() };
}

function indexSlugs(markdown: string | undefined): { slugs: Set<string>; duplicates: Set<string> } {
  if (markdown === undefined) return { slugs: new Set(), duplicates: new Set() };
  const found = new Set<string>();
  const duplicates = new Set<string>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/\[([a-z0-9][a-z0-9-]*)\]\((?:\.\/)?([a-z0-9][a-z0-9-]*)\/README\.md\)/);
    if (match && match[1] === match[2]) {
      if (found.has(match[1])) duplicates.add(match[1]);
      found.add(match[1]);
    }
  }
  return { slugs: found, duplicates };
}

function itemSlugs(files: ReadonlyMap<string, string>): Set<string> {
  return new Set(
    [...files.keys()]
      .map((file) => {
        const slug = file.match(/^roadmap\/([a-z0-9][a-z0-9-]*)\/README\.md$/)?.[1];
        return slug && itemStatus(files.get(file)!) ? slug : undefined;
      })
      .filter((slug): slug is string => slug !== undefined),
  );
}

export function evaluateDelivery(input: DeliveryInput): DeliveryFinding[] {
  if (!input.changed.some((entry) => entry.path === "roadmap" || entry.path.startsWith("roadmap/")))
    return [];
  const findings: DeliveryFinding[] = [];
  const headSlugs = itemSlugs(input.headFiles);
  const baseSlugs = itemSlugs(input.baseFiles);
  const deletedSlugs = new Set(
    input.changed
      .filter((entry) => entry.status === "D")
      .map((entry) => entry.path.match(/^roadmap\/([a-z0-9][a-z0-9-]*)\//)?.[1])
      .filter((slug): slug is string => slug !== undefined),
  );
  for (const slug of headSlugs) {
    const itemPath = `roadmap/${slug}/README.md`;
    const item = input.headFiles.get(itemPath)!;
    const status = itemStatus(item);
    const remaining = remainingIsEmpty(item);
    const manifestPath = `roadmap/${slug}/plan/README.md`;
    const manifest = input.headFiles.get(manifestPath);
    const statuses = manifest ? planStatuses(manifest) : [];
    const everyTerminal =
      statuses.length > 0 && statuses.every((value) => value === "DONE" || value.startsWith("REJECTED ("));
    const allDone = statuses.length > 0 && statuses.every((value) => value === "DONE");
    const round = newestRound(input.headFiles, slug);
    if (remaining === undefined || (manifest && statuses.length === 0)) {
      findings.push({
        case: "invalid_shape",
        slug,
        paths: [itemPath, ...(manifest && statuses.length === 0 ? [manifestPath] : [])],
        route: "tailrocks-reconcile",
        detail: "delivery item has an unmatched status, Remaining, or plan-manifest shape",
      });
      continue;
    }
    if (status === "DONE" || (remaining && everyTerminal))
      findings.push({
        case: 1,
        slug,
        paths: [itemPath, ...(manifest ? [manifestPath] : [])],
        route: "tailrocks-reconcile",
        detail: "finished delivery item remains on the roadmap",
      });
    if (allDone && round && round.defects.length > 0)
      findings.push({
        case: 3,
        slug,
        paths: [manifestPath, round.path],
        route: "tailrocks-reconcile",
        detail: `all plan rows are DONE while ${round.path} blocks on ${round.defects.join(", ")}`,
      });
    if (status === "DONE" && !round)
      findings.push({
        case: 4,
        slug,
        paths: [itemPath, `roadmap/${slug}/verification/`],
        route: "tailrocks-prove",
        detail: "item claims DONE without a verification round",
      });
  }
  for (const slug of deletedSlugs) {
    if (!baseSlugs.has(slug) || headSlugs.has(slug)) continue;
    const itemPath = `roadmap/${slug}/README.md`;
    const item = input.baseFiles.get(itemPath)!;
    const status = itemStatus(item);
    const remaining = remainingIsEmpty(item);
    const round = newestRound(input.baseFiles, slug);
    if (remaining === undefined)
      findings.push({
        case: "invalid_shape",
        slug,
        paths: [itemPath],
        route: "tailrocks-reconcile",
        detail: "deleted delivery item pre-image has no parseable Remaining section",
      });
    else if (!remaining || (round && round.defects.length > 0))
      findings.push({
        case: 2,
        slug,
        paths: [itemPath, ...(round ? [round.path] : [])],
        route: round ? "tailrocks-reconcile" : "tailrocks-prove",
        detail: round?.defects.length
          ? `retired item still has blocking defects: ${round.defects.join(", ")}`
          : "retired item still has Remaining work",
      });
    const deliveryPath = `delivery/${slug}.md`;
    if (
      status === "DONE" &&
      !input.changed.some((entry) => entry.status === "A" && entry.path === deliveryPath)
    )
      findings.push({
        case: 6,
        slug,
        paths: [itemPath, deliveryPath],
        route: "tailrocks-reconcile",
        detail: "retired item has no surviving delivery report",
      });
  }
  const index = indexSlugs(input.headFiles.get("roadmap/README.md"));
  for (const slug of index.duplicates)
    findings.push({
      case: 5,
      slug,
      paths: ["roadmap/README.md", `roadmap/${slug}/README.md`],
      route: "tailrocks-reconcile",
      detail: "roadmap index lists the same item more than once",
    });
  for (const slug of index.slugs) {
    if (!headSlugs.has(slug))
      findings.push({
        case: 5,
        slug,
        paths: ["roadmap/README.md", `roadmap/${slug}/README.md`],
        route: "tailrocks-reconcile",
        detail: "roadmap index lists an item folder that does not exist",
      });
  }
  for (const slug of headSlugs) {
    if (!index.slugs.has(slug))
      findings.push({
        case: 5,
        slug,
        paths: ["roadmap/README.md", `roadmap/${slug}/README.md`],
        route: "tailrocks-reconcile",
        detail: "roadmap item folder has no index row",
      });
  }
  if (
    headSlugs.size === 0 &&
    baseSlugs.size > 0 &&
    [...baseSlugs].every((slug) => deletedSlugs.has(slug)) &&
    input.headFiles.has("roadmap/README.md")
  )
    findings.push({
      case: 5,
      paths: ["roadmap/README.md", "roadmap/"],
      route: "tailrocks-reconcile",
      detail: "roadmap index survives after the last item folder was removed",
    });
  return findings.sort((left, right) => {
    const leftSlug = left.slug ?? "";
    const rightSlug = right.slug ?? "";
    return leftSlug < rightSlug
      ? -1
      : leftSlug > rightSlug
        ? 1
        : String(left.case) < String(right.case)
          ? -1
          : String(left.case) > String(right.case)
            ? 1
            : 0;
  });
}

function documentationPath(pathname: string, discovered?: ReadonlySet<string>): boolean {
  return (
    discovered?.has(pathname) === true ||
    pathname === "README.md" ||
    pathname === "INSTALL.md" ||
    pathname === "CONTRIBUTING.md" ||
    pathname === "CHANGELOG.md" ||
    pathname.startsWith("docs/")
  );
}

function testPath(pathname: string): boolean {
  return (
    /(^|\/)(test|tests|__tests__)(\/|$)/.test(pathname) ||
    /(?:^|\.)test\.[^/]+$/.test(pathname) ||
    /_test\.[^/]+$/.test(pathname)
  );
}

function ignoredForDocumentation(pathname: string, discovered?: ReadonlySet<string>): boolean {
  return (
    documentationPath(pathname, discovered) ||
    testPath(pathname) ||
    pathname.startsWith("roadmap/") ||
    pathname.startsWith("delivery/") ||
    pathname.startsWith(".github/")
  );
}

export function evaluateDocumentation(
  commits: readonly CommitState[],
  head: string,
  discoveredPaths?: ReadonlySet<string>,
): DocumentationResult {
  const bySha = new Map(commits.map((commit) => [commit.sha, commit]));
  if (bySha.size !== commits.length) throw new Error("commit history contains duplicate identities");
  const isAncestor = (ancestor: string, descendant: string): boolean => {
    const pending = [descendant];
    const seen = new Set<string>();
    while (pending.length > 0) {
      const current = pending.pop()!;
      if (current === ancestor) return true;
      if (seen.has(current)) continue;
      seen.add(current);
      pending.push(...(bySha.get(current)?.parents ?? []));
    }
    return false;
  };
  const ordered = commits.map((commit) => {
    if (
      !/^[0-9a-f]{40}$/.test(commit.sha) ||
      commit.parents.some((parent) => !/^[0-9a-f]{40}$/.test(parent)) ||
      commit.paths.length > maxPaths
    )
      throw new Error("commit history has an unmatched shape");
    const docWorthy = commit.paths.some((pathname) => !ignoredForDocumentation(pathname, discoveredPaths));
    const documentationSurface = commit.paths.some((pathname) =>
      documentationPath(pathname, discoveredPaths),
    );
    const trailer = hasExactTrailer(commit.message, "Tailrocks-Skill", "tailrocks-document");
    return { ...commit, docWorthy, documentationSurface, trailer };
  });
  if (ordered.at(-1)?.sha !== head) throw new Error("commit history does not terminate at HEAD");
  const docWorthyCommits = ordered.filter((commit) => commit.docWorthy).map((commit) => commit.sha);
  if (docWorthyCommits.length === 0)
    return { docWorthyCommits, headCovered: true, reason: "no commit changes a doc-worthy surface" };
  const obligations = ordered.filter((commit) => commit.docWorthy || commit.documentationSurface);
  const trailer = [...ordered]
    .reverse()
    .find(
      (candidate) =>
        candidate.trailer && obligations.every((commit) => isAncestor(commit.sha, candidate.sha)),
    );
  const headCovered = trailer !== undefined;
  return {
    docWorthyCommits,
    headCovered,
    ...(trailer ? { trailerCommit: trailer.sha } : {}),
    reason: headCovered
      ? "one tailrocks-document trailer commit descends from every doc-worthy and documentation-surface commit"
      : "doc-worthy commits are not covered by a later tailrocks-document trailer commit",
  };
}

function hasExactTrailer(message: string, key: string, expected: string): boolean {
  const lines = message.replaceAll("\r\n", "\n").split("\n");
  while (lines.at(-1)?.trim() === "") lines.pop();
  let start = lines.length;
  while (start > 0 && (/^[A-Za-z0-9-]+:\s+\S/.test(lines[start - 1]!) || /^[ \t]+\S/.test(lines[start - 1]!)))
    start -= 1;
  return lines.slice(start).some((line) => line === `${key}: ${expected}`);
}

function parseNameStatus(raw: string): { status: "A" | "M" | "D"; path: string }[] {
  const fields = raw.split("\0");
  if (fields.at(-1) === "") fields.pop();
  if (fields.length % 2 !== 0 || fields.length / 2 > maxPaths)
    throw new Error("diff path list is invalid or saturated");
  const result = [];
  for (let index = 0; index < fields.length; index += 2) {
    const rawStatus = fields[index]!;
    const pathname = fields[index + 1]!;
    if (!(rawStatus === "A" || rawStatus === "M" || rawStatus === "D") || !safeTreePath(pathname))
      throw new Error("diff contains an unmatched status or path");
    result.push({ status: rawStatus, path: pathname });
  }
  return result;
}

function safeTreePath(value: string): boolean {
  return (
    value.length > 0 &&
    Buffer.byteLength(value) <= 4_096 &&
    !value.includes("\0") &&
    !value.includes("\\") &&
    !path.posix.isAbsolute(value) &&
    !value.split("/").some((part) => part === "" || part === "." || part === "..")
  );
}

function parsePaths(raw: string): string[] {
  const fields = raw.split("\0");
  if (fields.at(-1) === "") fields.pop();
  if (fields.length > maxPaths || fields.some((entry) => !safeTreePath(entry)))
    throw new Error("tree path list is invalid or saturated");
  return fields;
}

async function loadTree(
  root: string,
  sha: string,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<Map<string, string>> {
  const raw = await requireCommand(runner, commands, root, [
    "git",
    "ls-tree",
    "-r",
    "-z",
    sha,
    "--",
    "roadmap",
    "delivery",
  ]);
  const entries = raw.split("\0");
  if (entries.at(-1) === "") entries.pop();
  if (entries.length > maxPaths) throw new Error("tree path list is saturated");
  const paths = entries
    .map((entry) => {
      const match = entry.match(/^(\d{6}) (blob|commit) ([0-9a-f]{40})\t([^]*)$/);
      if (!match || !safeTreePath(match[4]!)) throw new Error("tree entry has an unmatched shape");
      return { mode: match[1]!, type: match[2]!, path: match[4]! };
    })
    .filter(
      (entry) =>
        entry.path === "roadmap/README.md" ||
        /^roadmap\/[a-z0-9][a-z0-9-]*\/(README\.md|plan\/README\.md|verification\/\d{2}-report\.md)$/.test(
          entry.path,
        ) ||
        /^delivery\/[a-z0-9][a-z0-9-]*\.md$/.test(entry.path),
    )
    .map((entry) => {
      if (entry.type !== "blob" || !(entry.mode === "100644" || entry.mode === "100755"))
        throw new Error(`delivery artifact has an unmatched tree mode: ${entry.path}`);
      return entry.path;
    });
  if (paths.length > 500) throw new Error("delivery artifact file set is saturated");
  const files = new Map<string, string>();
  for (const pathname of paths) {
    const content = await requireCommand(runner, commands, root, ["git", "show", `${sha}:${pathname}`]);
    if (Buffer.byteLength(content) > maxFileBytes)
      throw new Error(`delivery artifact is too large: ${pathname}`);
    files.set(pathname, content);
  }
  return files;
}

async function loadCommits(
  root: string,
  target: Pick<PullRequest, "mergeBase" | "head">,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<CommitState[]> {
  const raw = await requireCommand(runner, commands, root, [
    "git",
    "rev-list",
    "--topo-order",
    "--reverse",
    `${target.mergeBase}..${target.head}`,
  ]);
  const shas = raw.trim() === "" ? [] : raw.trim().split("\n");
  if (shas.length > 500 || shas.some((sha) => !/^[0-9a-f]{40}$/.test(sha)))
    throw new Error("commit history is invalid or saturated");
  const commits: CommitState[] = [];
  for (const sha of shas) {
    const message = await requireCommand(runner, commands, root, ["git", "show", "-s", "--format=%B", sha]);
    if (Buffer.byteLength(message) > 100_000) throw new Error("commit message is too large");
    const parentsRaw = (
      await requireCommand(runner, commands, root, ["git", "show", "-s", "--format=%P", sha])
    ).trim();
    const parents = parentsRaw === "" ? [] : parentsRaw.split(" ");
    const paths = parsePaths(
      await requireCommand(
        runner,
        commands,
        root,
        parents.length > 0
          ? ["git", "diff", "--name-only", "-z", "--no-renames", parents[0]!, sha, "--"]
          : ["git", "diff-tree", "--root", "--no-commit-id", "--name-only", "-r", "-z", sha],
      ),
    );
    commits.push({ sha, message, paths, parents });
  }
  return commits;
}

function parseDocumentationTree(raw: string, revision: "base" | "head"): DocumentationTreeEntry[] {
  const records = raw.split("\0");
  if (records.at(-1) === "") records.pop();
  if (records.length > 20_000) throw new Error("documentation tree is saturated");
  return records.map((record) => {
    const match = record.match(/^(\d{6}) (blob|commit) [0-9a-f]{40}\t([^]*)$/);
    if (!match || !safeTreePath(match[3]!)) throw new Error("documentation tree entry is invalid");
    return {
      revision,
      mode: match[1]!,
      type: match[2]! as "blob" | "commit",
      path: match[3]!,
    };
  });
}

async function loadDocumentationDiscovery(
  root: string,
  target: Pick<PullRequest, "mergeBase" | "head">,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<DocumentationDiscovery> {
  const [baseTree, headTree] = await Promise.all([
    requireCommand(runner, commands, root, [
      "git",
      "ls-tree",
      "-r",
      "-z",
      "--full-tree",
      target.mergeBase,
      "--",
    ]),
    requireCommand(runner, commands, root, ["git", "ls-tree", "-r", "-z", "--full-tree", target.head, "--"]),
  ]);
  return discoverDocumentation([
    ...parseDocumentationTree(baseTree, "base"),
    ...parseDocumentationTree(headTree, "head"),
  ]);
}

export async function runDocumentationCheck(
  rootInput: string,
  pr: number,
  runtime: Pick<Runtime, "runner"> = {},
): Promise<MergePreflightReceipt> {
  const commands: (readonly string[])[] = [];
  if (!Number.isSafeInteger(pr) || pr < 1)
    return baseReceipt("invalid_arguments", "refused", commands, "PR must be a positive integer");
  let root: string;
  try {
    root = await safeRoot(rootInput);
  } catch (error) {
    return baseReceipt(
      "not_git_repo",
      "refused",
      commands,
      error instanceof Error ? error.message : String(error),
    );
  }
  const runner = runtime.runner ?? defaultRunner;
  try {
    const target = await verifyTarget(root, pr, undefined, runner, commands);
    const discovery = await loadDocumentationDiscovery(root, target, runner, commands);
    const result = evaluateDocumentation(
      await loadCommits(root, target, runner, commands),
      target.head,
      new Set(discovery.documentation_paths),
    );
    const documentation = {
      ...result,
      discovery,
      status: (result.docWorthyCommits.length === 0
        ? "not_needed"
        : result.headCovered
          ? "pass"
          : "blocked") as "not_needed" | "pass" | "blocked",
    };
    await verifyTarget(root, pr, target, runner, commands);
    return {
      ...baseReceipt(
        result.headCovered ? "ready" : "documentation_blocked",
        result.headCovered ? "ready" : "blocked",
        commands,
        result.reason,
      ),
      ...target,
      documentation,
    };
  } catch (error) {
    const classified = classifyError(error);
    return baseReceipt(classified.code, classified.outcome, commands, classified.detail);
  }
}

function classifyError(error: unknown): { code: Code; outcome: Outcome; detail: string } {
  const detail = error instanceof Error ? error.message : String(error);
  if (detail.startsWith("NOT_GIT_REPO:")) return { code: "not_git_repo", outcome: "refused", detail };
  if (detail.startsWith("TARGET_MISMATCH:")) return { code: "target_mismatch", outcome: "refused", detail };
  if (detail.startsWith("HEAD_CHANGED:")) return { code: "head_changed", outcome: "refused", detail };
  if (detail.startsWith("CLOSED:")) return { code: "closed", outcome: "refused", detail };
  if (
    detail.includes("unmatched") ||
    detail.includes("invalid") ||
    detail.includes("saturated") ||
    detail.includes("duplicate")
  )
    return { code: "state_unmatched", outcome: "failed", detail };
  return { code: "lookup_failed", outcome: "failed", detail };
}

export async function runMergePreflight(
  options: Options,
  runtime: Runtime = {},
): Promise<MergePreflightReceipt> {
  const commands: (readonly string[])[] = [];
  let root: string;
  try {
    root = await safeRoot(options.root);
  } catch (error) {
    return baseReceipt(
      "not_git_repo",
      "refused",
      commands,
      error instanceof Error ? error.message : String(error),
    );
  }
  const runner = runtime.runner ?? defaultRunner;
  const now = runtime.now ?? (() => performance.now());
  const sleep = runtime.sleep ?? ((milliseconds: number) => Bun.sleep(milliseconds));
  let target: PullRequest;
  try {
    target = await verifyTarget(root, options.pr, undefined, runner, commands);
  } catch (error) {
    const classified = classifyError(error);
    return baseReceipt(classified.code, classified.outcome, commands, classified.detail);
  }
  let delivery: NonNullable<MergePreflightReceipt["delivery"]>;
  let documentation: NonNullable<MergePreflightReceipt["documentation"]>;
  let staticCode: "delivery_blocked" | "documentation_blocked" | "multiple_blockers" | undefined;
  let staticDetail = "";
  try {
    const changed = parseNameStatus(
      await requireCommand(runner, commands, root, [
        "git",
        "diff",
        "--name-status",
        "-z",
        "--no-renames",
        target.mergeBase,
        target.head,
        "--",
      ]),
    );
    const deliveryTouched = changed.some(
      (entry) => entry.path === "roadmap" || entry.path.startsWith("roadmap/"),
    );
    const deliveryFindings = evaluateDelivery({
      changed,
      baseFiles: deliveryTouched ? await loadTree(root, target.mergeBase, runner, commands) : new Map(),
      headFiles: deliveryTouched ? await loadTree(root, target.head, runner, commands) : new Map(),
    });
    delivery = {
      status: !deliveryTouched ? "not_applicable" : deliveryFindings.length > 0 ? "blocked" : "pass",
      touched: deliveryTouched,
      findings: deliveryFindings,
    };
    const discovery = await loadDocumentationDiscovery(root, target, runner, commands);
    const documentationResult = evaluateDocumentation(
      await loadCommits(root, target, runner, commands),
      target.head,
      new Set(discovery.documentation_paths),
    );
    documentation = {
      ...documentationResult,
      discovery,
      status:
        documentationResult.docWorthyCommits.length === 0
          ? "not_needed"
          : documentationResult.headCovered
            ? "pass"
            : "blocked",
    };
    if (delivery.status === "blocked" || documentation.status === "blocked") {
      const both = delivery.status === "blocked" && documentation.status === "blocked";
      staticCode = both
        ? "multiple_blockers"
        : delivery.status === "blocked"
          ? "delivery_blocked"
          : "documentation_blocked";
      staticDetail = both
        ? "delivery and documentation predicates block merge"
        : delivery.status === "blocked"
          ? "delivery artifact contradictions block merge"
          : documentation.reason;
    }
  } catch (error) {
    const classified = classifyError(error);
    return { ...baseReceipt(classified.code, classified.outcome, commands, classified.detail), ...target };
  }
  let started: number;
  try {
    started = now();
    if (!Number.isFinite(started) || started < 0) throw new Error("monotonic clock is invalid");
  } catch (error) {
    return {
      ...baseReceipt(
        "state_unmatched",
        "failed",
        commands,
        error instanceof Error ? error.message : String(error),
      ),
      ...target,
      delivery,
      documentation,
    };
  }
  let checks: CheckState[] = [];
  let attempts = 0;
  while (true) {
    try {
      await verifyTarget(root, options.pr, target, runner, commands);
      const result = await invoke(runner, commands, root, [
        "gh",
        "pr",
        "checks",
        String(options.pr),
        "--repo",
        target.repository,
        "--required",
        "--json",
        "bucket,link,name,state,workflow",
      ]);
      if (![0, 1, 8].includes(result.code) || result.timedOut)
        throw new Error("required check lookup failed");
      if (Buffer.byteLength(result.stdout) > 5_000_000) throw new Error("required check output is saturated");
      checks = parseChecks(result.stdout);
    } catch (error) {
      const classified = classifyError(error);
      return {
        ...baseReceipt(classified.code, classified.outcome, commands, classified.detail),
        ...target,
        delivery,
        documentation,
      };
    }
    attempts += 1;
    let elapsed: number;
    try {
      elapsed = now() - started;
    } catch (error) {
      return {
        ...baseReceipt(
          "state_unmatched",
          "failed",
          commands,
          error instanceof Error ? error.message : String(error),
        ),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    }
    if (!Number.isFinite(elapsed) || elapsed < 0)
      return {
        ...baseReceipt("state_unmatched", "failed", commands, "monotonic clock moved backwards"),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    if (elapsed > wallClockLimitMs)
      return {
        ...baseReceipt(
          "checks_pending",
          "pending",
          commands,
          "required-check observation exceeded the wall-clock bound",
        ),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    if (checks.some((check) => check.bucket === "fail" || check.bucket === "cancel"))
      return {
        ...baseReceipt(
          "checks_failed",
          "blocked",
          commands,
          "one or more required checks failed or were cancelled",
        ),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    if (!checks.some((check) => check.bucket === "pending")) break;
    if (staticCode && !options.pollWithStaticBlockers)
      return {
        ...baseReceipt(
          staticCode,
          "blocked",
          commands,
          `${staticDetail}; required checks are also pending and were sampled once`,
        ),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    if (
      options.noPoll ||
      attempts >= maximumAttempts ||
      elapsed >= wallClockLimitMs ||
      elapsed + pollIntervalMs > wallClockLimitMs
    )
      return {
        ...baseReceipt(
          "checks_pending",
          "pending",
          commands,
          "required checks remain pending at the polling bound",
        ),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    try {
      await sleep(pollIntervalMs);
    } catch (error) {
      return {
        ...baseReceipt(
          "lookup_failed",
          "failed",
          commands,
          `poll wait failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    }
  }
  try {
    await verifyTarget(root, options.pr, target, runner, commands);
    if (staticCode)
      return {
        ...baseReceipt(staticCode, "blocked", commands, staticDetail),
        ...target,
        checkAttempts: attempts,
        checks,
        delivery,
        documentation,
      };
    return {
      ...baseReceipt(
        "ready",
        "ready",
        commands,
        "preflight gates pass; this receipt grants no merge authority",
      ),
      ...target,
      checkAttempts: attempts,
      checks,
      delivery,
      documentation,
    };
  } catch (error) {
    const classified = classifyError(error);
    return {
      ...baseReceipt(classified.code, classified.outcome, commands, classified.detail),
      ...target,
      checkAttempts: attempts,
      checks,
    };
  }
}

function parseOptions(args: readonly string[]): Options | undefined {
  let root: string | undefined;
  let pr: number | undefined;
  let noPoll = false;
  let pollWithStaticBlockers = false;
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]!;
    if (flag === "--no-poll" || flag === "--poll-with-static-blockers") {
      if (
        (flag === "--no-poll" && noPoll) ||
        (flag === "--poll-with-static-blockers" && pollWithStaticBlockers)
      )
        return undefined;
      if (flag === "--no-poll") noPoll = true;
      else pollWithStaticBlockers = true;
      continue;
    }
    if (!flag.startsWith("--") || seen.has(flag)) return undefined;
    seen.add(flag);
    const value = args[++index];
    if (value === undefined) return undefined;
    if (flag === "--root") root = value;
    else if (flag === "--pr") pr = Number(value);
    else return undefined;
  }
  if (!root || !Number.isSafeInteger(pr) || pr! < 1) return undefined;
  if (noPoll && pollWithStaticBlockers) return undefined;
  return { root, pr: pr!, noPoll, pollWithStaticBlockers };
}

function parseDocumentationOptions(args: readonly string[]): { root: string; pr: number } | undefined {
  let root: string | undefined;
  let pr: number | undefined;
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flag || !value || seen.has(flag)) return undefined;
    seen.add(flag);
    if (flag === "--root") root = value;
    else if (flag === "--pr") pr = Number(value);
    else return undefined;
  }
  return root && Number.isSafeInteger(pr) && pr! > 0 ? { root, pr: pr! } : undefined;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const documentationOptions =
    args[0] === "documentation" ? parseDocumentationOptions(args.slice(1)) : undefined;
  const options = args[0] === "documentation" ? undefined : parseOptions(args);
  const receipt = documentationOptions
    ? await runDocumentationCheck(documentationOptions.root, documentationOptions.pr)
    : options
      ? await runMergePreflight(options)
      : baseReceipt(
          "invalid_arguments",
          "refused",
          [],
          "usage: merge-preflight.ts --root <repository> --pr <number> [--no-poll | --poll-with-static-blockers] | documentation --root <repository> --pr <number>",
        );
  console.log(JSON.stringify(receipt));
  process.exit(
    receipt.outcome === "ready"
      ? 0
      : receipt.outcome === "pending"
        ? 8
        : receipt.outcome === "blocked" || receipt.outcome === "refused"
          ? 2
          : 1,
  );
}
