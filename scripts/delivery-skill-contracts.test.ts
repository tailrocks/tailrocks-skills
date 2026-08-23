import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

async function skill(name: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", name, relative), "utf8");
}

test("reconcile closes frozen packages without partial retirement", async () => {
  const source = await skill("tailrocks-reconcile");
  const retirement = await skill("tailrocks-reconcile", "references/retirement.md");
  for (const required of [
    "goal/check.sh",
    "gate-vacuous",
    "plan-drift",
    "decisions-drift",
    "Partial completion is not retirement",
  ])
    expect(`${source}\n${retirement}`).toContain(required);
  expect(retirement).toContain("Four conditions, all of them");
  expect(retirement).toContain("Two commits");
  expect(retirement).toContain("delivery/<slug>.md");
});

test("record-decision propagates intent and reopens advanced states", async () => {
  const source = await skill("tailrocks-record-decision");
  expect(source).toContain("If the item is `READY`,\n   `PLANNED`, or `IN EXECUTION`");
  expect(source).toContain("affected rows `STALE`");
  expect(source).toContain("Append to Decisions: date");
  expect(source).toContain("One invocation, one marked commit");
});

test("record-feedback captures verbatim defects without explanation", async () => {
  const source = await skill("tailrocks-record-feedback");
  const template = await skill("tailrocks-record-feedback", "templates/feedback.md");
  expect(source).toContain("their words verbatim");
  expect(source).toContain("Nothing here investigates, reproduces, judges, or fixes");
  expect(source).toContain("one statement per defect");
  expect(template).toContain("the user's own words, quoted, not paraphrased");
});

test("refresh-pr keeps report generation separate from exact remote mutation", async () => {
  const source = await skill("tailrocks-refresh-pr");
  expect(source).toContain("kept verbatim");
  expect(source).toContain("owner-only temporary directory");
  expect(source).toContain("--body-file");
  expect(source).toContain("Never blindly retry a mutation");
  expect(source).toContain("recovery receipt");
  expect(source).toContain("Do not use to open or merge a PR");
});

test("research has closed question and roadmap-sweep assembly contracts", async () => {
  const source = await skill("tailrocks-research");
  const playbook = await skill("tailrocks-research", "references/research-playbook.md");
  expect(source).toContain("A question");
  expect(source).toContain("A roadmap slug");
  expect(source).toContain("one per\n   question cluster");
  expect(source).toContain("Synthesize");
  expect(playbook).toContain("chapter");
  expect(playbook).toContain("A claim is usable only with a source");
});

test("retrospect emits one closed six-field patch shape", async () => {
  const source = await skill("tailrocks-retrospect");
  const shape = await skill("tailrocks-retrospect", "references/patch-shape.md");
  for (const field of ["Target", "Shape", "Anchor", "Text", "Checks", "Replaces"])
    expect(shape).toContain(`${field}:`);
  expect(shape).toContain("## The six legal shapes");
  expect(shape).toContain("template slot | acceptance check");
  const template = await skill("tailrocks-retrospect", "templates/retrospective.md");
  expect(template).toContain("template slot | acceptance check");
  expect(source).toContain("all six anchor fields");
  expect(source).toContain("Proposes only");
});

test("review-pr reports locally and posts only through separate fresh authority", async () => {
  const source = await skill("tailrocks-review-pr");
  const bar = await skill("tailrocks-review-pr", "references/finding-bar.md");
  expect(source).toContain("External posting is a separate, freshly authorized transaction");
  expect(source).toContain("without posting it");
  expect(source).toContain("accepted finding");
  expect(bar).toContain("documented waiver");
});

test("simplify separates read-only characterization from approved apply", async () => {
  const source = await skill("tailrocks-simplify");
  const audit = await skill("tailrocks-simplify-audit");
  const behavior = await skill("tailrocks-simplify", "references/behavior-preservation.md");
  expect(audit).toContain("read-only");
  expect(source).toContain("Only explicit `apply`");
  expect(source).toContain("APPLIED");
  expect(source).toContain("ROLLED_BACK");
  expect(behavior).toContain("Characterization");
  expect(source).toContain("recovery artifacts");
});

test("skill authoring owners preserve atomic placement and closed responsibility", async () => {
  const create = await skill("tailrocks-skill-create");
  const refactor = await skill("tailrocks-skill-refactor");
  const update = await skill("tailrocks-skill-update");
  expect(create).toContain("creation is one\n   transaction");
  expect(create).toContain("restore every created or modified path");
  expect(refactor).toContain("Never change a public contract");
  expect(refactor).toContain("DIRECT_MIGRATION_REQUIRED");
  expect(update).toContain("Inventory sibling ownership");
  expect(update).toContain("all affected deterministic acceptance checks");
});

test("grilling owns exact conversation-only dependency frontier", async () => {
  const source = await skill("tailrocks-grilling");
  expect(source).toContain("grilled, challenged, interrogated, or stress-tested");
  expect(source).toContain("Separate facts from user-owned decisions");
  expect(source).toContain("Build the dependency tree");
  expect(source).toContain("recommended answer");
  expect(source).toContain("require confirmation");
  expect(source).toContain("never execute");
});
