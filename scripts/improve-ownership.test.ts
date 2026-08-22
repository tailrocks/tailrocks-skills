import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { IMPROVE_CATEGORIES, IMPROVE_ROUTES } from "./improve-route-schema";

const root = path.resolve(import.meta.dir, "..");
const owners = [
  "tailrocks-improve",
  "tailrocks-improve-deep",
  "tailrocks-improve-security",
  "tailrocks-improve-plan",
  "tailrocks-improve-execution",
  "tailrocks-improve-reconcile",
  "tailrocks-seed-roadmap",
] as const;

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("improve selectors have seven exclusive outputs", async () => {
  const [standard, deep, security, plan, execution, reconcile, seed] = await Promise.all(
    owners.map((owner) => source(owner)),
  );
  expect(standard).toContain("Return exactly one report");
  expect(standard).toContain("no plan or delivery artifact");
  expect(deep).toContain("one exhaustive report");
  expect(deep).toContain("fresh-context independent");
  expect(security).toContain("Own security-only repository audit");
  expect(security).toContain("No secret value");
  expect(plan).toContain("exactly one plan plus its index row");
  expect(plan).toContain("Source, roadmap, issues, comments");
  expect(execution).toContain("only inside the isolated worktree");
  expect(execution).toContain("Never merge, push, edit the original");
  expect(reconcile).toContain("sole writable output is\n`plans/README.md`");
  expect(seed).toContain("Exactly one DRAFT item and index row");
  expect(seed).toContain("Tailrocks-Skill: tailrocks-seed-roadmap");
});

test("audit execution boundaries are explicit and bounded", async () => {
  for (const owner of ["tailrocks-improve", "tailrocks-improve-deep", "tailrocks-improve-security"]) {
    const text = (await source(owner)).replace(/\s+/g, " ");
    expect(text).toContain("read-only");
    expect(text).toContain("scrubbed");
    expect(text).toContain("disabled network");
    expect(text).toContain("TERM-then-KILL");
    expect(text).toMatch(/before\/after hashes|re-hashed afterward/);
  }
});

test("planning and reconciliation own CAS-safe narrow paths", async () => {
  const [plan, reconcile] = await Promise.all([
    source("tailrocks-improve-plan"),
    source("tailrocks-improve-reconcile"),
  ]);
  for (const text of [plan, reconcile]) {
    expect(text).toContain("symlinked or escaping paths");
    expect(text).toContain("compare-and-swap");
  }
  expect(plan).toContain("two-file set atomically");
  expect(plan.replace(/\s+/g, " ")).toContain(
    "immutable read-only target using frozen existing inputs, scrubbed secrets, disabled network",
  );
  expect(plan).toContain("TERM-then-KILL cleanup");
  expect(reconcile).toContain("No plan body, source, roadmap");
});

test("plan schema and execution supervision preserve the migrated contract", async () => {
  const [format, execution, loop] = await Promise.all([
    source("tailrocks-improve-plan", "references/plan-format.md"),
    source("tailrocks-improve-execution"),
    source("tailrocks-improve-execution", "references/execution-loop.md"),
  ]);
  for (const field of [
    "- Priority:",
    "- Effort:",
    "- Fix risk:",
    "- Lane:",
    "- Planned at:",
    "## Current state",
    "Expected output",
    "## Git boundary",
    "## Test plan",
    "## Maintenance notes",
  ])
    expect(format).toContain(field);
  expect(execution).toContain("If that route cannot\n   be selected or isolated, refuse");
  expect(execution).toContain("TERM then KILL");
  expect(loop).toContain("Each command declares time, retry, output, and process-tree bounds");
});

test("common audit policy is canonical and correctness-first", async () => {
  const canonical = await readFile(path.join(root, "shared/references/repository-audit-lanes.md"), "utf8");
  expect(canonical).toContain("correctness, consistency, goal fit, severity,\nconfidence, and fix risk");
  expect(canonical).toContain("Effort is planning metadata");
  for (const owner of ["tailrocks-improve", "tailrocks-improve-deep"]) {
    expect(await source(owner, "references/repository-audit-lanes.md")).toBe(canonical);
  }
  expect(
    await Bun.file(path.join(root, "skills/tailrocks-improve/references/audit-playbook.md")).exists(),
  ).toBe(false);
  expect(await Bun.file(path.join(root, "skills/tailrocks-improve/references/plan-format.md")).exists()).toBe(
    false,
  );
});

test("all improve owners are manual-only and published", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = await readFile(path.join(root, "catalog.json"), "utf8");
  for (const owner of owners) {
    expect(registry.owners).toContainEqual({ skill: owner, class: "MANUAL_ONLY" });
    expect(catalog).toContain(owner);
    expect(await source(owner)).toStartWith("---\nname:");
    expect(await source(owner)).toContain("Use only when the user explicitly requests this skill.");
    expect(await source(owner, "agents/openai.yaml")).toContain("allow_implicit_invocation: false");
  }
  expect(registry.owners.filter((owner) => owner.class === "MODEL_POLICY")).toHaveLength(11);
});

test("standard deep and security audit routes are closed and preserve batch authority", async () => {
  const [standard, deep, security] = await Promise.all([
    source("tailrocks-improve"),
    source("tailrocks-improve-deep"),
    source("tailrocks-improve-security"),
  ]);
  const nonSecurity = [...IMPROVE_CATEGORIES.standard, ...Object.keys(IMPROVE_CATEGORIES.platformDesign)];
  for (const category of IMPROVE_CATEGORIES.standard) {
    expect(standard).toContain(`\`${category}\``);
    expect(deep).toContain(`\`${category}\``);
  }
  for (const category of Object.keys(IMPROVE_CATEGORIES.platformDesign)) {
    expect(standard).toContain(`\`${category}\``);
  }
  expect(nonSecurity).toHaveLength(12);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "category")?.target).toBe("tailrocks-improve");
  expect(IMPROVE_ROUTES.find(({ id }) => id === "category")?.categoryClasses).toEqual([
    "standard",
    "platform-design",
  ]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "whole-repository-deep")?.targetArguments).toEqual([]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "category-deep")?.targetArguments).toEqual(["<category>"]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "security")?.targetArguments).toEqual([]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "security-deep")?.targetArguments).toEqual(["--deep"]);
  for (const route of IMPROVE_ROUTES.filter(({ id }) =>
    [
      "default",
      "quick",
      "category",
      "whole-repository-deep",
      "category-deep",
      "security",
      "security-deep",
    ].includes(id),
  )) {
    expect(route.batchForward).toBe(true);
    expect(route.batchEffect).toBe("non-interactive-selection");
    expect(route.authority).toBe("target-only");
  }
  expect(standard).toContain("No other category spelling is valid");
  expect(standard).toContain("Report that invocation and stop");
  expect(standard).toContain("Whole-repository `--deep`");
  expect(deep).toContain("platform-design\n   categories (`ux`, `tui`, `liquid-glass`)");
  expect(deep).toContain("does not\npass a redundant `--deep` flag");
  expect(security).toContain(
    "accepts only the `security` route, optional `--deep`, and\n   optional `--batch`",
  );
  expect(security).toContain("No flag is the normal security route");
  for (const owner of [standard, deep, security]) {
    expect(owner).toContain("non-interactive");
    expect(owner).toMatch(/grants no|changes neither|changes no/);
    expect(owner).not.toContain("tailrocks-audit");
  }
  expect(await readFile(path.join(root, "scripts", "improve-route-schema.ts"), "utf8")).not.toContain(
    "tailrocks-audit",
  );
});
