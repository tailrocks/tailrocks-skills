import { expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const read = (relative: string): Promise<string> => readFile(path.join(root, relative), "utf8");

test("TUI design and audit have exclusive selectors and outputs", async () => {
  const design = await read("skills/tailrocks-tui-design/SKILL.md");
  const audit = await read("skills/tailrocks-tui-design-audit/SKILL.md");
  expect(design).toContain('argument-hint: "design <feature or screens>"');
  expect(design).toContain("Refuse absent, unknown, mixed, or\n`audit` selectors");
  expect(design).not.toContain("- `audit`:");
  expect(design).toContain("owns design, bless, and freeze");
  expect(design).toContain("`FROZEN`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`");
  expect(audit).toContain("Return exactly one `PASS`, `FAIL`, `BLOCKED`, or `REFUSED`");
  expect(audit).toContain("Return one report in\n   conversation only");
});

test("only the existing TUI design owner has model policy", async () => {
  const registry = JSON.parse(await read("invocation-registry.json")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  expect(registry.owners.filter(({ skill }) => skill.startsWith("tailrocks-tui-design"))).toEqual([
    { skill: "tailrocks-tui-design", class: "MODEL_POLICY" },
    { skill: "tailrocks-tui-design-audit", class: "MANUAL_ONLY" },
  ]);
  const audit = await read("skills/tailrocks-tui-design-audit/SKILL.md");
  const agent = await read("skills/tailrocks-tui-design-audit/agents/openai.yaml");
  expect(audit).toContain("Use only when the user explicitly requests this skill.");
  expect(audit).toContain("disable-model-invocation: true");
  expect(agent).toContain("allow_implicit_invocation: false");
});

test("audit receives exact criteria copies and no authoring assets", async () => {
  const manifest = JSON.parse(await read("generated-references.json")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  const entries = new Map(manifest.entries.map((entry) => [entry.source, entry.destinations]));
  for (const name of ["gallery.md", "golden-frames.md", "screen-package.md", "tui-craft.md"]) {
    expect(entries.get(`skills/tailrocks-tui-design/references/${name}`)).toEqual([
      `skills/tailrocks-tui-design-audit/references/${name}`,
    ]);
    expect(await read(`skills/tailrocks-tui-design-audit/references/${name}`)).toBe(
      await read(`skills/tailrocks-tui-design/references/${name}`),
    );
  }
  const pipeline = entries.get("shared/references/design-pipeline.md") ?? [];
  expect(pipeline).not.toContain("skills/tailrocks-tui-design-audit/references/design-pipeline.md");
  await expect(access(path.join(root, "skills/tailrocks-tui-design-audit/templates"))).rejects.toThrow();
});

test("design freeze binds blessing and publishes the complete golden set by CAS", async () => {
  const design = await read("skills/tailrocks-tui-design/SKILL.md");
  const manifest = await read("skills/tailrocks-tui-design/templates/MANIFEST.md");
  const main = await read("skills/tailrocks-tui-design/templates/gallery/src/main.rs");
  const registry = await read("skills/tailrocks-tui-design/templates/gallery/src/registry.rs");
  for (const phrase of [
    "preimage hash or proven absence of every target",
    "Refuse symlinked targets",
    "A partial publish\nor partial golden set is never success",
    "view/fixture/registry/frame\n   hashes",
  ])
    expect(design).toContain(phrase);
  expect(manifest).toContain("at revision <full SHA>");
  expect(manifest).toContain(
    "registry\n  <digest>, view/fixture sources <digest>, frames/style matrix <digest>",
  );
  expect(main).toContain("match args.as_slice()");
  expect(main).not.toContain(".position(|a| a == name)");
  expect(main).not.toContain("fs::write(&path");
  for (const phrase of [
    "create_new(true)",
    "snapshot(&golden)",
    "snapshot(&stage)",
    "render_text(entry) != rendered",
    "MAX_GOLDEN_FILES",
    "directory_identity(&root)",
    "rename_no_replace(&golden, &backup)",
    "rename_no_replace(&stage, &golden)",
    "remove_owned_directory",
    "RecoveryRequired",
    "unexpected_golden_entry",
  ])
    expect(main).toContain(phrase);
  for (const phrase of [
    "MAX_ENTRIES",
    "MAX_TOTAL_CELLS",
    "valid_identifier",
    "duplicate_registry_entry",
    "invalid_style_check",
  ])
    expect(registry).toContain(phrase);
});

test("audit treats generated authoring rules as criteria and executes read-only", async () => {
  const audit = await read("skills/tailrocks-tui-design-audit/SKILL.md");
  for (const phrase of [
    "an audit criterion only; never create, install, edit, write,",
    "entire subject tree is mounted\n   enforceably read-only",
    "return `BLOCKED` without executing",
    "including tracked, ignored, and untracked paths",
    "never pass `--write`",
    "unchanged subject digest",
  ])
    expect(audit).toContain(phrase);
});

test("published terminal conformance routes name audit owner without old aliases", async () => {
  for (const relative of [
    "AGENTS.md",
    "docs/content/docs/choosing.mdx",
    "docs/content/docs/delivery/index.mdx",
    "docs/design/improve-family-design.md",
    "skills/tailrocks-improve-deep/SKILL.md",
    "skills/tailrocks-review-pr/SKILL.md",
  ]) {
    const source = await read(relative);
    expect(source).toContain("tailrocks-tui-design-audit");
    expect(source).not.toContain('tailrocks-tui-design" args="audit');
    expect(source).not.toContain("`tailrocks-tui-design audit`");
  }
});
