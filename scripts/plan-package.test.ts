import { afterAll, expect, test } from "bun:test";
import { copyFile, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { planPackageInputSchema, proofSchema, researchGapsSchema, runPlanPackage } from "./plan-package-core";

const roots: string[] = [];

function shell(command: string, cwd: string): void {
  const result = Bun.spawnSync(["/bin/sh", "-c", command], {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Plan Test",
      GIT_AUTHOR_EMAIL: "plan@test.invalid",
      GIT_COMMITTER_NAME: "Plan Test",
      GIT_COMMITTER_EMAIL: "plan@test.invalid",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
}

async function repository(): Promise<{ root: string; head: string }> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-plan-package-")));
  roots.push(root);
  await mkdir(path.join(root, "roadmap/demo"), { recursive: true });
  await mkdir(path.join(root, "research"), { recursive: true });
  await writeFile(path.join(root, "roadmap/demo/README.md"), "# Demo\n");
  await writeFile(path.join(root, "research/api.md"), "# Decision\n\nSupported API.\n");
  shell("/usr/bin/git init -q && /usr/bin/git add . && /usr/bin/git commit -qm initial", root);
  const head = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: root }).stdout.toString().trim();
  return { root, head };
}

function runnable(root: string) {
  return {
    id: "TEST_GATE",
    disposition: "RUNNABLE",
    argv: ["/bin/sh", "-c", "printf command-output"],
    cwd: ".",
    proof_argv: ["/bin/sh", "-c", `printf '%s' '${JSON.stringify({ schema: proofSchema, units: 7 })}'`],
    timeout_ms: 5_000,
    allowed_output_roots: [],
  } as const;
}

function deferred(root: string) {
  return {
    id: "LATE_GATE",
    disposition: "DEFERRED",
    argv: ["/bin/sh", "-c", "future-tool --check"],
    cwd: ".",
    enabling_slice: "002",
    blocker_argv: ["/bin/sh", "-c", "test ! -e tool-ready"],
    blocker_proof_argv: [
      "/bin/sh",
      "-c",
      `printf '%s' '${JSON.stringify({ schema: proofSchema, units: 1 })}'`,
    ],
    timeout_ms: 5_000,
    allowed_output_roots: [],
  } as const;
}

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
});

test("prove binds exact root/head and accepts only dedicated positive JSON units", async () => {
  const repo = await repository();
  const receipt = await runPlanPackage({
    schema: planPackageInputSchema,
    operation: "prove",
    root: repo.root,
    expected_head: repo.head,
    command: runnable(repo.root),
  });
  expect(receipt).toMatchObject({
    operation: "prove",
    outcome: "PROVEN",
    head: repo.head,
    units: 7,
    mutations: [],
  });
  expect(receipt.command_sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(receipt.execution).toMatchObject({
    exit_code: 0,
    stdout_sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
  });

  const bad = { ...runnable(repo.root), proof_argv: ["/bin/sh", "-c", "printf '17 tests passed'"] };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: bad,
    }),
  ).rejects.toThrow("one JSON object");
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: "0".repeat(40),
      command: runnable(repo.root),
    }),
  ).rejects.toThrow("Git HEAD changed");
  const zero = {
    ...runnable(repo.root),
    proof_argv: ["/bin/sh", "-c", `printf '%s' '${JSON.stringify({ schema: proofSchema, units: 0 })}'`],
  };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: zero,
    }),
  ).rejects.toThrow("exact positive integer");
  const timedOut = {
    ...runnable(repo.root),
    argv: ["/bin/sh", "-c", "sleep 1"],
    timeout_ms: 100,
  };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: timedOut,
    }),
  ).rejects.toThrow("runnable command failed");
});

test("prove permits DEFERRED only after an executed blocker precondition proof", async () => {
  const repo = await repository();
  const receipt = await runPlanPackage({
    schema: planPackageInputSchema,
    operation: "prove",
    root: repo.root,
    expected_head: repo.head,
    command: deferred(repo.root),
  });
  expect(receipt).toMatchObject({
    outcome: "DEFERRED",
    disposition: "DEFERRED",
    enabling_slice: "002",
    units: 1,
  });
  const unresolved = { ...deferred(repo.root), blocker_argv: ["/bin/sh", "-c", "exit 1"] };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: unresolved,
    }),
  ).rejects.toThrow("deferred command failed");
  const invalid = { ...deferred(repo.root), enabling_slice: "later" };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: invalid,
    }),
  ).rejects.toThrow("enabling_slice is invalid");
});

test("prove refuses source, research, and concurrent workspace mutation", async () => {
  const repo = await repository();
  for (const target of ["roadmap/demo/README.md", "research/api.md", "new-source.ts"]) {
    const command = {
      ...runnable(repo.root),
      argv: ["/bin/sh", "-c", `printf mutation >> '${target}'`],
    };
    await expect(
      runPlanPackage({
        schema: planPackageInputSchema,
        operation: "prove",
        root: repo.root,
        expected_head: repo.head,
        command,
      }),
    ).rejects.toThrow("mutated repository state");
    shell("/usr/bin/git reset --hard -q && /usr/bin/git clean -fdq", repo.root);
  }
  await writeFile(path.join(repo.root, ".gitignore"), "research/ignored.md\n");
  shell("/usr/bin/git add .gitignore && /usr/bin/git commit -qm ignore", repo.root);
  repo.head = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: repo.root })
    .stdout.toString()
    .trim();
  const ignoredResearch = {
    ...runnable(repo.root),
    argv: ["/bin/sh", "-c", "printf hidden > research/ignored.md"],
  };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: ignoredResearch,
    }),
  ).rejects.toThrow("mutated repository state");
  await rm(path.join(repo.root, "research/ignored.md"));
  await writeFile(path.join(repo.root, "roadmap/demo/README.md"), "# Dirty before proof\n");
  const stagesExistingChange = {
    ...runnable(repo.root),
    argv: ["/usr/bin/git", "add", "roadmap/demo/README.md"],
  };
  await expect(
    runPlanPackage({
      schema: planPackageInputSchema,
      operation: "prove",
      root: repo.root,
      expected_head: repo.head,
      command: stagesExistingChange,
    }),
  ).rejects.toThrow("mutated repository state");
});

test("validate closes research-gap schema and command partition", async () => {
  const repo = await repository(),
    runnableCommand = runnable(repo.root),
    deferredCommand = deferred(repo.root);
  const receipts = await Promise.all(
    [runnableCommand, deferredCommand].map((command) =>
      runPlanPackage({
        schema: planPackageInputSchema,
        operation: "prove",
        root: repo.root,
        expected_head: repo.head,
        command,
      }),
    ),
  );
  const base = {
    schema: planPackageInputSchema,
    operation: "validate",
    root: repo.root,
    expected_head: repo.head,
    item: "demo",
    research_gaps: {
      $schema: researchGapsSchema,
      item: "demo",
      plannedAt: repo.head,
      gaps: [
        {
          id: "RG1",
          question: "Which API is stable?",
          requiredEvidence: ["Supported stable API"],
          status: "RESOLVED",
          resolution: ["research/api.md#decision"],
          deferral: null,
        },
        {
          id: "RG2",
          question: "Which behavior is intentionally deferred?",
          requiredEvidence: ["Recorded product decision"],
          status: "DEFERRED",
          resolution: null,
          deferral: { decision: "D2", reason: "Not in this release", revisitWhen: "Scope expands" },
        },
      ],
    },
    commands: [runnableCommand, deferredCommand],
    receipts,
  };
  expect(await runPlanPackage(base)).toMatchObject({
    outcome: "VALIDATED",
    runnable: ["TEST_GATE"],
    deferred: ["LATE_GATE"],
  });
  const open = {
    ...base,
    research_gaps: {
      $schema: researchGapsSchema,
      item: "demo",
      plannedAt: repo.head,
      gaps: [
        {
          id: "RG1",
          question: "Unknown?",
          requiredEvidence: ["Exact answer"],
          status: "OPEN",
          resolution: null,
          deferral: null,
        },
      ],
    },
  };
  expect(await runPlanPackage(open)).toMatchObject({
    outcome: "RESEARCH_REQUIRED",
    open_research_gaps: ["RG1"],
  });
  expect(await runPlanPackage({ ...open, commands: [], receipts: [] })).toMatchObject({
    outcome: "RESEARCH_REQUIRED",
    runnable: [],
    deferred: [],
  });
  await expect(runPlanPackage({ ...base, commands: [runnableCommand, runnableCommand] })).rejects.toThrow(
    "command ids must be unique",
  );
  await expect(runPlanPackage({ ...base, receipts: receipts.slice(0, 1) })).rejects.toThrow(
    "cover the command partition exactly",
  );
  await expect(
    runPlanPackage({ ...base, receipts: [{ ...receipts[0], units: 0 }, receipts[1]] }),
  ).rejects.toThrow("receipt outcome is invalid");
  await expect(
    runPlanPackage({ ...base, research_gaps: { ...base.research_gaps, extra: true } }),
  ).rejects.toThrow("unknown or missing fields");
  await expect(
    runPlanPackage({
      ...base,
      research_gaps: { ...base.research_gaps, plannedAt: "0".repeat(40) },
    }),
  ).rejects.toThrow("binding is invalid");
  await expect(runPlanPackage({ ...base, item: "another" })).rejects.toThrow("binding is invalid");
  await expect(
    runPlanPackage({
      ...base,
      research_gaps: {
        ...base.research_gaps,
        gaps: [{ ...base.research_gaps.gaps[0], resolution: ["research/missing.md#decision"] }],
      },
    }),
  ).rejects.toThrow(/resolution|ENOENT/);
});

function manifest(rows: readonly string[], fingerprint: string): string {
  return [
    "# Implementation Plans — demo",
    "",
    `Frozen contract fingerprint: \`${fingerprint}\``,
    "",
    "## Execution order & status",
    "",
    "| Plan | Title | Covers | Priority | Effort | Depends on | Status |",
    "|------|-------|--------|----------|--------|------------|--------|",
    ...rows,
    "",
  ].join("\n");
}

async function packageRepo(
  rows: readonly string[],
): Promise<{ root: string; head: string; manifestPath: string; sha: string }> {
  const repo = await repository(),
    plan = path.join(repo.root, "roadmap/demo/plan"),
    goal = path.join(repo.root, "roadmap/demo/goal");
  await mkdir(plan, { recursive: true });
  await mkdir(goal, { recursive: true });
  for (const row of rows) {
    const id = row.split("|")[1]!.trim();
    await writeFile(path.join(plan, `${id}-slice.md`), `# ${id}\n`);
  }
  await writeFile(path.join(goal, "START.md"), "# Start\n\n```sh gates\ntrue ||| printf 1\n```\n");
  await writeFile(path.join(goal, "RESUME.md"), "# Resume\n");
  await writeFile(
    path.join(goal, "check.sh"),
    await readFile(path.join(import.meta.dir, "../skills/tailrocks-plan/templates/check.sh")),
  );
  const fingerprintResult = Bun.spawnSync(
    [
      "/bin/sh",
      "-c",
      'find roadmap/demo/plan roadmap/demo/goal -type f -print | LC_ALL=C sort | while IFS= read -r f; do printf \'%s %s\\n\' "$(git hash-object -- "$f")" "$f"; done | git hash-object --stdin',
    ],
    { cwd: repo.root, stdout: "pipe", stderr: "pipe" },
  );
  if (fingerprintResult.exitCode !== 0) throw new Error(fingerprintResult.stderr.toString());
  const manifestPath = "roadmap/demo/plan/README.md",
    bytes = manifest(rows, fingerprintResult.stdout.toString().trim());
  await writeFile(path.join(repo.root, manifestPath), bytes);
  shell("/usr/bin/git add roadmap && /usr/bin/git commit -qm package", repo.root);
  const head = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: repo.root })
    .stdout.toString()
    .trim();
  return {
    root: repo.root,
    head,
    manifestPath,
    sha: new Bun.CryptoHasher("sha256").update(bytes).digest("hex"),
  };
}

function resumeInput(repo: { root: string; head: string; manifestPath: string }) {
  return {
    schema: planPackageInputSchema,
    operation: "resume",
    root: repo.root,
    expected_head: repo.head,
    manifest_path: repo.manifestPath,
  };
}

async function recordReconcile(repo: {
  root: string;
  head: string;
  manifestPath: string;
  sha: string;
}): Promise<typeof repo> {
  shell(
    "/usr/bin/git commit --allow-empty -qm reconcile -m 'Tailrocks-Skill: tailrocks-reconcile'",
    repo.root,
  );
  return {
    ...repo,
    head: Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: repo.root }).stdout.toString().trim(),
  };
}

test("resume returns deterministic START, CONTINUE, RECONCILE, REPLAN, BLOCKED, and COMPLETE", async () => {
  const start = await packageRepo([
    "| 001 | Base | F1 | P1 | S | — | TODO |",
    "| 002 | Next | F2 | P2 | S | 001 | TODO |",
  ]);
  expect(await runPlanPackage(resumeInput(start))).toMatchObject({ outcome: "START", next_plan: "001" });
  const progress = await packageRepo(["| 001 | Base | F1 | P1 | S | — | IN PROGRESS |"]);
  expect(await runPlanPackage(resumeInput(progress))).toMatchObject({
    outcome: "CONTINUE",
    next_plan: "001",
  });
  const reconcile = await packageRepo([
    "| 001 | Base | F1 | P1 | S | — | DONE |",
    "| 002 | Next | F2 | P2 | S | 001 | TODO |",
  ]);
  expect(await runPlanPackage(resumeInput(reconcile))).toMatchObject({ outcome: "RECONCILE_REQUIRED" });
  const reconciled = await recordReconcile(reconcile);
  expect(await runPlanPackage(resumeInput(reconciled))).toMatchObject({
    outcome: "START",
    next_plan: "002",
  });
  const replan = await packageRepo(["| 001 | Base | F1 | P1 | S | — | STALE (decision changed) |"]);
  expect(await runPlanPackage(resumeInput(replan))).toMatchObject({ outcome: "REPLAN_REQUIRED" });
  const blocked = await packageRepo(["| 001 | Base | F1 | P1 | S | — | BLOCKED (missing input) |"]);
  expect(await runPlanPackage(resumeInput(blocked))).toMatchObject({ outcome: "BLOCKED" });
  const complete = await packageRepo([
    "| 001 | Base | F1 | P1 | S | — | DONE |",
    "| 002 | Declined | F2 | P2 | S | 001 | REJECTED (obsolete) |",
  ]);
  expect(await runPlanPackage(resumeInput(complete))).toMatchObject({ outcome: "RECONCILE_REQUIRED" });
  const reconciledComplete = await recordReconcile(complete);
  expect(await runPlanPackage(resumeInput(reconciledComplete))).toMatchObject({
    outcome: "COMPLETE",
    next_plan: null,
  });
});

test("resume refuses dirty, drifted, duplicate, cyclic, missing-file, and multiple-active packages", async () => {
  const dirty = await packageRepo(["| 001 | Base | F1 | P1 | S | — | TODO |"]);
  await writeFile(path.join(dirty.root, "dirty"), "x");
  await expect(runPlanPackage(resumeInput(dirty))).rejects.toThrow("worktree is dirty");

  const drift = await packageRepo(["| 001 | Base | F1 | P1 | S | — | TODO |"]);
  await writeFile(path.join(drift.root, "roadmap/demo/plan/001-slice.md"), "tampered\n");
  shell("/usr/bin/git add . && /usr/bin/git commit -qm drift", drift.root);
  const driftHead = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: drift.root })
    .stdout.toString()
    .trim();
  await expect(runPlanPackage({ ...resumeInput(drift), expected_head: driftHead })).rejects.toThrow(
    "goal contract refused resume",
  );
  const duplicate = await packageRepo([
    "| 001 | Base | F1 | P1 | S | — | TODO |",
    "| 001 | Again | F2 | P2 | S | — | TODO |",
  ]);
  await expect(runPlanPackage(resumeInput(duplicate))).rejects.toThrow(/exactly one file|unique|monotonic/);
  const cycle = await packageRepo([
    "| 001 | Base | F1 | P1 | S | 002 | TODO |",
    "| 002 | Next | F2 | P2 | S | 001 | TODO |",
  ]);
  await expect(runPlanPackage(resumeInput(cycle))).rejects.toThrow("cyclic");
  const active = await packageRepo([
    "| 001 | Base | F1 | P1 | S | — | IN PROGRESS |",
    "| 002 | Next | F2 | P2 | S | — | IN PROGRESS |",
  ]);
  await expect(runPlanPackage(resumeInput(active))).rejects.toThrow("multiple plans");

  const incoherent = await packageRepo([
    "| 001 | Base | F1 | P1 | S | — | TODO |",
    "| 002 | Next | F2 | P2 | S | 001 | DONE |",
  ]);
  await expect(runPlanPackage(resumeInput(incoherent))).rejects.toThrow("contradicts dependencies");

  const linked = await packageRepo(["| 001 | Base | F1 | P1 | S | — | TODO |"]);
  await rm(path.join(linked.root, "roadmap/demo/plan/001-slice.md"));
  await symlink("../../../README.md", path.join(linked.root, "roadmap/demo/plan/001-slice.md"));
  shell("/usr/bin/git add . && /usr/bin/git commit -qm linked", linked.root);
  const linkedHead = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: linked.root })
    .stdout.toString()
    .trim();
  await expect(runPlanPackage({ ...resumeInput(linked), expected_head: linkedHead })).rejects.toThrow(
    "plan file is unsafe",
  );

  const missing = await packageRepo(["| 001 | Base | F1 | P1 | S | — | TODO |"]);
  await rm(path.join(missing.root, "roadmap/demo/plan/001-slice.md"));
  shell("/usr/bin/git add -u && /usr/bin/git commit -qm missing", missing.root);
  const head = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: missing.root })
    .stdout.toString()
    .trim();
  await expect(runPlanPackage({ ...resumeInput(missing), expected_head: head })).rejects.toThrow(
    "exactly one file",
  );

  const hostile = await packageRepo(["| 001 | Base | F1 | P1 | S | — | TODO |"]);
  await writeFile(path.join(hostile.root, ".gitattributes"), "roadmap/** filter=evil\n");
  shell(
    "/usr/bin/git config filter.evil.clean \"/bin/sh -c 'touch hostile-filter-ran; cat'\" && /usr/bin/git add .gitattributes && /usr/bin/git commit -qm attributes",
    hostile.root,
  );
  await rm(path.join(hostile.root, "hostile-filter-ran"), { force: true });
  const hostileHead = Bun.spawnSync(["/usr/bin/git", "rev-parse", "HEAD"], { cwd: hostile.root })
    .stdout.toString()
    .trim();
  expect(await runPlanPackage({ ...resumeInput(hostile), expected_head: hostileHead })).toMatchObject({
    outcome: "START",
  });
  expect(await Bun.file(path.join(hostile.root, "hostile-filter-ran")).exists()).toBe(false);
});

test("installed entrypoint is loader-bound before dynamic core import", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "tailrocks-plan-installed-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "skills/tailrocks-plan"), { recursive: true });
  await writeFile(path.join(root, "skills/tailrocks-plan/SKILL.md"), "owner\n");
  await writeFile(path.join(root, "scripts/plan-package-core.ts"), "throw new Error('CORE_MARKER')\n");
  await writeFile(
    path.join(root, "scripts/plan-package.ts"),
    await readFile(path.join(import.meta.dir, "plan-package.ts")),
  );
  const child = Bun.spawnSync(
    [
      process.execPath,
      path.join(root, "scripts/plan-package.ts"),
      "--skill-file",
      path.join(root, "wrong/SKILL.md"),
    ],
    { stdin: Buffer.from("{}"), stdout: "pipe", stderr: "pipe" },
  );
  expect(child.exitCode).toBe(2);
  expect(child.stdout.toString()).toContain("loader is not bound");
  expect(child.stdout.toString()).not.toContain("CORE_MARKER");
});

test("installed entrypoint executes only from its canonical package", async () => {
  const repo = await repository();
  const input = {
    schema: planPackageInputSchema,
    operation: "validate",
    root: repo.root,
    expected_head: repo.head,
    item: "demo",
    research_gaps: {
      $schema: researchGapsSchema,
      item: "demo",
      plannedAt: repo.head,
      gaps: [
        {
          id: "RG1",
          question: "What evidence is missing?",
          requiredEvidence: ["One primary source"],
          status: "OPEN",
          resolution: null,
          deferral: null,
        },
      ],
    },
    commands: [],
    receipts: [],
  };
  const child = Bun.spawnSync(
    [
      process.execPath,
      path.join(import.meta.dir, "plan-package.ts"),
      "--skill-file",
      path.join(import.meta.dir, "../skills/tailrocks-plan/SKILL.md"),
    ],
    { stdin: Buffer.from(JSON.stringify(input)), stdout: "pipe", stderr: "pipe" },
  );
  expect(child.exitCode).toBe(0);
  expect(JSON.parse(child.stdout.toString())).toMatchObject({
    operation: "validate",
    outcome: "RESEARCH_REQUIRED",
    mutations: [],
  });
});

test("staged installed package binds every executable dependency", async () => {
  const installed = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-plan-staged-")));
  roots.push(installed);
  await mkdir(path.join(installed, "scripts"));
  await mkdir(path.join(installed, "skills/tailrocks-plan/templates"), { recursive: true });
  for (const file of [
    "plan-package.ts",
    "plan-package-core.ts",
    "bounded-command.ts",
    "resolve-executable.ts",
  ])
    await copyFile(path.join(import.meta.dir, file), path.join(installed, "scripts", file));
  await copyFile(
    path.join(import.meta.dir, "../skills/tailrocks-plan/SKILL.md"),
    path.join(installed, "skills/tailrocks-plan/SKILL.md"),
  );
  await copyFile(
    path.join(import.meta.dir, "../skills/tailrocks-plan/templates/check.sh"),
    path.join(installed, "skills/tailrocks-plan/templates/check.sh"),
  );
  const repo = await repository();
  const input = {
    schema: planPackageInputSchema,
    operation: "validate",
    root: repo.root,
    expected_head: repo.head,
    item: "demo",
    research_gaps: {
      $schema: researchGapsSchema,
      item: "demo",
      plannedAt: repo.head,
      gaps: [
        {
          id: "RG1",
          question: "What is missing?",
          requiredEvidence: ["Primary evidence"],
          status: "OPEN",
          resolution: null,
          deferral: null,
        },
      ],
    },
    commands: [],
    receipts: [],
  };
  const command = [
    process.execPath,
    path.join(installed, "scripts/plan-package.ts"),
    "--skill-file",
    path.join(installed, "skills/tailrocks-plan/SKILL.md"),
  ];
  const accepted = Bun.spawnSync(command, {
    stdin: Buffer.from(JSON.stringify(input)),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(accepted.exitCode).toBe(0);
  expect(JSON.parse(accepted.stdout.toString())).toMatchObject({ outcome: "RESEARCH_REQUIRED" });

  const checker = path.join(installed, "skills/tailrocks-plan/templates/check.sh");
  await rm(checker);
  await symlink(path.join(import.meta.dir, "../skills/tailrocks-plan/templates/check.sh"), checker);
  const refused = Bun.spawnSync(command, {
    stdin: Buffer.from(JSON.stringify(input)),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(refused.exitCode).toBe(2);
  expect(refused.stdout.toString()).toContain("unsafe");
});
