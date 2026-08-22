import { afterAll, expect, test } from "bun:test";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

interface Result {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}
const roots: string[] = [];

async function run(command: readonly string[], env?: Record<string, string>): Promise<Result> {
  const child = Bun.spawn(command, {
    env: { ...process.env, ...env },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, stdout, stderr };
}

async function cacheRoot(): Promise<string> {
  const root = await mkdtemp(path.join(homedir(), "Library/Caches/tailrocks-macos-visual-qa-"));
  roots.push(root);
  return root;
}

async function waitForIdentity(tool: string, executable: string): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const result = await run([tool, "list", executable]);
    if (result.code === 0 && result.stdout.trim()) return result.stdout.trim();
    await Bun.sleep(100);
  }
  throw new Error(`identity did not appear: ${executable}`);
}

async function stop(tool: string, executable: string, identity: string): Promise<void> {
  const [pid, token] = identity.split("|");
  await run([tool, "terminate", executable, pid!, token!]);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (!(await run([tool, "verify", executable, pid!, token!])).code) await Bun.sleep(100);
    else return;
  }
  await run([tool, "force-terminate", executable, pid!, token!]);
}

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
});

test("real apps prove exact decoy ownership and two-window refusal", async () => {
  if (process.platform !== "darwin") return;
  const root = await cacheRoot();
  const apps = path.join(root, "apps");
  const build = await run([path.join(import.meta.dir, "test-apps/build.sh"), apps]);
  expect(build).toMatchObject({ code: 0 });
  const processTool = path.join(root, "process-owner");
  expect(
    (
      await run([
        "swiftc",
        "-O",
        path.join(import.meta.dir, "templates/process-owner.swift"),
        "-o",
        processTool,
      ])
    ).code,
  ).toBe(0);
  const target = path.join(apps, "Fixture.app/Contents/MacOS/Fixture");
  const decoy = path.join(apps, "DecoyFixture.app/Contents/MacOS/DecoyFixture");
  expect((await run(["open", "-n", path.join(apps, "DecoyFixture.app")])).code).toBe(0);
  const decoyIdentity = await waitForIdentity(processTool, decoy);
  try {
    const output = path.join(root, "ambiguous.png");
    const capture = await run([
      "/bin/sh",
      path.join(import.meta.dir, "templates/capture.sh"),
      path.join(apps, "Fixture.app"),
      output,
      "--",
      "--two-windows",
    ]);
    expect(capture.code).toBe(4);
    expect(capture.stderr).toContain("ambiguous windows for exact pid");
    expect(await Bun.file(output).exists()).toBe(false);
    expect((await run([processTool, "list", decoy])).stdout.trim()).toBe(decoyIdentity);
    expect((await run([processTool, "list", target])).stdout.trim()).toBe("");
  } finally {
    await stop(processTool, decoy, decoyIdentity);
  }
}, 30_000);

test("appearance transaction restores exact typed registry and rejects forged recovery", async () => {
  if (process.platform !== "darwin") return;
  const root = await cacheRoot();
  const store = path.join(root, "defaults.json");
  const original = {
    "com.apple.universalaccess|increaseContrast": "0",
    "com.apple.universalaccess|reduceMotion": "1",
    "com.apple.universalaccess|differentiateWithoutColor": "0",
    "NSGlobalDomain|AppleInterfaceStyleSwitchesAutomatically": "1",
  };
  await writeFile(store, JSON.stringify(original));
  const fake = path.join(import.meta.dir, "test-support/fake-defaults.ts");
  await chmod(fake, 0o755);
  const environment = { TAILROCKS_DEFAULTS_COMMAND: fake, TAILROCKS_FAKE_DEFAULTS: store };
  const state = path.join(import.meta.dir, "templates/state.sh");
  expect(await run(["/bin/sh", state, "with", "dark", "--", "/usr/bin/true"], environment)).toMatchObject({
    code: 0,
  });
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
  expect(
    await run(["/bin/sh", state, "with", "dark", "--", "/usr/bin/true"], {
      ...environment,
      TAILROCKS_FAKE_FAIL_ONCE: "NSGlobalDomain|AppleInterfaceStyleSwitchesAutomatically|1",
    }),
  ).toMatchObject({ code: 0 });
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
  const forged = path.join(root, "forged.state");
  await writeFile(forged, "tailrocks.macos-state/v1\nNSGlobalDomain|arbitrary|-string|owned\n", {
    mode: 0o600,
  });
  expect((await run(["/bin/sh", state, "recover", forged, forged], environment)).code).not.toBe(0);
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
}, 20_000);
