import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { generateReferences } from "./generate-references";

async function write(root: string, relative: string, source = "source\n"): Promise<void> {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, source);
}

function manifest(): Record<string, unknown> {
  return {
    $schema: "tailrocks.generated-references/v1",
    entries: [
      {
        source: "shared/references/runtime-trust.md",
        destinations: [
          "skills/tailrocks-one/references/runtime-trust.md",
          "skills/tailrocks-two/references/runtime-trust.md",
        ],
      },
      {
        source: "skill-authoring/references/operational-contract.md",
        destinations: ["skills/tailrocks-one/references/operational-contract.md"],
      },
    ],
  };
}

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "generated-references-"));
  await write(root, "shared/references/runtime-trust.md", "runtime\n");
  await write(root, "skill-authoring/references/operational-contract.md", "contract\n");
  await write(root, "skills/tailrocks-one/SKILL.md");
  await write(root, "skills/tailrocks-two/SKILL.md");
  await write(root, "generated-references.json", `${JSON.stringify(manifest(), null, 2)}\n`);
  return root;
}

test("writes every destination atomically and then proves byte equality", async () => {
  const root = await fixture();
  const written = await generateReferences(root, "write");
  expect(written).toEqual({
    schema: "tailrocks.generated-references-receipt/v1",
    mode: "write",
    sources: 2,
    destinations: 3,
    byte_identical: 3,
    written: 3,
  });
  expect(await readFile(path.join(root, "skills/tailrocks-two/references/runtime-trust.md"), "utf8")).toBe(
    "runtime\n",
  );
  expect((await generateReferences(root, "check")).byte_identical).toBe(3);
  expect((await generateReferences(root, "write")).written).toBe(0);
  expect(await readFile(path.join(root, "generated-references.lock.json"), "utf8")).toContain(
    "tailrocks.generated-references-lock/v1",
  );
});

test("check mode rejects a missing or modified destination", async () => {
  const root = await fixture();
  await generateReferences(root, "write");
  await write(root, "skills/tailrocks-one/references/runtime-trust.md", "drift\n");
  await expect(generateReferences(root, "check")).rejects.toThrow("generated-reference drift");
});

test("copies and validates canonical bytes without text normalization", async () => {
  const root = await fixture();
  const source = path.join(root, "shared/references/runtime-trust.md");
  const bytes = Buffer.from([0x23, 0x20, 0x80, 0x0d, 0x0a]);
  await writeFile(source, bytes);
  await generateReferences(root, "write");
  const destination = await readFile(path.join(root, "skills/tailrocks-one/references/runtime-trust.md"));
  expect(destination.equals(bytes)).toBe(true);
  expect((await generateReferences(root, "check")).byte_identical).toBe(3);
});

test("manifest exactly covers canonical sources and every current skill runtime copy", async () => {
  const missingSource = await fixture();
  await write(missingSource, "shared/references/extra.md");
  await expect(generateReferences(missingSource, "write")).rejects.toThrow("exactly cover canonical");

  const missingRuntime = await fixture();
  const source = manifest();
  ((source.entries as Array<Record<string, unknown>>)[0]!.destinations as string[]).pop();
  await write(missingRuntime, "generated-references.json", JSON.stringify(source));
  await expect(generateReferences(missingRuntime, "write")).rejects.toThrow("exactly cover current skills");
});

test("rejects lock-owned removal, path escapes, and unsorted entries", async () => {
  const removed = await fixture();
  await generateReferences(removed, "write");
  const narrowed = manifest();
  (narrowed.entries as Array<Record<string, unknown>>)[1]!.destinations = [];
  await write(removed, "generated-references.json", JSON.stringify(narrowed));
  await expect(generateReferences(removed, "write")).rejects.toThrow("explicit migration required");

  const escaped = await fixture();
  const unsafe = manifest();
  (unsafe.entries as Array<Record<string, unknown>>)[0]!.source = "../runtime-trust.md";
  await write(escaped, "generated-references.json", JSON.stringify(unsafe));
  await expect(generateReferences(escaped, "write")).rejects.toThrow("source is invalid");

  const unsorted = await fixture();
  const reversed = manifest();
  (reversed.entries as unknown[]).reverse();
  await write(unsorted, "generated-references.json", JSON.stringify(reversed));
  await expect(generateReferences(unsorted, "write")).rejects.toThrow("strictly sorted");
});

test("install failure restores every prior destination byte-identically", async () => {
  const root = await fixture();
  const first = "skills/tailrocks-one/references/runtime-trust.md";
  const second = "skills/tailrocks-two/references/runtime-trust.md";
  await write(root, first, "old one\n");
  await write(root, second, "old two\n");
  let failed = false;
  await expect(
    generateReferences(root, "write", "generated-references.json", {
      rm,
      writeFile,
      rename: async (from, to) => {
        if (!failed && String(from).includes(".next") && String(to).endsWith(second)) {
          failed = true;
          throw new Error("injected second install failure");
        }
        await rename(from, to);
      },
    }),
  ).rejects.toThrow("injected second install failure");
  expect(await readFile(path.join(root, first), "utf8")).toBe("old one\n");
  expect(await readFile(path.join(root, second), "utf8")).toBe("old two\n");
  expect((await readdirRecursive(root)).filter((file) => file.includes(".generated-")).length).toBe(0);
});

test("retains recovery backup when rollback itself cannot restore it", async () => {
  const root = await fixture();
  const first = "skills/tailrocks-one/references/runtime-trust.md";
  const second = "skills/tailrocks-two/references/runtime-trust.md";
  await write(root, first, "old one\n");
  await write(root, second, "old two\n");
  let installFailed = false;
  await expect(
    generateReferences(root, "write", "generated-references.json", {
      rm,
      writeFile,
      rename: async (from, to) => {
        if (!installFailed && String(from).includes(".next") && String(to).endsWith(second)) {
          installFailed = true;
          throw new Error("injected install failure");
        }
        if (installFailed && String(from).includes(".restore") && String(to).endsWith(first))
          throw new Error("injected rollback failure");
        await rename(from, to);
      },
    }),
  ).rejects.toThrow("rollback needs recovery");
  const recovery = (await readdirRecursive(root)).filter(
    (file) => file.endsWith(".restore") && file.includes("tailrocks-one"),
  );
  expect(recovery).toHaveLength(1);
  expect(await readFile(path.join(root, recovery[0]!), "utf8")).toBe("old one\n");
});

test("cleanup failure keeps committed output and its recovery backup", async () => {
  const root = await fixture();
  const first = "skills/tailrocks-one/references/runtime-trust.md";
  await write(root, first, "old one\n");
  let failed = false;
  await expect(
    generateReferences(root, "write", "generated-references.json", {
      rename,
      writeFile,
      rm: async (target, options) => {
        if (!failed && String(target).includes("tailrocks-one") && String(target).endsWith(".restore")) {
          failed = true;
          throw new Error("injected cleanup failure");
        }
        await rm(target, options);
      },
    }),
  ).rejects.toThrow("install committed but retained .restore files need cleanup");
  expect(await readFile(path.join(root, first), "utf8")).toBe("runtime\n");
  const recovery = (await readdirRecursive(root)).filter(
    (file) => file.endsWith(".restore") && file.includes("tailrocks-one"),
  );
  expect(recovery).toHaveLength(1);
  expect(await readFile(path.join(root, recovery[0]!), "utf8")).toBe("old one\n");
});

async function readdirRecursive(root: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await Array.fromAsync(new Bun.Glob("**/*").scan({ cwd: root, dot: true })))
    files.push(entry);
  return files;
}
