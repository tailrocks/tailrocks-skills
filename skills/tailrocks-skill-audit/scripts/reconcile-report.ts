import { randomUUID } from "node:crypto";
import { link, lstat, mkdir, readFile, realpath, rename, rm, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "../../../scripts/bounded-command";

export const receiptSchema = "tailrocks.audit-report-reconciliation/v1";

export const layerPrefixes = {
  description: "DESC",
  router: "RTR",
  references: "REF",
  evidence: "EVAL",
  wiring: "WIRE",
  overlap: "OVL",
} as const;

export type FindingLayer = keyof typeof layerPrefixes;

export interface StructuredIdentity {
  readonly layer: FindingLayer;
  readonly doctrine_rule: string;
  readonly defect: string;
  readonly responsibility: string;
  readonly evidence: {
    readonly path: string;
    readonly anchor: string;
    readonly quote: string;
  };
}

interface ParsedFinding {
  readonly headingStart: number;
  readonly idStart: number;
  readonly idEnd: number;
  readonly prefix: string;
  readonly id: string;
  readonly identity: string;
}

interface ParsedReport {
  readonly skill: string;
  readonly source: string;
  readonly findings: readonly ParsedFinding[];
}

export interface HistoricalReport {
  readonly revision: string;
  readonly source: string;
}

export interface ReconciliationReceipt {
  readonly schema: typeof receiptSchema;
  readonly report: string;
  readonly previous_findings: number;
  readonly historical_reports: number;
  readonly preserved: number;
  readonly allocated: number;
  readonly retired: number;
  readonly maxima: Readonly<Record<string, number>>;
  readonly output_sha256: string;
  readonly output: string;
}

const prefixLayers = new Map(
  Object.entries(layerPrefixes).map(([layer, prefix]) => [prefix, layer as FindingLayer]),
);
const numericId = /^(DESC|RTR|REF|EVAL|WIRE|OVL)-([1-9]\d*)$/;
const candidateId = /^(DESC|RTR|REF|EVAL|WIRE|OVL)-NEW$/;
const headingPattern = /^### ((?:DESC|RTR|REF|EVAL|WIRE|OVL)-(?:NEW|\d+)) — .+$/gm;
const reportHeader = /^# Skill audit: ([a-z0-9]+(?:-[a-z0-9]+)*)$/gm;

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function keys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.join("\n") !== wanted.join("\n")) throw new Error(`${label} keys must be ${wanted.join(", ")}`);
}

function nonempty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "")
    throw new Error(`${label} must be a non-empty string`);
  return value;
}

/** Lowercase prose and collapse whitespace without altering backticked identifiers. */
export function normalizeProse(value: string): string {
  return value
    .trim()
    .split(/(`[^`\n]+`)/g)
    .map((part) => (part.startsWith("`") ? part : part.toLowerCase().replace(/\s+/g, " ")))
    .join("")
    .trim();
}

function structuredIdentity(
  value: unknown,
  label: string,
  allowDeprecatedEvalsLayer: boolean,
): StructuredIdentity {
  const identity = object(value, label);
  keys(identity, ["layer", "doctrine_rule", "defect", "responsibility", "evidence"], label);
  const rawLayer = nonempty(identity.layer, `${label}.layer`);
  if (rawLayer === "evals" && !allowDeprecatedEvalsLayer) {
    throw new Error(`${label}.layer evals is deprecated; use evidence`);
  }
  const layer = (rawLayer === "evals" ? "evidence" : rawLayer) as FindingLayer;
  if (!(layer in layerPrefixes)) throw new Error(`${label}.layer is unknown: ${layer}`);
  const evidence = object(identity.evidence, `${label}.evidence`);
  keys(evidence, ["path", "anchor", "quote"], `${label}.evidence`);
  return {
    layer,
    doctrine_rule: nonempty(identity.doctrine_rule, `${label}.doctrine_rule`),
    defect: nonempty(identity.defect, `${label}.defect`),
    responsibility: nonempty(identity.responsibility, `${label}.responsibility`),
    evidence: {
      path: nonempty(evidence.path, `${label}.evidence.path`),
      anchor: nonempty(evidence.anchor, `${label}.evidence.anchor`),
      quote: nonempty(evidence.quote, `${label}.evidence.quote`),
    },
  };
}

export function normalizeStructuredIdentity(
  value: unknown,
  label = "identity tuple",
  allowDeprecatedEvalsLayer = false,
): string {
  const identity = structuredIdentity(value, label, allowDeprecatedEvalsLayer);
  return JSON.stringify({
    layer: identity.layer,
    doctrine_rule: normalizeProse(identity.doctrine_rule),
    defect: normalizeProse(identity.defect),
    responsibility: normalizeProse(identity.responsibility),
    evidence: {
      path: identity.evidence.path.trim(),
      anchor: identity.evidence.anchor.trim(),
      quote: normalizeProse(identity.evidence.quote),
    },
  });
}

function normalizeLegacyIdentity(value: string, label: string): string {
  const fields = value.split(";");
  if (fields.length !== 5)
    throw new Error(`${label} legacy tuple must contain exactly five semicolon fields`);
  const rawLayer = normalizeProse(fields[0]!);
  const layer = (rawLayer === "evals" ? "evidence" : rawLayer) as FindingLayer;
  if (!(layer in layerPrefixes)) throw new Error(`${label} has unknown legacy layer: ${layer}`);
  return `legacy:${[layer, ...fields.slice(1).map(normalizeProse)].join("; ")}`;
}

function parseIdentity(
  value: string,
  label: string,
  allowDeprecatedEvalsLayer: boolean,
): { normalized: string; layer: FindingLayer } {
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`${label} identity tuple must be valid one-line JSON`);
    }
    const normalized = normalizeStructuredIdentity(parsed, label, allowDeprecatedEvalsLayer);
    return { normalized, layer: JSON.parse(normalized).layer as FindingLayer };
  }
  const normalized = normalizeLegacyIdentity(trimmed, label);
  return { normalized, layer: normalized.slice("legacy:".length).split(";", 1)[0] as FindingLayer };
}

export function parseReport(source: string, mode: "candidate" | "existing", label: string): ParsedReport {
  const headers = [...source.matchAll(reportHeader)];
  if (headers.length !== 1) throw new Error(`${label} must contain exactly one skill-audit header`);
  const skill = headers[0]![1]!;
  const headings = [...source.matchAll(headingPattern)];
  const allLevelThreeHeadings = [...source.matchAll(/^### .+$/gm)];
  if (allLevelThreeHeadings.length !== headings.length) {
    throw new Error(`${label} contains an unknown level-three finding heading`);
  }
  const findings: ParsedFinding[] = [];
  const ids = new Set<string>();
  const identities = new Set<string>();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index]!;
    const id = heading[1]!;
    const match = id.match(mode === "candidate" ? candidateId : numericId);
    if (!match) {
      const expected = mode === "candidate" ? "PREFIX-NEW" : "a positive numeric ID without leading zero";
      throw new Error(`${label} finding ${id} must use ${expected}`);
    }
    if (ids.has(id) && mode === "existing") throw new Error(`${label} has duplicate finding ID ${id}`);
    ids.add(id);
    const start = heading.index! + heading[0].length;
    const end = headings[index + 1]?.index ?? source.length;
    const section = source.slice(start, end);
    const tuples = [...section.matchAll(/^- \*\*Identity tuple:\*\*\s*(.+)$/gm)];
    if (tuples.length !== 1) throw new Error(`${label} finding ${id} must have exactly one identity tuple`);
    const identity = parseIdentity(
      tuples[0]![1]!,
      `${label} finding ${id}`,
      mode === "existing",
    );
    if (layerPrefixes[identity.layer] !== match[1])
      throw new Error(`${label} finding ${id} prefix disagrees with its layer`);
    if (identities.has(identity.normalized))
      throw new Error(`${label} has duplicate identity tuple ${identity.normalized}`);
    identities.add(identity.normalized);
    const idStart = heading.index! + heading[0].indexOf(id);
    findings.push({
      headingStart: heading.index!,
      idStart,
      idEnd: idStart + id.length,
      prefix: match[1]!,
      id,
      identity: identity.normalized,
    });
  }
  return { skill, source, findings };
}

function idParts(id: string): { prefix: string; number: number } {
  const match = id.match(numericId);
  if (!match) throw new Error(`invalid finding ID ${id}`);
  return { prefix: match[1]!, number: Number(match[2]) };
}

function validateHistory(reports: readonly ParsedReport[]): Map<string, number> {
  const maxima = new Map<string, number>();
  const idBindings = new Map<string, string>();
  for (const report of reports) {
    for (const finding of report.findings) {
      const prior = idBindings.get(finding.id);
      if (prior !== undefined && prior !== finding.identity) {
        throw new Error(`historical finding ID ${finding.id} was reused for a different identity`);
      }
      idBindings.set(finding.id, finding.identity);
      const parsed = idParts(finding.id);
      maxima.set(parsed.prefix, Math.max(maxima.get(parsed.prefix) ?? 0, parsed.number));
    }
  }
  return maxima;
}

function render(candidate: ParsedReport, assignments: ReadonlyMap<number, string>): string {
  let output = candidate.source;
  for (let index = candidate.findings.length - 1; index >= 0; index -= 1) {
    const finding = candidate.findings[index]!;
    const id = assignments.get(index);
    if (!id) throw new Error(`candidate finding ${index + 1} has no assignment`);
    output = `${output.slice(0, finding.idStart)}${id}${output.slice(finding.idEnd)}`;
  }
  return output;
}

export function reconcileReport(
  candidateSource: string,
  previousSource: string | undefined,
  history: readonly HistoricalReport[],
  report: string,
): ReconciliationReceipt {
  const candidate = parseReport(candidateSource, "candidate", "candidate");
  if (report.split(path.sep).join("/") !== `skill-audits/${candidate.skill}.md`) {
    throw new Error(`report path must be skill-audits/${candidate.skill}.md`);
  }
  const previous =
    previousSource === undefined ? undefined : parseReport(previousSource, "existing", "previous report");
  const historical = history.map((item) => parseReport(item.source, "existing", `history ${item.revision}`));
  for (const item of [previous, ...historical]) {
    if (item && item.skill !== candidate.skill)
      throw new Error(`report skill mismatch: expected ${candidate.skill}, got ${item.skill}`);
  }
  const maxima = validateHistory([...(previous ? [previous] : []), ...historical]);
  const previousByIdentity = new Map(
    previous?.findings.map((finding) => [finding.identity, finding.id]) ?? [],
  );
  const assignments = new Map<number, string>();
  let preserved = 0;
  const fresh: Array<{ index: number; finding: ParsedFinding }> = [];
  candidate.findings.forEach((finding, index) => {
    const id = previousByIdentity.get(finding.identity);
    if (id) {
      assignments.set(index, id);
      preserved += 1;
    } else fresh.push({ index, finding });
  });
  fresh.sort((left, right) =>
    left.finding.identity < right.finding.identity
      ? -1
      : left.finding.identity > right.finding.identity
        ? 1
        : 0,
  );
  for (const item of fresh) {
    const number = (maxima.get(item.finding.prefix) ?? 0) + 1;
    maxima.set(item.finding.prefix, number);
    assignments.set(item.index, `${item.finding.prefix}-${number}`);
  }
  const output = render(candidate, assignments);
  const hash = new Bun.CryptoHasher("sha256").update(output).digest("hex");
  return {
    schema: receiptSchema,
    report,
    previous_findings: previous?.findings.length ?? 0,
    historical_reports: history.length,
    preserved,
    allocated: fresh.length,
    retired: (previous?.findings.length ?? 0) - preserved,
    maxima: Object.fromEntries([...maxima].sort(([left], [right]) => left.localeCompare(right))),
    output_sha256: hash,
    output,
  };
}

async function git(root: string, args: readonly string[], allowMissing = false): Promise<string | undefined> {
  const result = await runBoundedCommand({ command: ["git", ...args], cwd: root });
  if (result.code === 0 && !result.timedOut) return result.stdout;
  if (allowMissing && /does not exist in|exists on disk, but not in/.test(result.stderr)) return undefined;
  throw new Error(`git ${args[0]} failed: ${result.stderr.trim()}`);
}

export async function committedHistory(root: string, report: string): Promise<HistoricalReport[]> {
  const log = await git(root, ["log", "--format=%H", "--", report]);
  const revisions = (log ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (revisions.length > 1_000) throw new Error("report history exceeds 1000 revisions");
  const reports: HistoricalReport[] = [];
  let bytes = 0;
  for (const revision of revisions) {
    const source = await git(root, ["show", `${revision}:${report}`], true);
    if (source !== undefined) {
      bytes += Buffer.byteLength(source);
      if (bytes > 50_000_000) throw new Error("report history exceeds 50 MB");
      reports.push({ revision, source });
    }
  }
  return reports;
}

async function existingFile(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function safeOutputPath(root: string, relative: string, skill: string): Promise<string> {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes(".."))
    throw new Error("output must stay inside the repository");
  const expected = `skill-audits/${skill}.md`;
  if (relative.split(path.sep).join("/") !== expected) throw new Error(`output must be ${expected}`);
  const absolute = path.resolve(root, relative);
  try {
    if ((await realpath(path.dirname(absolute))) !== path.dirname(absolute)) {
      throw new Error("output parent may not be a symlink");
    }
    if ((await lstat(absolute)).isSymbolicLink()) throw new Error("output may not be a symlink");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return absolute;
}

interface Identity {
  readonly dev: number;
  readonly ino: number;
  readonly sha256: string;
}

function sha256(source: string | Uint8Array): string {
  return new Bun.CryptoHasher("sha256").update(source).digest("hex");
}

async function fileIdentity(file: string): Promise<Identity> {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`report path is not a regular file: ${file}`);
  const body = await readFile(file);
  const after = await lstat(file);
  if (
    after.dev !== info.dev ||
    after.ino !== info.ino ||
    after.size !== info.size ||
    after.mtimeMs !== info.mtimeMs
  )
    throw new Error(`report changed while observed: ${file}`);
  return { dev: info.dev, ino: info.ino, sha256: sha256(body) };
}

function sameIdentity(left: Identity, right: Identity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.sha256 === right.sha256;
}

async function removeOwned(file: string, expected: Identity, transaction: string): Promise<void> {
  const quarantine = `${file}.reconcile-${transaction}.quarantine`;
  try {
    await rename(file, quarantine);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  const moved = await fileIdentity(quarantine);
  if (!sameIdentity(moved, expected)) {
    await link(quarantine, file).catch(() => undefined);
    throw new Error(`refusing to remove changed path; recovery artifact retained: ${quarantine}`);
  }
  await rm(quarantine);
}

export async function replaceReport(
  file: string,
  source: string,
  expectedSource: string | undefined,
  runtime: { readonly beforePublish?: () => Promise<void> } = {},
): Promise<void> {
  const transaction = randomUUID();
  const temporary = `${file}.reconcile-${transaction}.next`;
  const backup = `${file}.reconcile-${transaction}.restore`;
  let createdDirectory: string | undefined;
  let temporaryIdentity: Identity | undefined;
  let backupIdentity: Identity | undefined;
  let installedIdentity: Identity | undefined;
  try {
    createdDirectory = await mkdir(path.dirname(file), { recursive: true });
    await writeFile(temporary, source, { flag: "wx" });
    temporaryIdentity = await fileIdentity(temporary);
    let expected: Identity | undefined;
    try {
      expected = await fileIdentity(file);
      if (expectedSource === undefined || expected.sha256 !== sha256(expectedSource))
        throw new Error("report state no longer matches the reconciled input");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      if (expectedSource !== undefined) throw new Error("report disappeared before publication");
    }
    await runtime.beforePublish?.();
    if (expected) {
      await rename(file, backup);
      backupIdentity = await fileIdentity(backup);
      if (!sameIdentity(backupIdentity, expected)) {
        await link(backup, file).catch(() => undefined);
        throw new Error(`report changed before backup; recovery artifact retained: ${backup}`);
      }
    }
    await link(temporary, file);
    const installed = await fileIdentity(file);
    if (!sameIdentity(installed, temporaryIdentity)) throw new Error("report changed during publication");
    installedIdentity = installed;
    await removeOwned(temporary, temporaryIdentity, transaction);
    temporaryIdentity = undefined;
    if (backupIdentity) {
      await removeOwned(backup, backupIdentity, transaction);
      backupIdentity = undefined;
    }
  } catch (caught) {
    let error: unknown = caught;
    if (installedIdentity) {
      try {
        await removeOwned(file, installedIdentity, transaction);
      } catch (rollbackError) {
        error = new AggregateError([error, rollbackError], "report publication rollback failed");
      }
    }
    if (backupIdentity) {
      try {
        await link(backup, file);
        await removeOwned(backup, backupIdentity, transaction);
        backupIdentity = undefined;
      } catch (rollbackError) {
        error = new AggregateError([error, rollbackError], `report restore retained at ${backup}`);
      }
    }
    if (temporaryIdentity) {
      try {
        await removeOwned(temporary, temporaryIdentity, transaction);
      } catch (cleanupError) {
        error = new AggregateError([error, cleanupError], `temporary recovery retained at ${temporary}`);
      }
    }
    if (createdDirectory) await rmdir(createdDirectory).catch(() => undefined);
    throw error;
  }
}

class UsageError extends Error {}
function usage(): never {
  throw new UsageError("usage: reconcile-report.ts --candidate <draft.md> --output skill-audits/<skill>.md");
}

async function main(args: readonly string[]): Promise<void> {
  let candidateFile: string | undefined;
  let outputFile: string | undefined;
  for (let index = 0; index < args.length; index += 2) {
    const value = args[index + 1];
    if (!value) usage();
    if (args[index] === "--candidate" && !candidateFile) candidateFile = value;
    else if (args[index] === "--output" && !outputFile) outputFile = value;
    else usage();
  }
  if (!candidateFile || !outputFile) usage();
  const root = process.cwd();
  const candidateAbsolute = path.resolve(root, candidateFile);
  const candidateSource = await readFile(candidateAbsolute, "utf8");
  const parsedCandidate = parseReport(candidateSource, "candidate", "candidate");
  const outputAbsolute = await safeOutputPath(root, outputFile, parsedCandidate.skill);
  if (candidateAbsolute === outputAbsolute) throw new Error("candidate and output must differ");
  try {
    if ((await realpath(candidateAbsolute)) === (await realpath(outputAbsolute))) {
      throw new Error("candidate and output must differ");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const previous = await existingFile(outputAbsolute);
  const receipt = reconcileReport(
    candidateSource,
    previous,
    await committedHistory(root, outputFile.split(path.sep).join("/")),
    outputFile.split(path.sep).join("/"),
  );
  await replaceReport(outputAbsolute, receipt.output, previous);
  const { output: _output, ...publicReceipt } = receipt;
  console.log(
    JSON.stringify({
      ...publicReceipt,
      outcome: "success",
      code: "reconciled",
      mutations: [
        {
          path: outputFile,
          before_sha256: previous ? sha256(previous) : null,
          after_sha256: receipt.output_sha256,
        },
      ],
      recovery_artifacts: [],
    }),
  );
}

if (import.meta.main) {
  main(process.argv.slice(2)).catch((error) => {
    const detail = error instanceof Error ? error.message : String(error);
    const refused = error instanceof UsageError;
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: refused ? "refused" : "failed",
        code: refused ? "invalid_arguments" : "reconciliation_failed",
        mutations: [],
        recovery_artifacts: [...detail.matchAll(/\S+\.reconcile-[^\s]+\.(?:restore|next|quarantine)/g)].map(
          (match) => match[0],
        ),
        detail,
      }),
    );
    process.exit(refused ? 2 : 1);
  });
}
