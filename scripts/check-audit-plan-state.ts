import { readFile } from "node:fs/promises";
import path from "node:path";

export type PlanStateMode = "progress" | "pre-final" | "final";

type Row = {
  checkbox: " " | "x";
  id: string;
  line: number;
  receipt: boolean;
  status: string;
};

export type PlanStateReceipt = {
  schema: "tailrocks.audit-plan-state/v1";
  mode: PlanStateMode;
  actionable_rows: number;
  completed_rows: number;
  unchecked_rows: number;
  in_progress_rows: number;
  receipts: number;
  completion_marker: "NOT COMPLETED" | "COMPLETED";
  terminal_literal: "NOT COMPLETED" | "COMPLETED";
};

const usage = "usage: check-audit-plan-state.ts [--mode progress|pre-final|final] [--file path]";

export function parsePlanStateArgs(args: string[]): { mode: PlanStateMode; file: string } {
  let mode: PlanStateMode = "progress";
  let file = "skill-audits/audit-overview.md";
  let modeSeen = false;
  let fileSeen = false;
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const value = args[index + 1];
    if (flag === "--mode" && !modeSeen && value && !value.startsWith("--")) {
      if (!(value === "progress" || value === "pre-final" || value === "final")) throw new Error(usage);
      mode = value;
      modeSeen = true;
      index += 1;
      continue;
    }
    if (flag === "--file" && !fileSeen && value && !value.startsWith("--")) {
      file = value;
      fileSeen = true;
      index += 1;
      continue;
    }
    throw new Error(usage);
  }
  return { mode, file };
}

const actionablePattern =
  /^- \[([ x])\] \[(TODO|IN_PROGRESS|COMPLETED|BLOCKED: [^\]]+|STALE: [^\]]+)\] (P\d{2}\.(?:\d{2}|GATE))(?=\s|$)/;
const candidatePattern = /^- .*?(P\d{2}\.(?:\d{2}|GATE))\b/;

function isValidReceiptLine(line: string): boolean {
  const match = line.match(/^  - Evidence receipt \((\d{4})-(\d{2})-(\d{2})\):\s+(\S.*)$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getTime() > new Date().setUTCHours(0, 0, 0, 0)
  )
    return false;
  const result = match[4].trim();
  const firstToken = result
    .split(/[\s:]+/, 1)[0]!
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const placeholderTokens = new Set([
    "tbd",
    "todo",
    "pending",
    "proof",
    "placeholder",
    "fake",
    "example",
    "unknown",
    "later",
    "na",
  ]);
  return (
    result.length >= 4 &&
    !/^(?:tbd|todo|pending|proof|placeholder|fake|example|unknown|later|n\/a)[.!]?$/i.test(result) &&
    !placeholderTokens.has(firstToken) &&
    !/\b(?:placeholder|proof goes here|evidence goes here|fill (?:this|me) in|to be done)\b/i.test(result)
  );
}

export function checkAuditPlanState(
  source: string,
  mode: PlanStateMode = "progress",
): { errors: string[]; receipt?: PlanStateReceipt } {
  const errors: string[] = [];
  const lines = source.split("\n");
  const rows: Row[] = [];
  const candidates: Array<{ line: number; source: string }> = [];
  const visibleLines = new Set<number>();

  let fenced = false;
  for (const [index, line] of lines.entries()) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    visibleLines.add(index + 1);
    if (candidatePattern.test(line)) candidates.push({ line: index + 1, source: line });
    const match = line.match(actionablePattern);
    if (!match) continue;
    rows.push({
      checkbox: match[1] as " " | "x",
      status: match[2],
      id: match[3],
      line: index + 1,
      receipt: false,
    });
  }

  if (rows.length === 0) errors.push("plan has zero actionable rows");
  for (const candidate of candidates) {
    if (!actionablePattern.test(candidate.source)) {
      errors.push(`line ${candidate.line}: malformed actionable row`);
    }
  }

  for (const [index, row] of rows.entries()) {
    const end = index + 1 < rows.length ? rows[index + 1].line - 1 : lines.length;
    const rowLines = lines
      .slice(row.line, end)
      .filter((_, offset) => visibleLines.has(row.line + offset + 1));
    const receiptLines = rowLines.filter((line) => /^  - Evidence receipt \(/.test(line));
    row.receipt = receiptLines.some(isValidReceiptLine);
    if (receiptLines.length > 1) errors.push(`${row.id}: row has multiple evidence receipts`);
    if (receiptLines.length > 0 && !row.receipt) {
      errors.push(`${row.id}: evidence receipt must have a real ISO date and substantive result`);
    }
    if (row.status === "COMPLETED" && receiptLines.some((line) => /\bpending\b/i.test(line))) {
      errors.push(`${row.id}: completed row contains pending evidence`);
    }
  }

  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) errors.push(`duplicate actionable row ID: ${row.id}`);
    seen.add(row.id);
    if (row.status === "COMPLETED" && row.checkbox !== "x") {
      errors.push(`${row.id}: COMPLETED row must be checked`);
    }
    if (row.status !== "COMPLETED" && row.checkbox !== " ") {
      errors.push(`${row.id}: non-completed row must be unchecked`);
    }
    if (row.status === "COMPLETED" && !row.receipt) {
      errors.push(`${row.id}: completed row missing evidence receipt`);
    }
  }

  const inProgress = rows.filter((row) => row.status === "IN_PROGRESS");
  if (inProgress.length > 1) {
    errors.push(`multiple in-progress rows: ${inProgress.map((row) => row.id).join(", ")}`);
  }

  if (mode === "progress") {
    const firstUnresolved = rows.findIndex((row) => row.status !== "COMPLETED");
    if (firstUnresolved !== -1 && rows.slice(firstUnresolved + 1).some((row) => row.status === "COMPLETED")) {
      errors.push("progress rows must form a completed prefix");
    }
    if (inProgress.length === 1 && rows[firstUnresolved]?.id !== inProgress[0].id) {
      errors.push(`in-progress row must be first unresolved: ${inProgress[0].id}`);
    }
  }

  const headerMatches = lines.flatMap((line, index) => {
    const match = visibleLines.has(index + 1)
      ? line.match(/^- Completion marker: `(NOT COMPLETED|COMPLETED)`$/)
      : null;
    return match ? [{ value: match[1], line: index + 1 }] : [];
  });
  if (headerMatches.length !== 1) errors.push("plan must contain exactly one header completion marker");
  const literalMatches = lines.flatMap((line, index) => {
    const match = visibleLines.has(index + 1)
      ? line.match(/^AUDIT MIGRATION: (NOT COMPLETED|COMPLETED)$/)
      : null;
    return match ? [{ value: match[1], line: index + 1 }] : [];
  });
  if (literalMatches.length !== 1) errors.push("plan must contain exactly one terminal literal");
  const lastContentLine = lines.reduce(
    (last, line, index) => (visibleLines.has(index + 1) && line.trim() !== "" ? index + 1 : last),
    0,
  );
  if (literalMatches.length === 1 && literalMatches[0].line !== lastContentLine) {
    errors.push("terminal literal must be the final nonempty line");
  }
  const header = headerMatches[0]?.value as "NOT COMPLETED" | "COMPLETED" | undefined;
  const literal = literalMatches[0]?.value as "NOT COMPLETED" | "COMPLETED" | undefined;
  const p1106 = rows.find((row) => row.id === "P11.06");
  if (!p1106) errors.push("plan missing P11.06 atomic completion row");
  const atomic = [p1106?.status === "COMPLETED", header === "COMPLETED", literal === "COMPLETED"];
  if (!atomic.every((value) => value === atomic[0])) {
    errors.push("P11.06, header marker, and terminal literal must complete atomically");
  }

  const unchecked = rows.filter((row) => row.status !== "COMPLETED");
  if (mode === "pre-final") {
    const allowed = new Set(["P11.05", "P11.06"]);
    const invalid = unchecked.filter((row) => !allowed.has(row.id));
    if (invalid.length > 0) {
      errors.push(`pre-final rows not completed: ${invalid.map((row) => row.id).join(", ")}`);
    }
    for (const id of allowed) {
      if (!unchecked.some((row) => row.id === id)) errors.push(`pre-final requires ${id} unchecked`);
    }
    if (rows.find((row) => row.id === "P11.05")?.status !== "IN_PROGRESS") {
      errors.push("pre-final requires P11.05 IN_PROGRESS");
    }
    if (rows.find((row) => row.id === "P11.06")?.status !== "TODO") {
      errors.push("pre-final requires P11.06 TODO");
    }
    if (header !== "NOT COMPLETED" || literal !== "NOT COMPLETED") {
      errors.push("pre-final completion markers must remain NOT COMPLETED");
    }
  }
  if (mode === "final") {
    if (unchecked.length > 0) {
      errors.push(`final rows not completed: ${unchecked.map((row) => row.id).join(", ")}`);
    }
    if (header !== "COMPLETED" || literal !== "COMPLETED") {
      errors.push("final completion markers must be COMPLETED");
    }
  }

  if (errors.length > 0 || !header || !literal) return { errors };
  return {
    errors,
    receipt: {
      schema: "tailrocks.audit-plan-state/v1",
      mode,
      actionable_rows: rows.length,
      completed_rows: rows.length - unchecked.length,
      unchecked_rows: unchecked.length,
      in_progress_rows: inProgress.length,
      receipts: rows.filter((row) => row.receipt).length,
      completion_marker: header,
      terminal_literal: literal,
    },
  };
}

if (import.meta.main) {
  try {
    const { mode, file } = parsePlanStateArgs(process.argv.slice(2));
    const result = checkAuditPlanState(await readFile(path.resolve(file), "utf8"), mode);
    if (result.errors.length > 0) {
      console.log(
        JSON.stringify({
          schema: "tailrocks.audit-plan-state/v1",
          outcome: "failed",
          code: "plan_state_invalid",
          mutations: [],
          recovery_artifacts: [],
          errors: result.errors,
        }),
      );
      process.exit(1);
    }
    console.log(
      JSON.stringify({
        ...result.receipt,
        outcome: "success",
        code: "checked",
        mutations: [],
        recovery_artifacts: [],
      }),
    );
  } catch (error) {
    const refused = error instanceof Error && error.message === usage;
    console.log(
      JSON.stringify({
        schema: "tailrocks.audit-plan-state/v1",
        outcome: refused ? "refused" : "failed",
        code: refused ? "invalid_arguments" : "check_failed",
        mutations: [],
        recovery_artifacts: [],
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(refused ? 2 : 1);
  }
}
