import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const writer = "tailrocks-swift-best-practices";
const manual = ["tailrocks-swift-refactor", "tailrocks-swift-review", "tailrocks-swift-rust-core-boundary"];

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("Swift selectors have exclusive writer, review, refactor, and Rust-core owners", async () => {
  const [write, review, refactor, boundary] = await Promise.all([
    source(writer),
    source("tailrocks-swift-review"),
    source("tailrocks-swift-refactor"),
    source("tailrocks-swift-rust-core-boundary"),
  ]);
  expect(write).toContain('argument-hint: "<Swift or SwiftUI writing task>"');
  expect(write).toContain("Selection supplies policy, never mutation or tool authority");
  expect(write).toContain("tailrocks-swift-rust-core-boundary");
  expect(write).not.toContain("## Modes");
  expect(review).toContain('argument-hint: "<Swift review target, diff, or paths>"');
  expect(review).toContain("without mutation");
  expect(review).toContain("enforceably\n   read-only tree");
  expect(review).toContain("hashes before/after");
  expect(refactor).toContain('argument-hint: "<Swift refactor target and preservation oracle>"');
  expect(refactor).toContain("preservation oracle passes");
  expect(refactor).toContain("Re-run the identical oracle");
  expect(refactor).toContain("compare-and-swap only");
  expect(boundary).toContain('argument-hint: "<Rust-core Swift boundary task or review scope>"');
  expect(boundary).toContain("Exactly one `@MainActor");
  expect(boundary).toContain("architecture-only analysis are immutable");
  expect(boundary).toContain("Rust queues effects until acknowledged");
  expect(boundary).toContain("no user-facing English in Rust");
  expect(boundary).toContain("enforceably read-only tree");
  expect(boundary).toContain("scrubbed secrets, disabled network");
  expect(boundary).toContain("never install,\n   generate, format-write");
});

test("five Swift code references generate only to review and refactor", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of [
    "accessibility.md",
    "appkit-interop.md",
    "concurrency.md",
    "errors-and-api.md",
    "swiftui.md",
  ]) {
    const canonical = await source(writer, `references/${name}`);
    expect(await source("tailrocks-swift-refactor", `references/${name}`)).toBe(canonical);
    expect(await source("tailrocks-swift-review", `references/${name}`)).toBe(canonical);
    expect(manifest.entries).toContainEqual({
      source: `skills/${writer}/references/${name}`,
      destinations: [
        `skills/tailrocks-swift-refactor/references/${name}`,
        `skills/tailrocks-swift-review/references/${name}`,
      ],
    });
  }
});

test("Rust-core references moved only to the boundary owner", async () => {
  for (const name of ["apple-platform-shell.md", "rust-core-boundary.md"]) {
    expect(
      await Bun.file(path.join(root, "skills/tailrocks-swift-rust-core-boundary/references", name)).exists(),
    ).toBe(true);
    for (const skill of [writer, "tailrocks-swift-review", "tailrocks-swift-refactor"])
      expect(await Bun.file(path.join(root, "skills", skill, "references", name)).exists()).toBe(false);
  }
});

test("only writer retains model policy and PR review routes read-only", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: writer, class: "MODEL_POLICY" });
  for (const skill of manual) expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
  expect(await source("tailrocks-review-pr")).toMatch(
    /\|\s*Swift \/ SwiftUI source\s*\|\s*`tailrocks-swift-review`\s*\|/,
  );
  const catalog = await readFile(path.join(root, "catalog.json"), "utf8");
  for (const skill of [writer, ...manual]) expect(catalog).toContain(skill);
});
