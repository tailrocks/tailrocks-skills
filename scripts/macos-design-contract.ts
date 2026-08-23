import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicRecoveryArtifacts, atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";

export const liveSessionSchema = "tailrocks.macos-live-session/v1" as const;
export const reviewInputSchema = "tailrocks.macos-design-review-input/v1" as const;
export const reviewReceiptSchema = "tailrocks.macos.design-review/v1" as const;
export const blessInputSchema = "tailrocks.macos-design-bless-input/v1" as const;
export const systematizeInputSchema = "tailrocks.macos-design-systematize-input/v1" as const;
const digestPattern = /^[a-f0-9]{64}$/u;
const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
export const macosReviewStates = [
  "typical-light",
  "typical-dark",
  "minimum",
  "wide",
  "inactive",
  "sidebar-collapsed",
  "inspector-closed",
  "empty",
  "loading",
  "error",
  "large-dataset",
  "long-strings",
  "reduce-transparency",
  "increase-contrast",
  "differentiate-without-color",
  "offline",
  "permission-denied",
  "destructive-pending",
  "missing-values",
  "reduce-motion",
] as const;
export const macosReviewCategories = {
  "product-clarity": 15,
  "macos-nativeness": 20,
  "visual-hierarchy": 15,
  "liquid-glass": 15,
  "typography-color-icons": 10,
  "interaction-motion": 10,
  accessibility: 10,
  "performance-finish": 5,
} as const;
export const macosReviewHardFailures = [
  "pervasive-glass-content-cards",
  "overlapping-nested-glass",
  "unreadable-complex-background",
  "minimum-width-clipping",
  "keyboard-dead-end",
  "inferior-custom-control",
  "color-only-state",
  "missing-empty-loading-error",
  "broken-accessibility-settings",
  "unsafe-destructive-action",
  "data-loss-path",
  "window-state-not-restored",
  "command-palette-only",
  "hover-or-drag-only",
  "toolbar-without-menu",
  "inactive-window-unvalidated",
  "no-rendered-output",
  "implementer-only-review",
] as const;
export const macosReviewCaps = {
  "data-loss-or-restoration": 49,
  "core-task-not-keyboard": 59,
  "material-inaccessible": 59,
  "major-window-size-failure": 59,
  "menu-model-incomplete": 69,
  "ideal-data-only": 69,
  "implementer-only-review": 79,
} as const;

type RecordValue = Record<string, unknown>;
type ReviewOutcome = "PRELIMINARY" | "PASS" | "FAIL" | "BLOCKED" | "REFUSED";

interface MatrixRow {
  readonly state: string;
  readonly evidence: "live" | "static" | "missing";
  readonly observation: string;
}
interface CategoryScore {
  readonly id: keyof typeof macosReviewCategories;
  readonly points: number;
}
interface CapTrigger {
  readonly id: keyof typeof macosReviewCaps;
  readonly present: boolean;
}
interface HardFailure {
  readonly id: (typeof macosReviewHardFailures)[number];
  readonly present: boolean;
  readonly evidence: string;
}
interface LiveSession {
  readonly schema: typeof liveSessionSchema;
  readonly id: string;
  readonly prototype_revision: string;
  readonly package_sha256: string;
  readonly pid: number;
  readonly window_id: number;
  readonly ready_nonce: string;
  readonly matrix: readonly MatrixRow[];
  readonly capture_artifacts: readonly [];
}
export interface DesignReviewReceipt {
  readonly schema: typeof reviewReceiptSchema;
  readonly outcome: ReviewOutcome;
  readonly subject_revision: string;
  readonly package_sha256: string;
  readonly reviewer: string;
  readonly author: string;
  readonly live_session_id: string | null;
  readonly matrix: readonly MatrixRow[];
  readonly category_scores: readonly CategoryScore[];
  readonly score: number;
  readonly score_cap: number;
  readonly cap_triggers: readonly CapTrigger[];
  readonly hard_failure_checks: readonly HardFailure[];
  readonly hard_failures: readonly string[];
  readonly findings: readonly string[];
  readonly mutations: readonly [];
  readonly detail: string;
}
export interface DesignMutationReceipt {
  readonly schema: "tailrocks.macos-design-bless/v1" | "tailrocks.macos-design-systematize/v1";
  readonly outcome: "BLESSED" | "SYSTEMATIZED" | "NO_CHANGE" | "REFUSED" | "RECOVERY_REQUIRED";
  readonly paths: readonly string[];
  readonly mutations: readonly string[];
  readonly recovery_artifacts: readonly string[];
  readonly review_sha256: string;
  readonly signoff_sha256: string;
  readonly signoff: ParsedSignoff | null;
  readonly ledger: readonly {
    readonly id: string;
    readonly path: string;
    readonly before_sha256: string | null;
    readonly after_sha256: string;
    readonly state:
      | "published"
      | "unchanged"
      | "restored"
      | "postimage_survives"
      | "concurrent_replacement"
      | "missing"
      | "unsafe";
  }[];
  readonly partial_state: readonly string[];
  readonly detail: string;
}

function object(value: unknown, label: string): RecordValue {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    throw new Error(`${label} must be a plain object`);
  return value as RecordValue;
}
function exact(value: RecordValue, keys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort(),
    expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index]))
    throw new Error(`${label} has unknown or missing fields`);
}
function text(value: unknown, label: string, maximum = 1_000): string {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    !value ||
    Buffer.byteLength(value) > maximum ||
    /[\u0000-\u001f\u007f]/u.test(value)
  )
    throw new Error(`${label} is invalid`);
  return value;
}
function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
function sha(value: unknown, label: string): string {
  if (typeof value !== "string" || !digestPattern.test(value)) throw new Error(`${label} is invalid`);
  return value;
}
function revision(value: unknown, label: string): string {
  if (typeof value !== "string" || !revisionPattern.test(value)) throw new Error(`${label} is invalid`);
  return value;
}
function calendarDate(value: unknown, label: string): string {
  const date = text(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) throw new Error(`${label} is invalid`);
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date)
    throw new Error(`${label} is invalid`);
  return date;
}
function strings(value: unknown, label: string, maximum = 128): string[] {
  if (!Array.isArray(value) || value.length > maximum) throw new Error(`${label} is invalid`);
  const result = value.map((item, index) => text(item, `${label}[${index}]`));
  if (new Set(result).size !== result.length) throw new Error(`${label} contains duplicates`);
  return result;
}
function matrix(value: unknown, label: string): MatrixRow[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 128)
    throw new Error(`${label} is invalid`);
  const rows = value.map((raw, index) => {
    const row = object(raw, `${label}[${index}]`);
    exact(row, ["state", "evidence", "observation"], `${label}[${index}]`);
    if (!(["live", "static", "missing"] as unknown[]).includes(row.evidence))
      throw new Error(`${label}[${index}].evidence is invalid`);
    return {
      state: text(row.state, `${label}[${index}].state`),
      evidence: row.evidence as MatrixRow["evidence"],
      observation: text(row.observation, `${label}[${index}].observation`, 2_000),
    };
  });
  if (new Set(rows.map(({ state }) => state)).size !== rows.length)
    throw new Error(`${label} states are duplicated`);
  return rows;
}
function exactIds(actual: readonly string[], expected: readonly string[], label: string): void {
  if (
    new Set(actual).size !== actual.length ||
    [...actual].sort().join("\0") !== [...expected].sort().join("\0")
  )
    throw new Error(`${label} is not exhaustive`);
}
function categoryScores(value: unknown): CategoryScore[] {
  if (!Array.isArray(value)) throw new Error("category_scores is invalid");
  const result = value.map((raw, index) => {
    const row = object(raw, `category_scores[${index}]`);
    exact(row, ["id", "points"], `category_scores[${index}]`);
    if (!((row.id as string) in macosReviewCategories))
      throw new Error(`category_scores[${index}].id is invalid`);
    const id = row.id as keyof typeof macosReviewCategories,
      maximum = macosReviewCategories[id];
    if (!Number.isSafeInteger(row.points) || (row.points as number) < 0 || (row.points as number) > maximum)
      throw new Error(`category_scores[${index}].points is invalid`);
    return { id, points: row.points as number };
  });
  exactIds(
    result.map(({ id }) => id),
    Object.keys(macosReviewCategories),
    "category_scores",
  );
  return result;
}
function capTriggers(value: unknown): CapTrigger[] {
  if (!Array.isArray(value)) throw new Error("cap_triggers is invalid");
  const result = value.map((raw, index) => {
    const row = object(raw, `cap_triggers[${index}]`);
    exact(row, ["id", "present"], `cap_triggers[${index}]`);
    if (!((row.id as string) in macosReviewCaps) || typeof row.present !== "boolean")
      throw new Error(`cap_triggers[${index}] is invalid`);
    return { id: row.id as keyof typeof macosReviewCaps, present: row.present };
  });
  exactIds(
    result.map(({ id }) => id),
    Object.keys(macosReviewCaps),
    "cap_triggers",
  );
  return result;
}
function hardFailures(value: unknown): HardFailure[] {
  if (!Array.isArray(value)) throw new Error("hard_failures is invalid");
  const result = value.map((raw, index) => {
    const row = object(raw, `hard_failures[${index}]`);
    exact(row, ["id", "present", "evidence"], `hard_failures[${index}]`);
    if (!(macosReviewHardFailures as readonly unknown[]).includes(row.id) || typeof row.present !== "boolean")
      throw new Error(`hard_failures[${index}] is invalid`);
    return {
      id: row.id as HardFailure["id"],
      present: row.present,
      evidence: text(row.evidence, `hard_failures[${index}].evidence`, 2_000),
    };
  });
  exactIds(
    result.map(({ id }) => id),
    macosReviewHardFailures,
    "hard_failures",
  );
  return result;
}
function liveSession(
  raw: unknown,
  requiredStates: readonly string[],
  subjectRevision: string,
  packageSha256: string,
): LiveSession {
  const value = object(raw, "live_session");
  exact(
    value,
    [
      "schema",
      "id",
      "prototype_revision",
      "package_sha256",
      "pid",
      "window_id",
      "ready_nonce",
      "matrix",
      "capture_artifacts",
    ],
    "live_session",
  );
  if (value.schema !== liveSessionSchema) throw new Error("live_session schema is invalid");
  if (
    !Number.isSafeInteger(value.pid) ||
    (value.pid as number) < 1 ||
    !Number.isSafeInteger(value.window_id) ||
    (value.window_id as number) < 1
  )
    throw new Error("live_session process identity is invalid");
  if (!Array.isArray(value.capture_artifacts) || value.capture_artifacts.length !== 0)
    throw new Error("review live session cannot contain captures");
  const rows = matrix(value.matrix, "live_session.matrix");
  if (
    rows.some((row) => row.evidence !== "live") ||
    rows
      .map(({ state }) => state)
      .sort()
      .join("\0") !== [...requiredStates].sort().join("\0")
  )
    throw new Error("live_session does not prove the exact required matrix");
  const parsed = {
    schema: liveSessionSchema,
    id: text(value.id, "live_session.id"),
    prototype_revision: revision(value.prototype_revision, "live_session.prototype_revision"),
    package_sha256: sha(value.package_sha256, "live_session.package_sha256"),
    pid: value.pid as number,
    window_id: value.window_id as number,
    ready_nonce: text(value.ready_nonce, "live_session.ready_nonce"),
    matrix: rows,
    capture_artifacts: [] as const,
  };
  if (parsed.prototype_revision !== subjectRevision || parsed.package_sha256 !== packageSha256)
    throw new Error("live_session is stale for the subject");
  return parsed;
}

export function finalizeMacosDesignReview(raw: unknown): DesignReviewReceipt {
  try {
    const value = object(raw, "input");
    exact(
      value,
      [
        "schema",
        "mode",
        "subject_revision",
        "package_sha256",
        "author",
        "reviewer",
        "evidence",
        "live_session",
        "category_scores",
        "cap_triggers",
        "hard_failures",
        "findings",
      ],
      "input",
    );
    if (value.schema !== reviewInputSchema || (value.mode !== "preliminary" && value.mode !== "acceptance"))
      throw new Error("review selector is invalid");
    const subjectRevision = revision(value.subject_revision, "subject_revision");
    const packageSha256 = sha(value.package_sha256, "package_sha256");
    const author = text(value.author, "author"),
      reviewer = text(value.reviewer, "reviewer");
    if (author === reviewer) throw new Error("implementer cannot review own work");
    const evidence = matrix(value.evidence, "evidence");
    exactIds(
      evidence.map(({ state }) => state),
      macosReviewStates,
      "evidence matrix",
    );
    const categories = categoryScores(value.category_scores),
      caps = capTriggers(value.cap_triggers),
      failures = hardFailures(value.hard_failures);
    const rawScore = categories.reduce((sum, category) => sum + category.points, 0);
    const scoreCap = Math.min(
      100,
      ...caps.filter(({ present }) => present).map(({ id }) => macosReviewCaps[id]),
    );
    const score = Math.min(rawScore, scoreCap);
    const failedCategories = categories.filter(({ id, points }) => points < macosReviewCategories[id] * 0.6);
    const presentFailures = failures.filter(({ present }) => present).map(({ id }) => id);
    const findings = strings(value.findings, "findings");
    const session =
      value.live_session === null
        ? null
        : liveSession(value.live_session, macosReviewStates, subjectRevision, packageSha256);
    const acceptance = value.mode === "acceptance";
    if (acceptance && (!session || evidence.some((row) => row.evidence !== "live")))
      throw new Error("acceptance requires a complete bound live session");
    if (session && JSON.stringify(session.matrix) !== JSON.stringify(evidence))
      throw new Error("live session observations do not match review evidence");
    const outcome: ReviewOutcome = acceptance
      ? presentFailures.length === 0 && failedCategories.length === 0 && score >= 90
        ? "PASS"
        : "FAIL"
      : "PRELIMINARY";
    return {
      schema: reviewReceiptSchema,
      outcome,
      subject_revision: subjectRevision,
      package_sha256: packageSha256,
      reviewer,
      author,
      live_session_id: session?.id ?? null,
      matrix: evidence,
      category_scores: categories,
      score,
      score_cap: scoreCap,
      cap_triggers: caps,
      hard_failure_checks: failures,
      hard_failures: presentFailures,
      findings,
      mutations: [],
      detail:
        outcome === "PASS"
          ? "complete live acceptance passed"
          : outcome === "PRELIMINARY"
            ? "preliminary evidence only"
            : "acceptance failed",
    };
  } catch (error) {
    return {
      schema: reviewReceiptSchema,
      outcome: "REFUSED",
      subject_revision: "",
      package_sha256: "",
      reviewer: "",
      author: "",
      live_session_id: null,
      matrix: [],
      category_scores: [],
      score: 0,
      score_cap: 0,
      cap_triggers: [],
      hard_failure_checks: [],
      hard_failures: [],
      findings: [],
      mutations: [],
      detail: error instanceof Error ? error.message : "review refused",
    };
  }
}

async function safeRoot(root: unknown): Promise<string> {
  const candidate = path.resolve(text(root, "root", 4_096));
  const info = await lstat(candidate);
  if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(candidate)) !== candidate)
    throw new Error("root is unsafe");
  return candidate;
}
function safeRelative(value: unknown, label: string): string {
  const relative = text(value, label, 1_024),
    parts = relative.split("/");
  if (
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    parts.some((part) => !part || part === "." || part === ".." || part === ".git")
  )
    throw new Error(`${label} is unsafe`);
  return relative;
}
async function readBoundUtf8(file: string, label: string): Promise<string> {
  const before = await lstat(file);
  if (!before.isFile() || before.isSymbolicLink() || (await realpath(file)) !== file)
    throw new Error(`${label} is unsafe`);
  if (before.size > 4_000_000) throw new Error(`${label} is too large`);
  const body = await readFile(file, "utf8"),
    after = await lstat(file);
  if (
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs ||
    before.ctimeMs !== after.ctimeMs
  )
    throw new Error(`${label} changed while read`);
  return body;
}
function passingReview(raw: unknown): DesignReviewReceipt {
  const value = object(raw, "review");
  exact(
    value,
    [
      "schema",
      "outcome",
      "subject_revision",
      "package_sha256",
      "reviewer",
      "author",
      "live_session_id",
      "matrix",
      "category_scores",
      "score",
      "score_cap",
      "cap_triggers",
      "hard_failure_checks",
      "hard_failures",
      "findings",
      "mutations",
      "detail",
    ],
    "review",
  );
  if (value.schema !== reviewReceiptSchema || value.outcome !== "PASS")
    throw new Error("current independent live PASS is required");
  const parsedMatrix = matrix(value.matrix, "review.matrix");
  exactIds(
    parsedMatrix.map(({ state }) => state),
    macosReviewStates,
    "review.matrix",
  );
  if (parsedMatrix.some(({ evidence }) => evidence !== "live")) throw new Error("review matrix is not live");
  const categories = categoryScores(value.category_scores),
    caps = capTriggers(value.cap_triggers),
    checks = hardFailures(value.hard_failure_checks);
  const scoreCap = Math.min(
    100,
    ...caps.filter(({ present }) => present).map(({ id }) => macosReviewCaps[id]),
  );
  const score = Math.min(
    categories.reduce((sum, category) => sum + category.points, 0),
    scoreCap,
  );
  if (
    score < 90 ||
    value.score !== score ||
    value.score_cap !== scoreCap ||
    categories.some(({ id, points }) => points < macosReviewCategories[id] * 0.6)
  )
    throw new Error("review score proof is invalid");
  if (
    !Array.isArray(value.hard_failures) ||
    value.hard_failures.length !== 0 ||
    checks.some(({ present }) => present) ||
    !Array.isArray(value.mutations) ||
    value.mutations.length !== 0
  )
    throw new Error("review carries failure or mutation");
  const reviewer = text(value.reviewer, "review.reviewer"),
    author = text(value.author, "review.author");
  if (reviewer === author) throw new Error("review is not independent");
  return {
    schema: reviewReceiptSchema,
    outcome: "PASS",
    subject_revision: revision(value.subject_revision, "review.subject_revision"),
    package_sha256: sha(value.package_sha256, "review.package_sha256"),
    reviewer,
    author,
    live_session_id: text(value.live_session_id, "review.live_session_id"),
    matrix: parsedMatrix,
    category_scores: categories,
    score,
    score_cap: scoreCap,
    cap_triggers: caps,
    hard_failure_checks: checks,
    hard_failures: [],
    findings: strings(value.findings, "review.findings"),
    mutations: [],
    detail: text(value.detail, "review.detail"),
  };
}

export interface ParsedSignoff {
  readonly feature: string;
  readonly subject_revision: string;
  readonly package_sha256: string;
  readonly review_sha256: string;
  readonly reviewer: string;
  readonly live_session_id: string;
  readonly invocation_id: string;
  readonly states: readonly string[];
  readonly date: string;
  readonly user: string;
}
function parseCanonicalSignoff(body: string): ParsedSignoff {
  const lines = body.split("\n");
  if (lines.length !== 8 || lines[1] !== "" || lines[7] !== "")
    throw new Error("SIGNOFF.md grammar is invalid");
  const title = /^# ([A-Za-z0-9][A-Za-z0-9_-]{0,127}) prototype sign-off$/u.exec(lines[0]!);
  const identity = /^- \*\*Prototype identity\*\*: ([a-f0-9]{40}|[a-f0-9]{64}) — ([a-f0-9]{64})$/u.exec(
    lines[2]!,
  );
  const review =
    /^- \*\*Acceptance review\*\*: tailrocks\.macos\.design-review\/v1 ([a-f0-9]{64}) — `PASS` by ([^\x00-\x1f\x7f]+) in ([^\x00-\x1f\x7f]+)$/u.exec(
      lines[3]!,
    );
  const invocation = /^- \*\*Invocation\*\*: ([^\x00-\x1f\x7f]+)$/u.exec(lines[4]!);
  const scenarios = /^- \*\*Scenarios\*\*: ([^\x00-\x1f\x7f]+)$/u.exec(lines[5]!);
  const blessed = /^- \*\*Blessed\*\*: (\d{4}-\d{2}-\d{2}) by ([^\x00-\x1f\x7f]+) — reviewed running$/u.exec(
    lines[6]!,
  );
  if (!title || !identity || !review || !invocation || !scenarios || !blessed)
    throw new Error("SIGNOFF.md grammar is invalid");
  const states = scenarios[1]!.split(", ");
  exactIds(states, macosReviewStates, "SIGNOFF.md scenarios");
  return {
    feature: title[1]!,
    subject_revision: identity[1]!,
    package_sha256: identity[2]!,
    review_sha256: review[1]!,
    reviewer: review[2]!,
    live_session_id: review[3]!,
    invocation_id: invocation[1]!,
    states,
    date: calendarDate(blessed[1]!, "SIGNOFF.md date"),
    user: blessed[2]!,
  };
}
interface BoundLedgerWrite {
  readonly id: string;
  readonly file: string;
  readonly relative: string;
  readonly expected: string | null;
  readonly content: string;
}
async function terminalLedgerState(
  item: BoundLedgerWrite,
): Promise<DesignMutationReceipt["ledger"][number]["state"]> {
  try {
    const current = await readBoundUtf8(item.file, item.relative);
    if (item.expected !== null && current === item.expected) return "restored";
    if (current === item.content) return "postimage_survives";
    return "concurrent_replacement";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return item.expected === null ? "restored" : "missing";
    return "unsafe";
  }
}

export async function blessMacosDesign(
  raw: unknown,
  runtime: AtomicFileRuntime = {},
): Promise<DesignMutationReceipt> {
  const schema = "tailrocks.macos-design-bless/v1" as const;
  try {
    const value = object(raw, "input");
    exact(
      value,
      [
        "schema",
        "root",
        "target",
        "expected_utf8",
        "feature",
        "subject_revision",
        "package_sha256",
        "review",
        "review_sha256",
        "invocation_id",
        "human_signoff",
      ],
      "input",
    );
    if (value.schema !== blessInputSchema) throw new Error("input schema is invalid");
    const root = await safeRoot(value.root),
      target = safeRelative(value.target, "target"),
      feature = text(value.feature, "feature", 128);
    if (
      target !== `Design/Prototypes/${feature}/SIGNOFF.md` ||
      !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u.test(feature)
    )
      throw new Error("bless owner may write only the feature SIGNOFF.md");
    const review = passingReview(value.review),
      subjectRevision = revision(value.subject_revision, "subject_revision"),
      packageSha256 = sha(value.package_sha256, "package_sha256");
    const reviewSha256 = sha(value.review_sha256, "review_sha256"),
      invocationId = text(value.invocation_id, "invocation_id");
    if (digest(JSON.stringify(review)) !== reviewSha256) throw new Error("review digest is stale");
    if (review.subject_revision !== subjectRevision || review.package_sha256 !== packageSha256)
      throw new Error("review is stale");
    const signoff = object(value.human_signoff, "human_signoff");
    exact(
      signoff,
      [
        "source",
        "user",
        "date",
        "invocation_id",
        "subject_revision",
        "package_sha256",
        "review_sha256",
        "reviewer",
        "live_session_id",
        "states",
      ],
      "human_signoff",
    );
    if (
      signoff.source !== "live_user" ||
      signoff.invocation_id !== invocationId ||
      signoff.subject_revision !== subjectRevision ||
      signoff.package_sha256 !== packageSha256 ||
      signoff.review_sha256 !== reviewSha256 ||
      signoff.reviewer !== review.reviewer ||
      signoff.live_session_id !== review.live_session_id
    )
      throw new Error("human sign-off is not bound to the passing live review");
    const states = strings(signoff.states, "human_signoff.states");
    if (
      states.sort().join("\0") !==
      review.matrix
        .map(({ state }) => state)
        .sort()
        .join("\0")
    )
      throw new Error("sign-off does not cover reviewed matrix");
    const user = text(signoff.user, "human_signoff.user"),
      date = calendarDate(signoff.date, "human_signoff.date");
    if (typeof value.expected_utf8 !== "string" && value.expected_utf8 !== null)
      throw new Error("expected_utf8 is invalid");
    const body = `# ${feature} prototype sign-off\n\n- **Prototype identity**: ${subjectRevision} — ${packageSha256}\n- **Acceptance review**: ${reviewReceiptSchema} ${reviewSha256} — \`PASS\` by ${review.reviewer} in ${review.live_session_id}\n- **Invocation**: ${invocationId}\n- **Scenarios**: ${states.join(", ")}\n- **Blessed**: ${date} by ${user} — reviewed running\n`;
    const absolute = path.join(root, target);
    await atomicWriteFiles(
      [{ file: absolute, expected: value.expected_utf8 as string | null, content: body }],
      runtime,
    );
    return {
      schema,
      outcome: "BLESSED",
      paths: [target],
      mutations: [target],
      recovery_artifacts: [],
      review_sha256: reviewSha256,
      signoff_sha256: digest(body),
      signoff: parseCanonicalSignoff(body),
      ledger: [],
      partial_state: [],
      detail: `SIGNOFF.md ${digest(body)}`,
    };
  } catch (error) {
    const recovery = atomicRecoveryArtifacts(error);
    return {
      schema,
      outcome: recovery.length ? "RECOVERY_REQUIRED" : "REFUSED",
      paths: [],
      mutations: [],
      recovery_artifacts: recovery,
      review_sha256: "",
      signoff_sha256: "",
      signoff: null,
      ledger: [],
      partial_state: recovery,
      detail: error instanceof Error ? error.message : "blessing refused",
    };
  }
}

export async function systematizeMacosDesign(
  raw: unknown,
  runtime: AtomicFileRuntime = {},
): Promise<DesignMutationReceipt> {
  const schema = "tailrocks.macos-design-systematize/v1" as const;
  let boundReviewSha256 = "",
    boundSignoffSha256 = "";
  let declaredPaths: string[] = [];
  let boundWrites: BoundLedgerWrite[] = [];
  try {
    const value = object(raw, "input");
    exact(
      value,
      [
        "schema",
        "root",
        "design_system_root",
        "subject_revision",
        "package_sha256",
        "review",
        "review_sha256",
        "signoff_path",
        "signoff_sha256",
        "ledger",
      ],
      "input",
    );
    if (value.schema !== systematizeInputSchema) throw new Error("input schema is invalid");
    const root = await safeRoot(value.root),
      designRoot = safeRelative(value.design_system_root, "design_system_root");
    if (!designRoot.startsWith("Design/System/") || designRoot.includes("Prototypes"))
      throw new Error("design_system_root is outside product design-system ownership");
    const designRootFile = path.join(root, designRoot),
      designRootInfo = await lstat(designRootFile);
    if (
      !designRootInfo.isDirectory() ||
      designRootInfo.isSymbolicLink() ||
      (await realpath(designRootFile)) !== designRootFile
    )
      throw new Error("design_system_root is unsafe");
    const review = passingReview(value.review),
      reviewSha256 = sha(value.review_sha256, "review_sha256");
    boundReviewSha256 = reviewSha256;
    if (digest(JSON.stringify(review)) !== reviewSha256) throw new Error("review digest is stale");
    if (
      review.subject_revision !== revision(value.subject_revision, "subject_revision") ||
      review.package_sha256 !== sha(value.package_sha256, "package_sha256")
    )
      throw new Error("review is stale");
    const signoffPath = safeRelative(value.signoff_path, "signoff_path");
    if (!/^Design\/Prototypes\/[^/]+\/SIGNOFF\.md$/u.test(signoffPath))
      throw new Error("signoff_path is outside blessing ownership");
    const signoffFile = path.join(root, signoffPath),
      signoff = await readBoundUtf8(signoffFile, "signoff_path"),
      signoffSha256 = sha(value.signoff_sha256, "signoff_sha256");
    boundSignoffSha256 = signoffSha256;
    if (digest(signoff) !== signoffSha256) throw new Error("signoff digest is stale");
    const parsedSignoff = parseCanonicalSignoff(signoff),
      feature = signoffPath.split("/")[2]!;
    if (
      parsedSignoff.feature !== feature ||
      parsedSignoff.subject_revision !== review.subject_revision ||
      parsedSignoff.package_sha256 !== review.package_sha256 ||
      parsedSignoff.review_sha256 !== reviewSha256 ||
      parsedSignoff.reviewer !== review.reviewer ||
      parsedSignoff.live_session_id !== review.live_session_id
    )
      throw new Error("SIGNOFF.md does not bind the passing live review");
    text(parsedSignoff.invocation_id, "SIGNOFF.md invocation");
    text(parsedSignoff.user, "SIGNOFF.md user");
    if (!Array.isArray(value.ledger) || value.ledger.length === 0 || value.ledger.length > 128)
      throw new Error("ledger is invalid");
    const writes: BoundLedgerWrite[] = value.ledger.map((rawEntry, index) => {
      const entry = object(rawEntry, `ledger[${index}]`);
      exact(
        entry,
        ["id", "disposition", "path", "expected_utf8", "postimage_utf8", "evidence"],
        `ledger[${index}]`,
      );
      const id = text(entry.id, `ledger[${index}].id`, 128),
        disposition = text(entry.disposition, `ledger[${index}].disposition`, 32);
      if (!/^[A-Z][A-Z0-9-]*$/u.test(id) || disposition !== "accepted")
        throw new Error(`ledger[${index}] is not explicitly accepted`);
      const relative = safeRelative(entry.path, `ledger[${index}].path`);
      if (!(relative === designRoot || relative.startsWith(`${designRoot}/`)))
        throw new Error(`ledger[${index}].path is outside allowlist`);
      if (
        (typeof entry.expected_utf8 !== "string" && entry.expected_utf8 !== null) ||
        typeof entry.postimage_utf8 !== "string" ||
        Buffer.byteLength(entry.postimage_utf8 as string) > 4_000_000 ||
        (typeof entry.expected_utf8 === "string" && Buffer.byteLength(entry.expected_utf8) > 4_000_000)
      )
        throw new Error(`ledger[${index}] content is invalid`);
      text(entry.evidence, `ledger[${index}].evidence`, 2_000);
      return {
        id,
        file: path.join(root, relative),
        expected: entry.expected_utf8 as string | null,
        content: entry.postimage_utf8 as string,
        relative,
      };
    });
    if (new Set(writes.map(({ relative }) => relative)).size !== writes.length)
      throw new Error("ledger paths are duplicated");
    declaredPaths = writes.map(({ relative }) => relative);
    boundWrites = writes;
    const changed = writes.filter((item) => item.expected !== item.content);
    const unchanged = writes.filter((item) => item.expected === item.content);
    for (const item of unchanged)
      if (item.expected === null || (await readBoundUtf8(item.file, item.relative)) !== item.expected)
        throw new Error(`unchanged ledger path drifted: ${item.relative}`);
    const receiptLedger = writes.map(({ id, relative, expected, content }) => ({
      id,
      path: relative,
      before_sha256: expected === null ? null : digest(expected),
      after_sha256: digest(content),
      state: expected === content ? ("unchanged" as const) : ("published" as const),
    }));
    if (!changed.length)
      return {
        schema,
        outcome: "NO_CHANGE",
        paths: writes.map(({ relative }) => relative),
        mutations: [],
        recovery_artifacts: [],
        review_sha256: reviewSha256,
        signoff_sha256: signoffSha256,
        signoff: parsedSignoff,
        ledger: receiptLedger,
        partial_state: [],
        detail: "declared postimages already match",
      };
    await atomicWriteFiles(
      changed.map(({ file, expected, content }) => ({ file, expected, content })),
      runtime,
      [
        { file: signoffFile, expected: signoff },
        ...unchanged.map(({ file, expected }) => ({ file, expected: expected as string })),
      ],
    );
    return {
      schema,
      outcome: "SYSTEMATIZED",
      paths: writes.map(({ relative }) => relative),
      mutations: changed.map(({ relative }) => relative),
      recovery_artifacts: [],
      review_sha256: reviewSha256,
      signoff_sha256: signoffSha256,
      signoff: parsedSignoff,
      ledger: receiptLedger,
      partial_state: [],
      detail: "accepted ledger published by CAS",
    };
  } catch (error) {
    const recovery = atomicRecoveryArtifacts(error);
    const recoveredLedger = await Promise.all(
      boundWrites.map(async (item) => ({
        id: item.id,
        path: item.relative,
        before_sha256: item.expected === null ? null : digest(item.expected),
        after_sha256: digest(item.content),
        state: await terminalLedgerState(item),
      })),
    );
    const partial = recoveredLedger
      .filter(({ state }) => state !== "restored")
      .map(({ path: relative, state }) => `${relative}:${state}`);
    return {
      schema,
      outcome: recovery.length ? "RECOVERY_REQUIRED" : "REFUSED",
      paths: declaredPaths,
      mutations: [],
      recovery_artifacts: recovery,
      review_sha256: boundReviewSha256,
      signoff_sha256: boundSignoffSha256,
      signoff: null,
      ledger: recoveredLedger,
      partial_state: partial,
      detail: error instanceof Error ? error.message : "systematization refused",
    };
  }
}
