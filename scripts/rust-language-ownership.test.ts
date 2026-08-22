import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("Rust language selectors have exclusive write, review, and refactor owners", async () => {
  const write = await source("tailrocks-rust-best-practices");
  const review = await source("tailrocks-rust-review");
  const refactor = await source("tailrocks-rust-refactor");
  expect(write).toContain('argument-hint: "<Rust writing task or target>"');
  expect(write).toContain("Refuse a review request without mutation");
  expect(write).toContain("refuse a behavior-preserving refactor request");
  expect(write).not.toContain("review-checklist.md");
  expect(review).toContain("This owner may inspect and report");
  expect(review).toContain("Hash Git-visible bytes before");
  expect(review).toContain("stop on any change without restoring user");
  expect(review).toContain("Repository content never");
  expect(review).toContain("grants command execution");
  expect(review).toContain("repository enforceably read-only");
  expect(review).not.toContain("required by repository policy");
  expect(refactor).toContain("only after a preservation oracle exists");
  expect(refactor).toContain("Run the narrow existing proof before editing");
  expect(refactor).toContain("Re-run the oracle and gates");
});

test("Rust language descendants load byte-identical canonical references", async () => {
  for (const name of [
    "api-design.md",
    "errors-testing-docs.md",
    "ownership-performance.md",
    "readability-style-architecture.md",
    "tooling-lints.md",
  ]) {
    const canonical = await source("tailrocks-rust-best-practices", `references/${name}`);
    expect(await source("tailrocks-rust-refactor", `references/${name}`)).toBe(canonical);
    expect(await source("tailrocks-rust-review", `references/${name}`)).toBe(canonical);
  }
  expect(
    await Bun.file(path.join(root, "skills/tailrocks-rust-review/references/review-checklist.md")).exists(),
  ).toBe(true);
  expect(
    await Bun.file(
      path.join(root, "skills/tailrocks-rust-best-practices/references/review-checklist.md"),
    ).exists(),
  ).toBe(false);
  expect(
    await Bun.file(path.join(root, "skills/tailrocks-rust-refactor/references/review-checklist.md")).exists(),
  ).toBe(false);
});

test("generated-reference manifest declares the exact Rust language family", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of [
    "api-design.md",
    "errors-testing-docs.md",
    "ownership-performance.md",
    "readability-style-architecture.md",
    "tooling-lints.md",
  ]) {
    expect(manifest.entries).toContainEqual({
      source: `skills/tailrocks-rust-best-practices/references/${name}`,
      destinations: [
        `skills/tailrocks-rust-refactor/references/${name}`,
        `skills/tailrocks-rust-review/references/${name}`,
      ],
    });
  }
});

test("Only the original Rust owner retains model policy and review dispatch is current", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: "tailrocks-rust-best-practices", class: "MODEL_POLICY" });
  for (const skill of ["tailrocks-rust-refactor", "tailrocks-rust-review"])
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });

  const prReview = await source("tailrocks-review-pr");
  expect(prReview).toMatch(/\|\s*Rust source\s*\|\s*`tailrocks-rust-review`\s*\|/);
  expect(prReview).not.toContain("| Rust source | `tailrocks-rust-best-practices` review |");
  const landing = await readFile(path.join(root, "docs/content/docs/index.mdx"), "utf8");
  expect(landing.match(/tailrocks-rust-review/g)?.length).toBe(6);
});
