import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const writer = "tailrocks-typescript-best-practices";
const descendants = [
  "tailrocks-typescript-migrate",
  "tailrocks-typescript-refactor",
  "tailrocks-typescript-review",
];

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("TypeScript selectors have exclusive write, review, refactor, and migration owners", async () => {
  const [write, review, refactor, migrate] = await Promise.all([
    source(writer),
    source("tailrocks-typescript-review"),
    source("tailrocks-typescript-refactor"),
    source("tailrocks-typescript-migrate"),
  ]);
  expect(write).toContain('argument-hint: "<TypeScript or React writing task>"');
  expect(write).toContain("Selection alone grants no\nmutation or tool authority");
  expect(write).toContain("Refuse review, behavior-preserving refactor, and source");
  expect(write).not.toContain("## Review order");
  expect(review).toContain('argument-hint: "<TypeScript or React review target or diff>"');
  expect(review).toContain("without mutation");
  expect(review).toContain("enforceably read-only tree");
  expect(review).toContain("Hash afterward; stop on change without restoring");
  expect(refactor).toContain('argument-hint: "<TypeScript refactor target and preserved behavior>"');
  expect(refactor).toContain("preservation oracle exists");
  expect(refactor).toContain("Re-run the identical oracle");
  expect(refactor).toContain("compare-and-swap only unchanged approved files");
  expect(migrate).toContain('argument-hint: "<TypeScript compatibility migration target>"');
  expect(migrate).toContain("never a migration-plan artifact");
  expect(migrate).toContain("does\nnot own package manager, compiler/lint configuration");
  expect(migrate).toContain("never permission to run npm, pnpm, or yarn");
  expect(migrate).toContain("compare-and-swap unchanged paths");
});

test("semantic references generate only to review and refactor", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of [
    "boundaries-and-domain-values.md",
    "mutation-and-api-safety.md",
    "react-and-async.md",
    "state-and-errors.md",
  ]) {
    const canonical = await source(writer, `references/${name}`);
    expect(await source("tailrocks-typescript-refactor", `references/${name}`)).toBe(canonical);
    expect(await source("tailrocks-typescript-review", `references/${name}`)).toBe(canonical);
    expect(canonical).not.toContain("JSON.stringify(value)");
    expect(manifest.entries).toContainEqual({
      source: `skills/${writer}/references/${name}`,
      destinations: [
        `skills/tailrocks-typescript-refactor/references/${name}`,
        `skills/tailrocks-typescript-review/references/${name}`,
      ],
    });
  }
  expect(await Bun.file(path.join(root, `skills/${writer}/references/testing.md`)).exists()).toBe(true);
  expect(
    await Bun.file(path.join(root, "skills/tailrocks-typescript-migrate/references/migration.md")).exists(),
  ).toBe(true);
  expect(
    await Bun.file(path.join(root, `skills/${writer}/references/compiler-lint-testing.md`)).exists(),
  ).toBe(false);
});

test("TypeScript code owners do not reclaim project tooling", async () => {
  const all = await Promise.all([writer, ...descendants].map((skill) => source(skill)));
  const references = await Array.fromAsync(
    new Bun.Glob("skills/tailrocks-typescript-*/references/*.md").scan({ cwd: root }),
  );
  const refText = await Promise.all(references.map((file) => readFile(path.join(root, file), "utf8")));
  for (const text of [...all, ...refText]) {
    expect(text).not.toContain('"moduleResolution": "Bundler"');
    expect(text).not.toContain('"skipLibCheck": false');
  }
  const tooling = await source("tailrocks-tanstack-project-setup", "references/tooling-and-quality.md");
  expect(tooling).toContain("moduleResolution: Bundler");
  expect(tooling).toContain("skipLibCheck: false");
});

test("only the writer retains model policy and routing names the read-only owner", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: writer, class: "MODEL_POLICY" });
  for (const skill of descendants) expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
  expect(await source("tailrocks-review-pr")).toMatch(
    /\|\s*TypeScript \/ React \/ TanStack source\s*\|\s*`tailrocks-typescript-review`\s*\|/,
  );
  const catalog = await readFile(path.join(root, "catalog.json"), "utf8");
  for (const skill of [writer, ...descendants]) expect(catalog).toContain(skill);
});
