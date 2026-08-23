import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const family = [
  "tailrocks-tanstack-project-setup",
  "tailrocks-tanstack-project-audit",
  "tailrocks-tanstack-project-migrate",
  "tailrocks-tanstack-project-remediate",
] as const;

async function source(skill: (typeof family)[number], relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("TanStack lifecycle selectors have one exclusive owner each", async () => {
  const [setup, audit, migrate, remediate] = await Promise.all(family.map((skill) => source(skill)));
  expect(setup).toContain('argument-hint: "<new application destination and requirements>"');
  expect(setup).toContain("it never audits, migrates, or repairs an existing tree");
  expect(setup.replace(/\s+/g, " ")).toContain("refuse if it contains an application");
  expect(setup).toContain("compare-and-swap");
  expect(setup).not.toContain("## Modes");

  expect(audit).toContain('argument-hint: "<application path or audit scope>"');
  expect(audit).toContain("without mutation");
  expect(audit).toContain("Never install, format-write, generate routes/components");
  expect(audit).toContain("Hash bytes\n   afterward");
  expect(audit).toContain("status is exactly `PASS`, `GAP`, or `BLOCKED`");
  for (let id = 1; id <= 15; id += 1) {
    const padded = id.toString().padStart(3, "0");
    expect(audit).toContain(`\`TANSTACK-${padded}\``);
  }

  expect(migrate).toContain('argument-hint: "<existing application and approved migration scope>"');
  expect(migrate).toContain("Do not produce a\nmigration-plan artifact");
  expect(migrate).toContain("never-broken slices");
  expect(migrate).toContain("compare-and-swap");
  expect(migrate).toContain("Remove old owners only after replacement proof");

  expect(remediate).toContain('argument-hint: "<approved TANSTACK gap IDs and path scope>"');
  expect(remediate).toContain("duplicate, reordered, passing, blocked, unapproved");
  expect(remediate).toContain("one-to-one to a live approved ledger row");
  expect(remediate).toContain("never blanket overwrite authority");
  expect(remediate).toContain("routes to\n`tailrocks-tanstack-project-migrate`");
});

test("canonical TanStack references generate byte-identically to all descendants", async () => {
  for (const name of [
    "boundaries-and-data.md",
    "shadcn-ui.md",
    "stack-and-layout.md",
    "tooling-and-quality.md",
    "version-policy.md",
  ]) {
    const canonical = await source("tailrocks-tanstack-project-setup", `references/${name}`);
    for (const skill of family.slice(1)) expect(await source(skill, `references/${name}`)).toBe(canonical);
  }
  const oldChecklist = path.join(
    root,
    "skills/tailrocks-tanstack-project-setup/references/migration-checklist.md",
  );
  expect(await Bun.file(oldChecklist).exists()).toBe(false);
  expect(await source("tailrocks-tanstack-project-migrate", "references/migration-checklist.md")).toContain(
    "Each slice leaves a runnable app and stable external behavior",
  );
  for (const skill of ["tailrocks-tanstack-project-audit", "tailrocks-tanstack-project-remediate"] as const)
    expect(
      await Bun.file(path.join(root, "skills", skill, "references/migration-checklist.md")).exists(),
    ).toBe(false);
});

test("TanStack project owners remain manual-only and catalogued", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ id: string; skills: string[] }>;
  };
  const group = catalog.groups.find(({ id }) => id === "typescript")?.skills;
  for (const skill of family) {
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
    expect(group).toContain(skill);
    expect(await source(skill, "agents/openai.yaml")).toContain("allow_implicit_invocation: false");
  }
});

test("shared canonical setup links stay narrow and routable", async () => {
  const audit = await source("tailrocks-tanstack-project-audit");
  const migrate = await source("tailrocks-tanstack-project-migrate");
  const remediate = await source("tailrocks-tanstack-project-remediate");
  expect(audit).toContain("../tailrocks-tanstack-project-setup/templates/");
  for (const skill of [migrate, remediate]) {
    expect(skill).toContain("../tailrocks-tanstack-project-setup/templates/");
    expect(skill).toContain("../tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts");
  }
});
