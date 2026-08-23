import { afterEach, describe, expect, test } from "bun:test";
import { appendFileSync, chmodSync, cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const roots: string[] = [];
const template = join(import.meta.dir, "../skills/tailrocks-plan/templates/check.sh");

function run(cwd: string, command: string[]) {
  return Bun.spawnSync(command, { cwd, stderr: "pipe", stdout: "pipe" });
}

function git(cwd: string, ...args: string[]) {
  const result = run(cwd, ["git", ...args]);
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}

function fingerprint(root: string) {
  const script =
    'find roadmap/demo/plan roadmap/demo/goal -type f ! -path roadmap/demo/plan/README.md -print | LC_ALL=C sort | while IFS= read -r f; do printf \'%s %s\\n\' "$(git hash-object -- "$f")" "$f"; done | git hash-object --stdin';
  const result = run(root, ["sh", "-c", script]);
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}

function fixture(
  options: {
    gate?: string;
    status?: string;
    omitGates?: boolean;
    omitFingerprint?: boolean;
  } = {},
) {
  const root = mkdtempSync(join(tmpdir(), "tailrocks-goal-check-"));
  roots.push(root);
  const item = join(root, "roadmap/demo");
  const plan = join(item, "plan");
  const goal = join(item, "goal");
  mkdirSync(plan, { recursive: true });
  mkdirSync(goal, { recursive: true });
  mkdirSync(join(item, "verification"), { recursive: true });
  git(root, "init", "-q");
  git(root, "config", "user.email", "test@example.com");
  git(root, "config", "user.name", "Test");
  writeFileSync(join(plan, "001-plan.md"), "frozen\n");
  // A gate line carries its proof expression after `|||`; the default proves
  // one unit of work so the happy path stays honest rather than vacuous.
  const gates = options.omitGates ? "" : `\n\`\`\`sh gates\n${options.gate ?? "true ||| echo 1"}\n\`\`\`\n`;
  writeFileSync(join(goal, "START.md"), `Generated fixture.\n${gates}`);
  writeFileSync(join(goal, "RESUME.md"), "Resume fixture.\n");
  cpSync(template, join(goal, "check.sh"));
  chmodSync(join(goal, "check.sh"), 0o755);
  writeFileSync(join(item, "verification", "01-report.md"), "no rounds yet\n");
  const frozen = fingerprint(root);
  const fingerprintLine = options.omitFingerprint ? "" : `Frozen contract fingerprint: \`${frozen}\`\n\n`;
  writeFileSync(
    join(plan, "README.md"),
    `${fingerprintLine}## Execution order & status\n\n| Plan | Title | Covers | Priority | Effort | Depends on | Status |\n|------|-------|--------|----------|--------|------------|--------|\n| 000 | Demo | F1 | P1 | S | — | ${options.status ?? "DONE"} |\n`,
  );
  git(root, "add", ".");
  git(root, "commit", "-qm", "generated");
  return { root, item, plan, goal };
}

function check(root: string) {
  const result = run(root, ["sh", "roadmap/demo/goal/check.sh"]);
  const lines = result.stdout.toString().trim().split("\n");
  return { code: result.exitCode, verdict: lines.at(-1) };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("check.sh", () => {
  test("passes a clean terminal item", () => {
    const { root } = fixture();
    const head = git(root, "rev-parse", "--short", "HEAD");
    expect(check(root)).toEqual({ code: 0, verdict: `TAILROCKS GOAL: PASS ${head}` });
  });

  test("blocks a dirty tree", () => {
    const { root } = fixture();
    writeFileSync(join(root, "dirty"), "dirty\n");
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED dirty-tree" });
  });

  test.each([["plan/001-plan.md"], ["goal/START.md"], ["goal/check.sh"]])("blocks drift in %s", (name) => {
    const { root, item } = fixture();
    appendFileSync(join(item, name), "\n# tampered\n");
    git(root, "add", ".");
    git(root, "commit", "-qm", "tamper");
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED plan-drift" });
  });

  test.each([["README.md"], ["verification/01-report.md"]])(
    "leaves the writable %s outside the fingerprint",
    (name) => {
      const { root, item } = fixture();
      writeFileSync(join(item, name), "the loop moved this\n");
      git(root, "add", ".");
      git(root, "commit", "-qm", "loop");
      const head = git(root, "rev-parse", "--short", "HEAD");
      expect(check(root)).toEqual({ code: 0, verdict: `TAILROCKS GOAL: PASS ${head}` });
    },
  );

  test("blocks nonterminal rows", () => {
    const { root } = fixture({ status: "TODO" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED nonterminal-rows=1" });
  });

  test("blocks the first failing gate", () => {
    const { root } = fixture({ gate: "false ||| echo 1" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED gate-failed=false" });
  });

  test("blocks a gate that succeeded while executing nothing", () => {
    // The field failure this exists for: `cargo test -p typo` exits 0 and runs
    // no tests, so exit status alone reports a proof that proved nothing.
    const { root } = fixture({ gate: "true ||| echo 0" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED gate-vacuous=true" });
  });

  test("blocks proof prose containing incidental digits", () => {
    const { root } = fixture({ gate: "true ||| echo '17 tests passed'" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED gate-vacuous=true" });
  });

  test("blocks noncanonical leading-zero proof", () => {
    const { root } = fixture({ gate: "true ||| printf 00" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED gate-vacuous=true" });
  });

  test("blocks a gate whose proof expression is missing", () => {
    const { root } = fixture({ gate: "true" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED gate-unproven=true" });
  });

  test.each([
    ["fingerprint", { omitFingerprint: true }],
    ["gates-block", { omitGates: true }],
  ])("blocks malformed %s", (reason, options) => {
    const { root } = fixture(options);
    expect(check(root)).toEqual({ code: 1, verdict: `TAILROCKS GOAL: BLOCKED malformed=${reason}` });
  });

  test("accepts an all-rejected terminal package", () => {
    const { root } = fixture({ status: "REJECTED (decision removed scope)" });
    const head = git(root, "rev-parse", "--short", "HEAD");
    expect(check(root)).toEqual({ code: 0, verdict: `TAILROCKS GOAL: PASS ${head}` });
  });

  test("blocks an unknown status", () => {
    const { root } = fixture({ status: "FINISHED" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED malformed=status-table" });
  });
});
