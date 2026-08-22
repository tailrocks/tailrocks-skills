import { expect, test } from "bun:test";
import {
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

import { atomicRecoveryArtifacts, atomicWriteFiles } from "./atomic-file-transaction";

test("publishes all files or restores all originals", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "atomic-files-")));
  const first = path.join(root, "first");
  const second = path.join(root, "second");
  await writeFile(first, "old-one");
  await writeFile(second, "old-two");
  await atomicWriteFiles([
    { file: first, expected: "old-one", content: "new-one" },
    { file: second, expected: "old-two", content: "new-two" },
  ]);
  expect(await readFile(first, "utf8")).toBe("new-one");
  expect(await readFile(second, "utf8")).toBe("new-two");
});

test("concurrent replacement survives and retains recovery", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "atomic-files-")));
  const first = path.join(root, "first");
  const second = path.join(root, "second");
  await writeFile(first, "old-one");
  await writeFile(second, "old-two");
  await expect(
    atomicWriteFiles(
      [
        { file: first, expected: "old-one", content: "new-one" },
        { file: second, expected: "old-two", content: "new-two" },
      ],
      {
        afterPublish: async (file, index) => {
          if (index !== 0) return;
          await rm(file);
          await writeFile(file, "concurrent");
          await writeFile(second, "blocker");
        },
      },
    ),
  ).rejects.toThrow("transaction restore retained");
  expect(await readFile(first, "utf8")).toBe("concurrent");
  expect(await readFile(second, "utf8")).toBe("blocker");
  expect((await readdir(root)).some((name) => name.includes(".restore"))).toBe(true);
});

test("parent replacement cannot redirect a mutation", async () => {
  const base = await realpath(await mkdtemp(path.join(tmpdir(), "atomic-parent-")));
  const root = path.join(base, "root");
  const moved = path.join(base, "moved");
  const outside = path.join(base, "outside");
  await mkdir(root);
  await mkdir(outside);
  await writeFile(path.join(root, "target"), "old");
  await writeFile(path.join(outside, "target"), "outside");
  let swapped = false;
  await expect(
    atomicWriteFiles([{ file: path.join(root, "target"), expected: "old", content: "new" }], {
      beforeMutation: async (_file, operation) => {
        if (swapped || operation !== "rename") return;
        swapped = true;
        await rename(root, moved);
        await symlink(outside, root);
      },
    }),
  ).rejects.toThrow("transaction parent moved");
  expect(await readFile(path.join(outside, "target"), "utf8")).toBe("outside");
  expect(await readFile(path.join(moved, "target"), "utf8")).toBe("old");
  expect((await readdir(moved)).filter((name) => name.includes(".tailrocks-"))).toEqual([]);
});

test("parent disappearance during anchor spawn refuses promptly without leaking", async () => {
  const base = await realpath(await mkdtemp(path.join(tmpdir(), "atomic-anchor-")));
  const root = path.join(base, "root");
  const moved = path.join(base, "moved");
  await mkdir(root);
  await writeFile(path.join(root, "target"), "old");
  const started = performance.now();
  await expect(
    atomicWriteFiles([{ file: path.join(root, "target"), expected: "old", content: "new" }], {
      beforeAnchorSpawn: async () => {
        await rename(root, moved);
      },
    }),
  ).rejects.toThrow();
  expect(performance.now() - started).toBeLessThan(2_000);
  expect(await readFile(path.join(moved, "target"), "utf8")).toBe("old");
});

test("helper exit during publish returns bounded recovery evidence", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "atomic-helper-")));
  const target = path.join(root, "target");
  await writeFile(target, "old");
  let killed = false;
  let caught: unknown;
  const started = performance.now();
  try {
    await atomicWriteFiles([{ file: target, expected: "old", content: "new" }], {
      beforeAnchoredOperation: async (_directory, operation, pid) => {
        if (killed || operation !== "link") return;
        killed = true;
        process.kill(pid, "SIGKILL");
      },
    });
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeDefined();
  expect(performance.now() - started).toBeLessThan(2_000);
  const recovery = atomicRecoveryArtifacts(caught);
  expect(recovery.length).toBeGreaterThanOrEqual(1);
  for (const artifact of recovery) expect(await Bun.file(artifact).exists()).toBe(true);
});
