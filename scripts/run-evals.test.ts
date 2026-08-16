import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  aggregateVerdicts,
  collectArtifacts,
  fixtureDestination,
  stageFixtures,
  withRetries,
} from "./run-evals";

const cleanup: string[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((item) => rm(item, { recursive: true, force: true })));
});

describe("eval runner helpers", () => {
  test("preserves a nested skill-relative fixture path", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(path.join(skillDir, "templates/a"), { recursive: true });
    await writeFile(path.join(skillDir, "templates/a/b.txt"), "nested");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);
    await stageFixtures(root, skillDir, ["skills/x/templates/a/b.txt"], workspace);
    expect(await Bun.file(path.join(workspace, "templates/a/b.txt")).text()).toBe("nested");
    expect(fixtureDestination(root, skillDir, "skills/x/templates/a/b.txt", workspace)).toBe(
      path.join(workspace, "templates/a/b.txt"),
    );
  });

  test("stages a cross-skill fixture relative to the referenced skill", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(skillDir, { recursive: true });
    await mkdir(path.join(root, "skills/y/evals/fixtures/roadmap/item"), { recursive: true });
    await writeFile(path.join(root, "skills/y/evals/fixtures/roadmap/item/README.md"), "shared");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);
    const fixture = "skills/y/evals/fixtures/roadmap/item/README.md";
    await stageFixtures(root, skillDir, [fixture], workspace);
    const destination = path.join(workspace, "evals/fixtures/roadmap/item/README.md");
    expect(await Bun.file(destination).text()).toBe("shared");
    expect(fixtureDestination(root, skillDir, fixture, workspace)).toBe(destination);
  });

  test("rejects a fixture that escapes the skills tree", () => {
    expect(() => fixtureDestination("/repo", "/repo/skills/x", "skills/../secrets.txt", "/ws")).toThrow(
      "fixture escapes skill",
    );
    expect(() => fixtureDestination("/repo", "/repo/skills/x", "../y/SKILL.md", "/ws")).toThrow(
      "fixture escapes skill",
    );
  });

  test("artifact listing marks byte-cap truncation", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "eval-artifacts-"));
    cleanup.push(workspace);
    await writeFile(path.join(workspace, "large.txt"), "x".repeat(20));
    expect(await collectArtifacts(workspace, 8, 8)).toContain("[artifact content truncated: large.txt]");
  });

  test("one failure makes the aggregate fail and retains its workspace", () => {
    const verdicts = [true, true, false].map((pass, index) => ({
      run: index + 1,
      workspace: `/tmp/run-${index + 1}`,
      verdict: { pass },
    }));
    const result = aggregateVerdicts("x", 1, 3, verdicts);
    expect(result.exitCode).toBe(1);
    expect(result.summary.passed).toBe(2);
    expect(result.summary.retained_workspaces).toEqual(["/tmp/run-3"]);
  });

  test("retries transient execution failure and returns success", async () => {
    let calls = 0;
    expect(
      await withRetries(2, async () => {
        calls += 1;
        if (calls === 1) throw new Error("transient");
        return "ok";
      }),
    ).toBe("ok");
    expect(calls).toBe(2);
  });

  test("rethrows after the retry budget is exhausted", async () => {
    let calls = 0;
    await expect(
      withRetries(2, async () => {
        calls += 1;
        throw new Error(`failure-${calls}`);
      }),
    ).rejects.toThrow("failure-2");
    expect(calls).toBe(2);
  });
});
