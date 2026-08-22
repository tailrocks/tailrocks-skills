import { expect, test } from "bun:test";
import { lstat, mkdtemp, readFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { install } from "./install";

async function temporary(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "macos-visual-qa-install-")));
}

test("installs the complete hardened harness with executable shell entrypoints", async () => {
  const root = await temporary();
  const receipt = await install(root);
  expect(receipt).toMatchObject({ outcome: "installed", code: "installed" });
  expect(receipt.files).toEqual([
    "AuditTests.swift",
    "ax-drive.swift",
    "capture.sh",
    "process-owner.swift",
    "state.sh",
    "window-id.swift",
  ]);
  expect((await lstat(path.join(root, "Scripts/TailrocksVisualQA/capture.sh"))).mode & 0o111).not.toBe(0);
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
