import { afterAll, expect, test } from "bun:test";
import { access, chmod, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
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

async function waitFor(file: string): Promise<void> {
  for (let attempt = 0; attempt < 1_500; attempt += 1) {
    try {
      await access(file);
      return;
    } catch {
      await Bun.sleep(10);
    }
  }
  throw new Error(`path did not appear: ${file}`);
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
    expect(capture.code, capture.stderr).toBe(4);
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
  const environment = { TAILROCKS_FAKE_DEFAULTS: store };
  const harness = path.join(root, "harness");
  await mkdir(harness);
  const state = path.join(harness, "state.sh");
  const capture = path.join(harness, "capture.sh");
  const stateSource = (await readFile(path.join(import.meta.dir, "templates/state.sh"), "utf8")).replace(
    "DEFAULTS=/usr/bin/defaults",
    `DEFAULTS=${fake}`,
  );
  await writeFile(state, stateSource);
  await writeFile(capture, "#!/bin/sh\nexec /usr/bin/true\n");
  const transaction = ["/bin/sh", state, "with", "dark", "--", "/bin/sh", capture, "app", "out"];
  expect(await run(transaction, environment)).toMatchObject({
    code: 0,
  });
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
  expect(
    await run(transaction, {
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

test("capture publication rolls back an owned sidecar and survives output-parent replacement", async () => {
  if (process.platform !== "darwin") return;
  const root = await cacheRoot();
  const apps = path.join(root, "apps");
  expect((await run([path.join(import.meta.dir, "test-apps/build.sh"), apps])).code).toBe(0);
  const app = path.join(apps, "Fixture.app");
  for (const helper of ["process-owner.swift", "window-id.swift"])
    await writeFile(path.join(root, helper), await readFile(path.join(import.meta.dir, "templates", helper)));
  const base = (await readFile(path.join(import.meta.dir, "templates/capture.sh"), "utf8"))
    .replace(
      'screencapture -x -o -l "$WID" "$TMP_OUT"',
      '/bin/dd if=/dev/zero of="$TMP_OUT" bs=8192 count=1 2>/dev/null',
    )
    .replace(
      'dims=$(sips -g pixelWidth -g pixelHeight "$TMP_OUT" 2>/dev/null)',
      "dims='pixelWidth: 100\npixelHeight: 100'",
    )
    .replace(
      'cmp -s "$PRE_JSON" "$POST_JSON" || { echo "window identity changed during capture" >&2; exit 1; }',
      ": publication-race fixture keeps process ownership checks but bypasses live-window volatility",
    );

  const secondRoot = path.join(root, "second-link");
  await mkdir(secondRoot);
  const secondScript = path.join(root, "capture-second-link.sh");
  await writeFile(
    secondScript,
    base.replace(
      'ln "$PRE_JSON" "$SIDECAR" || { echo "sidecar publication raced" >&2; exit 2; }; PUBLISHED_SIDECAR=1',
      'ln "$PRE_JSON" "$SIDECAR" || { echo "sidecar publication raced" >&2; exit 2; }; PUBLISHED_SIDECAR=1\nwhile [ ! -e "$OUT_PARENT/.release-second-link" ]; do sleep 0.01; done',
    ),
  );
  const secondOutput = path.join(secondRoot, "capture.png");
  const second = Bun.spawn(["/bin/sh", secondScript, app, secondOutput], {
    stdout: "pipe",
    stderr: "pipe",
  });
  try {
    await waitFor(`${secondOutput}.json`);
  } catch (error) {
    const [exit, stderr] = await Promise.all([second.exited, new Response(second.stderr).text()]);
    throw new Error(`${String(error)}; exit=${exit}; stderr=${stderr}`);
  }
  await writeFile(secondOutput, "concurrent\n");
  await writeFile(path.join(secondRoot, ".release-second-link"), "release\n");
  expect(await second.exited).toBe(2);
  expect(await readFile(secondOutput, "utf8")).toBe("concurrent\n");
  await expect(access(`${secondOutput}.json`)).rejects.toThrow();

  const parentRoot = path.join(root, "parent-swap");
  const movedRoot = path.join(root, "parent-swap-moved");
  await mkdir(parentRoot);
  const parentScript = path.join(root, "capture-parent-swap.sh");
  await writeFile(
    parentScript,
    base.replace(
      '[ "$(stat -f \'%d:%i\' "$OUT_PARENT")" = "$OUT_PARENT_ID" ] || { echo "output parent identity changed after publication" >&2; exit 2; }',
      'while [ ! -e "$OUT_PARENT/.release-parent-swap" ]; do sleep 0.01; done\n[ "$(stat -f \'%d:%i\' "$OUT_PARENT")" = "$OUT_PARENT_ID" ] || { echo "output parent identity changed after publication" >&2; exit 2; }',
    ),
  );
  const parentOutput = path.join(parentRoot, "capture.png");
  const parent = Bun.spawn(["/bin/sh", parentScript, app, parentOutput], {
    stdout: "pipe",
    stderr: "pipe",
  });
  try {
    await waitFor(parentOutput);
  } catch (error) {
    const [exit, stderr] = await Promise.all([parent.exited, new Response(parent.stderr).text()]);
    throw new Error(`${String(error)}; exit=${exit}; stderr=${stderr}`);
  }
  await waitFor(`${parentOutput}.json`);
  await rename(parentRoot, movedRoot);
  await mkdir(parentRoot);
  await writeFile(path.join(parentRoot, ".release-parent-swap"), "release\n");
  expect(await parent.exited).toBe(2);
  await expect(access(path.join(movedRoot, "capture.png"))).rejects.toThrow();
  await expect(access(path.join(movedRoot, "capture.png.json"))).rejects.toThrow();
  await expect(access(parentOutput)).rejects.toThrow();
}, 30_000);
