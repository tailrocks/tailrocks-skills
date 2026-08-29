import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  stat,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  finalizeImproveReport,
  improveReportInputSchema,
  improveReportReceiptSchema,
} from "./improve-report-core";

const identities = new Map<string, { revision: string; dirty: string }>();
const allLanes = [
  "agent-legibility",
  "correctness",
  "dependencies",
  "direction",
  "docs",
  "dx",
  "liquid-glass",
  "perf",
  "tech-debt",
  "tests",
  "tui",
  "ux",
] as const;
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
const route = (primary: Record<string, unknown> | null = null, modifiers: string[] = []) => ({
  primaries: primary ? [primary] : [],
  modifiers,
  context: { kind: "repository" },
});

async function repository() {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "improve-report-")));
  const lines = Array.from({ length: 30 }, (_, index) => `evidence-${index + 1}`);
  await mkdir(path.join(root, "evidence"));
  await writeFile(path.join(root, "evidence", "evidence.txt"), `${lines.join("\n")}\n`);
  await writeFile(path.join(root, ".gitattributes"), "evidence/evidence.txt filter=hostile\n");
  const git = Bun.which("git");
  if (!git) throw new Error("git unavailable");
  const run = async (...args: string[]) => {
    const child = Bun.spawn([git, ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    if (code !== 0) throw new Error(stderr);
    return stdout.trim();
  };
  await run("init", "-b", "main");
  await run("config", "user.name", "Fixture");
  await run("config", "user.email", "fixture@example.test");
  await run("add", ".gitattributes", "evidence/evidence.txt");
  await run("commit", "-m", "fixture");
  identities.set(root, { revision: await run("rev-parse", "HEAD"), dirty: digest("") });
  return { root, lines };
}

function citation(lines: readonly string[], line: number) {
  return { path: "evidence/evidence.txt", line, line_sha256: digest(lines[line - 1]!) };
}

function candidate(lines: readonly string[], id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    kind: "defect",
    lane: "correctness",
    title: `Finding ${id}`,
    impact: "Observable wrong behavior.",
    correctness: false,
    consistency: false,
    goal_fit: false,
    severity: "MEDIUM",
    confidence: "HIGH",
    fix_risk: "LOW",
    effort: "S",
    citations: [citation(lines, 1), citation(lines, 2)],
    disposition: { outcome: "verified" },
    next_owner: "tailrocks-improve-plan",
    ...overrides,
  };
}

function input(root: string, candidates: unknown[], selectedRoute = route()) {
  const identity = identities.get(root);
  if (!identity) throw new Error("repository identity unavailable");
  return {
    schema: improveReportInputSchema,
    root,
    revision: identity.revision,
    dirty_sha256: identity.dirty,
    route: selectedRoute,
    lanes: allLanes.map((id) => ({ id, outcome: "completed", detail: `${id} inspected` })),
    commands: [
      { id: "static-check", outcome: "ran", units: 4, detail: "four units checked" },
      { id: "network-gate", outcome: "not_run", units: 0, detail: "network could not be disabled" },
    ],
    candidates,
  };
}

test("ranking is permutation-stable and correctness outranks cheaper cosmetics", async () => {
  const repo = await repository();
  const candidates = [
    candidate(repo.lines, "COSMETIC-1", { severity: "BLOCKER", effort: "S" }),
    candidate(repo.lines, "CORRECT-2", { correctness: true, severity: "LOW", effort: "L" }),
    candidate(repo.lines, "CORRECT-1", { correctness: true, severity: "LOW", effort: "S" }),
    candidate(repo.lines, "DIRECTION-1", {
      kind: "direction",
      lane: "direction",
      goal_fit: true,
      next_owner: "tailrocks-seed-roadmap",
    }),
  ];
  const first = await finalizeImproveReport(repo.root, input(repo.root, candidates));
  const second = await finalizeImproveReport(repo.root, input(repo.root, [...candidates].reverse()));
  expect(first).toEqual(second);
  expect(first).toMatchObject({
    schema: improveReportReceiptSchema,
    outcome: "reported",
    code: "reported",
    candidate_count: 4,
    mutations: [],
  });
  expect(first.defects.map(({ id }) => id)).toEqual(["CORRECT-1", "CORRECT-2", "COSMETIC-1"]);
  expect(first.directions.map(({ id }) => id)).toEqual(["DIRECTION-1"]);
  expect(first.commands.map(({ id }) => id)).toEqual(["network-gate", "static-check"]);
});

test("every closed rejection reason survives in the separate exhaustive partition", async () => {
  const repo = await repository();
  const reasons = [
    "by-design",
    "contradicted",
    "current-decision",
    "duplicate",
    "out-of-scope",
    "unverified",
  ] as const;
  const candidates = reasons.map((reason, index) =>
    candidate(repo.lines, `REJECT-${index + 1}`, {
      citations: [citation(repo.lines, index * 2 + 1), citation(repo.lines, index * 2 + 2)],
      disposition: { outcome: "rejected", reason, detail: `${reason} after independent re-read` },
      next_owner: null,
    }),
  );
  const receipt = await finalizeImproveReport(repo.root, input(repo.root, [...candidates].reverse()));
  expect(receipt.defects).toEqual([]);
  expect(receipt.directions).toEqual([]);
  expect(receipt.rejected.map(({ id }) => id)).toEqual(reasons.map((_, index) => `REJECT-${index + 1}`));
  expect(
    receipt.rejected.map(({ disposition }) =>
      disposition.outcome === "rejected" ? disposition.reason : "invalid",
    ),
  ).toEqual(reasons);
  expect(receipt.candidate_count).toBe(6);
});

test("current direct routes report while specialist routes return an empty typed handoff", async () => {
  const repo = await repository();
  const categoryInput = input(
    repo.root,
    [candidate(repo.lines, "DOCS-1", { lane: "docs" })],
    route({ kind: "category", category: "docs" }),
  );
  categoryInput.lanes = [{ id: "docs", outcome: "completed", detail: "docs inspected" }];
  expect(await finalizeImproveReport(repo.root, categoryInput)).toMatchObject({ outcome: "reported" });

  for (const selected of [route(null, ["--deep"]), route({ kind: "category", category: "security" })]) {
    const routed = input(repo.root, [], selected);
    routed.lanes = [];
    routed.commands = [];
    expect(await finalizeImproveReport(repo.root, routed)).toMatchObject({
      outcome: "routed",
      code: "route",
      defects: [],
      directions: [],
      rejected: [],
      mutations: [],
    });
  }
});

test("retired umbrella selectors and routed-work emulation are refused", async () => {
  const repo = await repository();
  for (const kind of ["branch", "next", "ask", "plan", "seed", "execute", "sweep"]) {
    const value = input(repo.root, [], route({ kind }));
    expect(await finalizeImproveReport(repo.root, value)).toMatchObject({
      outcome: "refused",
      code: "invalid_input",
      detail: "retired improve selector",
    });
  }
  expect(
    await finalizeImproveReport(
      repo.root,
      input(
        repo.root,
        [candidate(repo.lines, "SECURITY-1")],
        route({ kind: "category", category: "security" }),
      ),
    ),
  ).toMatchObject({ outcome: "refused", detail: "routed invocation must not emulate target work" });
});

test("duplicates, vacuous commands, incomplete lanes, and changed evidence fail closed", async () => {
  const repo = await repository();
  const duplicate = candidate(repo.lines, "DUPLICATE-1");
  expect(await finalizeImproveReport(repo.root, input(repo.root, [duplicate, duplicate]))).toMatchObject({
    outcome: "refused",
    detail: "candidate ids are duplicated",
  });
  const vacuous = input(repo.root, []);
  vacuous.commands = [{ id: "empty", outcome: "ran", units: 0, detail: "nothing ran" }];
  expect(await finalizeImproveReport(repo.root, vacuous)).toMatchObject({ outcome: "refused" });
  const skipped = input(repo.root, [candidate(repo.lines, "SKIPPED-1")]);
  skipped.lanes = skipped.lanes.map((lane) =>
    lane.id === "correctness" ? { ...lane, outcome: "skipped" as const } : lane,
  );
  expect(await finalizeImproveReport(repo.root, skipped)).toMatchObject({
    outcome: "refused",
    detail: "lane coverage does not match selection or candidates",
  });
  const changed = input(repo.root, [candidate(repo.lines, "CHANGED-1")]);
  changed.candidates[0]!.citations[0]!.line_sha256 = "f".repeat(64);
  expect(await finalizeImproveReport(repo.root, changed)).toMatchObject({
    outcome: "refused",
    code: "evidence_changed",
  });
});

test("restored-mtime rewrites and parent replacement races fail evidence identity", async () => {
  const rewritten = await repository();
  const file = path.join(rewritten.root, "evidence", "evidence.txt");
  const original = await readFile(file);
  const originalStat = await stat(file);
  const rewriteReceipt = await finalizeImproveReport(
    rewritten.root,
    input(rewritten.root, [candidate(rewritten.lines, "REWRITE-1")]),
    {
      afterEvidenceRead: async () => {
        const changed = Buffer.from(original);
        changed[0] = changed[0] === 0x65 ? 0x45 : 0x65;
        await writeFile(file, changed);
        await writeFile(file, original);
        await utimes(file, originalStat.atime, originalStat.mtime);
      },
    },
  );
  expect(rewriteReceipt).toMatchObject({ outcome: "refused", code: "evidence_changed" });

  const swapped = await repository();
  const directory = path.join(swapped.root, "evidence");
  const moved = path.join(swapped.root, "evidence-original");
  const swapReceipt = await finalizeImproveReport(
    swapped.root,
    input(swapped.root, [candidate(swapped.lines, "SWAP-1")]),
    {
      afterEvidenceRead: async () => {
        await rename(directory, moved);
        await mkdir(directory);
        await cp(path.join(moved, "evidence.txt"), path.join(directory, "evidence.txt"));
      },
    },
  );
  expect(swapReceipt).toMatchObject({ outcome: "refused", code: "evidence_changed" });
});

test("strict schemas, unsafe roots, sparse arrays, and excessive input refuse without writes", async () => {
  const repo = await repository();
  const evidenceFile = path.join(repo.root, "evidence", "evidence.txt");
  const before = await readFile(evidenceFile);
  for (const raw of [
    null,
    Object.assign(Object.create({ inherited: true }), input(repo.root, [])),
    { ...input(repo.root, []), extra: true },
    { ...input(repo.root, []), schema: "old" },
    { ...input(repo.root, []), candidates: new Array(1) },
    { ...input(repo.root, []), candidates: Array.from({ length: 1_001 }, () => ({})) },
    input(repo.root, [
      candidate(repo.lines, "BACKSLASH-1", {
        citations: [{ path: "..\\outside", line: 1, line_sha256: digest("x") }, citation(repo.lines, 2)],
      }),
    ]),
    input(repo.root, [
      candidate(repo.lines, "GIT-1", {
        citations: [{ path: ".git/config", line: 1, line_sha256: digest("x") }, citation(repo.lines, 2)],
      }),
    ]),
  ])
    expect((await finalizeImproveReport(repo.root, raw)).outcome).toBe("refused");
  expect(
    await finalizeImproveReport(repo.root, { ...input(repo.root, []), root: `${repo.root}/other` }),
  ).toMatchObject({
    outcome: "refused",
    code: "unsafe_target",
  });
  expect(
    await finalizeImproveReport(repo.root, { ...input(repo.root, []), revision: "f".repeat(40) }),
  ).toMatchObject({ outcome: "refused", code: "unsafe_target", detail: "target revision mismatch" });
  expect(
    await finalizeImproveReport(repo.root, { ...input(repo.root, []), dirty_sha256: "f".repeat(64) }),
  ).toMatchObject({ outcome: "refused", code: "unsafe_target", detail: "target dirty-state mismatch" });
  expect(await readFile(evidenceFile)).toEqual(before);
});

test("installed CLI emits one typed refusal and rejects symlink lookalikes", async () => {
  const sourceRoot = path.resolve(import.meta.dir, "..");
  for (const linked of [false, true]) {
    const root = await realpath(await mkdtemp(path.join(tmpdir(), "improve-installed-")));
    await mkdir(path.join(root, "scripts"));
    await mkdir(path.join(root, "skills", "tailrocks-improve"), { recursive: true });
    for (const name of [
      "improve-report-core.ts",
      "improve-route-resolver.ts",
      "improve-route-schema.ts",
      "bounded-command.ts",
      "resolve-executable.ts",
    ])
      await cp(path.join(sourceRoot, "scripts", name), path.join(root, "scripts", name));
    const entrypoint = path.join(root, "scripts", "improve-report.ts");
    if (linked) await symlink(path.join(sourceRoot, "scripts", "improve-report.ts"), entrypoint);
    else await cp(path.join(sourceRoot, "scripts", "improve-report.ts"), entrypoint);
    const skill = path.join(root, "skills", "tailrocks-improve", "SKILL.md");
    await writeFile(skill, "# Installed\n");
    const child = Bun.spawn([process.execPath, entrypoint, "--skill-file", skill], {
      cwd: root,
      stdin: new Blob(["{}"]),
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(child.stdout).text();
    expect(await child.exited).toBe(2);
    expect(stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(stdout)).toMatchObject({ schema: improveReportReceiptSchema, mutations: [] });
  }

  const target = await repository();
  const hostileMarker = path.join(target.root, "fsmonitor-executed");
  const hostileHelper = path.join(target.root, ".git", "hostile-fsmonitor.sh");
  await writeFile(
    hostileHelper,
    `#!/bin/sh\nprintf ran > ${JSON.stringify(hostileMarker)}\ncat >/dev/null\nexit 1\n`,
  );
  await chmod(hostileHelper, 0o755);
  const git = Bun.which("git")!;
  for (const [key, value] of [
    ["core.fsmonitor", hostileHelper],
    ["filter.hostile.clean", hostileHelper],
    ["filter.hostile.process", hostileHelper],
    ["filter.hostile.required", "true"],
  ]) {
    const configure = Bun.spawn([git, "config", key!, value!], {
      cwd: target.root,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await configure.exited).toBe(0);
  }
  const hostileGlobal = path.join(target.root, ".git", "hostile-global-config");
  await writeFile(
    hostileGlobal,
    `[core]\n\tfsmonitor = ${hostileHelper}\n[filter "hostile"]\n\tclean = ${hostileHelper}\n\tprocess = ${hostileHelper}\n\trequired = true\n`,
  );
  const targetEvidence = path.join(target.root, "evidence", "evidence.txt");
  const targetEvidenceBytes = await readFile(targetEvidence);
  const targetEvidenceStat = await stat(targetEvidence);
  await utimes(targetEvidence, targetEvidenceStat.atime, new Date());
  const indexFile = path.join(target.root, ".git", "index");
  const indexBefore = await readFile(indexFile);
  const indexStatBefore = await stat(indexFile);
  const plugin = await realpath(await mkdtemp(path.join(tmpdir(), "improve-plugin-")));
  await mkdir(path.join(plugin, "scripts"));
  await mkdir(path.join(plugin, "skills", "tailrocks-improve"), { recursive: true });
  for (const name of [
    "improve-report.ts",
    "improve-report-core.ts",
    "improve-route-resolver.ts",
    "improve-route-schema.ts",
    "bounded-command.ts",
    "resolve-executable.ts",
  ])
    await cp(path.join(sourceRoot, "scripts", name), path.join(plugin, "scripts", name));
  const installedSkill = path.join(plugin, "skills", "tailrocks-improve", "SKILL.md");
  await writeFile(installedSkill, "# Installed\n");
  const success = Bun.spawn(
    [process.execPath, path.join(plugin, "scripts", "improve-report.ts"), "--skill-file", installedSkill],
    {
      cwd: target.root,
      env: { ...process.env, GIT_CONFIG_GLOBAL: hostileGlobal },
      stdin: new Blob([JSON.stringify(input(target.root, []))]),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const successOutput = await new Response(success.stdout).text();
  expect(await success.exited).toBe(0);
  expect(successOutput.trim().split("\n")).toHaveLength(1);
  expect(JSON.parse(successOutput)).toMatchObject({ outcome: "reported", candidate_count: 0, mutations: [] });
  const routedInput = input(target.root, [], route({ kind: "category", category: "security" }));
  routedInput.lanes = [];
  routedInput.commands = [];
  const routed = Bun.spawn(
    [process.execPath, path.join(plugin, "scripts", "improve-report.ts"), "--skill-file", installedSkill],
    {
      cwd: target.root,
      env: { ...process.env, GIT_CONFIG_GLOBAL: hostileGlobal },
      stdin: new Blob([JSON.stringify(routedInput)]),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const routedOutput = await new Response(routed.stdout).text();
  expect(await routed.exited).toBe(3);
  expect(JSON.parse(routedOutput)).toMatchObject({ outcome: "routed", mutations: [] });
  const indexStatAfter = await stat(indexFile);
  expect(await readFile(indexFile)).toEqual(indexBefore);
  expect(indexStatAfter.mtimeMs).toBe(indexStatBefore.mtimeMs);
  expect(indexStatAfter.ctimeMs).toBe(indexStatBefore.ctimeMs);
  expect(await readFile(targetEvidence)).toEqual(targetEvidenceBytes);
  expect(await Bun.file(hostileMarker).exists()).toBe(false);
});
