import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("root-cause diagnoses read-only and remediate applies approved contracts only", async () => {
  const diagnosis = (await source("tailrocks-root-cause")).replace(/\s+/g, " ");
  const correction = (await source("tailrocks-remediate")).replace(/\s+/g, " ");

  expect(diagnosis).toContain("This owner is read-only");
  expect(diagnosis).toContain("never edits, contains harm, approves its own design");
  expect(diagnosis).toContain("The report grants no mutation authority");
  expect(diagnosis).toContain("Return one `DIAGNOSED` or `NOT_PROVEN` report");
  expect(correction).toContain("Only explicit `fix` plus the exact current approved contract continues");
  expect(correction).toContain("Reject omitted, `analyze`, `rebuild`, mixed, or unknown selectors");
  expect(correction).toContain("does not prove wrongness, derive a design, expand the defect class");
  expect(correction).toContain("Preserve all behavior not named in the approved break inventory");
});

test("correction authority and partial transactions fail closed", async () => {
  const correction = (await source("tailrocks-remediate")).replace(/\s+/g, " ");
  expect(correction).toContain("fresh action-specific user approval");
  expect(correction).toContain("data migration must be resumable and idempotent");
  expect(correction).toContain("verify backup and checksum");
  expect(correction).toContain("forward-recovery path");
  expect(correction).toContain("expected-preimage-to-owned-postimage CAS");
  expect(correction).toContain("never claim multi-path atomicity");
  expect(correction).toContain("Preserve concurrent replacements");
  expect(correction).toContain("`RECOVERY_REQUIRED` means at least one mutation survives");
  expect(correction).toContain("TERM-then-KILL cleanup");
  expect(correction).toContain("red, vacuous, unavailable, or mutation-prone baseline");
});

test("diagnosis owns moved doctrine and no retired public surface remains", async () => {
  for (const reference of ["principles-and-evidence.md", "concept-corpus.md", "redesign-discipline.md"]) {
    expect(
      await Bun.file(path.join(root, "skills/tailrocks-root-cause/references", reference)).exists(),
    ).toBe(true);
    expect(await Bun.file(path.join(root, "skills/tailrocks-remediate/references", reference)).exists()).toBe(
      false,
    );
    expect(await Bun.file(path.join(root, "skills/tailrocks-rethink/references", reference)).exists()).toBe(
      false,
    );
  }
  for (const relative of ["SKILL.md", "agents/openai.yaml"])
    expect(await Bun.file(path.join(root, "skills/tailrocks-rethink", relative)).exists()).toBe(false);
  for (const relative of ["SKILL.md", "agents/openai.yaml"])
    expect(await Bun.file(path.join(root, "skills/tailrocks-checkout-pr", relative)).exists()).toBe(false);
});

test("routing sends diagnosis to root-cause and approved application to remediate", async () => {
  const files = [
    "skills/tailrocks-review-pr/SKILL.md",
    "skills/tailrocks-review-pr/references/structural-review.md",
    "skills/tailrocks-review-pr/references/specialist-lanes.md",
    "skills/tailrocks-prove/SKILL.md",
    "skills/tailrocks-macos-design/SKILL.md",
    "docs/design/improve-family-design.md",
  ];
  for (const file of files) {
    const text = await readFile(path.join(root, file), "utf8");
    expect(text).toContain("tailrocks-root-cause");
  }
  const publicText = await Promise.all(
    ["AGENTS.md", "INSTALL.md", "README.md", "catalog.json", "invocation-registry.json"].map((file) =>
      readFile(path.join(root, file), "utf8"),
    ),
  );
  for (const text of publicText) {
    expect(text).not.toContain("tailrocks-rethink");
    expect(text).not.toContain("tailrocks-checkout-pr");
  }
});

test("root-cause is the sole new manual owner and generated trust destination", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: "tailrocks-root-cause", class: "MANUAL_ONLY" });
  expect(registry.owners.some(({ skill }) => skill === "tailrocks-rethink")).toBe(false);
  const trust = await source("tailrocks-root-cause", "references/runtime-trust.md");
  expect(trust).toBe(await readFile(path.join(root, "shared/references/runtime-trust.md"), "utf8"));
  expect(await source("tailrocks-root-cause", "agents/openai.yaml")).toContain(
    "allow_implicit_invocation: false",
  );
});
