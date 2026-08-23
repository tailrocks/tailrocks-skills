import { expect, test } from "bun:test";
import { access } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

async function skill(name: string): Promise<string> {
  return Bun.file(path.join(root, "skills", name, "SKILL.md")).text();
}

test("creation accepts placement before its first durable write", async () => {
  const source = (await skill("tailrocks-skill-create")).replace(/\s+/g, " ");
  const placement = source.indexOf("Decide placement before any durable write");
  const durableWrite = source.indexOf("first durable write");
  expect(placement).toBeGreaterThan(0);
  expect(durableWrite).toBeGreaterThan(placement);
  expect(source.slice(placement, durableWrite)).toContain("refusal leaves the repository");
});

test("update resolves sibling ownership before applying an edit", async () => {
  const source = await skill("tailrocks-skill-update");
  const ownership = source.indexOf("Inventory sibling ownership");
  const mutation = source.indexOf("Apply the smallest strong form");
  expect(ownership).toBeGreaterThan(0);
  expect(mutation).toBeGreaterThan(ownership);
  expect(source.slice(ownership, mutation)).toContain("leave the target unchanged and name that owner");
});

test("refactor preserves contracts and emits no migration-plan artifact", async () => {
  const source = await skill("tailrocks-skill-refactor");
  expect(source).toContain("Observable behavior and every public-contract\nfield remain frozen");
  expect(source).toContain("Do not create a migration plan or\n   migration artifact");
  expect(source).not.toContain("skill-migrations/");
  await expect(
    access(path.join(root, "skills/tailrocks-skill-refactor/templates/migration-contract.md")),
  ).rejects.toThrow();
});

test("authoring routers load their packaged canonical policy", async () => {
  for (const name of ["tailrocks-skill-create", "tailrocks-skill-update", "tailrocks-skill-refactor"]) {
    const source = await skill(name);
    expect(source).toContain("references/responsibility-topology.md");
    expect(source).toContain("references/operational-contract.md");
    expect(source).toContain("references/house-wiring.md");
    expect(source).not.toContain("skill-audit/references/design-doctrine.md");
    expect(source).not.toContain("skill-audit/references/house-wiring.md");
  }
});

test("published authoring routes require direct migration without a plan artifact", async () => {
  const sources = await Promise.all([
    Bun.file(path.join(root, "AGENTS.md")).text(),
    Bun.file(path.join(root, "docs/content/docs/choosing.mdx")).text(),
    skill("tailrocks-skill-audit"),
  ]);
  for (const source of sources) {
    expect(source).not.toContain("skill-migrations/");
    expect(source).not.toContain("durable migration handoff");
    expect(source).not.toContain("approved migration contract");
  }
  const audit = sources[2]!.replace(/\s+/g, " ");
  expect(audit).toContain("direct migration in the named branch and pull request");
  expect(audit).toContain("Do not create a migration plan, migration artifact, or migration product skill");
});

test("create owns one evidence-to-wiring transaction and refuses replacement migration", async () => {
  const source = await skill("tailrocks-skill-create");
  expect(source).toContain("From here through repository wiring, creation is one\n   transaction");
  expect(source).toContain("new name\n   derived from an existing owner is direct migration, not creation");
  expect(source).toContain("`CREATED`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`");
  expect(source).toContain("No\ncommit, push, external action, or partial evidence/skill/wiring publication");
});

test("update and refactor never consume direct-migration authority", async () => {
  const update = await skill("tailrocks-skill-update");
  const refactor = await skill("tailrocks-skill-refactor");
  for (const source of [update, refactor]) {
    const normalized = source.replace(/\s+/g, " ");
    expect(normalized).toContain("under every selector");
    expect(normalized).toContain("`DIRECT_MIGRATION_REQUIRED`");
    expect(normalized).toContain("No authoring-family skill executes direct migration");
  }
  expect(update).toContain("with zero mutations");
  expect(refactor).toContain("changes\nno path");
});

test("published wiring exposes no deprecated migration owner or route", async () => {
  const published = await Promise.all([
    Bun.file(path.join(root, "AGENTS.md")).text(),
    Bun.file(path.join(root, "README.md")).text(),
    Bun.file(path.join(root, "INSTALL.md")).text(),
    Bun.file(path.join(root, "catalog.json")).text(),
    Bun.file(path.join(root, "invocation-registry.json")).text(),
    Bun.file(path.join(root, "docs/content/docs/choosing.mdx")).text(),
    Bun.file(path.join(root, "docs/content/docs/skills/meta.json")).text(),
  ]);
  for (const source of published) {
    expect(source).not.toContain("tailrocks-skill-migration-plan");
    expect(source).not.toContain("tailrocks-skill-migrate");
    expect(source).not.toContain("tailrocks-skill-evaluate");
  }
  for (const name of [
    "tailrocks-skill-migration-plan",
    "tailrocks-skill-migrate",
    "tailrocks-skill-evaluate",
  ]) {
    await expect(access(path.join(root, "skills", name, "SKILL.md"))).rejects.toThrow();
    await expect(access(path.join(root, "docs/content/docs/skills", name))).rejects.toThrow();
  }
});
