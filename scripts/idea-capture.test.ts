import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, realpath, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import type { CreatePrCommandRequest, CreatePrCommandResult } from "./create-pr";
import {
  captureIdea,
  ideaCaptureInputSchema,
  parseIdeaCaptureArguments,
  type IdeaCaptureRuntime,
} from "./idea-capture-core";

const slug = "capture-exact-idea";
const ok = (stdout = ""): CreatePrCommandResult => ({ code: 0, stdout, stderr: "" });
const fail = (stderr = "failed"): CreatePrCommandResult => ({ code: 1, stdout: "", stderr });
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

async function command(argv: readonly string[], cwd: string): Promise<string> {
  const child = Bun.spawn(argv, { cwd, stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code !== 0) throw new Error(stderr);
  return stdout.trim();
}

interface Fixture {
  root: string;
  git: string;
  base: string;
  input: ReturnType<typeof input>;
}

function input(base: string, indexSha: string | null = null) {
  return {
    schema: ideaCaptureInputSchema,
    repository: "fixture/repo",
    actor: "fixture",
    head_owner: "fixture",
    remote_name: "origin",
    remote_url: "https://github.com/fixture/repo.git",
    base_branch: "main",
    base_sha: base,
    title: "Capture exact idea",
    created: "2026-08-23",
    intent: "Preserve a raw idea without invention.",
    sections: {
      vocabulary: [],
      decisions: [],
      capabilities: ["Capture one item and one index row."],
      screens: [],
      flows: [],
      data_integrations: [],
      references: [],
      research: [],
      must_not: ["MUST NOT overwrite an existing item."],
      quality_bar: [],
      open_questions: ["Which details remain unknown?"],
      open_research_questions: [],
      deferred: [],
    },
    index_sha256: indexSha,
    additional_trailers: [],
  } as const;
}

async function fixture(): Promise<Fixture> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "idea-capture-")));
  const git = Bun.which("git");
  if (!git || !path.isAbsolute(git)) throw new Error("absolute git is required");
  await command([git, "init", "-b", "main"], root);
  await command([git, "config", "user.name", "Fixture"], root);
  await command([git, "config", "user.email", "fixture@example.test"], root);
  await writeFile(path.join(root, "base.txt"), "base\n");
  await command([git, "add", "base.txt"], root);
  await command([git, "commit", "-m", "base"], root);
  const base = await command([git, "rev-parse", "HEAD"], root);
  await command([git, "remote", "add", "origin", "https://github.com/fixture/repo.git"], root);
  return { root, git, base, input: input(base) };
}

function runtime(
  f: Fixture,
  mutate?: (request: CreatePrCommandRequest, count: number) => CreatePrCommandResult | undefined,
  actor = "fixture",
) {
  let pushed = "";
  let body = "";
  let count = 0;
  const commands: string[][] = [];
  const remoteRunner = async (request: CreatePrCommandRequest): Promise<CreatePrCommandResult> => {
    commands.push([...request.command]);
    const changed = mutate?.(request, count++);
    if (changed) return changed;
    const args = request.command;
    if (args[1] === "api" && args[2] === "user") return ok(`${actor}\n`);
    if (args[1] === "api" && args[2] === "repos/fixture/repo/git/ref/heads/main")
      return ok(JSON.stringify({ ref: "refs/heads/main", sha: f.base, type: "commit" }));
    if (args[1] === "api" && args[2] === "repos/fixture/repo/pulls") return ok("[[]]\n");
    if (args[1] === "push") {
      pushed = args.at(-1)!.split(":", 1)[0]!;
      return ok();
    }
    if (args[1] === "ls-remote") return ok(pushed ? `${pushed}\trefs/heads/roadmap/${slug}\n` : "");
    if (args[1] === "pr" && args[2] === "create") {
      body = Buffer.from(request.stdin ?? "").toString("utf8");
      return ok("https://github.com/fixture/repo/pull/7\n");
    }
    if (args[1] === "pr" && args[2] === "view")
      return ok(
        JSON.stringify({
          body,
          headRefName: `roadmap/${slug}`,
          headRefOid: pushed,
          baseRefName: "main",
          baseRefOid: f.base,
          url: "https://github.com/fixture/repo/pull/7",
          title: "docs(roadmap): Capture exact idea",
          isDraft: true,
          author: { login: actor },
          state: "OPEN",
        }),
      );
    return fail(`unexpected: ${args.join(" ")}`);
  };
  const gateRunner = async (request: CreatePrCommandRequest): Promise<CreatePrCommandResult> => {
    if (request.command[0] === process.execPath)
      return ok(JSON.stringify({ schema: "tailrocks.gate-proof/v1", units: 2 }));
    return ok();
  };
  return {
    commands,
    value: {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner,
      gateRunner,
    } satisfies IdeaCaptureRuntime,
  };
}

test("accepts only loader-bound exact capture arguments", () => {
  expect(parseIdeaCaptureArguments(["--skill-file", "/plugin/skills/tailrocks-idea/SKILL.md", slug])).toEqual(
    {
      skillFile: "/plugin/skills/tailrocks-idea/SKILL.md",
      slug,
    },
  );
  for (const args of [[slug], ["--skill-file", "relative", slug], ["--skill-file", "/x", "../bad"]])
    expect(() => parseIdeaCaptureArguments(args)).toThrow();
});

test("fresh repository capture creates branch before exact files, commit, push, and draft PR", async () => {
  const f = await fixture();
  const mock = runtime(f);
  const branchesAtDirectoryCreation: string[] = [];
  const result = await captureIdea(f.root, slug, f.input, {
    ...mock.value,
    afterDirectoryCreate: async () => {
      branchesAtDirectoryCreation.push(await command([f.git, "symbolic-ref", "--short", "HEAD"], f.root));
    },
  });
  expect(result).toMatchObject({
    outcome: "captured",
    code: "captured",
    slug,
    branch: `roadmap/${slug}`,
    pull_request: "https://github.com/fixture/repo/pull/7",
  });
  expect(branchesAtDirectoryCreation).toEqual([`roadmap/${slug}`, `roadmap/${slug}`]);
  expect(result.files).toEqual(["roadmap/README.md", `roadmap/${slug}/README.md`]);
  const itemBody = await readFile(path.join(f.root, "roadmap", slug, "README.md"), "utf8");
  expect(itemBody).toContain("- **Status**: DRAFT");
  expect(itemBody).toContain(`- **Slug**: ${slug}`);
  expect(itemBody).not.toContain("## Log");
  expect(await readFile(path.join(f.root, "roadmap", "README.md"), "utf8")).toContain(
    `| [${slug}](${slug}/README.md) | Capture exact idea | DRAFT | — |`,
  );
  expect(
    (await command([f.git, "show", "--format=", "--name-only", "HEAD"], f.root)).split("\n").sort(),
  ).toEqual(["roadmap/README.md", `roadmap/${slug}/README.md`]);
  expect(
    await command([f.git, "log", "-1", "--format=%(trailers:key=Tailrocks-Skill,valueonly)"], f.root),
  ).toBe("tailrocks-idea");
  const create = mock.commands.find((args) => args[1] === "pr" && args[2] === "create")!;
  expect(create).toContain("--draft");
  expect(create).not.toContain("--force");
});

test("existing roadmap bytes and rows are preserved while one canonical row is appended", async () => {
  const f = await fixture();
  const existing =
    "# Roadmap\n\n| Slug | Title | Status | Remaining |\n|------|-------|--------|-----------|\n| [other](other/README.md) | Other | DRAFT | — |\n";
  await mkdir(path.join(f.root, "roadmap", "other"), { recursive: true });
  await writeFile(path.join(f.root, "roadmap", "README.md"), existing);
  await writeFile(path.join(f.root, "roadmap", "other", "README.md"), "other\n");
  await command([f.git, "add", "roadmap"], f.root);
  await command([f.git, "commit", "-m", "roadmap base"], f.root);
  f.base = await command([f.git, "rev-parse", "HEAD"], f.root);
  f.input = input(f.base, sha256(existing));
  const mock = runtime(f);
  expect((await captureIdea(f.root, slug, f.input, mock.value)).outcome).toBe("captured");
  expect(await readFile(path.join(f.root, "roadmap", "README.md"), "utf8")).toBe(
    `${existing}| [${slug}](${slug}/README.md) | Capture exact idea | DRAFT | — |\n`,
  );
  expect(await readFile(path.join(f.root, "roadmap", "other", "README.md"), "utf8")).toBe("other\n");
});

test("same-repository head with a non-owner actor captures and opens the draft PR", async () => {
  const f = await fixture();
  const input = { ...f.input, actor: "collaborator" };
  const mock = runtime(f, undefined, "collaborator");
  const receipt = await captureIdea(f.root, slug, input, mock.value);
  expect(receipt.outcome).toBe("captured");
  expect(receipt.code).toBe("captured");
});

test("invalid payload, dirty tree, collisions, and stale index refuse before capture writes", async () => {
  const invalid = await fixture();
  const invalidMock = runtime(invalid);
  expect((await captureIdea(invalid.root, "../bad", invalid.input, invalidMock.value)).code).toBe(
    "invalid_input",
  );
  expect(invalidMock.commands).toHaveLength(0);

  const dirty = await fixture();
  await writeFile(path.join(dirty.root, "dirty.txt"), "dirty\n");
  const dirtyMock = runtime(dirty);
  expect((await captureIdea(dirty.root, slug, dirty.input, dirtyMock.value)).code).toBe("unsafe_repository");
  expect(dirtyMock.commands).toHaveLength(0);

  for (const setup of ["item", "stale-index", "local-branch"] as const) {
    const f = await fixture();
    if (setup === "item") {
      await mkdir(path.join(f.root, "roadmap", slug), { recursive: true });
      await writeFile(path.join(f.root, "roadmap", slug, "README.md"), "collision\n");
      const emptyIndex =
        "# Roadmap\n\n| Slug | Title | Status | Remaining |\n|------|-------|--------|-----------|\n";
      await writeFile(path.join(f.root, "roadmap", "README.md"), emptyIndex);
      await command([f.git, "add", "roadmap"], f.root);
      await command([f.git, "commit", "-m", "existing item"], f.root);
      f.base = await command([f.git, "rev-parse", "HEAD"], f.root);
      f.input = input(f.base, sha256(emptyIndex));
    }
    if (setup === "stale-index") {
      await mkdir(path.join(f.root, "roadmap"));
      await writeFile(path.join(f.root, "roadmap", "README.md"), "changed\n");
      await command([f.git, "add", "roadmap/README.md"], f.root);
      await command([f.git, "commit", "-m", "changed index"], f.root);
      f.base = await command([f.git, "rev-parse", "HEAD"], f.root);
      f.input = input(f.base, "0".repeat(64));
    }
    if (setup === "local-branch") await command([f.git, "branch", `roadmap/${slug}`], f.root);
    const mock = runtime(f);
    const before = await command([f.git, "status", "--porcelain=v1", "--untracked-files=all"], f.root);
    const result = await captureIdea(f.root, slug, f.input, mock.value);
    expect(result.outcome).toBe("refused");
    expect(await command([f.git, "status", "--porcelain=v1", "--untracked-files=all"], f.root)).toBe(before);
    expect(mock.commands.some((args) => args[1] === "push")).toBe(false);
  }
});

test("remote branch or PR collision refuses before local branch and files", async () => {
  for (const collision of ["branch", "pr"] as const) {
    const f = await fixture();
    const mock = runtime(f, (request) => {
      const args = request.command;
      if (collision === "branch" && args[1] === "ls-remote")
        return ok(`${f.base}\trefs/heads/roadmap/${slug}\n`);
      if (collision === "pr" && args[1] === "api" && args[2] === "repos/fixture/repo/pulls")
        return ok('[[{"number":7}]]');
      return undefined;
    });
    const result = await captureIdea(f.root, slug, f.input, mock.value);
    expect(result.outcome).toBe("refused");
    expect(await command([f.git, "branch", "--list", `roadmap/${slug}`], f.root)).toBe("");
    expect(await Bun.file(path.join(f.root, "roadmap", slug, "README.md")).exists()).toBe(false);
  }
});

test("atomic publication failure restores index and cleans only owned directories", async () => {
  const f = await fixture();
  await mkdir(path.join(f.root, "roadmap"));
  const existing =
    "# Roadmap\n\n| Slug | Title | Status | Remaining |\n|------|-------|--------|-----------|\n";
  await writeFile(path.join(f.root, "roadmap", "README.md"), existing);
  await command([f.git, "add", "roadmap/README.md"], f.root);
  await command([f.git, "commit", "-m", "empty roadmap"], f.root);
  f.base = await command([f.git, "rev-parse", "HEAD"], f.root);
  f.input = input(f.base, sha256(existing));
  const mock = runtime(f);
  const result = await captureIdea(f.root, slug, f.input, {
    ...mock.value,
    atomic: {
      afterPublish: async () => {
        throw new Error("injected failure");
      },
    },
  });
  expect(result.outcome).toBe("refused");
  expect(await readFile(path.join(f.root, "roadmap", "README.md"), "utf8")).toBe(existing);
  expect(await Bun.file(path.join(f.root, "roadmap", slug, "README.md")).exists()).toBe(false);
  expect(await command([f.git, "rev-parse", "--abbrev-ref", "HEAD"], f.root)).toBe("main");
  expect(await command([f.git, "branch", "--list", `roadmap/${slug}`], f.root)).toBe("");
});

test("symlinked roadmap and branch creation race refuse without outside writes", async () => {
  const linked = await fixture();
  const outside = await realpath(await mkdtemp(path.join(tmpdir(), "idea-outside-")));
  await symlink(outside, path.join(linked.root, "roadmap"));
  const linkedMock = runtime(linked);
  expect((await captureIdea(linked.root, slug, linked.input, linkedMock.value)).outcome).toBe("refused");
  expect(await Bun.file(path.join(outside, "README.md")).exists()).toBe(false);

  const raced = await fixture();
  const racedMock = runtime(raced);
  const result = await captureIdea(raced.root, slug, raced.input, {
    ...racedMock.value,
    afterPreflight: async () => {
      await command([raced.git, "branch", `roadmap/${slug}`], raced.root);
    },
  });
  expect(result.outcome).toBe("refused");
  expect(await Bun.file(path.join(raced.root, "roadmap", slug, "README.md")).exists()).toBe(false);

  const swapped = await fixture();
  const swappedOutside = await realpath(await mkdtemp(path.join(tmpdir(), "idea-swapped-outside-")));
  const moved = path.join(swapped.root, "moved-roadmap");
  const swappedMock = runtime(swapped);
  const swappedResult = await captureIdea(swapped.root, slug, swapped.input, {
    ...swappedMock.value,
    afterDirectoryCreate: async (directory) => {
      if (directory !== path.join(swapped.root, "roadmap")) return;
      await command(["/bin/mv", directory, moved], swapped.root);
      await symlink(swappedOutside, directory);
    },
  });
  expect(swappedResult).toMatchObject({
    outcome: "recovery_required",
    recovery_artifacts: [`refs/heads/roadmap/${slug}`],
  });
  expect(await Bun.file(path.join(swappedOutside, slug, "README.md")).exists()).toBe(false);
});

test("commit and PR uncertainty retain one exact local recovery lane without duplicate remote creation", async () => {
  const commitFailure = await fixture();
  const commitMock = runtime(commitFailure);
  const runner = async (request: CreatePrCommandRequest): Promise<CreatePrCommandResult> => {
    if (request.command[1] === "commit") return fail("commit refused");
    const child = Bun.spawn(request.command, {
      cwd: request.cwd,
      stdin: request.stdin,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    return { code, stdout, stderr };
  };
  const failed = await captureIdea(commitFailure.root, slug, commitFailure.input, {
    ...commitMock.value,
    runner,
  });
  expect(failed).toMatchObject({ outcome: "recovery_required", code: "git_failed" });
  expect(failed.commit).toBe("");
  expect(failed.recovery_artifacts).toEqual([`local:refs/heads/roadmap/${slug}:uncommitted`]);
  expect(commitMock.commands.some((args) => args[1] === "push")).toBe(false);
  expect(await command([commitFailure.git, "rev-parse", "--abbrev-ref", "HEAD"], commitFailure.root)).toBe(
    `roadmap/${slug}`,
  );

  const prFailure = await fixture();
  const prMock = runtime(prFailure, (request) => {
    if (request.command[1] !== "pr" || request.command[2] !== "create") return undefined;
    return { ...fail("reply lost"), timedOut: true };
  });
  const uncertain = await captureIdea(prFailure.root, slug, prFailure.input, prMock.value);
  expect(uncertain).toMatchObject({ outcome: "recovery_required", code: "publication_failed" });
  expect(uncertain.commit).toMatch(/^[a-f0-9]{40}$/);
  expect(uncertain.external_actions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: "remote_ref", outcome: "success", proof: uncertain.commit }),
      expect.objectContaining({ kind: "create", outcome: "uncertain" }),
    ]),
  );
  expect(uncertain.recovery_artifacts).toEqual(
    expect.arrayContaining([
      `local:refs/heads/roadmap/${slug}@${uncertain.commit}`,
      `remote:https://github.com/fixture/repo.git#refs/heads/roadmap/${slug}@${uncertain.commit}`,
      `pull_request:fixture/repo:fixture:roadmap/${slug}:unproven`,
    ]),
  );
  expect(prMock.commands.filter((args) => args[1] === "pr" && args[2] === "create")).toHaveLength(1);
  expect(await command([prFailure.git, "status", "--porcelain=v1"], prFailure.root)).toBe("");

  const absentRemote = await fixture();
  const absentMock = runtime(absentRemote, (request) =>
    request.command[1] === "push" ? fail("push refused") : undefined,
  );
  const absent = await captureIdea(absentRemote.root, slug, absentRemote.input, absentMock.value);
  expect(absent).toMatchObject({ outcome: "recovery_required", code: "publication_failed" });
  expect(absent.external_actions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: "push", outcome: "uncertain" }),
      expect.objectContaining({ kind: "remote_ref", outcome: "success", proof: "absent" }),
    ]),
  );
  expect(absent.recovery_artifacts).toEqual([`local:refs/heads/roadmap/${slug}@${absent.commit}`]);
});

test("installed CLI emits one refusal receipt and symlink lookalikes fail identity", async () => {
  const sourceRoot = path.resolve(import.meta.dir, "..");
  for (const linked of [false, true]) {
    const root = await realpath(await mkdtemp(path.join(tmpdir(), "idea-installed-")));
    await mkdir(path.join(root, "scripts"));
    await mkdir(path.join(root, "skills", "tailrocks-idea"), { recursive: true });
    for (const name of [
      "idea-capture-core.ts",
      "atomic-file-transaction.ts",
      "bounded-command.ts",
      "create-pr.ts",
      "resolve-executable.ts",
      "roadmap-item-state.ts",
    ])
      await cp(path.join(sourceRoot, "scripts", name), path.join(root, "scripts", name));
    const entrypoint = path.join(root, "scripts", "idea-capture.ts");
    if (linked) await symlink(path.join(sourceRoot, "scripts", "idea-capture.ts"), entrypoint);
    else await cp(path.join(sourceRoot, "scripts", "idea-capture.ts"), entrypoint);
    const skillFile = path.join(root, "skills", "tailrocks-idea", "SKILL.md");
    await writeFile(skillFile, "# Installed\n");
    const child = Bun.spawn([process.execPath, entrypoint, "--skill-file", skillFile, slug], {
      cwd: root,
      stdin: new Blob(["{}"]),
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(child.stdout).text();
    expect(await child.exited).toBe(2);
    expect(stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(stdout)).toMatchObject({ schema: "tailrocks.idea-capture/v1", code: "invalid_input" });
  }
});

test("loader refusal happens before any local helper module executes", async () => {
  const sourceRoot = path.resolve(import.meta.dir, "..");
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "idea-bootstrap-")));
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "skills", "tailrocks-idea"), { recursive: true });
  const entrypoint = path.join(root, "scripts", "idea-capture.ts");
  await cp(path.join(sourceRoot, "scripts", "idea-capture.ts"), entrypoint);
  await writeFile(path.join(root, "skills", "tailrocks-idea", "SKILL.md"), "# Installed\n");
  const marker = path.join(root, "helper-executed");
  await writeFile(
    path.join(root, "scripts", "idea-capture-core.ts"),
    `await Bun.write(${JSON.stringify(marker)}, "executed");\n`,
  );
  const child = Bun.spawn(
    [process.execPath, entrypoint, "--skill-file", path.join(root, "wrong", "SKILL.md"), slug],
    { cwd: root, stdin: new Blob(["{}"]), stdout: "pipe", stderr: "pipe" },
  );
  const stdout = await new Response(child.stdout).text();
  expect(await child.exited).toBe(2);
  expect(JSON.parse(stdout)).toMatchObject({ code: "invalid_input" });
  expect(await Bun.file(marker).exists()).toBe(false);
});
