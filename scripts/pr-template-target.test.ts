import { afterEach, expect, test } from "bun:test";
import {
  cp,
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { requestSchema, runPrTemplateTarget } from "./pr-template-target-core";

const roots: string[] = [];

function shell(root: string, command: readonly string[]): string {
  const result = Bun.spawnSync(command, {
    cwd: root,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Template Test",
      GIT_AUTHOR_EMAIL: "template@test.invalid",
      GIT_COMMITTER_NAME: "Template Test",
      GIT_COMMITTER_EMAIL: "template@test.invalid",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}

async function repository(): Promise<{ root: string; head: string }> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-pr-template-")));
  roots.push(root);
  shell(root, ["/usr/bin/git", "init", "-q"]);
  await writeFile(path.join(root, "README.md"), "# Demo\n");
  shell(root, ["/usr/bin/git", "add", "."]);
  shell(root, ["/usr/bin/git", "commit", "-qm", "initial"]);
  return { root, head: shell(root, ["/usr/bin/git", "rev-parse", "HEAD"]) };
}

async function stagedPackage(): Promise<{ root: string; entry: string; skill: string }> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-pr-template-package-")));
  roots.push(root);
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "skills/tailrocks-pr-template/references"), { recursive: true });
  for (const name of [
    "pr-template-target.ts",
    "pr-template-target-core.ts",
    "atomic-file-transaction.ts",
    "bounded-command.ts",
    "resolve-executable.ts",
  ])
    await copyFile(path.join(import.meta.dir, name), path.join(root, "scripts", name));
  await copyFile(
    path.join(import.meta.dir, "../skills/tailrocks-pr-template/SKILL.md"),
    path.join(root, "skills/tailrocks-pr-template/SKILL.md"),
  );
  await copyFile(
    path.join(import.meta.dir, "../skills/tailrocks-pr-template/references/PULL_REQUEST_TEMPLATE.md"),
    path.join(root, "skills/tailrocks-pr-template/references/PULL_REQUEST_TEMPLATE.md"),
  );
  return {
    root,
    entry: path.join(root, "scripts/pr-template-target.ts"),
    skill: path.join(root, "skills/tailrocks-pr-template/SKILL.md"),
  };
}

function resolveInput(repo: { root: string; head: string }) {
  return { schema: requestSchema, operation: "resolve", root: repo.root, expected_head: repo.head };
}

async function resolve(repo: { root: string; head: string }) {
  return await runPrTemplateTarget(resolveInput(repo));
}

afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

test("absent layout resolves the sole house target without writing", async () => {
  const repo = await repository();
  expect(await resolve(repo)).toMatchObject({
    outcome: "RESOLVED",
    disposition: "CREATE",
    target: ".github/PULL_REQUEST_TEMPLATE.md",
    before_sha256: null,
    mutations: [],
  });
  expect(await Bun.file(path.join(repo.root, ".github/PULL_REQUEST_TEMPLATE.md")).exists()).toBe(false);
});

test.each([
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/pull_request_template.MD",
  "docs/PULL_REQUEST_TEMPLATE.md",
  "pull_request_template.md",
  ".github/PULL_REQUEST_TEMPLATE/feature.md",
])("one existing supported default remains the exact update target: %s", async (target) => {
  const repo = await repository();
  await mkdir(path.dirname(path.join(repo.root, target)), { recursive: true });
  await writeFile(path.join(repo.root, target), "old\n");
  expect(await resolve(repo)).toMatchObject({ disposition: "UPDATE", target });
});

test("unsupported text and root directory layouts do not replace the sole house target", async () => {
  for (const inert of [
    ".github/PULL_REQUEST_TEMPLATE.txt",
    "PULL_REQUEST_TEMPLATE/feature.md",
    "docs/PULL_REQUEST_TEMPLATE/feature.md",
  ]) {
    const repo = await repository();
    await mkdir(path.dirname(path.join(repo.root, inert)), { recursive: true });
    await writeFile(path.join(repo.root, inert), "inert\n");
    expect(await resolve(repo)).toMatchObject({
      disposition: "CREATE",
      target: ".github/PULL_REQUEST_TEMPLATE.md",
    });
  }
});

test("ambiguous defaults and multi-template-only layouts refuse", async () => {
  const ambiguous = await repository();
  await mkdir(path.join(ambiguous.root, "docs"));
  await writeFile(path.join(ambiguous.root, "PULL_REQUEST_TEMPLATE.md"), "root\n");
  await writeFile(path.join(ambiguous.root, "docs/pull_request_template.md"), "docs\n");
  await expect(resolve(ambiguous)).rejects.toThrow("ambiguous pull request templates");

  const multiple = await repository();
  await mkdir(path.join(multiple.root, ".github/PULL_REQUEST_TEMPLATE"), { recursive: true });
  await writeFile(path.join(multiple.root, ".github/PULL_REQUEST_TEMPLATE/feature.md"), "feature\n");
  await writeFile(path.join(multiple.root, ".github/PULL_REQUEST_TEMPLATE/fix.md"), "fix\n");
  await expect(resolve(multiple)).rejects.toThrow("ambiguous pull request templates");
});

test("publish creates or updates exactly the resolved target", async () => {
  for (const existing of [null, "docs/PULL_REQUEST_TEMPLATE.md"] as const) {
    const repo = await repository();
    if (existing) {
      await mkdir(path.join(repo.root, "docs"));
      await writeFile(path.join(repo.root, existing), "old\n");
    }
    const resolution = await resolve(repo);
    const content = "## Summary\n\nDescribe the change.\n";
    const receipt = await runPrTemplateTarget({
      schema: requestSchema,
      operation: "publish",
      root: repo.root,
      expected_head: repo.head,
      resolution_binding: resolution.resolution_binding,
      target: resolution.target,
      before_sha256: resolution.before_sha256,
      parent_existed: resolution.parent_existed,
      content,
      content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
    });
    expect(receipt).toMatchObject({ outcome: "PUBLISHED", mutations: [resolution.target] });
    expect(await readFile(path.join(repo.root, resolution.target as string), "utf8")).toBe(content);
    const defaults = [
      ".github/PULL_REQUEST_TEMPLATE.md",
      "docs/PULL_REQUEST_TEMPLATE.md",
      "PULL_REQUEST_TEMPLATE.md",
    ];
    const count = (
      await Promise.all(defaults.map((target) => Bun.file(path.join(repo.root, target)).exists()))
    ).filter(Boolean).length;
    expect(count).toBe(1);
  }
});

test("publication refuses stale resolution and concurrent replacement", async () => {
  const repo = await repository();
  await mkdir(path.join(repo.root, "docs"));
  await writeFile(path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md"), "old\n");
  const resolution = await resolve(repo);
  const content = "new\n";
  await expect(
    runPrTemplateTarget(
      {
        schema: requestSchema,
        operation: "publish",
        root: repo.root,
        expected_head: repo.head,
        resolution_binding: resolution.resolution_binding,
        target: resolution.target,
        before_sha256: resolution.before_sha256,
        parent_existed: resolution.parent_existed,
        content,
        content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
      },
      {
        afterResolve: async () =>
          await writeFile(path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md"), "raced\n"),
      },
    ),
  ).rejects.toThrow("target resolution changed before publication");
  expect(await readFile(path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md"), "utf8")).toBe("raced\n");
});

test("resolve receipt binds target parent and repository identities across publication", async () => {
  const content = "new\n";
  for (const race of ["target", "parent", "root"] as const) {
    const repo = await repository();
    await mkdir(path.join(repo.root, "docs"));
    const target = path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md");
    await writeFile(target, "old\n");
    const resolution = await resolve(repo);
    if (race === "target") {
      const sibling = path.join(repo.root, "docs/replacement.md");
      await writeFile(sibling, "old\n");
      await rename(sibling, target);
    } else if (race === "parent") {
      await rename(path.join(repo.root, "docs"), path.join(repo.root, "docs-original"));
      await mkdir(path.join(repo.root, "docs"));
      await writeFile(target, "old\n");
    } else {
      const original = `${repo.root}-original`;
      await rename(repo.root, original);
      roots.push(original);
      await cp(original, repo.root, { recursive: true });
    }
    const before = await lstat(target);
    await expect(
      runPrTemplateTarget({
        schema: requestSchema,
        operation: "publish",
        root: repo.root,
        expected_head: repo.head,
        resolution_binding: resolution.resolution_binding,
        target: resolution.target,
        before_sha256: resolution.before_sha256,
        parent_existed: resolution.parent_existed,
        content,
        content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
      }),
    ).rejects.toThrow("target resolution changed");
    const after = await lstat(target);
    expect({ dev: after.dev, ino: after.ino }).toEqual({ dev: before.dev, ino: before.ino });
    expect(await readFile(target, "utf8")).toBe("old\n");
  }
});

test("content validation rejects executable placeholders and preserves guidance placeholders", async () => {
  const repo = await repository();
  const resolution = await resolve(repo);
  const publish = (content: string) =>
    runPrTemplateTarget({
      schema: requestSchema,
      operation: "publish",
      root: repo.root,
      expected_head: repo.head,
      resolution_binding: resolution.resolution_binding,
      target: resolution.target,
      before_sha256: resolution.before_sha256,
      parent_existed: resolution.parent_existed,
      content,
      content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
    });
  await expect(publish("```sh\n<test command>\n```\n")).rejects.toThrow("placeholder command");
  const base = await readFile(
    path.join(import.meta.dir, "../skills/tailrocks-pr-template/references/PULL_REQUEST_TEMPLATE.md"),
    "utf8",
  );
  await expect(publish(base)).rejects.toThrow("untailored base template");
  const guidance = "## Summary\n\n<Describe the user-visible change.>\n";
  expect(await publish(guidance)).toMatchObject({ outcome: "PUBLISHED" });

  const update = await resolve(repo);
  expect(
    await runPrTemplateTarget({
      schema: requestSchema,
      operation: "publish",
      root: repo.root,
      expected_head: repo.head,
      resolution_binding: update.resolution_binding,
      target: update.target,
      before_sha256: update.before_sha256,
      parent_existed: update.parent_existed,
      content: guidance,
      content_sha256: new Bun.CryptoHasher("sha256").update(guidance).digest("hex"),
    }),
  ).toMatchObject({ outcome: "UNCHANGED", mutations: [] });
});

test("HEAD drift and candidate appearance refuse before publication", async () => {
  for (const race of ["head", "candidate"] as const) {
    const repo = await repository();
    const resolution = await resolve(repo);
    const content = "new\n";
    await expect(
      runPrTemplateTarget(
        {
          schema: requestSchema,
          operation: "publish",
          root: repo.root,
          expected_head: repo.head,
          resolution_binding: resolution.resolution_binding,
          target: resolution.target,
          before_sha256: resolution.before_sha256,
          parent_existed: resolution.parent_existed,
          content,
          content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
        },
        {
          afterResolve: async () => {
            if (race === "head") {
              await writeFile(path.join(repo.root, "README.md"), "# Changed\n");
              shell(repo.root, ["/usr/bin/git", "add", "README.md"]);
              shell(repo.root, ["/usr/bin/git", "commit", "-qm", "race"]);
            } else {
              await writeFile(path.join(repo.root, "PULL_REQUEST_TEMPLATE.md"), "raced\n");
            }
          },
        },
      ),
    ).rejects.toThrow(race === "head" ? "repository identity changed" : "target resolution changed");
    expect(await Bun.file(path.join(repo.root, resolution.target)).exists()).toBe(false);
  }
});

test("post-publication proof failure restores exact existing bytes", async () => {
  for (const race of ["head", "target"] as const) {
    const repo = await repository();
    await mkdir(path.join(repo.root, "docs"));
    const target = path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md");
    await writeFile(target, "old\n");
    const resolution = await resolve(repo);
    const content = "new\n";
    await expect(
      runPrTemplateTarget(
        {
          schema: requestSchema,
          operation: "publish",
          root: repo.root,
          expected_head: repo.head,
          resolution_binding: resolution.resolution_binding,
          target: resolution.target,
          before_sha256: resolution.before_sha256,
          parent_existed: resolution.parent_existed,
          content,
          content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
        },
        {
          atomic: {
            afterPublish: async () => {
              if (race === "head") {
                await writeFile(path.join(repo.root, "README.md"), "# Changed\n");
                shell(repo.root, ["/usr/bin/git", "add", "README.md"]);
                shell(repo.root, ["/usr/bin/git", "commit", "-qm", "race"]);
              } else {
                await unlink(target);
                await writeFile(target, "concurrent\n");
              }
            },
          },
        },
      ),
    ).rejects.toThrow();
    if (race === "head") expect(await readFile(target, "utf8")).toBe("old\n");
    else {
      expect(await readFile(target, "utf8")).toBe("concurrent\n");
      expect((await readdir(path.dirname(target))).some((name) => name.includes(".tailrocks-"))).toBe(true);
    }
  }
});

test("same-content target and parent replacement cannot masquerade as publication", async () => {
  for (const race of ["target", "parent"] as const) {
    const repo = await repository();
    await mkdir(path.join(repo.root, "docs"));
    const target = path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md");
    await writeFile(target, "old\n");
    const resolution = await resolve(repo);
    const content = "new\n";
    let replacement: { dev: number; ino: number } | null = null;
    await expect(
      runPrTemplateTarget(
        {
          schema: requestSchema,
          operation: "publish",
          root: repo.root,
          expected_head: repo.head,
          resolution_binding: resolution.resolution_binding,
          target: resolution.target,
          before_sha256: resolution.before_sha256,
          parent_existed: resolution.parent_existed,
          content,
          content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
        },
        {
          atomic: {
            afterPublish: async () => {
              if (race === "target") {
                const sibling = path.join(path.dirname(target), "replacement.md");
                await writeFile(sibling, content);
                await rename(sibling, target);
              } else {
                await rename(path.dirname(target), `${path.dirname(target)}-original`);
                await mkdir(path.dirname(target));
                await writeFile(target, content);
              }
              const info = await lstat(target);
              replacement = { dev: info.dev, ino: info.ino };
            },
          },
        },
      ),
    ).rejects.toThrow();
    const current = await lstat(target);
    expect({ dev: current.dev, ino: current.ino }).toEqual(replacement);
    expect(await readFile(target, "utf8")).toBe(content);
  }
});

test("directory identity swaps refuse without mutating replacement trees", async () => {
  const existing = await repository();
  await mkdir(path.join(existing.root, "docs"));
  await writeFile(path.join(existing.root, "docs/PULL_REQUEST_TEMPLATE.md"), "old\n");
  const existingResolution = await resolve(existing);
  const content = "new\n";
  await expect(
    runPrTemplateTarget(
      {
        schema: requestSchema,
        operation: "publish",
        root: existing.root,
        expected_head: existing.head,
        resolution_binding: existingResolution.resolution_binding,
        target: existingResolution.target,
        before_sha256: existingResolution.before_sha256,
        parent_existed: existingResolution.parent_existed,
        content,
        content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
      },
      {
        afterResolve: async () => {
          await rename(path.join(existing.root, "docs"), path.join(existing.root, "docs-original"));
          await mkdir(path.join(existing.root, "docs"));
          await writeFile(path.join(existing.root, "docs/PULL_REQUEST_TEMPLATE.md"), "old\n");
        },
      },
    ),
  ).rejects.toThrow("target resolution changed");
  expect(await readFile(path.join(existing.root, "docs/PULL_REQUEST_TEMPLATE.md"), "utf8")).toBe("old\n");

  const absent = await repository();
  const absentResolution = await resolve(absent);
  await expect(
    runPrTemplateTarget(
      {
        schema: requestSchema,
        operation: "publish",
        root: absent.root,
        expected_head: absent.head,
        resolution_binding: absentResolution.resolution_binding,
        target: absentResolution.target,
        before_sha256: absentResolution.before_sha256,
        parent_existed: absentResolution.parent_existed,
        content,
        content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
      },
      {
        afterDirectoryCreate: async (directory) => {
          await rename(directory, `${directory}-original`);
          await mkdir(directory);
        },
      },
    ),
  ).rejects.toThrow();
  expect(await Bun.file(path.join(absent.root, ".github/PULL_REQUEST_TEMPLATE.md")).exists()).toBe(false);
});

test("UNCHANGED revalidates repository and target identity", async () => {
  const repo = await repository();
  await mkdir(path.join(repo.root, "docs"));
  const target = path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md");
  const content = "current\n";
  await writeFile(target, content);
  const resolution = await resolve(repo);
  await expect(
    runPrTemplateTarget(
      {
        schema: requestSchema,
        operation: "publish",
        root: repo.root,
        expected_head: repo.head,
        resolution_binding: resolution.resolution_binding,
        target: resolution.target,
        before_sha256: resolution.before_sha256,
        parent_existed: resolution.parent_existed,
        content,
        content_sha256: resolution.before_sha256!,
      },
      {
        afterResolve: async () => {
          await unlink(target);
          await writeFile(target, content);
        },
      },
    ),
  ).rejects.toThrow("target resolution changed");
});

test("non-regular candidate refuses", async () => {
  const repo = await repository();
  shell(repo.root, ["/usr/bin/mkfifo", "PULL_REQUEST_TEMPLATE.md"]);
  await expect(resolve(repo)).rejects.toThrow("unsafe");
});

test("unsafe exact multi-template route refuses instead of creating a default", async () => {
  for (const kind of ["symlink", "fifo"] as const) {
    const repo = await repository();
    await mkdir(path.join(repo.root, ".github"));
    const route = path.join(repo.root, ".github/PULL_REQUEST_TEMPLATE");
    if (kind === "symlink") {
      await mkdir(path.join(repo.root, "outside-templates"));
      await symlink("../outside-templates", route);
    } else shell(repo.root, ["/usr/bin/mkfifo", route]);
    await expect(resolve(repo)).rejects.toThrow("template directory is unsafe");
    expect(await Bun.file(path.join(repo.root, ".github/PULL_REQUEST_TEMPLATE.md")).exists()).toBe(false);
  }
});

test("symlink targets and parent races refuse without outside writes", async () => {
  const repo = await repository();
  const outside = path.join(repo.root, "outside.md");
  await writeFile(outside, "outside\n");
  await mkdir(path.join(repo.root, "docs"));
  await symlink("../outside.md", path.join(repo.root, "docs/PULL_REQUEST_TEMPLATE.md"));
  await expect(resolve(repo)).rejects.toThrow("unsafe");
  expect(await readFile(outside, "utf8")).toBe("outside\n");

  const absent = await repository();
  const resolution = await resolve(absent);
  const content = "new\n";
  await expect(
    runPrTemplateTarget(
      {
        schema: requestSchema,
        operation: "publish",
        root: absent.root,
        expected_head: absent.head,
        resolution_binding: resolution.resolution_binding,
        target: resolution.target,
        before_sha256: null,
        parent_existed: resolution.parent_existed,
        content,
        content_sha256: new Bun.CryptoHasher("sha256").update(content).digest("hex"),
      },
      { afterResolve: async () => await mkdir(path.join(absent.root, ".github")) },
    ),
  ).rejects.toThrow();
  expect(await Bun.file(path.join(absent.root, ".github/PULL_REQUEST_TEMPLATE.md")).exists()).toBe(false);
});

test("installed loader refuses the wrong owner before importing core", async () => {
  const child = Bun.spawnSync(
    [
      process.execPath,
      path.join(import.meta.dir, "pr-template-target.ts"),
      "--skill-file",
      path.join(import.meta.dir, "../skills/tailrocks-plan/SKILL.md"),
    ],
    { stdin: Buffer.from("{}"), stdout: "pipe", stderr: "pipe" },
  );
  expect(child.exitCode).toBe(2);
  expect(child.stdout.toString()).toContain("not bound");
});

test("installed loader resolves through its bound package", async () => {
  const repo = await repository();
  const child = Bun.spawnSync(
    [
      process.execPath,
      path.join(import.meta.dir, "pr-template-target.ts"),
      "--skill-file",
      path.join(import.meta.dir, "../skills/tailrocks-pr-template/SKILL.md"),
    ],
    {
      stdin: Buffer.from(JSON.stringify(resolveInput(repo))),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  expect(child.exitCode).toBe(0);
  expect(JSON.parse(child.stdout.toString())).toMatchObject({
    outcome: "RESOLVED",
    target: ".github/PULL_REQUEST_TEMPLATE.md",
  });
});

test("staged installed package binds every executable dependency before import", async () => {
  const repo = await repository();
  const staged = await stagedPackage();
  const invoke = (skill = staged.skill) =>
    Bun.spawnSync([process.execPath, staged.entry, "--skill-file", skill], {
      stdin: Buffer.from(JSON.stringify(resolveInput(repo))),
      stdout: "pipe",
      stderr: "pipe",
    });
  const positive = invoke();
  expect(positive.exitCode).toBe(0);
  expect(JSON.parse(positive.stdout.toString())).toMatchObject({ outcome: "RESOLVED" });

  const wrong = path.join(staged.root, "skills/wrong/SKILL.md");
  await mkdir(path.dirname(wrong), { recursive: true });
  await writeFile(wrong, "wrong\n");
  expect(invoke(wrong).exitCode).toBe(2);

  const core = path.join(staged.root, "scripts/pr-template-target-core.ts");
  await unlink(core);
  await symlink(path.join(import.meta.dir, "pr-template-target-core.ts"), core);
  const unsafe = invoke();
  expect(unsafe.exitCode).toBe(2);
  expect(unsafe.stdout.toString()).toContain("package is unsafe");
});

test("staged public refusal formatter preserves exact recovery state", async () => {
  const staged = await stagedPackage();
  const module = (await import(staged.entry)) as {
    refusalReceipt(error: unknown): Record<string, unknown>;
  };
  const error = new Error("retained") as Error & {
    mutations: string[];
    recoveryArtifacts: string[];
  };
  error.mutations = ["target.md", "target.md"];
  error.recoveryArtifacts = ["/recovery/b", "/recovery/a", "/recovery/a"];
  expect(module.refusalReceipt(error)).toEqual({
    schema: "tailrocks.pr-template-target/v1",
    outcome: "REFUSED",
    mutations: ["target.md"],
    recovery_artifacts: ["/recovery/a", "/recovery/b"],
    detail: "retained",
  });
});
