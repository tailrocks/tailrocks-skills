import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { lstat, mkdtemp, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createPrInputSchema,
  createPullRequest,
  gateProofSchema,
  type CreatePrCommandRequest,
  type CreatePrCommandResult,
} from "./create-pr";

const ok = (stdout = ""): CreatePrCommandResult => ({ code: 0, stdout, stderr: "" });
const fail = (stderr = "failed"): CreatePrCommandResult => ({ code: 1, stdout: "", stderr });

interface Fixture {
  root: string;
  body: string;
  base: string;
  head: string;
  git: string;
  input: Record<string, unknown>;
}

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

async function fixture(): Promise<Fixture> {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "create-pr-")));
  const root = path.join(parent, "repo");
  await command(["/bin/mkdir", root], parent);
  const git = Bun.which("git");
  if (!git || !path.isAbsolute(git)) throw new Error("absolute git is required");
  const canonicalGit = await realpath(git);
  const runGit = (...args: string[]) => command([canonicalGit, ...args], root);
  await runGit("init", "-b", "main");
  await writeFile(path.join(root, "work.txt"), "base\n");
  await runGit("add", "work.txt");
  await runGit("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-m", "base");
  const base = await runGit("rev-parse", "HEAD");
  await runGit("switch", "-c", "feature/work");
  await writeFile(path.join(root, "work.txt"), "feature\n");
  await writeFile(path.join(root, ".gitattributes"), "*.txt filter=evil\n");
  await runGit("add", "work.txt", ".gitattributes");
  await runGit(
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.test",
    "commit",
    "-m",
    "feat: work",
    "-m",
    "Signed-off-by: Fixture <fixture@example.test>\nCo-authored-by: Codex <codex@openai.com>",
  );
  const head = await runGit("rev-parse", "HEAD");
  await runGit("remote", "add", "origin", "https://github.com/fixture/repo.git");
  const body = path.join(parent, "body.md");
  const bodyText = "## Summary\n\nCreate exact behavior.\n";
  await writeFile(body, bodyText);
  return {
    root,
    body,
    base,
    head,
    git: canonicalGit,
    input: {
      schema: createPrInputSchema,
      repo_root: root,
      repository: "owner/repo",
      actor: "fixture",
      head_owner: "fixture",
      remote_name: "origin",
      remote_url: "https://github.com/fixture/repo.git",
      base_branch: "main",
      base_sha: base,
      head_branch: "feature/work",
      head_sha: head,
      title: "Create exact behavior",
      body_file: body,
      body_sha256: createHash("sha256").update(bodyText).digest("hex"),
      draft: true,
      required_trailers: ["Signed-off-by", "Co-authored-by"],
      gates: [
        {
          id: "focused",
          command: [process.execPath, "-e", "process.stdout.write('passed')"],
          proof_command: [
            process.execPath,
            "-e",
            `process.stdout.write(JSON.stringify({schema:${JSON.stringify(gateProofSchema)},units:3}))`,
          ],
        },
      ],
    },
  };
}

function remote(
  f: Fixture,
  mutate?: (request: CreatePrCommandRequest, index: number) => CreatePrCommandResult | undefined,
) {
  const commands: string[][] = [];
  const requests: CreatePrCommandRequest[] = [];
  const runner = async (request: CreatePrCommandRequest): Promise<CreatePrCommandResult> => {
    requests.push(request);
    const index = commands.length;
    commands.push([...request.command]);
    const changed = mutate?.(request, index);
    if (changed) return changed;
    const args = request.command;
    if (args[1] === "api" && args[2] === "user") return ok("fixture\n");
    if (args[1] === "api" && args[2] === "repos/owner/repo/git/ref/heads/main")
      return ok(JSON.stringify({ ref: "refs/heads/main", sha: f.base, type: "commit" }));
    if (args[1] === "api" && args[2] === "repos/owner/repo/pulls") return ok("[[]]\n");
    if (args[1] === "push") return ok();
    if (args[1] === "ls-remote") return ok(`${f.head}\trefs/heads/feature/work\n`);
    if (args[1] === "pr" && args[2] === "create") return ok("https://github.com/owner/repo/pull/7\n");
    if (args[1] === "pr" && args[2] === "view")
      return ok(
        JSON.stringify({
          body: "## Summary\n\nCreate exact behavior.\n",
          headRefName: "feature/work",
          headRefOid: f.head,
          baseRefName: "main",
          baseRefOid: f.base,
          url: "https://github.com/owner/repo/pull/7",
          title: "Create exact behavior",
          isDraft: true,
          author: { login: "fixture" },
          state: "OPEN",
        }),
      );
    return fail(`unexpected ${args.join(" ")}`);
  };
  return { commands, requests, runner };
}

test("runs non-vacuous gates before exact push, create, and render receipts", async () => {
  const f = await fixture();
  const mock = remote(f);
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt.outcome).toBe("success");
  expect(receipt.executed_units).toBe(3);
  expect(receipt.external_actions.map((item) => item.kind)).toEqual([
    "actor",
    "base_ref",
    "existing_pr",
    "push",
    "remote_ref",
    "actor",
    "base_ref",
    "existing_pr",
    "remote_ref",
    "create",
    "render",
  ]);
  const push = mock.commands.find((entry) => entry[1] === "push")!;
  expect(push).toEqual([
    f.git,
    "push",
    "https://github.com/fixture/repo.git",
    `${f.head}:refs/heads/feature/work`,
  ]);
  const create = mock.commands.find((entry) => entry[1] === "pr" && entry[2] === "create")!;
  expect(create).toContain("--body-file");
  expect(create.at(-2)).toBe("-");
  expect(
    mock.requests.find((entry) => (entry.command === undefined ? false : entry.command[2] === "create"))
      ?.stdin,
  ).toEqual(Buffer.from("## Summary\n\nCreate exact behavior.\n"));
  expect(create).not.toContain("--body");
  expect(create).not.toContain("--force");
});

test("failed or vacuous gate causes zero remote calls", async () => {
  for (const script of [
    "process.exit(1)",
    "process.stdout.write(JSON.stringify({schema:'tailrocks.gate-proof/v1',units:0}))",
  ]) {
    const f = await fixture();
    const input = structuredClone(f.input) as any;
    if (script.includes("exit")) input.gates[0].command = [process.execPath, "-e", script];
    else input.gates[0].proof_command = [process.execPath, "-e", script];
    const mock = remote(f);
    const receipt = await createPullRequest(input, {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner: mock.runner,
    });
    expect(["gate_failed", "gate_vacuous"]).toContain(receipt.code);
    expect(mock.commands).toHaveLength(0);
  }
});

test("actor mismatch and existing PR refuse before mutation", async () => {
  for (const response of [ok("wrong\n"), ok('[[{"number":7}]]')]) {
    const f = await fixture();
    const mock = remote(f, (_request, index) =>
      index === (response.stdout.startsWith("wrong") ? 0 : 2) ? response : undefined,
    );
    const receipt = await createPullRequest(f.input, {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner: mock.runner,
    });
    expect(receipt.outcome).toBe("refused");
    expect(mock.commands.some((entry) => entry[1] === "push")).toBe(false);
  }
});

test("same-repo head with a non-owner actor is accepted", async () => {
  const f = await fixture();
  await command([f.git, "remote", "set-url", "origin", "https://github.com/owner/repo.git"], f.root);
  const input = {
    ...f.input,
    head_owner: "owner",
    remote_url: "https://github.com/owner/repo.git",
  };
  const mock = remote(f);
  const receipt = await createPullRequest(input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt.outcome).toBe("success");
  const create = mock.commands.find((entry) => entry[1] === "pr" && entry[2] === "create")!;
  expect(create).toContain("owner:feature/work");
});

test("a head owned by neither actor nor repository owner is accepted", async () => {
  const f = await fixture();
  await command([f.git, "remote", "set-url", "origin", "https://github.com/someone-else/repo.git"], f.root);
  const input = {
    ...f.input,
    head_owner: "someone-else",
    remote_url: "https://github.com/someone-else/repo.git",
  };
  const mock = remote(f);
  const receipt = await createPullRequest(input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt.outcome).toBe("success");
  const create = mock.commands.find((entry) => entry[1] === "pr" && entry[2] === "create")!;
  expect(create).toContain("someone-else:feature/work");
});

test("remote base drift refuses before push", async () => {
  const f = await fixture();
  const mock = remote(f, (request) =>
    request.command[2] === "repos/owner/repo/git/ref/heads/main"
      ? ok(JSON.stringify({ ref: "refs/heads/main", sha: f.head, type: "commit" }))
      : undefined,
  );
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt).toMatchObject({ code: "state_drift", outcome: "refused" });
  expect(mock.commands.some((entry) => entry[1] === "push")).toBe(false);
});

test("remote configuration race is caught immediately before immutable push", async () => {
  const f = await fixture();
  const mock = remote(f, (request) => {
    if (request.command[2] !== "repos/owner/repo/pulls") return undefined;
    const changed = Bun.spawnSync(
      [f.git, "remote", "set-url", "origin", "https://github.com/fixture/other.git"],
      {
        cwd: f.root,
      },
    );
    if (changed.exitCode !== 0) throw new Error(changed.stderr.toString());
    return undefined;
  });
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt).toMatchObject({ code: "state_drift", outcome: "refused" });
  expect(mock.commands.some((entry) => entry[1] === "push")).toBe(false);
});

test("push failure is terminal and create failure requires recovery", async () => {
  for (const failure of ["push", "create"] as const) {
    const f = await fixture();
    const mock = remote(f, (request) => {
      if (failure === "push" && request.command[1] === "push") return fail();
      if (failure === "push" && request.command[1] === "ls-remote") return ok();
      if (failure === "create" && request.command[1] === "pr" && request.command[2] === "create")
        return fail();
    });
    const receipt = await createPullRequest(f.input, {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner: mock.runner,
    });
    expect(receipt.code).toBe(`${failure}_failed`);
    expect(receipt.outcome).toBe(failure === "push" ? "refused" : "recovery_required");
    expect(mock.commands.some((entry) => entry[2] === "view")).toBe(false);
  }
});

test("nonzero push continues only when exact remote discovery proves the bound SHA", async () => {
  const f = await fixture();
  const mock = remote(f, (request) => (request.command[1] === "push" ? fail("transport closed") : undefined));
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt.outcome).toBe("success");
  expect(receipt.external_actions.find((entry) => entry.kind === "push")?.outcome).toBe("uncertain");
  expect(receipt.external_actions.find((entry) => entry.kind === "remote_ref")?.proof).toBe(f.head);
});

test("body path replacement cannot change immutable stdin bytes", async () => {
  const f = await fixture();
  const mock = remote(f, (request) => {
    if (request.command[1] === "pr" && request.command[2] === "create")
      writeFileSync(f.body, "attacker replacement\n");
    return undefined;
  });
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt.outcome).toBe("success");
  const create = mock.requests.find((entry) => entry.command[2] === "create")!;
  expect(create.command.slice(-3, -1)).toEqual(["--body-file", "-"]);
  expect(create.stdin).toEqual(Buffer.from("## Summary\n\nCreate exact behavior.\n"));
});

test("remote head replacement during second preflight prevents PR creation", async () => {
  const f = await fixture();
  let pullLookups = 0;
  let replaced = false;
  const mock = remote(f, (request) => {
    if (request.command[2] === "repos/owner/repo/pulls") {
      pullLookups += 1;
      if (pullLookups === 2) replaced = true;
    }
    if (replaced && request.command[1] === "ls-remote") return ok(`${f.base}\trefs/heads/feature/work\n`);
    return undefined;
  });
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt).toMatchObject({ code: "remote_ref_failed", outcome: "recovery_required" });
  expect(mock.commands.some((entry) => entry[2] === "create")).toBe(false);
});

test("invalid UTF-8 body refuses before remote access", async () => {
  const f = await fixture();
  const bytes = Uint8Array.of(0x80);
  await writeFile(f.body, bytes);
  const input = { ...f.input, body_sha256: createHash("sha256").update(bytes).digest("hex") };
  const mock = remote(f);
  const receipt = await createPullRequest(input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt).toMatchObject({ code: "state_drift", outcome: "refused" });
  expect(mock.commands).toHaveLength(0);
});

test("render identity mismatch requires recovery", async () => {
  const f = await fixture();
  const mock = remote(f, (request) =>
    request.command[1] === "pr" && request.command[2] === "view"
      ? ok(JSON.stringify({ body: "wrong" }))
      : undefined,
  );
  const receipt = await createPullRequest(f.input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt).toMatchObject({ code: "render_failed", outcome: "recovery_required" });
});

test("missing required commit trailer refuses before remote access", async () => {
  const f = await fixture();
  const input = { ...f.input, required_trailers: ["Tailrocks-Skill"] };
  const mock = remote(f);
  const receipt = await createPullRequest(input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt).toMatchObject({ code: "state_drift", outcome: "refused" });
  expect(mock.commands).toHaveLength(0);
});

test("gate mutations stay inside the disposable exact-revision workspace", async () => {
  const f = await fixture();
  const input = structuredClone(f.input) as any;
  input.gates[0].command = [process.execPath, "-e", "require('fs').writeFileSync('drift.txt','x')"];
  const mock = remote(f);
  const receipt = await createPullRequest(input, {
    gitExecutable: f.git,
    ghExecutable: process.execPath,
    remoteRunner: mock.runner,
  });
  expect(receipt.outcome).toBe("success");
  await expect(lstat(path.join(f.root, "drift.txt"))).rejects.toThrow();
});

test("network-denied gate cannot reach a listener and causes zero remote calls", async () => {
  let hits = 0;
  const server = Bun.serve({
    port: 0,
    fetch() {
      hits += 1;
      return new Response("reachable");
    },
  });
  try {
    const f = await fixture();
    const input = structuredClone(f.input) as any;
    input.gates[0].command = ["/usr/bin/curl", "--fail", `http://127.0.0.1:${server.port}/mutation`];
    const mock = remote(f);
    const receipt = await createPullRequest(input, {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner: mock.runner,
    });
    expect(receipt).toMatchObject({ code: "gate_failed", outcome: "refused" });
    expect(mock.commands).toHaveLength(0);
    expect(hits).toBe(0);
  } finally {
    server.stop(true);
  }
});

test("gate sandbox does not inherit ambient secrets", async () => {
  process.env.CREATE_PR_TEST_SECRET = "must-not-cross";
  try {
    const f = await fixture();
    const input = structuredClone(f.input) as any;
    input.gates[0].command = [process.execPath, "-e", "if(process.env.CREATE_PR_TEST_SECRET)process.exit(9)"];
    const mock = remote(f);
    const receipt = await createPullRequest(input, {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner: mock.runner,
    });
    expect(receipt.outcome).toBe("success");
  } finally {
    delete process.env.CREATE_PR_TEST_SECRET;
  }
});

test("gate materialization ignores hostile global smudge configuration", async () => {
  let hits = 0;
  const server = Bun.serve({
    port: 0,
    fetch() {
      hits += 1;
      return new Response("smudged");
    },
  });
  const configRoot = await realpath(await mkdtemp(path.join(tmpdir(), "create-pr-git-config-")));
  const config = path.join(configRoot, "hostile.gitconfig");
  await writeFile(
    config,
    `[filter "evil"]\n\tsmudge = /usr/bin/curl --silent http://127.0.0.1:${server.port}/smudge\n\trequired = true\n`,
  );
  process.env.GIT_CONFIG_GLOBAL = config;
  try {
    const f = await fixture();
    const mock = remote(f);
    const receipt = await createPullRequest(f.input, {
      gitExecutable: f.git,
      ghExecutable: process.execPath,
      remoteRunner: mock.runner,
    });
    expect(receipt.outcome).toBe("success");
    expect(hits).toBe(0);
  } finally {
    delete process.env.GIT_CONFIG_GLOBAL;
    server.stop(true);
  }
});
