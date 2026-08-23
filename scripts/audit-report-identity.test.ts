import { expect, test } from "bun:test";
import { lstat, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  type FindingLayer,
  type HistoricalReport,
  reconcileReport,
  replaceReport,
} from "../skills/tailrocks-skill-audit/scripts/reconcile-report";

const reconciler = path.resolve(
  import.meta.dir,
  "../skills/tailrocks-skill-audit/scripts/reconcile-report.ts",
);

function identity(
  layer: FindingLayer,
  defect: string,
  overrides: Partial<{
    doctrine_rule: string;
    responsibility: string;
    path: string;
    anchor: string;
    quote: string;
  }> = {},
): string {
  return JSON.stringify({
    layer,
    doctrine_rule: overrides.doctrine_rule ?? "deterministic work belongs in software",
    defect,
    responsibility: overrides.responsibility ?? "audit reports",
    evidence: {
      path: overrides.path ?? "skills/tailrocks-skill-audit/references/report-format.md",
      anchor: overrides.anchor ?? "## Rules",
      quote: overrides.quote ?? "Allocate new IDs monotonically",
    },
  });
}

function report(findings: Array<{ id: string; tuple: string; title?: string }>, extra = ""): string {
  return `# Skill audit: tailrocks-example

- Audited at: abc (2026-08-22)
- Verdict: test

## References

${findings
  .map(
    (finding) => `### ${finding.id} — ${finding.title ?? "Defect"}

- **Defect:** defect
- **Evidence:** file
- **Fix:** fix
- **Dimensions:** contract
- **Identity tuple:** ${finding.tuple}
- **Action:** validator
- **Acceptance:** accepted
`,
  )
  .join("\n")}${extra}`;
}

test("first audit allocates new findings by canonical identity, not draft order", () => {
  const zed = identity("references", "zed defect");
  const alpha = identity("references", "alpha defect");
  const receipt = reconcileReport(
    report([
      { id: "REF-NEW", tuple: zed, title: "Zed" },
      { id: "REF-NEW", tuple: alpha, title: "Alpha" },
    ]),
    undefined,
    [],
    "skill-audits/tailrocks-example.md",
  );
  expect(receipt.allocated).toBe(2);
  expect(receipt.preserved).toBe(0);
  expect(receipt.output).toContain("### REF-2 — Zed");
  expect(receipt.output).toContain("### REF-1 — Alpha");
  expect(receipt.output).not.toContain("-NEW");
  expect(receipt.output_sha256).toHaveLength(64);
});

test("whitespace, prose case, and report line movement preserve the immediate ID", () => {
  const previous = report([{ id: "REF-4", tuple: identity("references", "Manual stable-ID transform") }]);
  const moved = report(
    [
      {
        id: "REF-NEW",
        tuple: identity("references", "  manual   STABLE-ID\n transform  ", {
          quote: "  ALLOCATE new   ids monotonically ",
        }),
      },
    ],
    "\n\n## Killed findings\n\nNone.\n",
  );
  const receipt = reconcileReport(moved, previous, [], "skill-audits/tailrocks-example.md");
  expect(receipt.preserved).toBe(1);
  expect(receipt.allocated).toBe(0);
  expect(receipt.retired).toBe(0);
  expect(receipt.output).toContain("### REF-4 — Defect");
});

test("surviving legacy tuples retain IDs without pretending to structure identifiers", () => {
  const previousTuple =
    "references; deterministic work in software; manual stable-ID transform; audit reports; report-format identity rules";
  const candidateTuple =
    " References ; DETERMINISTIC   work in software ; manual stable-id transform ; audit reports ; report-format identity rules ";
  const receipt = reconcileReport(
    report([{ id: "REF-NEW", tuple: candidateTuple }]),
    report([{ id: "REF-6", tuple: previousTuple }]),
    [],
    "skill-audits/tailrocks-example.md",
  );
  expect(receipt.preserved).toBe(1);
  expect(receipt.output).toContain("### REF-6 — Defect");
});

test("retired identity returning allocates above historical maximum", () => {
  const retired = identity("references", "retired defect");
  const previous = report([{ id: "REF-5", tuple: identity("references", "current defect") }]);
  const history: HistoricalReport[] = [
    { revision: "old", source: report([{ id: "REF-9", tuple: retired }]) },
  ];
  const receipt = reconcileReport(
    report([{ id: "REF-NEW", tuple: retired }]),
    previous,
    history,
    "skill-audits/tailrocks-example.md",
  );
  expect(receipt.output).toContain("### REF-10 — Defect");
  expect(receipt.retired).toBe(1);
  expect(receipt.maxima.REF).toBe(10);
});

test("all six layers keep independent historical maxima", () => {
  const layers = Object.entries({
    description: "DESC",
    router: "RTR",
    references: "REF",
    evidence: "EVAL",
    wiring: "WIRE",
    overlap: "OVL",
  }) as Array<[FindingLayer, string]>;
  const history = report(
    layers.map(([layer, prefix], index) => ({
      id: `${prefix}-${index + 2}`,
      tuple: identity(layer, `old ${layer}`),
    })),
  );
  const candidate = report(
    layers.map(([layer, prefix]) => ({ id: `${prefix}-NEW`, tuple: identity(layer, `new ${layer}`) })),
  );
  const receipt = reconcileReport(
    candidate,
    undefined,
    [{ revision: "old", source: history }],
    "skill-audits/tailrocks-example.md",
  );
  layers.forEach(([, prefix], index) =>
    expect(receipt.output).toContain(`### ${prefix}-${index + 3} — Defect`),
  );
});

test("new structured evidence rejects the deprecated evals layer", () => {
  const deprecated = identity("evidence", "missing proof").replace('"layer":"evidence"', '"layer":"evals"');
  expect(() =>
    reconcileReport(
      report([{ id: "EVAL-NEW", tuple: deprecated }]),
      undefined,
      [],
      "skill-audits/tailrocks-example.md",
    ),
  ).toThrow("layer evals is deprecated; use evidence");
});

test("historical structured evals identities normalize to evidence", () => {
  const evidence = identity("evidence", "missing proof");
  const deprecated = evidence.replace('"layer":"evidence"', '"layer":"evals"');
  const receipt = reconcileReport(
    report([{ id: "EVAL-NEW", tuple: evidence }]),
    report([{ id: "EVAL-7", tuple: deprecated }]),
    [],
    "skill-audits/tailrocks-example.md",
  );
  expect(receipt.output).toContain("### EVAL-7 — Defect");
  expect(receipt.preserved).toBe(1);
});

test("rejects candidate collisions, malformed IDs, and prefix disagreement", () => {
  const tuple = identity("references", "same");
  expect(() =>
    reconcileReport(
      report([
        { id: "REF-NEW", tuple },
        { id: "REF-NEW", tuple },
      ]),
      undefined,
      [],
      "skill-audits/tailrocks-example.md",
    ),
  ).toThrow("duplicate identity tuple");
  expect(() =>
    reconcileReport(report([{ id: "REF-1", tuple }]), undefined, [], "skill-audits/tailrocks-example.md"),
  ).toThrow("must use PREFIX-NEW");
  expect(() =>
    reconcileReport(report([{ id: "RTR-NEW", tuple }]), undefined, [], "skill-audits/tailrocks-example.md"),
  ).toThrow("prefix disagrees");
  expect(() =>
    reconcileReport(
      report([{ id: "REF-NEW", tuple: "references; only; four; fields" }]),
      undefined,
      [],
      "skill-audits/tailrocks-example.md",
    ),
  ).toThrow("exactly five");
  expect(() =>
    reconcileReport(
      report([{ id: "REF-NEW", tuple }]).replace("### REF-NEW", "### UNKNOWN-NEW"),
      undefined,
      [],
      "skill-audits/tailrocks-example.md",
    ),
  ).toThrow("unknown level-three");
  expect(() =>
    reconcileReport(report([{ id: "REF-NEW", tuple }]), undefined, [], "skill-audits/wrong.md"),
  ).toThrow("report path must be");
});

test("paths and anchors remain case-sensitive while backticked identifiers preserve case", () => {
  const previousTuple = identity("references", "Rule for `UserID`", {
    path: "Skills/Owner/SKILL.md",
    anchor: "## UserID",
  });
  const changedPath = identity("references", "rule for `UserID`", {
    path: "skills/Owner/SKILL.md",
    anchor: "## UserID",
  });
  const changedIdentifier = identity("references", "rule for `userid`", {
    path: "Skills/Owner/SKILL.md",
    anchor: "## UserID",
  });
  for (const candidateTuple of [changedPath, changedIdentifier]) {
    const receipt = reconcileReport(
      report([{ id: "REF-NEW", tuple: candidateTuple }]),
      report([{ id: "REF-3", tuple: previousTuple }]),
      [],
      "skill-audits/tailrocks-example.md",
    );
    expect(receipt.preserved).toBe(0);
    expect(receipt.output).toContain("### REF-4 — Defect");
  }
});

test("normalization preserves whitespace inside backticked identifiers", () => {
  const previousTuple = identity("references", "Rule for `User  ID`");
  const candidateTuple = identity("references", "rule for `User ID`");
  const receipt = reconcileReport(
    report([{ id: "REF-NEW", tuple: candidateTuple }]),
    report([{ id: "REF-3", tuple: previousTuple }]),
    [],
    "skill-audits/tailrocks-example.md",
  );
  expect(receipt.preserved).toBe(0);
  expect(receipt.output).toContain("### REF-4 — Defect");
});

test("rejects duplicate active IDs and historical retired-ID reuse", () => {
  const first = identity("references", "first");
  const second = identity("references", "second");
  const duplicateIds = report([
    { id: "REF-1", tuple: first },
    { id: "REF-1", tuple: second },
  ]);
  expect(() =>
    reconcileReport(
      report([{ id: "REF-NEW", tuple: first }]),
      duplicateIds,
      [],
      "skill-audits/tailrocks-example.md",
    ),
  ).toThrow("duplicate finding ID");
  expect(() =>
    reconcileReport(
      report([{ id: "REF-NEW", tuple: first }]),
      undefined,
      [
        { revision: "one", source: report([{ id: "REF-7", tuple: first }]) },
        { revision: "two", source: report([{ id: "REF-7", tuple: second }]) },
      ],
      "skill-audits/tailrocks-example.md",
    ),
  ).toThrow("reused for a different identity");
});

async function command(
  cwd: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> {
  const child = Bun.spawn(args, { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, stdout, stderr };
}

async function git(cwd: string, ...args: string[]): Promise<void> {
  const result = await command(cwd, ["git", ...args]);
  if (result.code !== 0) throw new Error(result.stderr);
}

test("CLI reads Git history, writes atomically, and leaves prior bytes on failure", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "audit-report-identity-"));
  await mkdir(path.join(root, "skill-audits"));
  await git(root, "init", "-q");
  await git(root, "config", "user.name", "Test");
  await git(root, "config", "user.email", "test@example.com");
  const output = path.join(root, "skill-audits/tailrocks-example.md");
  const retired = identity("references", "retired");
  await writeFile(output, report([{ id: "REF-7", tuple: retired }]));
  await git(root, "add", "skill-audits/tailrocks-example.md");
  await git(root, "commit", "-qm", "first");
  await writeFile(output, report([{ id: "REF-8", tuple: identity("references", "current") }]));
  await git(root, "add", "skill-audits/tailrocks-example.md");
  await git(root, "commit", "-qm", "second");

  const candidate = path.join(root, "candidate.md");
  await writeFile(candidate, report([{ id: "REF-NEW", tuple: retired }]));
  const success = await command(root, [
    process.execPath,
    reconciler,
    "--candidate",
    candidate,
    "--output",
    "skill-audits/tailrocks-example.md",
  ]);
  expect(success.code).toBe(0);
  const receipt = JSON.parse(success.stdout) as Record<string, unknown>;
  expect(receipt.schema).toBe("tailrocks.audit-report-reconciliation/v1");
  expect(receipt.historical_reports).toBe(2);
  expect(receipt.allocated).toBe(1);
  expect(await readFile(output, "utf8")).toContain("### REF-9 — Defect");

  const beforeFailure = await readFile(output);
  await writeFile(
    candidate,
    report([
      { id: "REF-NEW", tuple: retired },
      { id: "REF-NEW", tuple: retired },
    ]),
  );
  const failure = await command(root, [
    process.execPath,
    reconciler,
    "--candidate",
    candidate,
    "--output",
    "skill-audits/tailrocks-example.md",
  ]);
  expect(failure.code).toBe(1);
  expect(failure.stderr).toBe("");
  expect(JSON.parse(failure.stdout).detail).toContain("duplicate identity tuple");
  expect(await readFile(output)).toEqual(beforeFailure);
});

test("report CAS refuses concurrent replacement and retains recovery evidence", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "audit-report-race-"));
  const output = path.join(root, "report.md");
  const original = "original\n";
  const replacement = "concurrent\n";
  await writeFile(output, original);
  await expect(
    replaceReport(output, "candidate\n", original, {
      beforePublish: async () => {
        await rm(output);
        await writeFile(output, replacement);
      },
    }),
  ).rejects.toThrow("report restore retained");
  expect(await readFile(output, "utf8")).toBe(replacement);
  expect((await readdir(root)).some((name) => name.includes(".restore"))).toBe(true);
});

test("failed first-audit validation creates no output directory", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "audit-report-no-write-"));
  const candidate = path.join(root, "candidate.md");
  const tuple = identity("references", "duplicate");
  await writeFile(
    candidate,
    report([
      { id: "REF-NEW", tuple },
      { id: "REF-NEW", tuple },
    ]),
  );
  const failure = await command(root, [
    process.execPath,
    reconciler,
    "--candidate",
    candidate,
    "--output",
    "skill-audits/tailrocks-example.md",
  ]);
  expect(failure.code).toBe(1);
  await expect(lstat(path.join(root, "skill-audits"))).rejects.toMatchObject({ code: "ENOENT" });
});
