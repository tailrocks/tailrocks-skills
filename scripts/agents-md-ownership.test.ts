import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("Agents MD add audit and sync have exclusive outputs", async () => {
  const [add, audit, sync] = await Promise.all([
    source("tailrocks-agents-md"),
    source("tailrocks-agents-md-audit"),
    source("tailrocks-agents-md-sync"),
  ]);
  expect(add).toContain('argument-hint: "<one rule and governed paths>"');
  expect(add).toContain("Own one rule-addition decision");
  expect(add).toContain("Model selection alone always yields zero mutation");
  expect(audit).toContain("Own one read-only instruction audit");
  expect(audit).toContain("No repository byte changed");
  expect(sync).toContain("Apply one explicitly approved topology repair");
  expect(sync).toContain("Exactly one approved finding repaired");
  expect(sync).toContain("invents no rule");
});

test("only the existing named owner retains model policy", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners).toContainEqual({ skill: "tailrocks-agents-md", class: "MODEL_POLICY" });
  for (const skill of ["tailrocks-agents-md-audit", "tailrocks-agents-md-sync"]) {
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
    expect(await source(skill)).toContain("Use only when the user explicitly requests this skill.");
    expect(await source(skill, "agents/openai.yaml")).toContain("allow_implicit_invocation: false");
  }
  expect(await source("tailrocks-agents-md", "agents/openai.yaml")).toContain(
    "allow_implicit_invocation: true",
  );
});

test("deletion evidence and topology inspection moved out of add", async () => {
  const addRule = await source("tailrocks-agents-md", "references/rule-writing.md");
  const addPlacement = await source("tailrocks-agents-md", "references/placement-and-topology.md");
  const deletion = await source("tailrocks-agents-md-audit", "references/deletion-evidence.md");
  const topology = await source("tailrocks-agents-md-audit", "references/topology-audit.md");
  expect(addRule).not.toContain("# Rule deletion evidence");
  expect(addPlacement).toContain("deepest valid\ndirectory owns the rule");
  expect(deletion).toContain("Propose deletion only when evidence shows");
  expect(topology).toContain("without repair");
});

test("sync uses only installed script typed create repair and verify transactions", async () => {
  const sync = await source("tailrocks-agents-md-sync");
  expect(sync).toContain("installed topology script");
  expect(sync).toContain("`create`");
  expect(sync).toContain("`repair --expect-target <exact-raw-target>`");
  expect(sync).toContain("installed-script `verify`");
  expect(sync).toContain("compare-and-swap");
  expect(sync).toContain("only while their identities still match");
});

test("installed entrypoint identity and partial publication are honest", async () => {
  for (const skill of ["tailrocks-agents-md", "tailrocks-agents-md-audit", "tailrocks-agents-md-sync"]) {
    const text = (await source(skill)).replace(/\s+/g, " ");
    expect(text).toContain("loader-provided absolute");
    expect(text).toContain("ignore an inherited `SKILL_DIR`");
    expect(text).toMatch(
      /`lstat` every unresolved component before any `realpath`|before any `realpath`, `lstat` every unresolved component/,
    );
  }
  const [add, sync] = await Promise.all([source("tailrocks-agents-md"), source("tailrocks-agents-md-sync")]);
  expect(add).toContain("report exact partial\n   mutations");
  expect(sync).toContain("Never claim\n   multi-path atomicity");
});
