import { afterEach, describe, expect, test } from "bun:test";
import { appendFileSync, chmodSync, cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const roots: string[] = [];
const template = join(import.meta.dir, "../skills/tailrocks-plan/templates/goal-check.sh");

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
    'find plans/demo -type f ! -path plans/demo/README.md -print | LC_ALL=C sort | while IFS= read -r f; do printf \'%s %s\\n\' "$(git hash-object -- "$f")" "$f"; done | git hash-object --stdin';
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
  const pkg = join(root, "plans/demo");
  mkdirSync(pkg, { recursive: true });
  git(root, "init", "-q");
  git(root, "config", "user.email", "test@example.com");
  git(root, "config", "user.name", "Test");
  writeFileSync(join(pkg, "plan.md"), "frozen\n");
  const gates = options.omitGates ? "" : `\n\`\`\`sh gates\n${options.gate ?? "true"}\n\`\`\`\n`;
  writeFileSync(join(pkg, "GOAL.md"), `Generated fixture.\n${gates}`);
  cpSync(template, join(pkg, "goal-check.sh"));
  chmodSync(join(pkg, "goal-check.sh"), 0o755);
  const frozen = fingerprint(root);
  const fingerprintLine = options.omitFingerprint ? "" : `Frozen package fingerprint: \`${frozen}\`\n\n`;
  writeFileSync(
    join(pkg, "README.md"),
    `${fingerprintLine}| Plan | Status |\n|---|---|\n| 000 | ${options.status ?? "DONE"} |\n`,
  );
  git(root, "add", ".");
  git(root, "commit", "-qm", "generated");
  return { root, pkg };
}

function check(root: string) {
  const result = run(root, ["sh", "plans/demo/goal-check.sh"]);
  const lines = result.stdout.toString().trim().split("\n");
  return { code: result.exitCode, verdict: lines.at(-1) };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("goal-check.sh", () => {
  test("passes a clean terminal package", () => {
    const { root } = fixture();
    const head = git(root, "rev-parse", "--short", "HEAD");
    expect(check(root)).toEqual({ code: 0, verdict: `TAILROCKS GOAL: PASS ${head}` });
  });

  test("blocks a dirty tree", () => {
    const { root } = fixture();
    writeFileSync(join(root, "dirty"), "dirty\n");
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED dirty-tree" });
  });

  test.each(["plan.md", "GOAL.md", "goal-check.sh"])("blocks drift in %s", (name) => {
    const { root, pkg } = fixture();
    appendFileSync(join(pkg, name), "\n# tampered\n");
    git(root, "add", ".");
    git(root, "commit", "-qm", "tamper");
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED plan-drift" });
  });

  test("blocks nonterminal rows", () => {
    const { root } = fixture({ status: "TODO" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED nonterminal-rows=1" });
  });

  test("blocks the first failing gate", () => {
    const { root } = fixture({ gate: "false" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED gate-failed=false" });
  });

  test.each([
    ["fingerprint", { omitFingerprint: true }],
    ["gates-block", { omitGates: true }],
  ])("blocks malformed %s", (reason, options) => {
    const { root } = fixture(options);
    expect(check(root)).toEqual({ code: 1, verdict: `TAILROCKS GOAL: BLOCKED malformed=${reason}` });
  });

  test("blocks a malformed status table", () => {
    const { root } = fixture({ status: "REJECTED" });
    expect(check(root)).toEqual({ code: 1, verdict: "TAILROCKS GOAL: BLOCKED malformed=status-table" });
  });
});
