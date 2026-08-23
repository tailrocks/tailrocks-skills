import { expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const read = (relative: string): Promise<string> => readFile(path.join(root, relative), "utf8");

test("macOS design selectors have exclusive owners and two-pass ordering", async () => {
  const design = await read("skills/tailrocks-macos-design/SKILL.md");
  const review = await read("skills/tailrocks-macos-design-review/SKILL.md");
  const systematize = await read("skills/tailrocks-macos-design-systematize/SKILL.md");
  expect(design).toContain('argument-hint: "[design|prototype] <feature or screen>"');
  expect(design).toContain("Refuse absent, unknown, mixed, `review`, or\n`systematize` selectors");
  expect(design).not.toContain("## Review mode");
  expect(design).not.toContain("- `review`:");
  expect(design).not.toContain("- `systematize`:");
  expect(design.indexOf("Independent preliminary review")).toBeLessThan(design.indexOf("## Prototype"));
  expect(design.indexOf("tailrocks-macos-design-review acceptance")).toBeLessThan(
    design.indexOf("the user signs off"),
  );
  expect(review).toContain('argument-hint: "[preliminary|acceptance]');
  expect(review).toContain("Only `PASS` is an\nacceptance verdict");
  expect(systematize).toContain("Apply only explicitly accepted ledger rows");
  expect(systematize).toContain("stable learned-item ID");
});

test("only the existing macOS design owner has model policy", async () => {
  const registry = JSON.parse(await read("invocation-registry.json")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const family = registry.owners.filter(({ skill }) => skill.startsWith("tailrocks-macos-design"));
  expect(family).toEqual([
    { skill: "tailrocks-macos-design", class: "MODEL_POLICY" },
    { skill: "tailrocks-macos-design-review", class: "MANUAL_ONLY" },
    { skill: "tailrocks-macos-design-systematize", class: "MANUAL_ONLY" },
  ]);
  for (const name of ["tailrocks-macos-design-review", "tailrocks-macos-design-systematize"]) {
    const skill = await read(`skills/${name}/SKILL.md`);
    const agent = await read(`skills/${name}/agents/openai.yaml`);
    expect(skill).toContain("Use only when the user explicitly requests this skill.");
    expect(skill).toContain("disable-model-invocation: true");
    expect(agent).toContain("allow_implicit_invocation: false");
  }
});

test("macOS design references have exact canonical ownership", async () => {
  const manifest = JSON.parse(await read("generated-references.json")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  const entries = new Map(manifest.entries.map((entry) => [entry.source, entry.destinations]));
  const reviewNames = [
    "anti-patterns.md",
    "appkit-api.md",
    "apple-patterns.md",
    "archetypes.md",
    "custom-component-contract.md",
    "custom-renderers.md",
    "design-principles.md",
    "experience-brief.md",
    "layer-model.md",
    "macos-craft.md",
    "match-policy.md",
    "motion.md",
    "native-behavior.md",
    "native-component-map.md",
    "platform-baseline.md",
    "swiftui-api.md",
    "verification.md",
  ];
  for (const name of reviewNames) {
    const destinations = [`skills/tailrocks-macos-design-review/references/${name}`];
    if (name === "match-policy.md" || name === "verification.md")
      destinations.push(`skills/tailrocks-macos-visual-baseline/references/${name}`);
    if (name === "verification.md") destinations.push(`skills/tailrocks-macos-visual-qa/references/${name}`);
    if (name === "match-policy.md" || name === "verification.md")
      destinations.push(`skills/tailrocks-macos-visual-regression/references/${name}`);
    expect(entries.get(`skills/tailrocks-macos-design/references/${name}`)).toEqual(destinations);
  }
  for (const name of ["exemplars.md", "reference-corpus.md"]) {
    expect(entries.get(`skills/tailrocks-macos-design-systematize/references/${name}`)).toEqual([
      `skills/tailrocks-macos-design-review/references/${name}`,
      `skills/tailrocks-macos-design/references/${name}`,
    ]);
  }
  for (const removed of [
    "skills/tailrocks-macos-design/references/review-mode.md",
    "skills/tailrocks-macos-design/references/rubric.md",
    "skills/tailrocks-macos-design/templates/DesignReview.md",
  ])
    await expect(access(path.join(root, removed))).rejects.toThrow();
});

test("review evidence is live-first and corpus is source-neutral", async () => {
  const template = await read("skills/tailrocks-macos-design-review/templates/DesignReview.md");
  const corpus = await read("skills/tailrocks-macos-design-systematize/references/exemplars.md");
  expect(template).toContain("Live-render session identity (required for acceptance");
  expect(template).toContain("every row must name a live observation");
  expect(template).not.toContain("| State | Screenshot |");
  expect(corpus).not.toMatch(/https?:\/\//);
  expect(corpus).not.toMatch(/Compiled .* from|source URL|— [A-Z][a-z]+ [A-Z][a-z]+/);
});

test("published macOS review routes use the new owner without aliases", async () => {
  const agents = await read("AGENTS.md");
  expect(agents).toContain("`tailrocks-macos-design-review`'s scored `preliminary` and `acceptance`");
  expect(agents).not.toContain("macOS design's scored `review`");

  for (const relative of [
    "skills/tailrocks-review-pr/SKILL.md",
    "skills/tailrocks-improve-deep/SKILL.md",
    "docs/design/improve-family-design.md",
    "docs/content/docs/delivery/macos-app.mdx",
  ]) {
    const source = await read(relative);
    expect(source).toContain("tailrocks-macos-design-review");
    expect(source).not.toContain("tailrocks-macos-design`'s `review`");
    expect(source).not.toContain('tailrocks-macos-design" args="review');
  }
});
