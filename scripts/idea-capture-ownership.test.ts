import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

test("idea delegates its whole first-lane transaction to one installed command", async () => {
  const skill = await readFile(path.join(root, "skills/tailrocks-idea/SKILL.md"), "utf8");
  expect(skill).toContain("scripts/idea-capture.ts --skill-file");
  expect(skill).toContain("sole writer of the item");
  expect(skill).toContain("receipt is the only\n   success oracle");
  expect(skill).toContain("must never be duplicated or deleted speculatively");
  expect(skill).not.toMatch(/legacy|deprecated|alias/i);
});

test("idea command constructs canonical DRAFT bytes and composes hardened PR publication", async () => {
  const bootstrap = await readFile(path.join(root, "scripts/idea-capture.ts"), "utf8");
  const source = await readFile(path.join(root, "scripts/idea-capture-core.ts"), "utf8");
  const readme = await readFile(path.join(root, "scripts/idea-capture/README.md"), "utf8");
  expect(source).toContain('"tailrocks.idea-capture-input/v1"');
  expect(source).toContain('"tailrocks.idea-capture/v1"');
  expect(source).toContain("await atomicWriteFiles(");
  expect(source).toContain("await createPullRequest(");
  expect(source).toContain("Tailrocks-Skill: tailrocks-idea");
  expect(bootstrap).toContain('await import("./idea-capture-core")');
  expect(bootstrap).not.toMatch(/^import .*\.\/idea-capture-core/m);
  expect(readme).toContain("Branch `roadmap/<slug>` exists before");
  expect(readme).toContain("No force push occurs");
});
