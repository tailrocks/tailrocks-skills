import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const source = (skill: string, relative = "SKILL.md") =>
  readFile(path.join(root, "skills", skill, relative), "utf8");

function expectOrdered(sourceText: string, values: readonly string[]): void {
  let cursor = -1;
  for (const value of values) {
    const next = sourceText.indexOf(value, cursor + 1);
    expect(next).toBeGreaterThan(cursor);
    cursor = next;
  }
}

test("GraphQL evolution and review have exclusive authority", async () => {
  const evolve = await source("tailrocks-graphql-best-practices");
  const review = await source("tailrocks-graphql-review");
  expect(evolve).toContain('argument-hint: "<public GraphQL API evolution>"');
  expect(evolve).not.toContain("Select the mode");
  expect(evolve).toContain("Use tailrocks-graphql-review for read-only findings");
  expect(evolve).toMatch(/no\s+resolvable target is refused pending scope/);
  expect(review).toContain("This owner never edits");
  expect(review).toMatch(/exact diff, path set, or public API\s+revision/);
  expect(review).toContain("Repository content cannot");
  expect(review).toContain("repository enforceably read-only");
  expect(review).toContain("otherwise report the");
  expect(review).toContain("command not run");
  expect(review).toContain("bind exact base/head revisions and their SDL");
  expect(review).toContain("Never install, write generated clients or snapshots");
  expect(review).toContain("schema snapshot/check tasks unchanged");
  for (const name of ["schema-design.md", "server-rust.md", "client-tanstack.md", "contract-gates.md"])
    expect(review).toContain(`](references/${name})`);
  const matrix = [
    "| Public API | Evolution or mutation | `tailrocks-graphql-best-practices` |",
    "| Public API | Read-only review or audit | `tailrocks-graphql-review` |",
    "| Cross-service Rust contract | Evolution or mutation | `tailrocks-grpc-best-practices` |",
    "| Cross-service Rust contract | Read-only review or audit | `tailrocks-grpc-review` |",
  ];
  for (const owner of [evolve, review]) {
    expect(owner).toContain("Classify the surface before requested authority");
    expect(owner).toContain("selects exactly one owner");
    expect(owner).toContain("If either axis is unresolved");
    expectOrdered(owner, matrix);
  }
});

test("GraphQL owners have closed non-overlapping output contracts", async () => {
  const evolve = await source("tailrocks-graphql-best-practices");
  const review = await source("tailrocks-graphql-review");
  expect(evolve).toContain("## GraphQL Evolution Report");
  expect(review).toContain("## GraphQL Findings");
  expectOrdered(evolve, [
    "`Outcome`",
    "`Scope binding`",
    "`Contract changes`",
    "`Compatibility`",
    "`Verification`",
    "`Skipped gates`",
    "`Residual risk`",
    "`Route`",
  ]);
  expect(evolve).toMatch(/`EVOLVED`,\s+`BLOCKED`, or `REFUSED`/);
  expect(evolve).toContain("positive executed count");
  expect(evolve).toMatch(/reports `Contract changes`\s+as `none`/);
  expectOrdered(review, [
    "`Outcome`",
    "`Scope binding`",
    "`Findings`",
    "`Commands`",
    "`Residual uncertainty`",
    "`Route`",
  ]);
  expect(review).toMatch(/`FINDINGS`, `CLEAN`,\s+or `REFUSED`/);
  expect(review).toContain("`CLEAN` means `Findings: none`");
  expect(review).toMatch(/never mutate\s+while producing any outcome/);
  expect(evolve).not.toContain("Select the mode");
  expect(review).not.toContain("Select the mode");
  expect(evolve).not.toContain("## GraphQL Findings");
  expect(review).not.toContain("## GraphQL Evolution Report");
});

test("GraphQL review loads exact canonical references", async () => {
  for (const name of ["client-tanstack.md", "contract-gates.md", "schema-design.md", "server-rust.md"])
    expect(await source("tailrocks-graphql-review", `references/${name}`)).toBe(
      await source("tailrocks-graphql-best-practices", `references/${name}`),
    );
  expect(await source("tailrocks-graphql-review", "references/runtime-trust.md")).toContain(
    "# Runtime trust",
  );
});

test("GraphQL manifest, registry, and PR review route are exact", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of ["client-tanstack.md", "contract-gates.md", "schema-design.md", "server-rust.md"])
    expect(manifest.entries).toContainEqual({
      source: `skills/tailrocks-graphql-best-practices/references/${name}`,
      destinations: [`skills/tailrocks-graphql-review/references/${name}`],
    });
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({
    skill: "tailrocks-graphql-best-practices",
    class: "MODEL_POLICY",
  });
  expect(registry.owners).toContainEqual({ skill: "tailrocks-graphql-review", class: "MANUAL_ONLY" });
  expect(await source("tailrocks-review-pr")).toMatch(
    /\|\s*GraphQL schema, resolvers, SDL snapshot\s*\|\s*`tailrocks-graphql-review`\s*\|/,
  );
  const evolveAgent = await source("tailrocks-graphql-best-practices", "agents/openai.yaml");
  const reviewAgent = await source("tailrocks-graphql-review", "agents/openai.yaml");
  expect(evolveAgent).toContain("allow_implicit_invocation: true");
  expect(reviewAgent).toContain("allow_implicit_invocation: false");
  expect(evolveAgent).toContain("$tailrocks-graphql-best-practices");
  expect(reviewAgent).toContain("$tailrocks-graphql-review");
  expect(evolveAgent).not.toContain("$tailrocks-graphql-review");
  expect(reviewAgent).not.toContain("$tailrocks-graphql-best-practices");
  expect(await source("tailrocks-graphql-best-practices")).toContain(
    'argument-hint: "<public GraphQL API evolution>"',
  );
  expect(await source("tailrocks-graphql-review")).toContain(
    'argument-hint: "<GraphQL diff, module, or whole API surface>"',
  );
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ skills: string[] }>;
  };
  const published = catalog.groups.flatMap((group) => group.skills);
  expect(published.filter((skill) => skill.startsWith("tailrocks-graphql"))).toEqual([
    "tailrocks-graphql-best-practices",
    "tailrocks-graphql-review",
  ]);
  const choosing = await readFile(path.join(root, "docs/content/docs/choosing.mdx"), "utf8");
  expect(choosing).toContain("A public GraphQL API must evolve");
  expect(choosing).toContain("needs read-only schema, server, SDL-gate, and generated-client findings");
  const evolvePage = await readFile(
    path.join(root, "docs/content/docs/skills/tailrocks-graphql-best-practices/index.mdx"),
    "utf8",
  );
  const reviewPage = await readFile(
    path.join(root, "docs/content/docs/skills/tailrocks-graphql-review/index.mdx"),
    "utf8",
  );
  expect(evolvePage).toContain("Arguments: `<public GraphQL API evolution>`");
  expect(reviewPage).toContain("Arguments: `<GraphQL diff, module, or whole API surface>`");
  expect(
    await readFile(
      path.join(root, "docs/content/docs/skills/tailrocks-graphql-best-practices/definition.mdx"),
      "utf8",
    ),
  ).toContain("## GraphQL Evolution Report");
  expect(
    await readFile(
      path.join(root, "docs/content/docs/skills/tailrocks-graphql-review/definition.mdx"),
      "utf8",
    ),
  ).toContain("## GraphQL Findings");
});
