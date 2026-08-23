import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "../bounded-command";
import { install } from "./install";

const grantedPermissions = `import Foundation
let requested = CommandLine.arguments[1]
let permission = requested == "session" ? "interactive-session" : requested
let data = try! JSONSerialization.data(withJSONObject: ["schema":"tailrocks.macos-permission/v1","permission":permission,"outcome":"granted","detail":"preflight passed without prompting"], options:[.sortedKeys])
FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data("\\n".utf8))
`;
async function grantPermissions(harness: string): Promise<void> {
  await writeFile(path.join(harness, "permissions.swift"), grantedPermissions);
}

async function temporary(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "macos-visual-qa-install-")));
}

test("installs the complete hardened harness with shell internals behind the supervisor", async () => {
  const root = await temporary();
  const receipt = await install(root);
  expect(receipt).toMatchObject({ outcome: "installed", code: "installed" });
  expect(receipt.files).toEqual([
    "AuditTests.swift",
    "app-launcher.swift",
    "ax-drive.swift",
    "capture.sh",
    "permissions.swift",
    "process-owner.swift",
    "run.ts",
    "state.sh",
    "window-id.swift",
  ]);
  expect((await lstat(path.join(root, "Scripts/TailrocksVisualQA/capture.sh"))).mode & 0o111).toBe(0);
  expect((await lstat(path.join(root, "Scripts/TailrocksVisualQA/state.sh"))).mode & 0o111).toBe(0);
  expect(await readFile(path.join(root, "Scripts/TailrocksVisualQA/window-id.swift"), "utf8")).toContain(
    "matches.count == 1",
  );
});

test("existing destination refuses without changing its files", async () => {
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const before = await readFile(path.join(root, "Scripts/TailrocksVisualQA/capture.sh"), "utf8");
  const receipt = await install(root);
  expect(receipt).toMatchObject({ outcome: "refused", code: "destination_exists", files: [] });
  expect(await readFile(path.join(root, "Scripts/TailrocksVisualQA/capture.sh"), "utf8")).toBe(before);
});

test("absolute, traversal, and empty destination components refuse", async () => {
  const root = await temporary();
  for (const destination of ["/tmp/out", "../out", "Scripts//out"]) {
    expect(await install(root, destination)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
});

test("destination race fails without deleting concurrent bytes", async () => {
  const root = await temporary();
  const receipt = await install(root, "Scripts/TailrocksVisualQA", {
    afterDestinationClaim: async (destination) => {
      await writeFile(path.join(destination, "capture.sh"), "concurrent\n");
    },
  });
  const destination = path.join(root, "Scripts/TailrocksVisualQA");
  expect(receipt).toMatchObject({
    outcome: "failed",
    code: "install_failed",
    recoveryArtifacts: [destination],
  });
  expect(await readFile(path.join(destination, "capture.sh"), "utf8")).toBe("concurrent\n");
});

test("destination directory swap cannot redirect template publication", async () => {
  const root = await temporary();
  const outside = path.join(root, "outside");
  const moved = path.join(root, "claimed-moved");
  await mkdir(outside);
  const receipt = await install(root, "Scripts/TailrocksVisualQA", {
    afterDestinationClaim: async (destination) => {
      await rename(destination, moved);
      await symlink(outside, destination);
    },
  });
  expect(receipt).toMatchObject({ outcome: "failed", code: "install_failed" });
  expect(await readdir(outside)).toEqual([]);
  expect(await readdir(moved)).toEqual([]);
});

test("installed supervisor emits one terminal receipt for success and recovery failure", async () => {
  if (process.platform !== "darwin") return;
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  await grantPermissions(harness);
  const app = path.join(root, "App.app");
  const output = path.join(root, "capture.png");
  await mkdir(app);
  const capture = path.join(harness, "capture.sh");
  await writeFile(
    capture,
    '#!/bin/sh\nprintf png > "$2"\nprintf \'{"pid":42}\\n\' > "$2.json"\nprintf \'{"pid":42}\\n\'\n',
  );
  const success = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", app, output],
    cwd: harness,
  });
  expect(success.code).toBe(0);
  expect(JSON.parse(success.stdout)).toMatchObject({
    outcome: "success",
    code: "capture_completed",
    mutations: [output, `${output}.json`],
    data: { pid: 42 },
  });
  await writeFile(
    capture,
    `#!/bin/sh\nprintf 'tailrocks-recovery-artifact-base64:%s\\n' '${Buffer.from("/tmp/before").toString("base64")}' '${Buffer.from("/tmp/applied").toString("base64")}' >&2\nexit 1\n`,
  );
  const failure = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", app, output],
    cwd: harness,
  });
  expect(failure.code).toBe(1);
  expect(JSON.parse(failure.stdout)).toMatchObject({
    outcome: "failed",
    code: "capture_failed",
    recovery_artifacts: ["/tmp/before", "/tmp/applied"],
  });
  const unusualRecovery = path.join(root, "My Captures\ncontrol", "capture.png");
  await writeFile(
    capture,
    `#!/bin/sh\nprintf 'tailrocks-recovery-artifact-base64:%s\\n' '${Buffer.from(unusualRecovery).toString("base64")}' >&2\nexit 1\n`,
  );
  const unusualFailure = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", app, unusualRecovery],
    cwd: harness,
  });
  expect(JSON.parse(unusualFailure.stdout)).toMatchObject({
    outcome: "failed",
    recovery_artifacts: [unusualRecovery],
  });
  await writeFile(
    capture,
    '#!/bin/sh\nprintf png > "$2"\nprintf \'{"pid":42}\\n\' > "$2.json"\nprintf \'{"pid":42}\\n\'\n',
  );
  const state = path.join(harness, "state.sh");
  await writeFile(
    state,
    '#!/bin/sh\nshift 3\n"$@"\nstatus=$?\necho tailrocks-state-restoration:restored >&2\nexit "$status"\n',
  );
  const stateResult = await runBoundedCommand({
    command: ["bun", "run.ts", "state", "--", "with", "dark", "--", "capture", app, output],
    cwd: harness,
  });
  const stateReceipt = JSON.parse(stateResult.stdout) as Record<string, unknown>;
  expect(stateReceipt).toMatchObject({
    outcome: "success",
    code: "state_completed",
    mutations: [output, `${output}.json`],
  });
  expect(stateReceipt.system_mutations).toHaveLength(6);
  expect((stateReceipt.system_mutations as Array<{ restored: boolean }>).every((item) => item.restored)).toBe(
    true,
  );
});

test("supervisor refuses unknown state and ambiguous capture arguments", async () => {
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  const app = path.join(root, "App.app");
  await mkdir(app);
  for (const argv of [
    ["state", "--", "with", "unknown", "--", "true"],
    ["state", "--", "snapshot", path.join(root, "unsafe")],
    ["capture", "--", "/Applications/App.app", "/tmp/out.png", "unsafe-app-arg"],
  ]) {
    const result = await runBoundedCommand({ command: ["bun", "run.ts", ...argv], cwd: harness });
    expect(result.code).toBe(2);
    expect(JSON.parse(result.stdout)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
  const rawState = await runBoundedCommand({
    command: ["/bin/sh", "state.sh", "with", "dark", "--", "/usr/bin/true"],
    cwd: harness,
  });
  expect(rawState.code).toBe(2);
  expect(rawState.stderr).toContain("with permits only the installed capture operation");
});

test("supervisor caps timing overrides and strips ambient secrets from children", async () => {
  if (process.platform !== "darwin") return;
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  const app = path.join(root, "App.app");
  const output = path.join(root, "capture.png");
  await mkdir(app);
  for (const [name, value] of [
    ["TAILROCKS_VISUAL_QA_TIMEOUT_MILLISECONDS", "600001"],
    ["TAILROCKS_VISUAL_QA_KILL_GRACE_MILLISECONDS", "10001"],
  ]) {
    const result = await runBoundedCommand({
      command: ["bun", "run.ts", "capture", "--", app, output],
      cwd: harness,
      env: { [name]: value },
    });
    expect(result.code).toBe(2);
    expect(JSON.parse(result.stdout)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
  await writeFile(
    path.join(harness, "capture.sh"),
    '#!/bin/sh\nprintf png > "$2"\nprintf \'{"pid":42}\\n\' > "$2.json"\nprintf \'{"secret":"%s","override":"%s","path":"%s"}\\n\' "${SECRET_TOKEN:-}" "${TAILROCKS_DEFAULTS_COMMAND:-}" "$PATH"\n',
  );
  const result = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", app, output],
    cwd: harness,
    env: { SECRET_TOKEN: "must-not-cross", TAILROCKS_DEFAULTS_COMMAND: "/tmp/hostile" },
  });
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    data: { secret: "", override: "", path: "/usr/bin:/bin:/usr/sbin:/sbin" },
  });
});

test("exact app and global state locks refuse concurrent operations and preserve foreign locks", async () => {
  if (process.platform !== "darwin") return;
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  const app = path.join(root, "App.app");
  const output = path.join(root, "capture.png");
  await mkdir(app);
  const captureLock = path.join(
    tmpdir(),
    `tailrocks-macos-visual-capture-${createHash("sha256")
      .update(await realpath(app))
      .digest("hex")
      .slice(0, 24)}.lock`,
  );
  await writeFile(captureLock, "foreign", { mode: 0o600 });
  const capture = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", app, output],
    cwd: harness,
  });
  expect(capture.code).toBe(2);
  expect(await readFile(captureLock, "utf8")).toBe("foreign");
  await rm(captureLock);
  const stateLock = path.join(tmpdir(), "tailrocks-macos-visual-state.lock");
  await writeFile(stateLock, "foreign", { mode: 0o600 });
  const state = await runBoundedCommand({
    command: [
      "bun",
      "run.ts",
      "state",
      "--",
      "recover",
      path.join(root, "before"),
      path.join(root, "applied"),
    ],
    cwd: harness,
  });
  expect(state.code).toBe(2);
  expect(await readFile(stateLock, "utf8")).toBe("foreign");
  await rm(stateLock);
});

test("supervisor reports known recovery paths after timeout", async () => {
  if (process.platform !== "darwin") return;
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  await grantPermissions(harness);
  const app = path.join(root, "App.app");
  await mkdir(app);
  await writeFile(
    path.join(harness, "state.sh"),
    '#!/bin/sh\nprintf before > "$TAILROCKS_STATE_BEFORE"\nprintf applied > "$TAILROCKS_STATE_APPLIED"\nsleep 10\n',
  );
  const result = await runBoundedCommand({
    command: [
      "bun",
      "run.ts",
      "state",
      "--",
      "with",
      "dark",
      "--",
      "capture",
      app,
      path.join(root, "capture.png"),
    ],
    cwd: harness,
    env: {
      TAILROCKS_VISUAL_QA_TIMEOUT_MILLISECONDS: "50",
      TAILROCKS_VISUAL_QA_KILL_GRACE_MILLISECONDS: "50",
    },
    timeoutMilliseconds: 2_000,
  });
  const receipt = JSON.parse(result.stdout) as { code: string; recovery_artifacts: string[] };
  expect(receipt.code).toBe("timeout");
  expect(receipt.recovery_artifacts).toHaveLength(2);
});

test("CLI rejects unknown, duplicate, and trailing arguments with one receipt", async () => {
  for (const args of [["--unknown", "x"], ["--root", "/tmp", "--root", "/tmp"], ["--root"]]) {
    const result = await runBoundedCommand({ command: ["bun", "install.ts", ...args], cwd: import.meta.dir });
    expect(result.code).toBe(2);
    expect(result.stderr).toBe("");
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(result.stdout)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
});
