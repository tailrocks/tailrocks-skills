import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("Rust project selectors have one authority owner each", async () => {
  const setup = await source("tailrocks-rust-project-setup");
  const audit = await source("tailrocks-rust-project-audit");
  const remediate = await source("tailrocks-rust-project-remediate");
  const compactSetup = setup.replace(/\s+/g, " ");
  expect(setup).toContain('argument-hint: "<new workspace requirements>"');
  expect(setup).not.toContain("## Modes");
  expect(setup).not.toContain("Existing workspace audit and remediation");
  expect(compactSetup).toContain(
    "If a Rust workspace already exists, refuse without inspecting or changing it",
  );
  expect(audit).toContain("This owner is read-only");
  expect(audit).toContain("Do not install tools");
  expect(audit).toContain("| <ID> | <STATUS> | <Evidence> | <Expected state> | <Remediation scope> |");
  expect(audit).toContain("`STATUS` is exactly one of `PASS`, `GAP`, or `BLOCKED`");
  expect(audit).toContain("RUST-PROJECT-014");
  expect(audit).toContain("owner-only temporary target/cache directories");
  expect(audit).toContain("Hash the repository again afterward");
  expect(remediate).toContain("Require exact approved gaps");
  expect(remediate).toContain("tailrocks-rust-project-setup/templates/");
  expect(remediate).toContain("never overwrite concurrent changes");
});

test("Rust project audit and remediation load byte-identical owner references", async () => {
  for (const name of [
    "lints-clippy-rustfmt.md",
    "supply-chain-and-testing.md",
    "toolchain-and-mise.md",
    "version-policy.md",
    "workspace-and-layout.md",
  ]) {
    const canonical = await source("tailrocks-rust-project-setup", `references/${name}`);
    expect(await source("tailrocks-rust-project-audit", `references/${name}`)).toBe(canonical);
    expect(await source("tailrocks-rust-project-remediate", `references/${name}`)).toBe(canonical);
  }
});

test("Rust project descendants remain manual-only and catalogued", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ id: string; skills: string[] }>;
  };
  for (const skill of ["tailrocks-rust-project-audit", "tailrocks-rust-project-remediate"]) {
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
    expect(catalog.groups.find((group) => group.id === "rust")?.skills).toContain(skill);
  }
});
