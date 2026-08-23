import { describe, expect, test } from "bun:test";

import { checkAuditPlanState, parsePlanStateArgs, type PlanStateMode } from "./check-audit-plan-state";

function plan(
  rows: string[],
  marker: "NOT COMPLETED" | "COMPLETED" = "NOT COMPLETED",
  literal: "NOT COMPLETED" | "COMPLETED" = marker,
): string {
  return `# Plan

- Completion marker: \`${marker}\`

Status examples are explanatory only:

- \`[ ] [TODO]\` — ready later.
- \`[ ] [IN_PROGRESS]\` — only one.

${rows.join("\n")}

AUDIT MIGRATION: ${literal}
`;
}

const completed = (id: string) =>
  `- [x] [COMPLETED] ${id} Complete it.\n  - Evidence receipt (2026-08-22): command passed 1 check.`;

function run(source: string, mode: PlanStateMode = "progress"): string[] {
  return checkAuditPlanState(source, mode).errors;
}

describe("checkAuditPlanState", () => {
  test("parses actionable rows only and emits nonzero progress receipt", () => {
    const result = checkAuditPlanState(
      plan([
        completed("P01.01"),
        "```md\n- [ ] [TODO] P99.99 Fenced example.\n  - Evidence receipt (2026-08-22): fake.\n- Completion marker: `COMPLETED`\nAUDIT MIGRATION: COMPLETED\n```",
        "  - [x] [COMPLETED] P98.98 Indented example.",
        "- [ ] [IN_PROGRESS] P01.02 Work.",
        "- [ ] [TODO] P11.06 Close.",
      ]),
    );
    expect(result.errors).toEqual([]);
    expect(result.receipt).toMatchObject({
      actionable_rows: 3,
      completed_rows: 1,
      unchecked_rows: 2,
      in_progress_rows: 1,
      receipts: 1,
    });
  });

  test("rejects duplicate IDs, multiple active rows, malformed statuses, and checkbox crossings", () => {
    const source = plan([
      completed("P01.01"),
      "- [ ] [IN_PROGRESS] P01.01 Duplicate.",
      "- [ ] [IN_PROGRESS] P01.02 Active.",
      "- [ ] [DONE] P01.03 Malformed.",
      "- [X] [TODO] P01.05 Malformed checkbox.",
      "- [ ] TODO P01.06 Broken status brackets.",
      "- TODO P01.07 Missing checkbox opener.",
      "- [ ] [TODO] P01.08-old Suffixed ID.",
      "- [x] [TODO] P01.04 Crossed.",
      "- [ ] [TODO] P11.06 Close.",
    ]);
    const errors = run(source);
    expect(errors).toContain("duplicate actionable row ID: P01.01");
    expect(errors).toContain("multiple in-progress rows: P01.01, P01.02");
    expect(errors.some((error) => error.endsWith("malformed actionable row"))).toBeTrue();
    expect(errors).toContain("P01.04: non-completed row must be unchecked");
  });

  test("requires receipts only for completed actionable rows", () => {
    const errors = run(plan(["- [x] [COMPLETED] P01.01 Done.", "- [ ] [TODO] P11.06 Close."]));
    expect(errors).toContain("P01.01: completed row missing evidence receipt");
  });

  test("rejects malformed duplicate and pending completed receipts", () => {
    const malformed = plan([
      "- [x] [COMPLETED] P01.01 Done.\n  - Evidence receipt (today): proof.",
      "- [ ] [TODO] P11.06 Close.",
    ]);
    expect(run(malformed)).toContain(
      "P01.01: evidence receipt must have a real ISO date and substantive result",
    );

    for (const receipt of [
      "  - Evidence receipt (2026-02-30): command passed 1 check.",
      "  - Evidence receipt (9999-99-99): TBD",
      "  - Evidence receipt (2026-08-23): x",
      "  - Evidence receipt (2026-08-23): placeholder",
      "  - Evidence receipt (2026-08-23): proof goes here",
      "  - Evidence receipt (2999-01-01): command passed 1 check.",
      "  - Evidence receipt (2026-08-23): TBD: run the checker later.",
      "  - Evidence receipt (2026-08-23): TODO run command.",
      "  - Evidence receipt (2026-08-23): example result: 10 tests passed.",
      "  - Evidence receipt (2026-08-23): fake proof: 10 tests passed.",
      "  - Evidence receipt (2026-08-23): proof: command passed 1 check.",
      "  - Evidence receipt (2026-08-23): unknown: command passed 1 check.",
      "  - Evidence receipt (2026-08-23): later: command passed 1 check.",
      "  - Evidence receipt (2026-08-23): n/a: command passed 1 check.",
      "  - Evidence receipt (2026-08-23): n-a: command passed 1 check.",
      "  - Evidence receipt (2026-08-23): N.A.: command passed 1 check.",
    ]) {
      const errors = run(plan([`- [x] [COMPLETED] P01.01 Done.\n${receipt}`, "- [ ] [TODO] P11.06 Close."]));
      expect(errors).toContain("P01.01: evidence receipt must have a real ISO date and substantive result");
    }

    const duplicate = plan([
      `${completed("P01.01")}\n  - Evidence receipt (2026-08-23): second proof.`,
      "- [ ] [TODO] P11.06 Close.",
    ]);
    expect(run(duplicate)).toContain("P01.01: row has multiple evidence receipts");

    const pending = plan([
      "- [x] [COMPLETED] P01.01 Done.\n  - Evidence receipt (2026-08-23): evidence pending.",
      "- [ ] [TODO] P11.06 Close.",
    ]);
    expect(run(pending)).toContain("P01.01: completed row contains pending evidence");
  });

  test("progress requires a completed prefix and active first unresolved row", () => {
    const errors = run(
      plan([
        completed("P01.01"),
        "- [ ] [TODO] P01.02 Waiting.",
        "- [ ] [IN_PROGRESS] P01.03 Late active.",
        completed("P01.04"),
        "- [ ] [TODO] P11.06 Close.",
      ]),
    );
    expect(errors).toContain("progress rows must form a completed prefix");
    expect(errors).toContain("in-progress row must be first unresolved: P01.03");
  });

  test("pre-final allows only P11.05 and P11.06 unchecked", () => {
    const source = plan([
      completed("P01.01"),
      completed("P11.04"),
      "- [ ] [IN_PROGRESS] P11.05 Check.",
      "- [ ] [TODO] P11.06 Close.",
    ]);
    expect(run(source, "pre-final")).toEqual([]);
    expect(run(source.replace(completed("P11.04"), "- [ ] [TODO] P11.04 Audit."), "pre-final")).toContain(
      "pre-final rows not completed: P11.04",
    );
    expect(run(source.replace("[IN_PROGRESS] P11.05", "[TODO] P11.05"), "pre-final")).toContain(
      "pre-final requires P11.05 IN_PROGRESS",
    );
    expect(run(source.replace("[TODO] P11.06", "[IN_PROGRESS] P11.06"), "pre-final")).toContain(
      "pre-final requires P11.06 TODO",
    );
  });

  test("rejects every partial atomic completion permutation", () => {
    for (const rowClosed of [false, true]) {
      for (const headerClosed of [false, true]) {
        for (const literalClosed of [false, true]) {
          if (rowClosed === headerClosed && headerClosed === literalClosed) continue;
          const source = plan(
            [completed("P01.01"), rowClosed ? completed("P11.06") : "- [ ] [TODO] P11.06 Close."],
            headerClosed ? "COMPLETED" : "NOT COMPLETED",
            literalClosed ? "COMPLETED" : "NOT COMPLETED",
          );
          expect(run(source)).toContain(
            "P11.06, header marker, and terminal literal must complete atomically",
          );
        }
      }
    }
  });

  test("final requires all rows, receipts, header, and literal completed", () => {
    const source = plan([completed("P01.01"), completed("P11.05"), completed("P11.06")], "COMPLETED");
    const result = checkAuditPlanState(source, "final");
    expect(result.errors).toEqual([]);
    expect(result.receipt).toMatchObject({ actionable_rows: 3, completed_rows: 3, unchecked_rows: 0 });
  });

  test("refuses zero actionable rows and duplicate terminal markers", () => {
    const source = `${plan([])}\nAUDIT MIGRATION: NOT COMPLETED\n`;
    const errors = run(source);
    expect(errors).toContain("plan has zero actionable rows");
    expect(errors).toContain("plan must contain exactly one terminal literal");
    expect(errors).toContain("plan missing P11.06 atomic completion row");
  });

  test("CLI parsing rejects unknown, repeated, or missing values", () => {
    expect(parsePlanStateArgs([])).toEqual({
      mode: "progress",
      file: "skill-audits/audit-overview.md",
    });
    expect(parsePlanStateArgs(["--file", "custom.md", "--mode", "final"])).toEqual({
      mode: "final",
      file: "custom.md",
    });
    for (const args of [
      ["--unknown"],
      ["--mode"],
      ["--mode", "wrong"],
      ["--mode", "progress", "--mode", "final"],
      ["--file", "a", "--file", "b"],
    ]) {
      expect(() => parsePlanStateArgs(args)).toThrow("usage:");
    }
  });
});
