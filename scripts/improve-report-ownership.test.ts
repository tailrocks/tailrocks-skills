import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

test("improve delegates route ranking partition and receipt to one installed oracle", async () => {
  const skill = await readFile(path.join(root, "skills/tailrocks-improve/SKILL.md"), "utf8");
  const bootstrap = await readFile(path.join(root, "scripts/improve-report.ts"), "utf8");
  const core = await readFile(path.join(root, "scripts/improve-report-core.ts"), "utf8");
  expect(skill).toContain("sole route and final-report\noracle");
  expect(skill).toContain("tailrocks.improve-report/v1");
  expect(skill).toContain("refuses those retired umbrella selectors");
  expect(bootstrap).toContain('await import("./improve-report-core")');
  expect(bootstrap).not.toMatch(/^import .*\.\/improve-report-core/m);
  expect(core).toContain("resolveImproveRoute(input.route)");
  expect(core).toContain('outcome: "reported"');
  expect(core).toContain("mutations: []");
});

test("ranking and rejection vocabulary are closed and effort never enters the comparator", async () => {
  const core = await readFile(path.join(root, "scripts/improve-report-core.ts"), "utf8");
  const rank = core.slice(core.indexOf("function score("), core.indexOf("function base("));
  expect(rank).toContain("candidate.correctness");
  expect(rank).toContain("candidate.consistency");
  expect(rank).toContain("candidate.goal_fit");
  expect(rank).toContain("candidate.severity");
  expect(rank).toContain("candidate.confidence");
  expect(rank).toContain("candidate.fix_risk");
  expect(rank).not.toContain("candidate.effort");
  for (const reason of [
    "duplicate",
    "contradicted",
    "unverified",
    "by-design",
    "out-of-scope",
    "current-decision",
  ])
    expect(core).toContain(`"${reason}"`);
});
