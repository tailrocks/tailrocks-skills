import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { aggregateVerdicts, collectArtifacts, fixtureDestination, stageFixtures } from "./run-evals";

const cleanup: string[] = [];
afterEach(async () => { await Promise.all(cleanup.splice(0).map((item) => rm(item, { recursive: true, force: true }))); });

describe("eval runner helpers", () => {
  test("preserves a nested skill-relative fixture path", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-")); cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(path.join(skillDir, "templates/a"), { recursive: true });
    await writeFile(path.join(skillDir, "templates/a/b.txt"), "nested");
    const workspace = path.join(root, "workspace"); await mkdir(workspace);
    await stageFixtures(root, skillDir, ["skills/x/templates/a/b.txt"], workspace);
    expect(await Bun.file(path.join(workspace, "templates/a/b.txt")).text()).toBe("nested");
    expect(fixtureDestination(root, skillDir, "skills/x/templates/a/b.txt", workspace)).toBe(path.join(workspace, "templates/a/b.txt"));
  });

  test("artifact listing marks byte-cap truncation", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "eval-artifacts-")); cleanup.push(workspace);
    await writeFile(path.join(workspace, "large.txt"), "x".repeat(20));
    expect(await collectArtifacts(workspace, 8, 8)).toContain("[artifact content truncated: large.txt]");
  });

  test("one failure makes the aggregate fail and retains its workspace", () => {
    const verdicts = [true, true, false].map((pass, index) => ({ run: index + 1, workspace: `/tmp/run-${index + 1}`, verdict: { pass } }));
    const result = aggregateVerdicts("x", 1, 3, verdicts);
    expect(result.exitCode).toBe(1);
    expect(result.summary.passed).toBe(2);
    expect(result.summary.retained_workspaces).toEqual(["/tmp/run-3"]);
  });
});
