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

const serviceRoutingMatrix = [
  "| Public API | Evolution or mutation | `tailrocks-graphql-best-practices` |",
  "| Public API | Read-only review or audit | `tailrocks-graphql-review` |",
  "| Cross-service Rust contract | Evolution or mutation | `tailrocks-grpc-best-practices` |",
  "| Cross-service Rust contract | Read-only review or audit | `tailrocks-grpc-review` |",
];

test("gRPC evolution and review have exclusive authority", async () => {
  const evolve = await source("tailrocks-grpc-best-practices");
  const review = await source("tailrocks-grpc-review");
  expect(evolve).toContain('argument-hint: "<cross-service gRPC contract evolution>"');
  expect(review).toContain('argument-hint: "<gRPC diff, module, or whole service surface>"');
  expect(evolve).not.toContain("Select the mode");
  expect(evolve).toContain("Use tailrocks-grpc-review for findings");
  expect(evolve).toMatch(/no\s+resolvable proto, RPC, or adapter target is refused pending scope/);
  expect(review).toContain("This owner never edits");
  expect(review).toMatch(/exact diff,\s+path set, or cross-service revision/);
  expect(review).toContain("compiled descriptors, field-number history");
  expect(review).toContain("Never substitute a moving `main`");
  expect(review).toContain("Never install, run");
  expect(review).toContain("`buf generate`");
  expect(review).toContain("bounded loopback with controlled fixtures only");
  for (const owner of [evolve, review]) {
    expect(owner).toContain("Classify the surface before requested authority");
    expect(owner).toContain("selects exactly one owner");
    expect(owner).toContain("If either axis is unresolved");
    expect(owner).toContain("If the selected owner is not this skill");
    expectOrdered(owner, serviceRoutingMatrix);
  }
});

test("gRPC owners have closed non-overlapping output contracts", async () => {
  const evolve = await source("tailrocks-grpc-best-practices");
  const review = await source("tailrocks-grpc-review");
  expect(evolve).toContain("## gRPC Evolution Report");
  expect(review).toContain("## gRPC Findings");
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
  expect(evolve).not.toContain("## gRPC Findings");
  expect(review).not.toContain("## gRPC Evolution Report");
});

test("gRPC review loads exact canonical references", async () => {
  for (const name of ["operations.md", "proto-contracts.md", "tonic-server-client.md"])
    expect(await source("tailrocks-grpc-review", `references/${name}`)).toBe(
      await source("tailrocks-grpc-best-practices", `references/${name}`),
    );
  expect(await source("tailrocks-grpc-review", "references/runtime-trust.md")).toContain("# Runtime trust");
});

test("gRPC manifest, registry, and review routes are exact", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of ["operations.md", "proto-contracts.md", "tonic-server-client.md"])
    expect(manifest.entries).toContainEqual({
      source: `skills/tailrocks-grpc-best-practices/references/${name}`,
      destinations: [`skills/tailrocks-grpc-review/references/${name}`],
    });
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: "tailrocks-grpc-best-practices", class: "MODEL_POLICY" });
  expect(registry.owners).toContainEqual({ skill: "tailrocks-grpc-review", class: "MANUAL_ONLY" });
  expect(await source("tailrocks-review-pr")).toMatch(
    /\|\s*`\.proto`, tonic\/prost adapters\s*\|\s*`tailrocks-grpc-review`\s*\|/,
  );
  const graphqlReview = await source("tailrocks-graphql-review");
  const graphqlEvolution = await source("tailrocks-graphql-best-practices");
  for (const owner of [graphqlEvolution, graphqlReview]) expectOrdered(owner, serviceRoutingMatrix);
  const evolveAgent = await source("tailrocks-grpc-best-practices", "agents/openai.yaml");
  const reviewAgent = await source("tailrocks-grpc-review", "agents/openai.yaml");
  expect(evolveAgent).toContain("allow_implicit_invocation: true");
  expect(reviewAgent).toContain("allow_implicit_invocation: false");
  expect(evolveAgent).toContain("$tailrocks-grpc-best-practices");
  expect(reviewAgent).toContain("$tailrocks-grpc-review");
  expect(evolveAgent).not.toContain("$tailrocks-grpc-review");
  expect(reviewAgent).not.toContain("$tailrocks-grpc-best-practices");
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ skills: string[] }>;
  };
  expect(
    catalog.groups.flatMap((group) => group.skills).filter((skill) => skill.startsWith("tailrocks-grpc")),
  ).toEqual(["tailrocks-grpc-best-practices", "tailrocks-grpc-review"]);
  const choosing = await readFile(path.join(root, "docs/content/docs/choosing.mdx"), "utf8");
  expect(choosing).toContain("A cross-service gRPC contract must evolve");
  expect(choosing).toContain("needs read-only proto, adapter, operations, and wire-contract findings");
  expect(
    await readFile(
      path.join(root, "docs/content/docs/skills/tailrocks-grpc-best-practices/index.mdx"),
      "utf8",
    ),
  ).toContain("Arguments: `<cross-service gRPC contract evolution>`");
  expect(
    await readFile(path.join(root, "docs/content/docs/skills/tailrocks-grpc-review/index.mdx"), "utf8"),
  ).toContain("Arguments: `<gRPC diff, module, or whole service surface>`");
  expect(
    await readFile(
      path.join(root, "docs/content/docs/skills/tailrocks-grpc-best-practices/definition.mdx"),
      "utf8",
    ),
  ).toContain("## gRPC Evolution Report");
  expect(
    await readFile(path.join(root, "docs/content/docs/skills/tailrocks-grpc-review/definition.mdx"), "utf8"),
  ).toContain("## gRPC Findings");
});
