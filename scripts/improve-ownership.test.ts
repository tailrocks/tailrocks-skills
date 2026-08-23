import { expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";
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

test("retired combined audit owner is absent from every public surface", async () => {
  for (const relative of [
    "skills/tailrocks-audit/SKILL.md",
    "skills/tailrocks-audit/agents/openai.yaml",
    "skills/tailrocks-audit/references/audit-lanes.md",
    "skills/tailrocks-audit/references/execution-loop.md",
    "skills/tailrocks-audit/references/plan-seeding.md",
    "skills/tailrocks-audit/references/runtime-trust.md",
    "docs/content/docs/skills/tailrocks-audit/index.mdx",
    "docs/content/docs/skills/tailrocks-audit/definition.mdx",
  ]) {
    await expect(access(path.join(root, relative))).rejects.toThrow();
  }
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toHaveLength(84);
  expect(
    registry.owners.filter(({ class: invocationClass }) => invocationClass === "MANUAL_ONLY"),
  ).toHaveLength(73);
  expect(registry.owners.some(({ skill }) => skill === "tailrocks-audit")).toBe(false);
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ id: string; skills: string[] }>;
  };
  expect(catalog.groups.find(({ id }) => id === "delivery")?.skills).toHaveLength(10);
  const generated = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ destinations: string[] }>;
  };
  expect(generated.entries).toHaveLength(88);
  expect(generated.entries.reduce((count, { destinations }) => count + destinations.length, 0)).toBe(258);
  for (const relative of [
    "AGENTS.md",
    "INSTALL.md",
    "README.md",
    "catalog.json",
    "generated-references.json",
    "invocation-registry.json",
    "docs/content/docs/choosing.mdx",
    "docs/content/docs/delivery/index.mdx",
    "docs/content/docs/install.mdx",
    "docs/content/docs/skills/index.mdx",
    "docs/content/docs/skills/meta.json",
    "docs/design/improve-family-design.md",
    "docs/design/pipeline-walkthrough.md",
  ]) {
    expect(await readFile(path.join(root, relative), "utf8")).not.toContain("tailrocks-audit");
  }
});

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
  expect(plan).toContain("plan-and-index set atomically");
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

test("pipeline-free planning has exact plans index rejection and pre-publication review contracts", async () => {
  const [plan, boundary, format, reconciliation] = await Promise.all([
    source("tailrocks-improve-plan"),
    source("tailrocks-improve-plan", "references/artifact-boundary.md"),
    source("tailrocks-improve-plan", "references/plan-format.md"),
    source("tailrocks-improve-reconcile", "references/reconciliation.md"),
  ]);
  const contract = [plan, boundary, format].join("\n");
  expect(plan).toContain("one rejected-finding index update");
  expect(plan).toContain("Atomically compare-and-swap only\n   the index");
  expect(boundary).toContain(
    '`{ outcome: "no_change", code: "already_rejected", mutations: [], commit: null }`',
  );
  expect(format).toContain("## Rejected findings");
  expect(format).toContain("## Review receipts");
  expect(format).toContain("Every correction invalidates all receipts and restarts review");
  expect(format).toContain("lowercase SHA-256 over the exact UTF-8 byte prefix");
  expect(format).toContain("Do not\nnormalize line endings, whitespace, or encoding");
  expect(format).toContain("stale_rejection_evidence");
  expect(format).toContain("| Plan | Title | Priority | Status | Planned at | Dependencies | Evidence |");
  expect(format).toContain("| Finding | Reason | Evidence | Observed at | Next owner |");
  expect(format).toContain("stable\nsecret-safe finding ID");
  expect(reconciliation).toContain("Preserve the canonical `## Rejected findings` table");
  expect(reconciliation).toContain("stale_rejection_evidence");
  expect(reconciliation).not.toContain("superseded evidence updates");
  expect(plan.indexOf("stage one new numbered")).toBeLessThan(plan.indexOf("Cold-review the staged plan"));
  expect(plan.indexOf("Cold-review the staged plan")).toBeLessThan(plan.indexOf("publish the final"));
  expect(plan).toContain("After every correction, restart the required review set");
  expect(plan).toContain("one exact `## Review receipts\\n` heading");
  expect(plan.replace(/\s+/g, " ")).toContain("two independent PASS receipts bound to the same digest");
  expect(plan).toContain("Recompute the review digest");
  expect(plan).toContain("On drift, return a zero-mutation refusal");
  expect(contract).toContain("`plans/NNN-*.md`");
  expect(contract).toContain("`plans/README.md`");
  for (const retiredMechanic of [
    "roadmap/<slug>/plan",
    "goal/check.sh",
    "goal/START.md",
    "goal/RESUME.md",
    "Frozen contract fingerprint",
    "Tailrocks-Skill: tailrocks-improve-plan",
  ]) {
    expect(contract).not.toContain(retiredMechanic);
  }
  expect(boundary).toContain("Never create a roadmap item");
  expect(boundary).toContain("frozen-contract\nfingerprint");
  expect(boundary.replace(/\s+/g, " ")).toContain(
    "Never create a plan file/row, separate log, branch, or empty commit",
  );
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

test("branch research and design-conformance routes preserve depth batch and authority", async () => {
  const [review, research, web, tui, macos] = await Promise.all([
    source("tailrocks-review-pr"),
    source("tailrocks-research"),
    source("tailrocks-web-design-audit"),
    source("tailrocks-tui-design-audit"),
    source("tailrocks-macos-design-review"),
  ]);
  const categories = [
    ...IMPROVE_CATEGORIES.standard,
    ...IMPROVE_CATEGORIES.security,
    ...Object.keys(IMPROVE_CATEGORIES.platformDesign),
  ];
  for (const id of ["branch", "branch-deep"]) {
    const route = IMPROVE_ROUTES.find((candidate) => candidate.id === id);
    expect(route?.target).toBe("tailrocks-review-pr");
    expect(route?.categoryClasses).toEqual(["standard", "security", "platform-design"]);
    expect(route?.optionalTargetArguments).toEqual(["<validated category aspect>"]);
    expect(route?.batchForward).toBe(true);
  }
  for (const category of categories) expect(review).toContain(`\`${category}\``);
  expect(review).toContain("exhaustively covering every changed\n  package and path group");
  expect(review).toContain("fresh-context independent refutation");
  expect(review).toContain("never silently invokes that manual owner");

  const directionQuestion =
    "What candidate product directions follow from this repository's evidence and history?";
  expect(IMPROVE_ROUTES.find(({ id }) => id === "next")?.targetArguments).toEqual([directionQuestion]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "next-deep")?.targetArguments).toEqual([
    directionQuestion,
    "--deep",
  ]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "ask")?.targetArguments).toEqual(["<question>"]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "ask-deep")?.targetArguments).toEqual([
    "<question>",
    "--deep",
  ]);
  expect(research).toContain("competing directions with trade-offs");
  expect(research).toContain("competing answers");
  expect(research).toContain("never retained `next`/`ask` selectors");

  const designContracts = [
    ["web", web, "tailrocks-web-design-audit", "<design-route package or shipped screens>"],
    ["tui", tui, "tailrocks-tui-design-audit", "<gallery package or shipped terminal screens>"],
    ["macos", macos, "tailrocks-macos-design-review", "<screen, window, or prototype package>"],
  ] as const;
  for (const [medium, contract, target, subject] of designContracts) {
    for (const suffix of ["", "-deep"]) {
      const route = IMPROVE_ROUTES.find(({ id }) => id === `ask-design-${medium}${suffix}`);
      expect(route?.target).toBe(target);
      expect(route?.targetArguments).toContain(subject);
      expect(route?.batchEffect).toBe("non-interactive-selection");
      expect(route?.authority).toBe("target-only");
    }
    expect(contract.replace(/\s+/g, " ")).toContain("accepts no `ask` compatibility selector");
    expect(contract).toContain("fresh-context independent refutation");
    expect(contract).toContain("non-interactive");
    expect(contract).not.toContain("tailrocks-audit");
  }
  expect(IMPROVE_ROUTES.find(({ id }) => id === "ask-design-macos")?.targetArguments.at(0)).toBe(
    "acceptance",
  );
  for (const contract of [review, research]) expect(contract).not.toContain("tailrocks-audit");
});

test("plan seed execution and both reconcile scopes route to exclusive owners", async () => {
  const expected = [
    ["plan", "tailrocks-improve-plan", ["<description>"], null],
    ["plan-deep", "tailrocks-improve-plan", ["<description>", "--deep"], "second-cold-plan-review"],
    ["seed", "tailrocks-seed-roadmap", ["<finding>"], null],
    ["execute", "tailrocks-improve-execution", ["<plan>"], null],
    ["execute-deep", "tailrocks-improve-execution", ["<plan>", "--deep"], "second-independent-diff-review"],
    ["plans-sweep", "tailrocks-improve-reconcile", [], null],
    ["plans-sweep-deep", "tailrocks-improve-reconcile", ["--deep"], "reverify-every-row"],
    ["roadmap-sweep", "tailrocks-reconcile", ["<slug>"], null],
    ["roadmap-sweep-deep", "tailrocks-reconcile", ["<slug>", "--deep"], "reverify-every-row"],
  ] as const;
  for (const [id, target, targetArguments, deepOperation] of expected) {
    const route = IMPROVE_ROUTES.find((candidate) => candidate.id === id);
    expect(route?.target).toBe(target);
    expect(route?.targetArguments).toEqual(targetArguments);
    expect(route?.deepOperation ?? null).toBe(deepOperation);
    expect(route?.batchForward).toBe(true);
    expect(route?.batchEffect).toBe("non-interactive-selection");
    expect(route?.authority).toBe("target-only");
  }

  const [plan, seed, execution, planSweep, roadmapSweep] = await Promise.all([
    source("tailrocks-improve-plan"),
    source("tailrocks-seed-roadmap"),
    source("tailrocks-improve-execution"),
    source("tailrocks-improve-reconcile"),
    source("tailrocks-reconcile"),
  ]);
  expect(plan).toContain("second independent cold review");
  expect(execution).toContain("second independent diff review");
  expect(planSweep).toContain("re-verifies every indexed row without sampling");
  expect(roadmapSweep.replace(/\s+/g, " ")).toContain(
    "re-verifies every row, applicable criterion, blocker, and assumption regardless of claimed status",
  );
  expect(seed.replace(/\s+/g, " ")).toContain("`--deep` is not a valid seed modifier");
  for (const contract of [plan, seed, execution, planSweep, roadmapSweep]) {
    const normalized = contract.replace(/\s+/g, " ");
    expect(contract).toContain("`--batch`");
    expect(normalized).toContain("deterministic and non-interactive");
    expect(normalized).toMatch(/Invoke (this owner )?directly; no routing skill dispatches it/);
    expect(contract).not.toContain("tailrocks-audit");
  }
});
