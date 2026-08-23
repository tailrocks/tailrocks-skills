import { expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const read = (relative: string): Promise<string> => readFile(path.join(root, relative), "utf8");

test("web design and audit have exclusive selectors and outputs", async () => {
  const design = await read("skills/tailrocks-web-design/SKILL.md");
  const audit = await read("skills/tailrocks-web-design-audit/SKILL.md");
  expect(design).toContain('argument-hint: "design <feature or screens>"');
  expect(design).toContain("Refuse absent, unknown, mixed, or\n`audit` selectors");
  expect(design).not.toContain("- `audit`:");
  expect(design).toContain(
    "writes design routes, pure screen components, fixtures, and the\nscreen manifest",
  );
  expect(audit).toContain("Return exactly one `PASS`, `FAIL`, `BLOCKED`, or `REFUSED`");
  expect(audit).toContain("Return the report in conversation\n   only");
  expect(audit).not.toContain("## Modes");
});

test("only the existing web design owner has model policy", async () => {
  const registry = JSON.parse(await read("invocation-registry.json")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners.filter(({ skill }) => skill.startsWith("tailrocks-web-design"))).toEqual([
    { skill: "tailrocks-web-design", class: "MODEL_POLICY" },
    { skill: "tailrocks-web-design-audit", class: "MANUAL_ONLY" },
  ]);
  const audit = await read("skills/tailrocks-web-design-audit/SKILL.md");
  const agent = await read("skills/tailrocks-web-design-audit/agents/openai.yaml");
  expect(audit).toContain("Use only when the user explicitly requests this skill.");
  expect(audit).toContain("disable-model-invocation: true");
  expect(agent).toContain("allow_implicit_invocation: false");
});

test("audit receives exact criteria copies and no authoring assets", async () => {
  const manifest = JSON.parse(await read("generated-references.json")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  const entries = new Map(manifest.entries.map((entry) => [entry.source, entry.destinations]));
  for (const name of ["design-routes.md", "screen-package.md", "web-screen-craft.md"]) {
    expect(entries.get(`skills/tailrocks-web-design/references/${name}`)).toEqual([
      `skills/tailrocks-web-design-audit/references/${name}`,
    ]);
    expect(await read(`skills/tailrocks-web-design-audit/references/${name}`)).toBe(
      await read(`skills/tailrocks-web-design/references/${name}`),
    );
  }
  const pipeline = entries.get("shared/references/design-pipeline.md") ?? [];
  expect(pipeline).not.toContain("skills/tailrocks-web-design-audit/references/design-pipeline.md");
  await expect(access(path.join(root, "skills/tailrocks-web-design-audit/templates"))).rejects.toThrow();
});

test("copied authoring language cannot grant audit mutation", async () => {
  const design = await read("skills/tailrocks-web-design/SKILL.md");
  const audit = await read("skills/tailrocks-web-design-audit/SKILL.md");
  for (const phrase of [
    "preimage hash or proven absence of every target",
    "Refuse symlinked\ntargets",
    "predeclared write set",
    "A partial publish is never success",
    "component and fixture hashes",
  ])
    expect(design).toContain(phrase);
  expect(audit).toContain("an audit criterion only: never create, add, install, edit, commit, or re-bless");
  expect(audit).toContain("subject tree is mounted enforceably read-only");
  expect(audit).toContain("every cache, temporary\n   file, build output, and process artifact");
  expect(audit).toContain("return `BLOCKED` without executing");
  expect(audit).toContain("including tracked, ignored, or untracked paths");
  expect(audit).toContain("refuse an existing, stale,\n   redirected, proxied, wrong-root, disappeared, or");
  expect(audit).toContain("unchanged subject digest");
});

test("published web conformance routes name the audit owner without old aliases", async () => {
  for (const relative of [
    "AGENTS.md",
    "docs/content/docs/choosing.mdx",
    "docs/content/docs/delivery/index.mdx",
    "docs/design/improve-family-design.md",
    "skills/tailrocks-improve-deep/SKILL.md",
    "skills/tailrocks-review-pr/SKILL.md",
  ]) {
    const source = await read(relative);
    expect(source).toContain("tailrocks-web-design-audit");
    expect(source).not.toContain('tailrocks-web-design" args="audit');
    expect(source).not.toContain("`tailrocks-web-design audit`");
  }
});
