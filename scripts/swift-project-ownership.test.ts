import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const owners = [
  "tailrocks-swift-project-setup",
  "tailrocks-swift-project-audit",
  "tailrocks-swift-project-remediate",
  "tailrocks-swift-agent-integration",
  "tailrocks-swift-rust-core-setup",
] as const;

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("Swift project selectors have five exclusive authority owners", async () => {
  const [setup, audit, remediate, agent, rustCore] = await Promise.all(owners.map((owner) => source(owner)));
  expect(setup).toContain('argument-hint: "<new macOS project requirements>"');
  expect(setup).toContain("If Swift project configuration, sources, or a generated project already");
  expect(setup).not.toContain("## Modes");
  expect(setup).toContain("tailrocks-swift-agent-integration");
  expect(setup).toContain("tailrocks-swift-rust-core-setup");
  expect(audit).toContain('argument-hint: "<existing Swift project path or audit scope>"');
  expect(audit).toContain("A finding never grants remediation");
  expect(audit).toContain("enforceably read-only tree");
  expect(audit).toContain("disabled network");
  expect(audit).toContain("TERM then KILL");
  expect(remediate).toContain('argument-hint: "<approved SWIFT-PROJECT gap IDs and path scope>"');
  expect(remediate).toContain("every write maps one-to-one to a live approved row");
  expect(remediate).toContain("compare-and-swap semantics");
  expect(agent).toContain("user must enable Xcode's external-agent");
  expect(agent).toContain("never automate or infer that consent");
  expect(agent).toContain("without executing vendored material");
  expect(rustCore).not.toContain("Add or verify");
  expect(rustCore).toContain("bridge crate and CLI to the exact\n   same version");
  expect(rustCore).toContain("external\n   cache, output, and staging");
  expect(rustCore).toContain("CAS-publish only\n   approved staged bytes");
});

test("Swift project audit has a stable complete fixed ledger", async () => {
  const audit = await source("tailrocks-swift-project-audit");
  const ids = [...audit.matchAll(/`SWIFT-PROJECT-(\d{3})`/g)].map((match) => match[1]);
  expect(ids).toEqual(Array.from({ length: 16 }, (_, index) => String(index + 1).padStart(3, "0")));
  expect(audit).toContain("pipefail and both false-green traps");
  expect(audit).toContain("scheduled forward and dead-code lanes");
  expect(audit).toContain("accessibility-audit wiring");
  expect(audit).toContain("Before/after hashes match");
});

test("four Swift baseline references generate only to audit and remediate", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  for (const name of ["lint-and-format.md", "project-generation.md", "testing.md", "toolchain.md"]) {
    const canonical = await source("tailrocks-swift-project-setup", `references/${name}`);
    expect(await source("tailrocks-swift-project-audit", `references/${name}`)).toBe(canonical);
    expect(await source("tailrocks-swift-project-remediate", `references/${name}`)).toBe(canonical);
    expect(manifest.entries).toContainEqual({
      source: `skills/tailrocks-swift-project-setup/references/${name}`,
      destinations: [
        `skills/tailrocks-swift-project-audit/references/${name}`,
        `skills/tailrocks-swift-project-remediate/references/${name}`,
      ],
    });
  }
});

test("specialist references moved exclusively and retain valid canonical routes", async () => {
  expect(
    await Bun.file(
      path.join(root, "skills/tailrocks-swift-agent-integration/references/agent-integration.md"),
    ).exists(),
  ).toBe(true);
  expect(
    await Bun.file(
      path.join(root, "skills/tailrocks-swift-rust-core-setup/references/rust-core.md"),
    ).exists(),
  ).toBe(true);
  for (const name of ["agent-integration.md", "rust-core.md"])
    expect(
      await Bun.file(path.join(root, "skills/tailrocks-swift-project-setup/references", name)).exists(),
    ).toBe(false);
  const rustCore = await source("tailrocks-swift-rust-core-setup", "references/rust-core.md");
  expect(rustCore).toContain("`tailrocks-swift-project-setup`'s project-generation policy");
  expect(rustCore).toContain("`tailrocks-swift-project-setup`'s toolchain policy");
});

test("registry catalog and review route expose every Swift project owner", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ id: string; skills: string[] }>;
  };
  for (const owner of owners) {
    expect(registry.owners).toContainEqual({ skill: owner, class: "MANUAL_ONLY" });
    expect(catalog.groups.find((group) => group.id === "macos")?.skills).toContain(owner);
  }
  expect(await source("tailrocks-review-pr")).toMatch(
    /\|\s*Swift\/Xcode project configuration\s*\|\s*`tailrocks-swift-project-audit`\s*\|/,
  );
});
