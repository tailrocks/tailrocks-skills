import { expect, test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const owners = [
  "tailrocks-macos-visual-baseline",
  "tailrocks-macos-visual-qa",
  "tailrocks-macos-visual-regression",
] as const;

async function source(relative: string): Promise<string> {
  return readFile(path.join(root, relative), "utf8");
}

test("macOS visual selectors and durable outputs have exclusive owners", async () => {
  const [baseline, current, regression] = await Promise.all(
    owners.map((owner) => source(`skills/${owner}/SKILL.md`)),
  );
  expect(baseline).toContain(
    'argument-hint: "baseline <blessed prototype package> --output <baseline directory>"',
  );
  expect(current).toContain('argument-hint: "verify <feature or screens>"');
  expect(regression).toContain(
    'argument-hint: "regress <feature or screens> --baseline <baseline directory>"',
  );
  expect(current).toContain("writes no project source, harness, baseline, approval,");
  expect(baseline).toContain("This owner alone freezes a macOS visual");
  expect(regression).toContain("read-only on repository source and baseline bytes");
  expect(current).not.toMatch(/^\s*- `(?:harness|baseline|freeze|regress)`:/m);
  expect(baseline).not.toMatch(/^\s*- `(?:verify|harness|freeze|regress)`:/m);
  expect(regression).not.toMatch(/^\s*- `(?:verify|harness|baseline|freeze)`:/m);
});

test("all three macOS visual owners are manual-only and catalogued", async () => {
  const registry = JSON.parse(await source("invocation-registry.json")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = await source("catalog.json");
  for (const owner of owners) {
    const skill = await source(`skills/${owner}/SKILL.md`);
    const metadata = await source(`skills/${owner}/agents/openai.yaml`);
    expect(skill).toContain("Use only when the user explicitly requests this skill.");
    expect(skill).toContain("disable-model-invocation: true");
    expect(skill).toContain("user-invocable: true");
    expect(metadata).toContain("allow_implicit_invocation: false");
    expect(registry.owners).toContainEqual({ skill: owner, class: "MANUAL_ONLY" });
    expect(catalog).toContain(`\"${owner}\"`);
  }
});

test("shared harness and design contracts generate to exact visual consumers", async () => {
  const manifest = JSON.parse(await source("generated-references.json")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  const bySource = new Map(manifest.entries.map((entry) => [entry.source, entry.destinations]));
  expect(bySource.get("scripts/macos-visual-qa/README.md")).toEqual([
    "skills/tailrocks-macos-visual-baseline/references/harness-contract.md",
    "skills/tailrocks-macos-visual-qa/references/harness-contract.md",
    "skills/tailrocks-macos-visual-regression/references/harness-contract.md",
  ]);
  for (const name of ["interaction.md", "missing-project-policy.md", "state-matrix.md"])
    expect(bySource.get(`skills/tailrocks-macos-visual-qa/references/${name}`)).toEqual([
      `skills/tailrocks-macos-visual-baseline/references/${name}`,
      `skills/tailrocks-macos-visual-regression/references/${name}`,
    ]);
  expect(bySource.get("skills/tailrocks-macos-design/references/launch-contract.md")).toEqual([
    "skills/tailrocks-macos-visual-baseline/references/launch-contract.md",
    "skills/tailrocks-macos-visual-regression/references/launch-contract.md",
  ]);
  expect(bySource.get("skills/tailrocks-macos-design/references/verification.md")).toEqual([
    "skills/tailrocks-macos-design-review/references/verification.md",
    "skills/tailrocks-macos-visual-baseline/references/verification.md",
    "skills/tailrocks-macos-visual-qa/references/verification.md",
    "skills/tailrocks-macos-visual-regression/references/verification.md",
  ]);
  for (const owner of owners)
    await expect(readdir(path.join(root, `skills/${owner}/templates`))).rejects.toThrow();
});

test("baseline binds blessing and CAS while regression cannot approve or rebaseline", async () => {
  const [baseline, regression] = await Promise.all([
    source("skills/tailrocks-macos-visual-baseline/SKILL.md"),
    source("skills/tailrocks-macos-visual-regression/SKILL.md"),
  ]);
  for (const clause of [
    "acceptance-review PASS",
    "user's date/revision/scenario/appearance/size",
    "exact preimage digest",
    "OS atomic",
    "atomic quarantine",
    "RECOVERY_REQUIRED",
  ])
    expect(baseline).toContain(clause);
  expect(regression).toContain("not mean the experience is good or approved");
  expect(regression).toContain("Never write a report file");
  expect(regression).toContain("read-only on repository source and baseline bytes");
});

test("published macOS routes name baseline and regression without old combined modes", async () => {
  const [agents, choosing, delivery, design, movement] = await Promise.all([
    source("AGENTS.md"),
    source("docs/content/docs/choosing.mdx"),
    source("docs/content/docs/delivery/macos-app.mdx"),
    source("skills/tailrocks-macos-design/SKILL.md"),
    source("skill-audits/content-movement-design-pr.md"),
  ]);
  for (const text of [agents, choosing, delivery, design]) {
    expect(text).toContain("tailrocks-macos-visual-baseline");
    expect(text).toContain("tailrocks-macos-visual-regression");
  }
  expect(movement).toContain("no alias, redirect, or compatibility route");
  expect(movement).not.toContain("Redirect legacy `regress`");
});
