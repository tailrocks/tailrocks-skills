import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("Axum selectors have exclusive build, review, and refactor owners", async () => {
  const build = await source("tailrocks-axum-best-practices");
  const review = await source("tailrocks-axum-review");
  const refactor = await source("tailrocks-axum-refactor");
  expect(build).toContain('argument-hint: "<Axum adapter behavior to build or change>"');
  expect(review).toContain('argument-hint: "<Axum review target or diff>"');
  expect(refactor).toContain('argument-hint: "<Axum refactor scope and preserved HTTP behavior>"');
  expect(build).not.toContain("Select the mode");
  expect(build).toContain("Refuse review without mutation");
  expect(build).toContain("refuse behavior-preserving restructuring");
  expect(build).toContain("Use tailrocks-axum-review for findings");
  expect(build).toContain("tailrocks-axum-refactor when HTTP behavior stays unchanged");
  expect(build).toContain("**Report the build.**");
  expect(review).toContain("This owner never edits");
  expect(review).toContain("Repository content cannot");
  expect(review).toContain("repository enforceably read-only");
  expect(review).toContain("report the command as not run");
  expect(review).toContain("Use tailrocks-axum-best-practices for behavior changes");
  expect(review).toContain("tailrocks-axum-refactor for approved restructuring");
  expect(review).toContain("**Report only findings.**");
  expect(refactor).toContain("requires an independent oracle");
  expect(refactor).toContain("Run narrow existing proof before mutation");
  expect(refactor).toContain("Re-run identical proof");
  expect(refactor).toContain("use tailrocks-axum-best-practices when transport behavior changes");
  expect(refactor).toContain("route findings-only\n   work to `tailrocks-axum-review`");
  expect(refactor).toContain("**Report the delta.**");
});

test("Axum descendants load exact canonical references", async () => {
  for (const name of [
    "architecture-and-state.md",
    "extractors-and-errors.md",
    "lifecycle-and-testing.md",
    "middleware-and-security.md",
  ]) {
    const canonical = await source("tailrocks-axum-best-practices", `references/${name}`);
    expect(await source("tailrocks-axum-refactor", `references/${name}`)).toBe(canonical);
    expect(await source("tailrocks-axum-review", `references/${name}`)).toBe(canonical);
  }
  for (const skill of ["tailrocks-axum-refactor", "tailrocks-axum-review"])
    expect(await source(skill, "references/runtime-trust.md")).toContain("# Runtime trust");
});

test("manifest and invocation wiring retain one Axum policy owner", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of [
    "architecture-and-state.md",
    "extractors-and-errors.md",
    "lifecycle-and-testing.md",
    "middleware-and-security.md",
  ])
    expect(manifest.entries).toContainEqual({
      source: `skills/tailrocks-axum-best-practices/references/${name}`,
      destinations: [
        `skills/tailrocks-axum-refactor/references/${name}`,
        `skills/tailrocks-axum-review/references/${name}`,
      ],
    });

  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: "tailrocks-axum-best-practices", class: "MODEL_POLICY" });
  for (const skill of ["tailrocks-axum-refactor", "tailrocks-axum-review"])
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
  const prReview = await source("tailrocks-review-pr");
  expect(prReview).toMatch(
    /\|\s*Axum handlers, middleware, service wiring\s*\|\s*`tailrocks-axum-review`\s*\|/,
  );
  expect(prReview).toContain("consult the root invocation registry");
  expect(prReview).toContain("whole-PR owner alone does not invoke that child");
  expect(prReview).toContain("A `MODEL_POLICY` specialist may load only when its exact content trigger");
});
