import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("simplify audit and apply have exclusive outputs and compatibility routes", async () => {
  const [apply, audit] = await Promise.all([
    source("tailrocks-simplify"),
    source("tailrocks-simplify-audit"),
  ]);
  expect(apply).toContain('argument-hint: "apply <approved removal set and PR, branch, or diff>"');
  expect(apply).toContain("Legacy default or `audit` prints `Use tailrocks-simplify-audit`");
  expect(apply).toContain("Only explicit `apply` plus the exact approved findings continues");
  expect(apply).toContain("discovers no candidate");
  expect(audit).toContain("This owner is read-only and returns one report");
  expect(audit).toContain("No repository byte changed");
  expect(audit).toContain("No candidate is\napproved or applied");
});

test("simplification ladder moved byte-identically to audit only", async () => {
  const ladder = await source("tailrocks-simplify-audit", "references/simplification-ladder.md");
  expect(createHash("sha256").update(ladder).digest("hex")).toBe(
    "9adcb4707a6f8967154c77f782a49835993518dd10eb9f51e5174eb877250840",
  );
  expect(
    await Bun.file(path.join(root, "skills/tailrocks-simplify/references/simplification-ladder.md")).exists(),
  ).toBe(false);
  expect(
    await Bun.file(path.join(root, "skills/tailrocks-simplify/references/behavior-preservation.md")).exists(),
  ).toBe(true);
  expect(
    await Bun.file(
      path.join(root, "skills/tailrocks-simplify-audit/references/behavior-preservation.md"),
    ).exists(),
  ).toBe(false);
});

test("apply requires pre-edit oracle CAS and owned rollback", async () => {
  const apply = (await source("tailrocks-simplify")).replace(/\s+/g, " ");
  expect(apply).toContain("Require a preservation oracle before production mutation");
  expect(apply).toContain("pass against unchanged production bytes");
  expect(apply).toContain("publish each characterization-test file sequentially by compare-and-swap");
  expect(apply).toContain(
    "publish every production file sequentially by expected-preimage-to-owned-postimage CAS",
  );
  expect(apply).toContain("recording one receipt per path");
  expect(apply).toContain("Never claim multi-file atomicity");
  expect(apply).toContain("current bytes prove they still match the owned postimage");
  expect(apply).toContain("Retain and name every surviving changed path and recovery artifact");
  expect(apply).toContain("`ROLLED_BACK` means every owned mutation was restored");
  expect(apply).toContain("any surviving mutation is `RECOVERY_REQUIRED`");
  expect(apply).toContain("TERM-then-KILL cleanup");

  const preservation = (await source("tailrocks-simplify", "references/behavior-preservation.md")).replace(
    /\s+/g,
    " ",
  );
  expect(preservation).toContain("Record the per-path CAS receipts");
  expect(preservation).toContain("current bytes still match the postimage installed by this invocation");
  expect(preservation).toContain("using CAS so a concurrent replacement survives");
  expect(preservation).toContain("report `RECOVERY_REQUIRED`");
  expect(preservation).not.toContain("Commit or record it");
  expect(preservation).not.toContain("put the code back");
});

test("review and improve route discovery to audit and approval to apply", async () => {
  const review = await source("tailrocks-review-pr");
  const structural = await source("tailrocks-review-pr", "references/structural-review.md");
  const routing = await source("tailrocks-improve", "references/finding-routing.md");
  for (const text of [review, structural, routing]) {
    expect(text).toContain("tailrocks-simplify-audit");
    expect(text).toContain("tailrocks-simplify");
  }
});

test("both simplify owners are manual-only catalogued and trust-generated", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = await readFile(path.join(root, "catalog.json"), "utf8");
  const trust = await source("tailrocks-simplify", "references/runtime-trust.md");
  for (const skill of ["tailrocks-simplify", "tailrocks-simplify-audit"]) {
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
    expect(catalog).toContain(skill);
    expect(await source(skill, "references/runtime-trust.md")).toBe(trust);
    expect(await source(skill, "agents/openai.yaml")).toContain("allow_implicit_invocation: false");
  }
});
