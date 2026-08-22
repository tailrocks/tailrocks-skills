import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const source = (skill: string, relative = "SKILL.md") =>
  readFile(path.join(root, "skills", skill, relative), "utf8");

test("gRPC evolution and review have exclusive authority", async () => {
  const evolve = await source("tailrocks-grpc-best-practices");
  const review = await source("tailrocks-grpc-review");
  expect(evolve).not.toContain("Select the mode");
  expect(evolve).toContain("Refuse review/audit without mutation");
  expect(evolve).toContain("Use tailrocks-grpc-review for findings");
  expect(review).toContain("This owner never edits");
  expect(review).toContain("compiled descriptors, field-number history");
  expect(review).toContain("Never substitute a moving `main`");
  expect(review).toContain("Never install, run");
  expect(review).toContain("`buf generate`");
  expect(review).toContain("bounded loopback with controlled fixtures only");
  expect(review).toContain("name `tailrocks-graphql-review`, and stop");
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
  expect(await source("tailrocks-review-pr")).toContain(
    "| `.proto`, tonic/prost adapters | `tailrocks-grpc-review` |",
  );
  const graphqlReview = await source("tailrocks-graphql-review");
  expect(graphqlReview).toContain("refuse this review, name");
  expect(graphqlReview).toContain("`tailrocks-grpc-review`, and stop");
});
