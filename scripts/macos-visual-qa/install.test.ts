import { expect, test } from "bun:test";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "../bounded-command";
import { install } from "./install";

async function temporary(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "macos-visual-qa-install-")));
}

test("installs the complete hardened harness with shell internals behind the supervisor", async () => {
  const root = await temporary();
  const receipt = await install(root);
  expect(receipt).toMatchObject({ outcome: "installed", code: "installed" });
  expect(receipt.files).toEqual([
    "AuditTests.swift",
    "ax-drive.swift",
    "capture.sh",
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
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  const capture = path.join(harness, "capture.sh");
  await writeFile(capture, "#!/bin/sh\nprintf '{\"pid\":42}\\n'\n");
  const success = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", "/Applications/App.app", "/tmp/capture.png"],
    cwd: harness,
  });
  expect(success.code).toBe(0);
  expect(JSON.parse(success.stdout)).toMatchObject({
    outcome: "success",
    code: "capture_completed",
    mutations: ["/tmp/capture.png", "/tmp/capture.png.json"],
    data: { pid: 42 },
  });
  await writeFile(
    capture,
    "#!/bin/sh\necho 'restore failed; recovery snapshots retained: /tmp/before /tmp/applied' >&2\nexit 1\n",
  );
  const failure = await runBoundedCommand({
    command: ["bun", "run.ts", "capture", "--", "/Applications/App.app", "/tmp/capture.png"],
    cwd: harness,
  });
  expect(failure.code).toBe(1);
  expect(JSON.parse(failure.stdout)).toMatchObject({
    outcome: "failed",
    code: "capture_failed",
    recovery_artifacts: ["/tmp/before", "/tmp/applied"],
  });
  const state = path.join(harness, "state.sh");
  await writeFile(state, "#!/bin/sh\nexit 0\n");
  const stateResult = await runBoundedCommand({
    command: ["bun", "run.ts", "state", "--", "with", "dark", "--", "true"],
    cwd: harness,
  });
  const stateReceipt = JSON.parse(stateResult.stdout) as Record<string, unknown>;
  expect(stateReceipt).toMatchObject({ outcome: "success", code: "state_completed", mutations: [] });
  expect(stateReceipt.system_mutations).toHaveLength(6);
  expect((stateReceipt.system_mutations as Array<{ restored: boolean }>).every((item) => item.restored)).toBe(
    true,
  );
});

test("supervisor refuses unknown state and ambiguous capture arguments", async () => {
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  for (const argv of [
    ["state", "--", "with", "unknown", "--", "true"],
    ["capture", "--", "/Applications/App.app", "/tmp/out.png", "unsafe-app-arg"],
  ]) {
    const result = await runBoundedCommand({ command: ["bun", "run.ts", ...argv], cwd: harness });
    expect(result.code).toBe(2);
    expect(JSON.parse(result.stdout)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
});

test("supervisor reports known recovery paths after timeout", async () => {
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const harness = path.join(root, "Scripts/TailrocksVisualQA");
  await writeFile(
    path.join(harness, "state.sh"),
    '#!/bin/sh\nprintf before > "$TAILROCKS_STATE_BEFORE"\nprintf applied > "$TAILROCKS_STATE_APPLIED"\nsleep 10\n',
  );
  const result = await runBoundedCommand({
    command: ["bun", "run.ts", "state", "--", "with", "dark", "--", "true"],
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
