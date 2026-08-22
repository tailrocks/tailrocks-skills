import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseInvocationRegistry } from "./invocation-registry";

const root = path.resolve(import.meta.dir, "..");

async function source(file: string): Promise<string> {
  return readFile(path.join(root, file), "utf8");
}

async function compact(file: string): Promise<string> {
  return (await source(file)).replace(/\s+/g, " ");
}

test("invocation policy records the exact effective two-class matrix", async () => {
  const skills = (await Array.fromAsync(new Bun.Glob("skills/*/SKILL.md").scan({ cwd: root })))
    .map((file) => file.split("/")[1]!)
    .sort();
  const registry = parseInvocationRegistry(JSON.parse(await source("invocation-registry.json")), skills);
  expect(registry.errors).toEqual([]);
  const modelPolicy = [...registry.classes]
    .filter(([, invocationClass]) => invocationClass === "MODEL_POLICY")
    .map(([name]) => name);
  expect(modelPolicy).toHaveLength(11);
  expect(skills).toHaveLength(84);

  const policy = await compact("skill-audits/invocation-policy.md");
  expect(policy).toContain("CONFIRMED AND IMPLEMENTED");
  expect(policy).toContain("exactly two classes");
  expect(policy).not.toMatch(/\bDUAL\b|UNCONFIRMED|proposed `tailrocks-grilling`|Every skill is manual-only/);
  for (const name of modelPolicy) expect(policy).toContain(`| \`${name}\` |`);
});

test("root, install, choosing, and context doctrine agree on counts and authority", async () => {
  const agents = await compact("AGENTS.md");
  expect(agents).toContain("The confirmed `MODEL_POLICY` set is exact");
  expect(agents).toContain("Every other skill is `MANUAL_ONLY`");

  const install = await compact("INSTALL.md");
  expect(install).toContain("classifies 11 skills as `MODEL_POLICY`");
  expect(install).toContain("other 73 skills are");
  expect(install).toContain("Model selection grants no mutation");

  const choosing = await compact("docs/content/docs/choosing.mdx");
  expect(choosing).toContain("Eleven exact-trigger policy owners");
  expect(choosing).toContain("It writes and executes nothing");
  expect(choosing).toContain("Naming a route invokes nothing and grants no authority");

  const budget = await compact("docs/design/skill-context-budget.md");
  expect(budget).toContain("current 73 manual-only skills");
  expect(budget).toContain("11 model-policy descriptions");
  expect(budget).toContain("all 84 descriptions");
  expect(budget).toContain("3,942 across the 73 manual owners");
  expect(budget).toContain("current 84 descriptions total 21,545 characters");
  expect(budget).toContain("17,530 count against the per-skill caps");
  expect(budget).toContain("model-policy owners, which have no guard, are measured in full");
  expect(budget).not.toContain("Every skill is manual-only");
});

test("catalog and generated grilling pages expose model policy", async () => {
  const catalog = JSON.parse(await source("catalog.json")) as {
    groups: Array<{ id: string; skills: string[] }>;
  };
  expect(catalog.groups.find((group) => group.id === "decision-support")?.skills).toEqual([
    "tailrocks-grilling",
  ]);
  for (const file of ["README.md", "docs/content/docs/skills/index.mdx"]) {
    const generated = await source(file);
    expect(generated).toMatch(/tailrocks-grilling.*Model policy/);
  }
  const page = await source("docs/content/docs/skills/tailrocks-grilling/index.mdx");
  expect(page).toContain("This model-policy skill may load automatically only when its exact trigger");
  expect(page).toContain("Selection grants no authority beyond the");
});
