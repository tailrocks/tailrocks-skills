import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

test("document and merge consume one discovery and final-order command", async () => {
  const skill = await readFile(path.join(root, "skills/tailrocks-document/SKILL.md"), "utf8");
  const merge = await readFile(path.join(root, "scripts/merge-preflight.ts"), "utf8");
  expect(skill.match(/merge-preflight `documentation` subcommand/g)).toHaveLength(1);
  expect(skill).toContain("merge-preflight TypeScript");
  expect(skill).toContain("merge-base ∪ HEAD");
  expect(skill).toContain("steps 1, 2, 5, and the read-only shared predicate in step 6");
  expect(merge).toContain('from "./documentation-discovery"');
  expect(merge.match(/loadDocumentationDiscovery\(/g)?.length).toBe(3);
});

test("discovery has one current schema and no compatibility alias", async () => {
  const source = await readFile(path.join(root, "scripts/documentation-discovery.ts"), "utf8");
  expect(source).toContain('"tailrocks.documentation-discovery/v1"');
  expect(source).toContain("documentation_paths");
  expect(source).toContain("command_sources");
  expect(source).not.toMatch(/deprecated|alias|legacy/i);
});
