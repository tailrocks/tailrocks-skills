import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { proveDriverInputSchema, runProveDriver } from "./prove-driver-core";
import { isRestrictedLinuxCi } from "./test-platform";

const cleanup = new Set<string>();

function git(root: string, args: readonly string[]): string {
  const result = Bun.spawnSync(["/usr/bin/git", ...args], {
    cwd: root,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Prove Test",
      GIT_AUTHOR_EMAIL: "prove@test.invalid",
      GIT_COMMITTER_NAME: "Prove Test",
      GIT_COMMITTER_EMAIL: "prove@test.invalid",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString();
}

function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

async function repository(files: Record<string, string>) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-prove-source-")));
  cleanup.add(root);
  git(root, ["init", "-q"]);
  for (const [name, body] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), body);
  }
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "fixture"]);
  const head = git(root, ["rev-parse", "HEAD"]).trim();
  const status = git(root, ["status", "--porcelain=v1", "--untracked-files=all"]);
  return { root, head, status_sha256: digest(status) };
}

function row(
  id: string,
  capability: "CLI" | "APPLICATION" | "BROWSER",
  script: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    capability,
    claims: [`${id} claim`],
    argv: [process.execPath, script],
    cwd: ".",
    stdin: null,
    timeout_ms: 2_000,
    maximum_output_bytes: 100_000,
    effect_authority: "READ_ONLY",
    artifacts: [],
    env_names: [],
    ...overrides,
  };
}

async function prepare(
  repo: Awaited<ReturnType<typeof repository>>,
  inventory: unknown[],
  build: string[] | null = null,
) {
  const receipt = await runProveDriver({
    schema: proveDriverInputSchema,
    operation: "prepare",
    root: repo.root,
    head: repo.head,
    status_sha256: repo.status_sha256,
    inventory,
    build_argv: build,
    prepared_artifacts: build ? ["built.txt"] : [],
  });
  for (const item of receipt.recovery as string[]) cleanup.add(item);
  return receipt;
}

async function runSurface(
  repo: Awaited<ReturnType<typeof repository>>,
  prepared: Record<string, unknown>,
  id: string,
  authority: "READ_ONLY" | "WORKSPACE_WRITE" = "READ_ONLY",
  reason: string | null = null,
) {
  return await runProveDriver({
    schema: proveDriverInputSchema,
    operation: "run",
    session_manifest: prepared.session_manifest,
    session_sha256: prepared.session_sha256,
    root: repo.root,
    head: repo.head,
    status_sha256: repo.status_sha256,
    row_id: id,
    effect_authority: authority,
    decisive_stream: "stdout",
    decisive_line_index: 0,
    not_executed_reason: reason,
  });
}

async function assemble(
  repo: Awaited<ReturnType<typeof repository>>,
  prepared: Record<string, unknown>,
  receipts: Record<string, unknown>[],
) {
  return await runProveDriver({
    schema: proveDriverInputSchema,
    operation: "assemble",
    session_manifest: prepared.session_manifest,
    session_sha256: prepared.session_sha256,
    root: repo.root,
    head: repo.head,
    status_sha256: repo.status_sha256,
    receipts: receipts.map(({ row_id, receipt_path, receipt_sha256 }) => ({
      row_id,
      receipt_path,
      receipt_sha256,
    })),
  });
}

afterEach(async () => {
  for (const target of [...cleanup].sort((a, b) => b.length - a.length))
    await rm(target, { recursive: true, force: true });
  cleanup.clear();
  delete process.env.PROVE_ALLOWED;
  delete process.env.PROVE_SECRET;
});

test("prepare builds once and CLI application browser rows assemble one factual bundle", async () => {
  const repo = await repository({
    "build.ts": "await Bun.write('built.txt', 'built\\n'); console.log('1 artifact built');\n",
    "cli.ts":
      "console.log(`cli:${process.env.PROVE_ALLOWED}:${process.env.PROVE_SECRET ?? 'absent'}`); console.error('cli stderr');\n",
    "app.ts":
      "console.log('application ready'); console.log(JSON.stringify({schema:'tailrocks.prove-application/v1',ready:true,probes:1,owned_pid:process.pid,cleanup:true}));\n",
    "browser.ts":
      "await Bun.write('capture.png', 'png'); console.log('browser asserted'); console.log(JSON.stringify({schema:'tailrocks.prove-browser/v1',origin:'http://127.0.0.1:3210',navigations:1,assertions:2,external_requests:0,cleanup:true,page_errors:[],console_errors:[]}));\n",
  });
  process.env.PROVE_ALLOWED = "yes";
  process.env.PROVE_SECRET = "hidden";
  const inventory = [
    row("CLI_MAIN", "CLI", "cli.ts", { env_names: ["PROVE_ALLOWED"] }),
    row("APP_MAIN", "APPLICATION", "app.ts"),
    row("WEB_MAIN", "BROWSER", "browser.ts", {
      effect_authority: "WORKSPACE_WRITE",
      artifacts: ["capture.png"],
    }),
  ];
  const prepared = await prepare(repo, inventory, [process.execPath, "build.ts"]);
  expect(prepared).toMatchObject({ outcome: "EXECUTED", prepared_artifacts: [{ path: "built.txt" }] });
  const cli = await runSurface(repo, prepared, "CLI_MAIN");
  expect(cli).toMatchObject({
    outcome: "EXECUTED",
    capability: "CLI",
    stdout: { sha256: digest("cli:yes:absent\n") },
    stderr: { sha256: digest("cli stderr\n") },
    decisive_line: { stream: "stdout", index: 0, text: "cli:yes:absent" },
  });
  expect((cli as Record<string, unknown>).WORKS).toBeUndefined();
  const app = await runSurface(repo, prepared, "APP_MAIN");
  expect(app).toMatchObject({ outcome: "EXECUTED", adapter: { ready: true, probes: 1, cleanup: true } });
  const browser = await runSurface(repo, prepared, "WEB_MAIN", "WORKSPACE_WRITE");
  expect(browser).toMatchObject({
    outcome: "EXECUTED",
    adapter: { origin: "http://127.0.0.1:3210", assertions: 2, external_requests: 0 },
    artifacts: [{ path: "capture.png", bytes: 3, sha256: digest("png") }],
  });
  const parent = (prepared.recovery as string[])[0]!;
  const receipt = await assemble(repo, prepared, [browser, cli, app]);
  expect(receipt).toMatchObject({
    outcome: "EXECUTED",
    bundle: {
      schema: "tailrocks.prove-evidence-bundle/v1",
      inventory,
      build: { outcome: "EXECUTED" },
      prepared_artifacts: [{ path: "built.txt", bytes: 6, sha256: digest("built\n") }],
    },
    recovery: [],
  });
  expect((receipt.bundle as { receipts: { row_id: string }[] }).receipts.map(({ row_id }) => row_id)).toEqual(
    ["CLI_MAIN", "APP_MAIN", "WEB_MAIN"],
  );
  expect(receipt.bundle_sha256).toBe(digest(JSON.stringify(receipt.bundle)));
  expect(await Bun.file(parent).exists()).toBe(false);
});

test("argv stdin environment and read-only mutation facts stay exact", async () => {
  const repo = await repository({
    ".gitignore": "unexpected.txt\n",
    "args.ts":
      "const stdin=await Bun.stdin.text(); console.log(JSON.stringify({args:process.argv.slice(2),stdin,secret:process.env.PROVE_SECRET??'absent'}));\n",
    "mutate.ts": "await Bun.write('unexpected.txt','changed'); console.log('mutated');\n",
  });
  process.env.PROVE_SECRET = "hidden";
  const hostile = "a; touch pwned";
  const inventory = [
    row("ARGS", "CLI", "args.ts", {
      argv: [process.execPath, "args.ts", hostile],
      stdin: "exact stdin\n",
    }),
    row("MUTATE", "CLI", "mutate.ts"),
  ];
  const prepared = await prepare(repo, inventory);
  const args = await runSurface(repo, prepared, "ARGS");
  const expectedLine = JSON.stringify({ args: [hostile], stdin: "exact stdin\n", secret: "absent" });
  expect(args).toMatchObject({
    outcome: "EXECUTED",
    argv: [process.execPath, "args.ts", hostile],
    stdin_sha256: digest("exact stdin\n"),
    env_names: [],
    decisive_line: { text: expectedLine, sha256: digest(expectedLine) },
  });
  const mutation = await runSurface(repo, prepared, "MUTATE");
  expect(mutation).toMatchObject({
    outcome: "FAILED",
    detail: "read-only driver mutated workspace",
    mutations: [expect.stringContaining("/workspace")],
  });
  expect(await assemble(repo, prepared, [args, mutation])).toMatchObject({ outcome: "EXECUTED" });
});

test("reserved environment names refuse and named values bind by digest", async () => {
  const repo = await repository({ "env.ts": "console.log(process.env.PROVE_ALLOWED);\n" });
  process.env.PROVE_ALLOWED = "yes";
  await expect(prepare(repo, [row("HOSTILE", "CLI", "env.ts", { env_names: ["PATH"] })])).rejects.toThrow(
    "env_names",
  );
  const prepared = await prepare(repo, [row("ALLOWED", "CLI", "env.ts", { env_names: ["PROVE_ALLOWED"] })]);
  const receipt = await runSurface(repo, prepared, "ALLOWED");
  expect(receipt.environment_sha256).toBe(
    digest(JSON.stringify([{ name: "PROVE_ALLOWED", sha256: digest("yes") }])),
  );
  expect(await assemble(repo, prepared, [receipt])).toMatchObject({ outcome: "EXECUTED" });
});

test("rows use independent workspaces under reversed and concurrent execution", async () => {
  const repo = await repository({
    "isolated.ts":
      "const existed=await Bun.file('shared.txt').exists(); await Bun.write('shared.txt','same'); console.log(String(existed));\n",
  });
  const inventory = ["A", "B", "C", "D"].map((id) =>
    row(id, "CLI", "isolated.ts", { effect_authority: "WORKSPACE_WRITE", artifacts: ["shared.txt"] }),
  );
  const prepared = await prepare(repo, inventory);
  const b = await runSurface(repo, prepared, "B", "WORKSPACE_WRITE");
  const a = await runSurface(repo, prepared, "A", "WORKSPACE_WRITE");
  const [c, d] = await Promise.all([
    runSurface(repo, prepared, "C", "WORKSPACE_WRITE"),
    runSurface(repo, prepared, "D", "WORKSPACE_WRITE"),
  ]);
  for (const receipt of [a, b, c, d]) {
    expect(receipt).toMatchObject({ outcome: "EXECUTED", decisive_line: { text: "false" } });
  }
  expect(new Set([a, b, c, d].map((receipt) => receipt.workspace_snapshot_before)).size).toBe(1);
  expect(new Set([a, b, c, d].map((receipt) => receipt.workspace_snapshot_after)).size).toBe(1);
  expect(await assemble(repo, prepared, [d, c, b, a])).toMatchObject({ outcome: "EXECUTED" });
});

test("NOT_EXECUTED is explicit and never spawns the program", async () => {
  const repo = await repository({
    "must-not-run.ts": "await Bun.write('spawned.txt', 'bad');\n",
  });
  const prepared = await prepare(repo, [row("NO_DEVICE", "CLI", "must-not-run.ts")]);
  const receipt = await runSurface(repo, prepared, "NO_DEVICE", "READ_ONLY", "device unavailable");
  expect(receipt).toMatchObject({ outcome: "NOT_EXECUTED", exit_code: null, detail: "device unavailable" });
  const manifest = JSON.parse(await readFile(prepared.session_manifest as string, "utf8"));
  expect(await Bun.file(path.join(manifest.workspace, "spawned.txt")).exists()).toBe(false);
  expect(await assemble(repo, prepared, [receipt])).toMatchObject({ outcome: "EXECUTED" });
});

test("failed build is a factual receipt and makes every surface NOT_EXECUTED", async () => {
  const repo = await repository({
    "build-fail.ts": "console.error('build broke'); process.exit(9);\n",
    "must-not-run.ts": "await Bun.write('spawned.txt', 'bad');\n",
  });
  const prepared = await prepare(
    repo,
    [row("BLOCKED", "CLI", "must-not-run.ts")],
    [process.execPath, "build-fail.ts"],
  );
  expect(prepared).toMatchObject({
    outcome: "FAILED",
    build: { outcome: "FAILED", exit_code: 9, stderr: { sha256: digest("build broke\n") } },
    prepared_artifacts: [],
  });
  const receipt = await runSurface(repo, prepared, "BLOCKED");
  expect(receipt).toMatchObject({
    outcome: "NOT_EXECUTED",
    detail: "surface not executed because the prepared build failed",
  });
  expect(await assemble(repo, prepared, [receipt])).toMatchObject({ outcome: "EXECUTED" });
});

test("nonzero timeout saturation and malformed adapters stay FAILED facts", async () => {
  const repo = await repository({
    "nonzero.ts": "console.log('failed command'); process.exit(7);\n",
    "timeout.ts": "console.log('started'); setInterval(()=>{}, 1000);\n",
    "saturate.ts": "console.log('x'.repeat(10000));\n",
    "bad-app.ts": "console.log('bad app'); console.log('{}');\n",
    "bad-browser.ts":
      "console.log('bad browser'); console.log(JSON.stringify({schema:'tailrocks.prove-browser/v1',origin:'https://example.com',navigations:1,assertions:1,external_requests:1,cleanup:true,page_errors:[],console_errors:[]}));\n",
  });
  const timeoutItem = row("TIMEOUT", "CLI", "timeout.ts", { timeout_ms: 100 });
  const inventory = [
    row("NONZERO", "CLI", "nonzero.ts"),
    ...(isRestrictedLinuxCi() ? [] : [timeoutItem]),
    row("SATURATE", "CLI", "saturate.ts", { maximum_output_bytes: 32 }),
    row("BAD_APP", "APPLICATION", "bad-app.ts"),
    row("BAD_BROWSER", "BROWSER", "bad-browser.ts"),
  ];
  const prepared = await prepare(repo, inventory);
  const receipts = [];
  for (const item of inventory) receipts.push(await runSurface(repo, prepared, item.id));
  expect(receipts.map((receipt) => receipt.outcome)).toEqual(inventory.map(() => "FAILED"));
  expect(receipts[0]).toMatchObject({ exit_code: 7, timed_out: false });
  const timeoutReceipt = receipts.find((receipt) => receipt.row_id === timeoutItem.id);
  if (timeoutReceipt) expect(timeoutReceipt).toMatchObject({ exit_code: 124, timed_out: true });
  const saturateReceipt = receipts.find((receipt) => receipt.row_id === "SATURATE");
  expect(saturateReceipt).toMatchObject({ exit_code: 125, saturated: true });
  expect(receipts.find((receipt) => receipt.row_id === "BAD_APP")!.detail).toContain("application protocol");
  expect(receipts.find((receipt) => receipt.row_id === "BAD_BROWSER")!.detail).toContain("browser protocol");
  expect(await assemble(repo, prepared, receipts)).toMatchObject({ outcome: "EXECUTED" });
}, 15_000);

test("assembly refuses missing duplicate foreign and forged bindings without cleanup", async () => {
  const repo = await repository({ "ok.ts": "console.log('ok');\n" });
  const prepared = await prepare(repo, [row("ONE", "CLI", "ok.ts"), row("TWO", "CLI", "ok.ts")]);
  const one = await runSurface(repo, prepared, "ONE");
  const two = await runSurface(repo, prepared, "TWO");
  await expect(assemble(repo, prepared, [one])).rejects.toThrow("coverage");
  await expect(assemble(repo, prepared, [one, one])).rejects.toThrow("duplicate");
  await expect(
    runProveDriver({
      schema: proveDriverInputSchema,
      operation: "assemble",
      session_manifest: prepared.session_manifest,
      session_sha256: prepared.session_sha256,
      root: repo.root,
      head: repo.head,
      status_sha256: repo.status_sha256,
      receipts: [
        { row_id: one.row_id, receipt_path: one.receipt_path, receipt_sha256: one.receipt_sha256 },
        { row_id: two.row_id, receipt_path: two.receipt_path, receipt_sha256: digest("forged") },
      ],
    }),
  ).rejects.toThrow("digest");
  const manifest = JSON.parse(await readFile(prepared.session_manifest as string, "utf8"));
  expect((await lstat(manifest.workspace)).isDirectory()).toBe(true);
  expect(await assemble(repo, prepared, [two, one])).toMatchObject({ outcome: "EXECUTED" });
});

test("assembly refuses tampered machine-owned receipt bytes", async () => {
  const repo = await repository({ "ok.ts": "console.log('ok');\n" });
  const prepared = await prepare(repo, [row("ONE", "CLI", "ok.ts")]);
  const receipt = await runSurface(repo, prepared, "ONE");
  await writeFile(receipt.receipt_path as string, "{}\n");
  await expect(assemble(repo, prepared, [receipt])).rejects.toThrow("digest changed");
});

test("source status and root inode drift refuse before execution or assembly", async () => {
  const repo = await repository({ "ok.ts": "console.log('ok');\n" });
  const prepared = await prepare(repo, [row("ONE", "CLI", "ok.ts")]);
  await writeFile(path.join(repo.root, "dirty.txt"), "dirty\n");
  await expect(runSurface(repo, prepared, "ONE")).rejects.toThrow("repository byte snapshot changed");
  await rm(path.join(repo.root, "dirty.txt"));
  const original = `${repo.root}-original`;
  await rename(repo.root, original);
  cleanup.add(original);
  await cp(original, repo.root, { recursive: true });
  await expect(runSurface(repo, prepared, "ONE")).rejects.toThrow("root identity changed");
});

test("workspace owner replacement refuses cleanup without deleting replacement", async () => {
  const repo = await repository({ "ok.ts": "console.log('ok');\n" });
  const prepared = await prepare(repo, [row("ONE", "CLI", "ok.ts")]);
  const receipt = await runSurface(repo, prepared, "ONE");
  const parent = (prepared.recovery as string[])[0]!,
    moved = `${parent}-moved`;
  await rename(parent, moved);
  cleanup.add(moved);
  await mkdir(parent, { mode: 0o700 });
  cleanup.add(parent);
  await writeFile(path.join(parent, "replacement.txt"), "keep\n");
  await expect(assemble(repo, prepared, [receipt])).rejects.toThrow();
  expect(await readFile(path.join(parent, "replacement.txt"), "utf8")).toBe("keep\n");
});

test("installed loader refuses wrong owner and symlinked dependencies before import", async () => {
  const child = Bun.spawnSync(
    [
      process.execPath,
      path.join(import.meta.dir, "prove-driver.ts"),
      "--skill-file",
      path.join(import.meta.dir, "../skills/tailrocks-plan/SKILL.md"),
    ],
    { stdin: Buffer.from("{}"), stdout: "pipe", stderr: "pipe" },
  );
  expect(child.exitCode).toBe(2);
  expect(child.stdout.toString()).toContain("not bound");

  const stage = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-prove-package-")));
  cleanup.add(stage);
  await mkdir(path.join(stage, "scripts"));
  await mkdir(path.join(stage, "skills/tailrocks-prove"), { recursive: true });
  for (const name of [
    "prove-driver.ts",
    "prove-driver-core.ts",
    "bounded-command.ts",
    "bounded-json-stdin.ts",
    "resolve-executable.ts",
  ])
    await cp(path.join(import.meta.dir, name), path.join(stage, "scripts", name));
  await cp(
    path.join(import.meta.dir, "../skills/tailrocks-prove/SKILL.md"),
    path.join(stage, "skills/tailrocks-prove/SKILL.md"),
  );
  const repo = await repository({ "ok.ts": "console.log('ok');\n" });
  const positive = Bun.spawnSync(
    [
      process.execPath,
      path.join(stage, "scripts/prove-driver.ts"),
      "--skill-file",
      path.join(stage, "skills/tailrocks-prove/SKILL.md"),
    ],
    {
      stdin: Buffer.from(
        JSON.stringify({
          schema: proveDriverInputSchema,
          operation: "prepare",
          root: repo.root,
          head: repo.head,
          status_sha256: repo.status_sha256,
          inventory: [row("ONE", "CLI", "ok.ts")],
          build_argv: null,
          prepared_artifacts: [],
        }),
      ),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  expect(positive.exitCode).toBe(0);
  const positiveReceipt = JSON.parse(positive.stdout.toString());
  expect(positiveReceipt).toMatchObject({ outcome: "EXECUTED", operation: "prepare" });
  for (const item of positiveReceipt.recovery) cleanup.add(item);
  const core = path.join(stage, "scripts/prove-driver-core.ts");
  await rm(core);
  await symlink(path.join(import.meta.dir, "prove-driver-core.ts"), core);
  const unsafe = Bun.spawnSync(
    [
      process.execPath,
      path.join(stage, "scripts/prove-driver.ts"),
      "--skill-file",
      path.join(stage, "skills/tailrocks-prove/SKILL.md"),
    ],
    { stdin: Buffer.from("{}"), stdout: "pipe", stderr: "pipe" },
  );
  expect(unsafe.exitCode).toBe(2);
  expect(unsafe.stdout.toString()).toContain("dependency is unsafe");
});

test("installed loader preserves structured recovery on session refusal", async () => {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-prove-")));
  cleanup.add(parent);
  const manifest = path.join(parent, "session.json");
  await writeFile(manifest, "{}\n", { mode: 0o600 });
  const result = Bun.spawnSync(
    [
      process.execPath,
      path.join(import.meta.dir, "prove-driver.ts"),
      "--skill-file",
      path.join(import.meta.dir, "../skills/tailrocks-prove/SKILL.md"),
    ],
    {
      stdin: Buffer.from(
        JSON.stringify({
          schema: proveDriverInputSchema,
          operation: "run",
          session_manifest: manifest,
          session_sha256: digest("{}\n"),
        }),
      ),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  expect(result.exitCode).toBe(2);
  expect(JSON.parse(result.stdout.toString())).toMatchObject({ outcome: "REFUSED", recovery: [parent] });
});

test("closed schemas reject extra fields duplicate rows and path escapes", async () => {
  const repo = await repository({ "ok.ts": "console.log('ok');\n" });
  const valid = row("ONE", "CLI", "ok.ts");
  await expect(
    runProveDriver({
      schema: proveDriverInputSchema,
      operation: "prepare",
      root: repo.root,
      head: repo.head,
      status_sha256: repo.status_sha256,
      inventory: [valid],
      build_argv: null,
      prepared_artifacts: [],
      extra: true,
    }),
  ).rejects.toThrow("unknown or missing");
  await expect(prepare(repo, [valid, valid])).rejects.toThrow("unique");
  await expect(prepare(repo, [{ ...valid, cwd: "../outside" }])).rejects.toThrow("escaped");
  await expect(prepare(repo, [{ ...valid, artifacts: ["../outside"] }])).rejects.toThrow("escaped");
});
