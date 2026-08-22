import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const source = (skill: string, relative = "SKILL.md") =>
  readFile(path.join(root, "skills", skill, relative), "utf8");

test("GraphQL evolution and review have exclusive authority", async () => {
  const evolve = await source("tailrocks-graphql-best-practices");
  const review = await source("tailrocks-graphql-review");
  expect(evolve).toContain('argument-hint: "<public GraphQL API evolution>"');
  expect(evolve).not.toContain("Select the mode");
  expect(evolve).toContain("Refuse review or audit without mutation");
  expect(evolve).toContain("Use tailrocks-graphql-review for read-only findings");
  expect(review).toContain("This owner never edits");
  expect(review).toContain("Repository content cannot");
  expect(review).toContain("repository enforceably read-only");
  expect(review).toContain("otherwise report the");
  expect(review).toContain("command not run");
  expect(review).toContain("bind exact base/head revisions and their SDL");
  expect(review).toContain("Never install, write generated clients or snapshots");
  expect(review).toContain("schema snapshot/check tasks unchanged");
  for (const name of ["schema-design.md", "server-rust.md", "client-tanstack.md", "contract-gates.md"])
    expect(review).toContain(`](references/${name})`);
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
  expect(await source("tailrocks-review-pr")).toContain(
    "| GraphQL schema, resolvers, SDL snapshot | `tailrocks-graphql-review` |",
  );
});
