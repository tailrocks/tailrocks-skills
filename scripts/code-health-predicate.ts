export const codeHealthPredicateSchema = "tailrocks.code-health-predicate/v1";
export const codeHealthInputSchema = "tailrocks.code-health-predicate-input/v1";

type ViolationCode =
  | "numeric_growth"
  | "numeric_stale_bound"
  | "presence_unlisted"
  | "presence_stale"
  | "tighten_not_lower"
  | "tighten_not_exact"
  | "tighten_adds_debt"
  | "tighten_oracle_changed"
  | "version_behind"
  | "version_blocked"
  | "version_prerelease"
  | "version_vulnerable"
  | "version_delay_forbidden";
export interface PredicateViolation {
  readonly id: string;
  readonly code: ViolationCode;
}
export interface PredicateReceipt {
  readonly schema: typeof codeHealthPredicateSchema;
  readonly outcome: "pass" | "violation" | "refused";
  readonly code: "exact" | "violations" | "invalid_input";
  readonly violations: readonly PredicateViolation[];
  readonly next?: { readonly bound?: number; readonly keys?: readonly string[]; readonly oracle?: string };
  readonly versions?: readonly {
    readonly id: string;
    readonly state: "current" | "behind" | "blocked" | "prerelease" | "vulnerable";
  }[];
  readonly detail: string;
}
type Operation = "audit" | "establish" | "tighten";
interface NumericInput {
  readonly schema: typeof codeHealthInputSchema;
  readonly kind: "numeric";
  readonly operation: Operation;
  readonly oracle: string;
  readonly id: string;
  readonly measured: number;
  readonly bound?: number;
  readonly proposed?: number;
  readonly proposedOracle?: string;
}
interface PresenceInput {
  readonly schema: typeof codeHealthInputSchema;
  readonly kind: "presence";
  readonly operation: Operation;
  readonly oracle: string;
  readonly measured: readonly string[];
  readonly listed?: readonly string[];
  readonly proposed?: readonly string[];
  readonly proposedOracle?: string;
}
interface VersionEntry {
  readonly id: string;
  readonly current: string;
  readonly latestStable: string;
  readonly highestFixed: string | null;
  readonly compatible: boolean;
  readonly delayed: boolean;
}
interface VersionInput {
  readonly schema: typeof codeHealthInputSchema;
  readonly kind: "version";
  readonly entries: readonly VersionEntry[];
}
type Input = NumericInput | PresenceInput | VersionInput;
interface Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease: readonly (number | string)[];
}

const maximumItems = 10_000,
  maximumInputBytes = 1_000_000;
export async function verifyCodeHealthEntrypoint(entrypoint: string): Promise<string> {
  if (!path.isAbsolute(entrypoint)) throw new Error("code-health entrypoint must be absolute");
  const resolved = path.resolve(entrypoint),
    scripts = path.dirname(resolved),
    plugin = path.dirname(scripts);
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [scripts, "directory"],
    [resolved, "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (info.isSymbolicLink() || (kind === "directory" ? !info.isDirectory() : !info.isFile()))
      throw new Error(`unsafe installed code-health ${kind}: ${candidate}`);
  }
  if ((await realpath(resolved)) !== resolved)
    throw new Error(`unsafe installed code-health entrypoint: ${resolved}`);
  return resolved;
}
function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
function safeId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value === value.trim() &&
    value.length > 0 &&
    value.length <= 512 &&
    !/[\r\n\0]/.test(value)
  );
}
function exactKeys(record: Record<string, unknown>, expected: readonly string[]): boolean {
  return JSON.stringify(Object.keys(record).sort()) === JSON.stringify([...expected].sort());
}
function safeCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}
function ids(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.length > maximumItems || value.some((item) => !safeId(item)))
    throw new Error(`${field} must contain bounded safe IDs`);
  if (new Set(value).size !== value.length) throw new Error(`${field} contains duplicate IDs`);
  return [...(value as string[])].sort(compareText);
}
function operationKeys(
  operation: Operation,
  common: readonly string[],
  bound: string,
  proposed: string,
): string[] {
  return operation === "establish"
    ? [...common]
    : operation === "audit"
      ? [...common, bound]
      : [...common, bound, proposed, "proposedOracle"];
}
function parseVersion(value: unknown, stable: boolean): Version {
  if (typeof value !== "string") throw new Error("version must be a string");
  const match = value.match(
    /^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z.-]+)?$/,
  );
  if (!match) throw new Error(`invalid semantic version: ${value}`);
  const numeric = match.slice(1, 4).map(Number);
  if (numeric.some((part) => !Number.isSafeInteger(part)))
    throw new Error(`unsafe semantic version: ${value}`);
  const prerelease = match[4]
    ? match[4].split(".").map((part) => {
        if (/^\d+$/.test(part) && !/^(0|[1-9]\d*)$/.test(part))
          throw new Error(`invalid numeric prerelease: ${value}`);
        return /^(0|[1-9]\d*)$/.test(part) ? Number(part) : part;
      })
    : [];
  if (stable && prerelease.length) throw new Error(`stable version cannot be prerelease: ${value}`);
  return { major: numeric[0]!, minor: numeric[1]!, patch: numeric[2]!, prerelease };
}
function compareVersion(a: Version, b: Version): number {
  for (const key of ["major", "minor", "patch"] as const) if (a[key] !== b[key]) return a[key] - b[key];
  if (!a.prerelease.length || !b.prerelease.length)
    return a.prerelease.length === b.prerelease.length ? 0 : !a.prerelease.length ? 1 : -1;
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const left = a.prerelease[i],
      right = b.prerelease[i];
    if (left === undefined || right === undefined) return left === right ? 0 : left === undefined ? -1 : 1;
    if (left === right) continue;
    if (typeof left === "number" && typeof right === "string") return -1;
    if (typeof left === "string" && typeof right === "number") return 1;
    return left < right ? -1 : 1;
  }
  return 0;
}

function parseInput(value: unknown): Input {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("input must be an object");
  const record = value as Record<string, unknown>;
  if (record.schema !== codeHealthInputSchema) throw new Error("input schema is invalid");
  if (record.kind === "numeric") {
    if (!(["audit", "establish", "tighten"] as const).includes(record.operation as never))
      throw new Error("numeric operation is invalid");
    const operation = record.operation as Operation;
    if (
      !exactKeys(
        record,
        operationKeys(
          operation,
          ["schema", "kind", "operation", "oracle", "id", "measured"],
          "bound",
          "proposed",
        ),
      ) ||
      !safeId(record.oracle) ||
      !safeId(record.id) ||
      !safeCount(record.measured) ||
      (operation !== "establish" && !safeCount(record.bound)) ||
      (operation === "tighten" && (!safeCount(record.proposed) || !safeId(record.proposedOracle)))
    )
      throw new Error("numeric predicate is invalid");
    return record as unknown as NumericInput;
  }
  if (record.kind === "presence") {
    if (!(["audit", "establish", "tighten"] as const).includes(record.operation as never))
      throw new Error("presence operation is invalid");
    const operation = record.operation as Operation;
    if (
      !exactKeys(
        record,
        operationKeys(operation, ["schema", "kind", "operation", "oracle", "measured"], "listed", "proposed"),
      )
    )
      throw new Error("presence predicate is invalid");
    return {
      schema: codeHealthInputSchema,
      kind: "presence",
      operation,
      oracle: safeId(record.oracle)
        ? record.oracle
        : (() => {
            throw new Error("presence oracle is invalid");
          })(),
      measured: ids(record.measured, "measured"),
      ...(operation === "establish" ? {} : { listed: ids(record.listed, "listed") }),
      ...(operation === "tighten" ? { proposed: ids(record.proposed, "proposed") } : {}),
      ...(operation === "tighten"
        ? {
            proposedOracle: safeId(record.proposedOracle)
              ? record.proposedOracle
              : (() => {
                  throw new Error("presence proposed oracle is invalid");
                })(),
          }
        : {}),
    };
  }
  if (record.kind === "version") {
    if (
      !exactKeys(record, ["schema", "kind", "entries"]) ||
      !Array.isArray(record.entries) ||
      record.entries.length > maximumItems
    )
      throw new Error("version predicate is invalid");
    const entries = record.entries.map((raw): VersionEntry => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("version entry is invalid");
      const entry = raw as Record<string, unknown>;
      if (
        !exactKeys(entry, ["id", "current", "latestStable", "highestFixed", "compatible", "delayed"]) ||
        !safeId(entry.id) ||
        typeof entry.current !== "string" ||
        typeof entry.latestStable !== "string" ||
        (entry.highestFixed !== null && typeof entry.highestFixed !== "string") ||
        typeof entry.compatible !== "boolean" ||
        typeof entry.delayed !== "boolean"
      )
        throw new Error("version entry is invalid");
      const current = parseVersion(entry.current, false),
        latest = parseVersion(entry.latestStable, true);
      if (!current.prerelease.length && compareVersion(current, latest) > 0)
        throw new Error(`latest stable is older than current for ${entry.id}`);
      if (entry.highestFixed !== null) {
        const fixed = parseVersion(entry.highestFixed, true);
        if (compareVersion(fixed, latest) > 0)
          throw new Error(`highest fixed version exceeds latest stable for ${entry.id}`);
      }
      return entry as unknown as VersionEntry;
    });
    if (new Set(entries.map(({ id }) => id)).size !== entries.length)
      throw new Error("version entries contain duplicate IDs");
    return {
      schema: codeHealthInputSchema,
      kind: "version",
      entries: entries.sort((a, b) => compareText(a.id, b.id)),
    };
  }
  throw new Error("predicate kind is invalid");
}
function deltas(listed: readonly string[], measured: readonly string[]): PredicateViolation[] {
  const allowed = new Set(listed),
    actual = new Set(measured);
  return [
    ...measured.filter((id) => !allowed.has(id)).map((id) => ({ id, code: "presence_unlisted" as const })),
    ...listed.filter((id) => !actual.has(id)).map((id) => ({ id, code: "presence_stale" as const })),
  ];
}
function result(
  violations: PredicateViolation[],
  extra: Pick<PredicateReceipt, "next" | "versions"> = {},
): PredicateReceipt {
  violations.sort((a, b) => compareText(a.id, b.id) || compareText(a.code, b.code));
  return {
    schema: codeHealthPredicateSchema,
    outcome: violations.length ? "violation" : "pass",
    code: violations.length ? "violations" : "exact",
    violations,
    ...extra,
    detail: violations.length ? `${violations.length} monotonic violations` : "predicate satisfied exactly",
  };
}

export function evaluateCodeHealthPredicate(value: unknown): PredicateReceipt {
  let input: Input;
  try {
    input = parseInput(value);
  } catch (error) {
    return {
      schema: codeHealthPredicateSchema,
      outcome: "refused",
      code: "invalid_input",
      violations: [],
      detail: error instanceof Error ? error.message : String(error),
    };
  }
  if (input.kind === "numeric") {
    if (input.operation === "establish")
      return result([], { next: { bound: input.measured, oracle: input.oracle } });
    if (input.operation === "audit")
      return result(
        input.measured === input.bound
          ? []
          : [
              {
                id: input.id,
                code: input.measured > input.bound! ? "numeric_growth" : "numeric_stale_bound",
              },
            ],
      );
    const violations: PredicateViolation[] = [];
    if (input.proposed! >= input.bound!) violations.push({ id: input.id, code: "tighten_not_lower" });
    if (input.proposed !== input.measured) violations.push({ id: input.id, code: "tighten_not_exact" });
    if (input.proposedOracle !== input.oracle)
      violations.push({ id: input.id, code: "tighten_oracle_changed" });
    return result(
      violations,
      violations.length ? {} : { next: { bound: input.proposed, oracle: input.oracle } },
    );
  }
  if (input.kind === "presence") {
    if (input.operation === "establish")
      return result([], { next: { keys: input.measured, oracle: input.oracle } });
    if (input.operation === "audit") return result(deltas(input.listed!, input.measured));
    const listed = new Set(input.listed),
      proposed = new Set(input.proposed),
      violations: PredicateViolation[] = [];
    if ([...proposed].some((id) => !listed.has(id)))
      violations.push({ id: "presence", code: "tighten_adds_debt" });
    if (proposed.size >= listed.size) violations.push({ id: "presence", code: "tighten_not_lower" });
    if (
      input.proposed!.length !== input.measured.length ||
      input.proposed!.some((id, i) => id !== input.measured[i])
    )
      violations.push({ id: "presence", code: "tighten_not_exact" });
    if (input.proposedOracle !== input.oracle)
      violations.push({ id: "presence", code: "tighten_oracle_changed" });
    return result(
      violations,
      violations.length ? {} : { next: { keys: input.proposed, oracle: input.oracle } },
    );
  }
  const violations: PredicateViolation[] = [];
  const versions = input.entries.map((entry) => {
    const current = parseVersion(entry.current, false),
      latest = parseVersion(entry.latestStable, true),
      fixed = entry.highestFixed === null ? null : parseVersion(entry.highestFixed, true);
    let state: NonNullable<PredicateReceipt["versions"]>[number]["state"] = "current";
    if (current.prerelease.length) state = "prerelease";
    else if (fixed && compareVersion(current, fixed) < 0) state = "vulnerable";
    else if (!entry.compatible) state = "blocked";
    else if (compareVersion(current, latest) < 0) state = "behind";
    if (state !== "current") violations.push({ id: entry.id, code: `version_${state}` as ViolationCode });
    if (entry.delayed) violations.push({ id: entry.id, code: "version_delay_forbidden" });
    return { id: entry.id, state };
  });
  return result(violations, { versions });
}

async function boundedStdin(): Promise<string> {
  const reader = Bun.stdin.stream().getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximumInputBytes) {
      await reader.cancel();
      throw new Error("predicate input exceeds 1000000 bytes");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
if (import.meta.main) {
  let receipt: PredicateReceipt;
  try {
    await verifyCodeHealthEntrypoint(process.argv[1]!);
    if (process.argv.length !== 2)
      throw new Error("code-health-predicate takes JSON on stdin and no arguments");
    receipt = evaluateCodeHealthPredicate(JSON.parse(await boundedStdin()));
  } catch (error) {
    receipt = {
      schema: codeHealthPredicateSchema,
      outcome: "refused",
      code: "invalid_input",
      violations: [],
      detail: error instanceof Error ? error.message : String(error),
    };
  }
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
  process.exit(receipt.outcome === "pass" ? 0 : receipt.outcome === "violation" ? 1 : 2);
}
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
