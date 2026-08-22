import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { checkProtectedPaths, parseProtectedPathsManifest } from "./check-protected-paths";

const roots: string[] = [];

async function git(root: string, args: string[]): Promise<string> {
  const process = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (exitCode !== 0) throw new Error(stderr);
  return stdout.trim();
}

async function write(root: string, relative: string, source: string): Promise<void> {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, source);
}

async function fixture(): Promise<{ root: string; sha: string; manifest: string }> {
  const root = await mkdtemp(path.join(tmpdir(), "protected-paths-"));
  roots.push(root);
  await git(root, ["init", "-q"]);
  await git(root, ["config", "user.name", "Test"]);
  await git(root, ["config", "user.email", "test@example.invalid"]);
  await write(root, "scripts/run-evals.ts", "baseline\n");
  await write(root, "scripts/run-evals.test.ts", "baseline test\n");
  await write(root, "docs/design/eval-runner-design.md", "baseline design\n");
  await write(root, "skills/sample/evals/evals.json", "{}\n");
  await write(root, "ordinary.txt", "ordinary\n");
  await git(root, ["add", "."]);
  await git(root, ["commit", "-qm", "baseline"]);
  const sha = await git(root, ["rev-parse", "HEAD"]);
  const manifest = path.join(root, "protected-paths.txt");
  await write(
    root,
    "protected-paths.txt",
    `# Frozen paths\n# Source SHA: ${sha}\nskills/*/evals/**\nscripts/run-evals.ts\nscripts/run-evals.test.ts\ndocs/design/eval-runner-design.md\n`,
  );
  return { root, sha, manifest };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("parseProtectedPathsManifest", () => {
  test("rejects missing SHA, duplicate paths, and unsafe paths", () => {
    expect(() => parseProtectedPathsManifest("scripts/run-evals.ts\n")).toThrow("Source SHA");
    expect(() =>
      parseProtectedPathsManifest(
        `# Source SHA: ${"a".repeat(40)}\nscripts/run-evals.ts\nscripts/run-evals.ts\n`,
      ),
    ).toThrow("duplicate");
    expect(() => parseProtectedPathsManifest(`# Source SHA: ${"a".repeat(40)}\n../outside\n`)).toThrow(
      "unsafe path",
    );
  });
});

describe("checkProtectedPaths", () => {
  test("passes a clean tree and reports nonzero scope", async () => {
    const { root, sha, manifest } = await fixture();
    const receipt = await checkProtectedPaths(root, manifest);
    expect(receipt.source_sha).toBe(sha);
    expect(receipt.patterns_checked).toBe(4);
    expect(receipt.baseline_paths_checked).toBe(4);
    expect(receipt.pattern_source_counts.every((entry) => entry.source_paths === 1)).toBeTrue();
    expect(receipt.violations).toEqual([]);
  });

  test("rejects a changed manifest digest or any unmatched pattern", async () => {
    const { root, manifest } = await fixture();
    await expect(checkProtectedPaths(root, manifest, "0".repeat(64))).rejects.toThrow("immutable SHA-256");
    await write(
      root,
      "protected-paths.txt",
      `${await Bun.file(manifest).text()}scripts/missing-protected-file.ts\n`,
    );
    await expect(checkProtectedPaths(root, manifest)).rejects.toThrow(
      "pattern matches zero source paths: scripts/missing-protected-file.ts",
    );
  });

  test("detects tracked, staged, and committed changes from the audited SHA", async () => {
    for (const state of ["tracked", "staged", "committed"] as const) {
      const { root, manifest } = await fixture();
      await write(root, "scripts/run-evals.ts", `${state}\n`);
      if (state !== "tracked") await git(root, ["add", "scripts/run-evals.ts"]);
      if (state === "committed") await git(root, ["commit", "-qm", "change protected"]);
      const receipt = await checkProtectedPaths(root, manifest);
      expect(receipt.violations).toContainEqual({
        state: state === "tracked" ? "worktree" : state === "staged" ? "staged" : "tracked",
        detail: "M",
        path: "scripts/run-evals.ts",
      });
    }
  });

  test("detects untracked protected files, including ignored files", async () => {
    const { root, manifest } = await fixture();
    await write(root, ".gitignore", "skills/other/\n");
    await write(root, "skills/other/evals/new.json", "{}\n");
    await write(root, "skills/Another/evals/new.json", "{}\n");
    const receipt = await checkProtectedPaths(root, manifest);
    expect(receipt.violations).toContainEqual({
      state: "untracked",
      detail: "?",
      path: "skills/other/evals/new.json",
    });
    expect(
      receipt.violations
        .filter((violation) => violation.state === "untracked")
        .map((violation) => violation.path),
    ).toEqual(["skills/Another/evals/new.json", "skills/other/evals/new.json"]);
  });

  test("detects deleted and moved protected paths", async () => {
    for (const state of ["deleted", "moved"] as const) {
      const { root, manifest } = await fixture();
      if (state === "deleted") {
        await unlink(path.join(root, "scripts/run-evals.ts"));
      } else {
        await git(root, ["mv", "scripts/run-evals.ts", "moved.ts"]);
      }
      const receipt = await checkProtectedPaths(root, manifest);
      if (state === "deleted") {
        expect(receipt.violations).toContainEqual({
          state: "worktree",
          detail: "D",
          path: "scripts/run-evals.ts",
        });
      } else {
        expect(receipt.violations).toContainEqual({
          state: "staged",
          detail: "R100",
          path: "scripts/run-evals.ts",
          other_path: "moved.ts",
        });
      }
    }
  });

  test("detects a staged change canceled in the worktree", async () => {
    const { root, manifest } = await fixture();
    await write(root, "scripts/run-evals.ts", "staged\n");
    await git(root, ["add", "scripts/run-evals.ts"]);
    await write(root, "scripts/run-evals.ts", "baseline\n");
    const receipt = await checkProtectedPaths(root, manifest);
    expect(receipt.counts.staged).toBe(1);
    expect(receipt.counts.worktree).toBe(1);
  });

  test("detects unsafe protected index flags", async () => {
    const { root, manifest } = await fixture();
    await git(root, ["update-index", "--skip-worktree", "scripts/run-evals.ts"]);
    const receipt = await checkProtectedPaths(root, manifest);
    expect(receipt.violations).toContainEqual({
      state: "unsafe_index",
      detail: "S",
      path: "scripts/run-evals.ts",
    });
  });

  test("ignores changes outside the manifest", async () => {
    const { root, manifest } = await fixture();
    await write(root, "ordinary.txt", "changed\n");
    await write(root, "new.txt", "new\n");
    expect((await checkProtectedPaths(root, manifest)).violations).toEqual([]);
  });
});
