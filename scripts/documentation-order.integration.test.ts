import { expect, test } from "bun:test";
import { mkdtemp, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  runDocumentationCheck,
  runMergePreflight,
  type CommandResult,
  type CommandRunner,
} from "./merge-preflight";

async function execute(command: readonly string[], cwd: string): Promise<CommandResult> {
  const child = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, stdout, stderr };
}

async function history(kind: "covered" | "stale" | "not_needed" | "merge_graph") {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "document-order-")));
  const git = async (...args: string[]) => {
    const result = await execute(["git", ...args], root);
    if (result.code !== 0) throw new Error(result.stderr);
    return result.stdout.trim();
  };
  await git("init", "-b", "main");
  await git("config", "user.name", "Fixture");
  await git("config", "user.email", "fixture@example.test");
  await writeFile(path.join(root, "README.md"), "# Fixture\n");
  await git("add", "README.md");
  await git("commit", "-m", "chore: base");
  const base = await git("rev-parse", "HEAD");
  if (kind === "not_needed") {
    await writeFile(path.join(root, "app.test.ts"), "export {};\n");
    await git("add", "app.test.ts");
    await git("commit", "-m", "test: proof");
  } else {
    await writeFile(path.join(root, "app.ts"), "export const value = 1;\n");
    await git("add", "app.ts");
    await git("commit", "-m", "feat: behavior");
    if (kind === "merge_graph") {
      const source = await git("rev-parse", "HEAD");
      await git("switch", "-c", "docs-side", base);
      await writeFile(path.join(root, "GUIDE.md"), "# Side documentation\n");
      await git("add", "GUIDE.md");
      await git("commit", "-m", "docs: side");
      await git("switch", "main");
      expect(await git("rev-parse", "HEAD")).toBe(source);
      await git("merge", "--no-ff", "docs-side", "-m", "merge: histories");
    }
    await writeFile(path.join(root, "README.md"), "# Fixture\n\nCurrent behavior.\n");
    await git("add", "README.md");
    await git("commit", "-m", "docs: describe behavior", "-m", "Tailrocks-Skill: tailrocks-document");
    if (kind === "stale") {
      await writeFile(path.join(root, "README.md"), "# Fixture\n\nStale later edit.\n");
      await git("add", "README.md");
      await git("commit", "-m", "docs: later edit");
    } else {
      await writeFile(path.join(root, "app.test.ts"), "export {};\n");
      await git("add", "app.test.ts");
      await git("commit", "-m", "test: proof");
    }
  }
  return { root, base, head: await git("rev-parse", "HEAD") };
}

function host(root: string, base: string, head: string): CommandRunner {
  return async ({ command, cwd }) => {
    if (command[0] !== "gh") return execute(command, cwd);
    if (command[1] === "repo") return { code: 0, stdout: '{"nameWithOwner":"owner/repository"}', stderr: "" };
    if (command[1] === "pr" && command[2] === "view")
      return {
        code: 0,
        stdout: JSON.stringify({ number: 7, state: "OPEN", headRefOid: head, baseRefOid: base }),
        stderr: "",
      };
    if (command[1] === "pr" && command[2] === "checks")
      return {
        code: 0,
        stdout: JSON.stringify([
          {
            bucket: "pass",
            link: "https://github.com/check/1",
            name: "build",
            state: "SUCCESS",
            workflow: "ci",
          },
        ]),
        stderr: "",
      };
    return { code: 127, stdout: "", stderr: `unexpected hosting command in ${root}` };
  };
}

test("document check and full merge consume identical real-Git final-order truth", async () => {
  for (const [kind, status] of [
    ["covered", "pass"],
    ["stale", "blocked"],
    ["not_needed", "not_needed"],
    ["merge_graph", "pass"],
  ] as const) {
    const fixture = await history(kind);
    const runner = host(fixture.root, fixture.base, fixture.head);
    const document = await runDocumentationCheck(fixture.root, 7, { runner });
    const merge = await runMergePreflight({ root: fixture.root, pr: 7, noPoll: true }, { runner });
    expect(document.documentation?.status).toBe(status);
    expect(merge.documentation).toEqual(document.documentation);
    expect(document.documentation?.discovery.entries_scanned).toBeGreaterThan(0);
  }
});
