import { afterAll, expect, test } from "bun:test";
import { access, cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

interface Result {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}
const roots: string[] = [];
const grantedPermissions = `import Foundation
let requested = CommandLine.arguments[1]
let permission = requested == "session" ? "interactive-session" : requested
let data = try! JSONSerialization.data(withJSONObject: ["schema":"tailrocks.macos-permission/v1","permission":permission,"outcome":"granted","detail":"preflight passed without prompting"], options:[.sortedKeys])
FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data("\\n".utf8))
`;

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

async function stageHarness(root: string, captureSource?: string): Promise<string> {
  const harness = path.join(root, `harness-${crypto.randomUUID()}`);
  await mkdir(harness);
  for (const name of [
    "run.ts",
    "capture.sh",
    "state.sh",
    "process-owner.swift",
    "window-id.swift",
    "app-launcher.swift",
  ])
    await cp(path.join(import.meta.dir, "templates", name), path.join(harness, name));
  await writeFile(path.join(harness, "permissions.swift"), grantedPermissions);
  if (captureSource !== undefined) await writeFile(path.join(harness, "capture.sh"), captureSource);
  return harness;
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
  const launcher = path.join(root, "app-launcher");
  expect(
    (await run(["swiftc", "-O", path.join(import.meta.dir, "templates/app-launcher.swift"), "-o", launcher]))
      .code,
  ).toBe(0);
  const invalidIdentity = await run([launcher, path.join(apps, "Fixture.app"), decoy]);
  expect(invalidIdentity.code).toBe(1);
  expect(invalidIdentity.stderr).toContain("launch returned invalid application identity");
  expect((await run([processTool, "list", target])).stdout.trim()).toBe("");
  expect((await run(["open", "-n", path.join(apps, "DecoyFixture.app")])).code).toBe(0);
  const decoyIdentity = await waitForIdentity(processTool, decoy);
  try {
    const harness = await stageHarness(root);
    const output = path.join(root, "ambiguous.png");
    const capture = await run([
      process.execPath,
      path.join(harness, "run.ts"),
      "capture",
      "--",
      path.join(apps, "Fixture.app"),
      output,
      "--",
      "--two-windows",
    ]);
    expect(capture.code, capture.stderr).toBe(1);
    expect(JSON.parse(capture.stdout)).toMatchObject({ outcome: "failed", exit_code: 4 });
    expect(JSON.parse(capture.stdout).detail).toContain("ambiguous windows for exact pid");
    expect(await Bun.file(output).exists()).toBe(false);
    expect((await run([processTool, "list", decoy])).stdout.trim()).toBe(decoyIdentity);
    expect((await run([processTool, "list", target])).stdout.trim()).toBe("");

    expect((await run(["open", "-n", path.join(apps, "Fixture.app")])).code).toBe(0);
    const existingIdentity = await waitForIdentity(processTool, target);
    const occupied = await run([
      process.execPath,
      path.join(harness, "run.ts"),
      "capture",
      "--",
      path.join(apps, "Fixture.app"),
      path.join(root, "occupied.png"),
    ]);
    expect(JSON.parse(occupied.stdout)).toMatchObject({ outcome: "failed", exit_code: 4 });
    expect(JSON.parse(occupied.stdout).detail).toContain("preexisting exact-owned process");
    expect((await run([processTool, "list", target])).stdout.trim()).toBe(existingIdentity);
    await stop(processTool, target, existingIdentity);
  } finally {
    await stop(processTool, decoy, decoyIdentity);
  }
}, 30_000);

test("permission denial is typed and precedes launch, settings, and output", async () => {
  if (process.platform !== "darwin") return;
  const root = await cacheRoot(),
    harness = await stageHarness(root);
  const denied = `import Foundation
let requested = CommandLine.arguments[1]
let permission = requested == "session" ? "interactive-session" : requested
let blocked = requested == "screen-recording" || requested == "automation-system-events"
let data = try! JSONSerialization.data(withJSONObject: ["schema":"tailrocks.macos-permission/v1","permission":permission,"outcome":blocked ? "blocked" : "granted","detail":blocked ? "fixture permission missing" : "preflight passed without prompting"], options:[.sortedKeys])
(blocked ? FileHandle.standardError : FileHandle.standardOutput).write(data)
(blocked ? FileHandle.standardError : FileHandle.standardOutput).write(Data("\\n".utf8))
exit(blocked ? 3 : 0)
`;
  await writeFile(path.join(harness, "permissions.swift"), denied);
  const output = path.join(root, "denied.png"),
    marker = path.join(root, "state-ran");
  const capture = await run([
    process.execPath,
    path.join(harness, "run.ts"),
    "capture",
    "--",
    path.join(root, "Missing.app"),
    output,
  ]);
  expect(capture.code).toBe(3);
  expect(JSON.parse(capture.stdout)).toMatchObject({
    outcome: "blocked",
    code: "permission_blocked",
    mutations: [],
    system_mutations: [],
    permissions: [
      { permission: "interactive-session", outcome: "granted" },
      { permission: "screen-recording", outcome: "blocked" },
    ],
  });
  expect(await Bun.file(output).exists()).toBe(false);

  await writeFile(path.join(harness, "state.sh"), `#!/bin/sh\nprintf ran > '${marker}'\nexit 1\n`);
  const state = await run([
    process.execPath,
    path.join(harness, "run.ts"),
    "state",
    "--",
    "with",
    "dark",
    "--",
    "capture",
    path.join(root, "Missing.app"),
    output,
  ]);
  expect(JSON.parse(state.stdout)).toMatchObject({ outcome: "blocked", code: "permission_blocked" });
  expect(await Bun.file(marker).exists()).toBe(false);
}, 20_000);

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
  const harness = path.join(root, "harness");
  await mkdir(harness);
  await cp(path.join(import.meta.dir, "templates/run.ts"), path.join(harness, "run.ts"));
  await writeFile(path.join(harness, "permissions.swift"), grantedPermissions);
  const state = path.join(harness, "state.sh");
  const capture = path.join(harness, "capture.sh");
  const defaultsWrapper = path.join(harness, "defaults");
  const osascriptWrapper = path.join(harness, "osascript");
  const writeDefaultsWrapper = async (failOnce = "") =>
    writeFile(
      defaultsWrapper,
      `#!/bin/sh\nTAILROCKS_FAKE_DEFAULTS='${store}' TAILROCKS_FAKE_FAIL_ONCE='${failOnce}' exec '${process.execPath}' '${fake}' "$@"\n`,
      { mode: 0o755 },
    );
  await writeDefaultsWrapper();
  await writeFile(
    osascriptWrapper,
    `#!/bin/sh\ncase "$*" in *true*) exec '${defaultsWrapper}' write -g AppleInterfaceStyle -string Dark ;; *false*) exec '${defaultsWrapper}' delete -g AppleInterfaceStyle ;; *) exit 2 ;; esac\n`,
    { mode: 0o755 },
  );
  const stateSource = (await readFile(path.join(import.meta.dir, "templates/state.sh"), "utf8"))
    .replace("DEFAULTS=/usr/bin/defaults", `DEFAULTS=${defaultsWrapper}`)
    .replace("OSASCRIPT=/usr/bin/osascript", `OSASCRIPT=${osascriptWrapper}`);
  await writeFile(state, stateSource);
  await writeFile(
    capture,
    '#!/bin/sh\nprintf png > "$2"\nprintf \'{"pid":42}\\n\' > "$2.json"\nprintf \'{"pid":42}\\n\'\n',
  );
  const app = path.join(root, "App.app");
  await mkdir(app);
  const transaction = (output: string) => [
    process.execPath,
    path.join(harness, "run.ts"),
    "state",
    "--",
    "with",
    "dark",
    "--",
    "capture",
    app,
    output,
  ];
  const first = await run(transaction(path.join(root, "one.png")));
  expect(JSON.parse(first.stdout)).toMatchObject({ outcome: "success", restoration: "restored" });
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
  await writeDefaultsWrapper("NSGlobalDomain|AppleInterfaceStyleSwitchesAutomatically|1");
  const second = await run(transaction(path.join(root, "two.png")));
  expect(JSON.parse(second.stdout)).toMatchObject({ outcome: "success", restoration: "restored" });
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
  await writeFile(capture, "#!/bin/sh\nexit 7\n");
  const failedCapture = await run(transaction(path.join(root, "failed.png")));
  const failedReceipt = JSON.parse(failedCapture.stdout);
  expect(failedReceipt).toMatchObject({ outcome: "failed", restoration: "restored" });
  expect(failedReceipt.system_mutations.every((item: { restored: boolean }) => item.restored)).toBe(true);
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
  const forged = path.join(root, "forged.state");
  await writeFile(forged, "tailrocks.macos-state/v1\nNSGlobalDomain|arbitrary|-string|owned\n", {
    mode: 0o600,
  });
  const recovery = await run([
    process.execPath,
    path.join(harness, "run.ts"),
    "state",
    "--",
    "recover",
    forged,
    forged,
  ]);
  const recoveryReceipt = JSON.parse(recovery.stdout);
  expect(recoveryReceipt).toMatchObject({
    outcome: "failed",
    restoration: "recovery-required",
    recovery_artifacts: [forged],
  });
  expect(recoveryReceipt.system_mutations).toHaveLength(6);
  expect(recoveryReceipt.system_mutations.every((item: { restored: boolean }) => !item.restored)).toBe(true);
  expect(JSON.parse(await readFile(store, "utf8"))).toEqual(original);
}, 20_000);

test("capture publication rolls back an owned sidecar and survives output-parent replacement", async () => {
  if (process.platform !== "darwin") return;
  const root = await cacheRoot();
  const apps = path.join(root, "apps");
  expect((await run([path.join(import.meta.dir, "test-apps/build.sh"), apps])).code).toBe(0);
  const app = path.join(apps, "Fixture.app");
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
  const secondHarness = await stageHarness(
    root,
    base.replace(
      'ln "$PRE_JSON" "$SIDECAR" || { echo "sidecar publication raced" >&2; exit 2; }; PUBLISHED_SIDECAR=1',
      'ln "$PRE_JSON" "$SIDECAR" || { echo "sidecar publication raced" >&2; exit 2; }; PUBLISHED_SIDECAR=1\nwhile [ ! -e "$OUT_PARENT/.release-second-link" ]; do sleep 0.01; done',
    ),
  );
  const secondOutput = path.join(secondRoot, "capture.png");
  const second = Bun.spawn(
    [process.execPath, path.join(secondHarness, "run.ts"), "capture", "--", app, secondOutput],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  try {
    await waitFor(`${secondOutput}.json`);
  } catch (error) {
    const [exit, stderr] = await Promise.all([second.exited, new Response(second.stderr).text()]);
    throw new Error(`${String(error)}; exit=${exit}; stderr=${stderr}`);
  }
  await writeFile(secondOutput, "concurrent\n");
  await writeFile(path.join(secondRoot, ".release-second-link"), "release\n");
  expect(await second.exited).toBe(1);
  expect(await readFile(secondOutput, "utf8")).toBe("concurrent\n");
  await expect(access(`${secondOutput}.json`)).rejects.toThrow();

  const parentRoot = path.join(root, "parent-swap");
  const movedRoot = path.join(root, "parent-swap-moved");
  await mkdir(parentRoot);
  const parentHarness = await stageHarness(
    root,
    base.replace(
      '[ "$(stat -f \'%d:%i\' "$OUT_PARENT")" = "$OUT_PARENT_ID" ] || { echo "output parent identity changed after publication" >&2; exit 2; }',
      'while [ ! -e "$OUT_PARENT/.release-parent-swap" ]; do sleep 0.01; done\n[ "$(stat -f \'%d:%i\' "$OUT_PARENT")" = "$OUT_PARENT_ID" ] || { echo "output parent identity changed after publication" >&2; exit 2; }',
    ),
  );
  const parentOutput = path.join(parentRoot, "capture.png");
  const parent = Bun.spawn(
    [process.execPath, path.join(parentHarness, "run.ts"), "capture", "--", app, parentOutput],
    { stdout: "pipe", stderr: "pipe" },
  );
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
  expect(await parent.exited).toBe(1);
  await expect(access(path.join(movedRoot, "capture.png"))).rejects.toThrow();
  await expect(access(path.join(movedRoot, "capture.png.json"))).rejects.toThrow();
  await expect(access(parentOutput)).rejects.toThrow();
}, 30_000);
