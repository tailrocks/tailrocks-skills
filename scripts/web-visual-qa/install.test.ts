import { expect, test } from "bun:test";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "../bounded-command";
import { install } from "./install";

async function temporary(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "web-visual-qa-install-")));
}

test("installs config, guarded fixture, spec, and route transactionally", async () => {
  const root = await temporary();
  const result = await install(root);
  expect(result).toMatchObject({ outcome: "installed", code: "installed" });
  expect(result.files).toHaveLength(5);
  const config = await readFile(path.join(root, "playwright.visual.config.ts"), "utf8");
  expect(config).not.toContain("webServer");
  expect(config).not.toContain("reuseExistingServer");
  expect(await readFile(path.join(root, "tests/visual/guarded-test.ts"), "utf8")).toContain(
    "await verifyGuard()",
  );
});

test("one existing target refuses before any other target is written", async () => {
  const root = await temporary();
  expect((await install(root)).outcome).toBe("installed");
  const result = await install(root);
  expect(result).toMatchObject({ outcome: "refused", code: "collision", files: [] });
});

test("rollback never deletes concurrently replaced or raced targets", async () => {
  const root = await temporary();
  const replacement = "concurrent replacement\n";
  const blocker = "concurrent blocker\n";
  const result = await install(root, {
    afterPublish: async (destination, index) => {
      if (index !== 0) return;
      await rm(destination);
      await writeFile(destination, replacement);
      await writeFile(path.join(root, "tests/visual/global-setup.ts"), blocker);
    },
  });
  expect(result).toMatchObject({ outcome: "failed", code: "install_failed" });
  expect(await readFile(path.join(root, "playwright.visual.config.ts"), "utf8")).toBe(replacement);
  expect(await readFile(path.join(root, "tests/visual/global-setup.ts"), "utf8")).toBe(blocker);
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
