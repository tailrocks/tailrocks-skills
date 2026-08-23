import { expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const directory = path.join(root, "shared", "references");
const sources = [
  "contribution-handoff.md",
  "design-pipeline.md",
  "pr-conventions.md",
  "repository-audit-lanes.md",
  "runtime-trust.md",
  "version-policy.md",
];

test("shared policy has exactly six canonical sources", async () => {
  expect((await readdir(directory)).sort()).toEqual(sources);
  for (const file of sources) {
    const source = await readFile(path.join(directory, file), "utf8");
    expect(source.startsWith("# ")).toBeTrue();
    expect(source.trim().split("\n").length).toBeGreaterThan(5);
  }
});

test("shared policy stays source-neutral and owner-relative-link free", async () => {
  for (const file of sources) {
    const source = await readFile(path.join(directory, file), "utf8");
    expect(source).not.toMatch(/https?:\/\/(?:www\.)?(?:github|gitlab|bitbucket|codeberg)\.com/i);
    expect(source).not.toMatch(/\]\((?:\.\.\/|references\/|templates\/)/);
    expect(source).not.toMatch(/\b(?:Claude|Codex|Gemini|GPT|Grok)\b/i);
  }
});

test("common version and design sources contain no ecosystem adapter", async () => {
  const version = await readFile(path.join(directory, "version-policy.md"), "utf8");
  expect(version).not.toMatch(/\b(?:Cargo|crates\.io|npm|Bun|Rust|TanStack|Swift)\b/);

  const design = await readFile(path.join(directory, "design-pipeline.md"), "utf8");
  expect(design).not.toMatch(/\b(?:AppKit|Playwright|React|ratatui|SwiftUI|Tailwind)\b/);
});
