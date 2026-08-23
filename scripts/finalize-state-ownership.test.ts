import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

test("finalize skill delegates READY exclusively to the installed machine command", async () => {
  const skill = await readFile(path.join(root, "skills/tailrocks-finalize/SKILL.md"), "utf8");
  expect(skill).toContain("scripts/finalize-state.ts --skill-file");
  expect(skill).toContain("Never edit either Status field yourself");
  expect(skill).toContain("Only its atomic `published` receipt grants `READY`");
  expect(skill).not.toMatch(/fallback|legacy|deprecated|alias/i);
});

test("finalize command owns one typed readiness input and receipt", async () => {
  const source = await readFile(path.join(root, "scripts/finalize-state.ts"), "utf8");
  const readme = await readFile(path.join(root, "scripts/finalize-state/README.md"), "utf8");
  expect(source).toContain('"tailrocks.finalize-readiness/v1"');
  expect(source).toContain('"tailrocks.finalize-state/v1"');
  expect(source).toContain('publishRoadmapStatus(files, slug, item, index, "SHAPING", "READY", runtime)');
  expect(readme).toContain("sole machine writer");
  expect(readme).toContain("compare-and-swap transaction");
});
