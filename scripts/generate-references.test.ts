import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
          "skills/tailrocks-rust-project-audit/references/runtime-trust.md",
          "skills/tailrocks-rust-project-remediate/references/runtime-trust.md",
          "skills/tailrocks-rust-project-setup/references/runtime-trust.md",
          "skills/tailrocks-tanstack-project-audit/references/runtime-trust.md",
          "skills/tailrocks-tanstack-project-migrate/references/runtime-trust.md",
          "skills/tailrocks-tanstack-project-remediate/references/runtime-trust.md",
          "skills/tailrocks-tanstack-project-setup/references/runtime-trust.md",
          "skills/tailrocks-two/references/runtime-trust.md",
          "skills/tailrocks-typescript-best-practices/references/runtime-trust.md",
          "skills/tailrocks-typescript-migrate/references/runtime-trust.md",
          "skills/tailrocks-typescript-refactor/references/runtime-trust.md",
          "skills/tailrocks-typescript-review/references/runtime-trust.md",
        ],
      },
      {
        source: "skill-authoring/references/operational-contract.md",
        destinations: ["skills/tailrocks-one/references/operational-contract.md"],
      },
      ...[
        "lints-clippy-rustfmt.md",
        "supply-chain-and-testing.md",
        "toolchain-and-mise.md",
        "version-policy.md",
        "workspace-and-layout.md",
      ].map((name) => ({
        source: `skills/tailrocks-rust-project-setup/references/${name}`,
        destinations: [
          `skills/tailrocks-rust-project-audit/references/${name}`,
          `skills/tailrocks-rust-project-remediate/references/${name}`,
        ],
      })),
      ...[
        "boundaries-and-data.md",
        "shadcn-ui.md",
        "stack-and-layout.md",
        "tooling-and-quality.md",
        "version-policy.md",
      ].map((name) => ({
        source: `skills/tailrocks-tanstack-project-setup/references/${name}`,
        destinations: [
          `skills/tailrocks-tanstack-project-audit/references/${name}`,
          `skills/tailrocks-tanstack-project-migrate/references/${name}`,
          `skills/tailrocks-tanstack-project-remediate/references/${name}`,
        ],
      })),
      ...[
        "boundaries-and-domain-values.md",
        "mutation-and-api-safety.md",
        "react-and-async.md",
        "state-and-errors.md",
      ].map((name) => ({
        source: `skills/tailrocks-typescript-best-practices/references/${name}`,
        destinations: [
          `skills/tailrocks-typescript-refactor/references/${name}`,
          `skills/tailrocks-typescript-review/references/${name}`,
        ],
      })),
    ],
  };
}

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "generated-references-"));
  await write(root, "shared/references/runtime-trust.md", "runtime\n");
  await write(root, "skill-authoring/references/operational-contract.md", "contract\n");
  await write(root, "skills/tailrocks-one/SKILL.md");
  await write(root, "skills/tailrocks-two/SKILL.md");
  for (const skill of [
    "tailrocks-rust-project-audit",
    "tailrocks-rust-project-remediate",
    "tailrocks-rust-project-setup",
    "tailrocks-tanstack-project-audit",
    "tailrocks-tanstack-project-migrate",
    "tailrocks-tanstack-project-remediate",
    "tailrocks-tanstack-project-setup",
    "tailrocks-typescript-migrate",
    "tailrocks-typescript-best-practices",
    "tailrocks-typescript-refactor",
    "tailrocks-typescript-review",
  ])
    await write(root, `skills/${skill}/SKILL.md`);
  for (const name of [
    "lints-clippy-rustfmt.md",
    "supply-chain-and-testing.md",
    "toolchain-and-mise.md",
    "version-policy.md",
    "workspace-and-layout.md",
  ])
    await write(root, `skills/tailrocks-rust-project-setup/references/${name}`, `${name}\n`);
  for (const name of [
    "boundaries-and-data.md",
    "shadcn-ui.md",
    "stack-and-layout.md",
    "tooling-and-quality.md",
    "version-policy.md",
  ])
    await write(root, `skills/tailrocks-tanstack-project-setup/references/${name}`, `${name}\n`);
  for (const name of [
    "boundaries-and-domain-values.md",
    "mutation-and-api-safety.md",
    "react-and-async.md",
    "state-and-errors.md",
  ])
    await write(root, `skills/tailrocks-typescript-best-practices/references/${name}`, `${name}\n`);
  await write(root, "generated-references.json", `${JSON.stringify(manifest(), null, 2)}\n`);
  return root;
}

test("writes every destination atomically and then proves byte equality", async () => {
  const root = await fixture();
  const written = await generateReferences(root, "write");
  expect(written).toMatchObject({
    schema: "tailrocks.generated-references-receipt/v1",
    mode: "write",
    sources: 16,
    destinations: 47,
    byte_identical: 47,
    written: 47,
  });
  expect(written.mutations).toHaveLength(48);
  expect(written.mutations).toContain("generated-references.lock.json");
  expect(await readFile(path.join(root, "skills/tailrocks-two/references/runtime-trust.md"), "utf8")).toBe(
    "runtime\n",
  );
  expect((await generateReferences(root, "check")).byte_identical).toBe(47);
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
  expect((await generateReferences(root, "check")).byte_identical).toBe(47);
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

test("admits only declared owner-family reference sources and counts them", async () => {
  const root = await fixture();
  expect((await generateReferences(root, "write")).sources).toBe(16);

  const source = manifest();
  const entries = source.entries as Array<{ source: string; destinations: string[] }>;
  await rm(path.join(root, "skills/tailrocks-rust-project-setup/SKILL.md"));
  entries[0]!.destinations = entries[0]!.destinations.filter(
    (destination) => !destination.includes("tailrocks-rust-project-setup"),
  );
  await write(root, "generated-references.json", JSON.stringify(source));
  await expect(generateReferences(root, "check")).rejects.toThrow("source owner is missing");

  const omitted = await fixture();
  const omittedManifest = manifest();
  (omittedManifest.entries as unknown[]).pop();
  await write(omitted, "generated-references.json", JSON.stringify(omittedManifest));
  await expect(generateReferences(omitted, "write")).rejects.toThrow("must copy exactly");

  const redirected = await fixture();
  const redirectedManifest = manifest();
  (redirectedManifest.entries as Array<{ destinations: string[] }>)[2]!.destinations.pop();
  await write(redirected, "generated-references.json", JSON.stringify(redirectedManifest));
  await expect(generateReferences(redirected, "write")).rejects.toThrow("copy exactly");

  const generated = await fixture();
  const generatedManifest = manifest();
  (generatedManifest.entries as Array<{ source: string }>)[2]!.source =
    "skills/tailrocks-rust-project-audit/references/lints-clippy-rustfmt.md";
  await write(generated, "generated-references.json", JSON.stringify(generatedManifest));
  await expect(generateReferences(generated, "write")).rejects.toThrow("source is invalid");
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

test("concurrent replacement refuses, survives rollback, and retains recovery", async () => {
  const root = await fixture();
  const first = "skills/tailrocks-one/references/runtime-trust.md";
  const second = "skills/tailrocks-two/references/runtime-trust.md";
  await write(root, first, "old one\n");
  await write(root, second, "old two\n");
  await expect(
    generateReferences(root, "write", "generated-references.json", {
      afterPublish: async (file, index) => {
        if (index !== 0) return;
        await rm(file);
        await writeFile(file, "concurrent replacement\n");
        await writeFile(path.join(root, second), "concurrent blocker\n");
      },
    }),
  ).rejects.toThrow("transaction restore retained");
  expect(await readFile(path.join(root, first), "utf8")).toBe("concurrent replacement\n");
  expect(await readFile(path.join(root, second), "utf8")).toBe("concurrent blocker\n");
  expect((await readdirRecursive(root)).some((file) => file.includes(".restore"))).toBe(true);
});

async function readdirRecursive(root: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await Array.fromAsync(new Bun.Glob("**/*").scan({ cwd: root, dot: true })))
    files.push(entry);
  return files;
}
