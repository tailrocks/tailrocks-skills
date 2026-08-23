import { expect, test } from "bun:test";
import path from "node:path";

import {
  absoluteLinks,
  escapeMdx,
  generate,
  groupSkills,
  mapProse,
  readCatalog,
  renderSkillIndex,
  renderSkillOverview,
  replaceRootList,
  strayMarkdown,
  textDiagrams,
  summarize,
} from "./generate-docs";

const skill = (name: string) => ({
  name,
  title: name,
  summary: "",
  description: "",
  argumentHint: undefined,
  defaultPrompt: undefined,
  invocationClass: "MANUAL_ONLY" as const,
  body: "",
  references: [],
  templates: [],
});

test("prose transforms skip fenced blocks and inline code", () => {
  const source = ["text <here>", "```sh", "cmd <raw>", "```", "`code <span>` and <tail>"].join("\n");
  const output = mapProse(source, (text) => text.replace(/</g, "["));
  expect(output).toBe(["text [here>", "```sh", "cmd <raw>", "```", "`code <span>` and [tail>"].join("\n"));
});

test("escapes the characters MDX reads as syntax, and keeps autolinks clickable", () => {
  expect(escapeMdx("write roadmap/<slug>/README.md")).toBe("write roadmap/&lt;slug>/README.md");
  expect(escapeMdx("a {value} here")).toBe("a &#123;value&#125; here");
  expect(escapeMdx("see <https://example.com/x>")).toBe("see [https://example.com/x](https://example.com/x)");
  expect(escapeMdx("`<T>` stays")).toBe("`<T>` stays");
});

test("rewrites repository-relative links and leaves absolute ones alone", () => {
  expect(absoluteLinks("[a](references/x.md)", "https://host/base")).toBe(
    "[a](https://host/base/references/x.md)",
  );
  expect(absoluteLinks("[a](https://x.test)", "https://host/base")).toBe("[a](https://x.test)");
  expect(absoluteLinks("[a](#anchor)", "https://host/base")).toBe("[a](#anchor)");
});

test("summaries drop the explicit-request guard and keep one sentence", () => {
  const description = "Use only when the user explicitly requests this skill. Do the thing. Not this part.";
  expect(summarize(description)).toBe("Do the thing.");
});

test("root list replacement requires both markers", () => {
  expect(replaceRootList("a\n<!-- skills:start -->old<!-- skills:end -->\nb", "NEW")).toBe("a\nNEW\nb");
  expect(() => replaceRootList("no markers", "NEW")).toThrow();
});

test("grouping preserves catalog order and rejects an incomplete catalog", () => {
  const groups = [{ id: "g", title: "G", summary: "s", skills: ["b", "a"] }];
  const grouped = groupSkills(groups, [skill("a"), skill("b")]);
  expect(grouped[0]?.skills.map((entry) => entry.name)).toEqual(["b", "a"]);

  expect(() => groupSkills(groups, [skill("a"), skill("b"), skill("c")])).toThrow(/no group contains c/);
  expect(() => groupSkills(groups, [skill("a")])).toThrow(/unknown skill b/);
  expect(() =>
    groupSkills([...groups, { id: "h", title: "H", summary: "s", skills: ["a"] }], [skill("a"), skill("b")]),
  ).toThrow(/more than one group/);
});

test("renders manual and model-policy invocation classes distinctly", () => {
  const manual = skill("tailrocks-manual");
  const model = { ...skill("tailrocks-model"), invocationClass: "MODEL_POLICY" as const };
  expect(renderSkillOverview(manual)).toContain("never activates on its own");
  expect(renderSkillOverview(model)).toContain("may load automatically only when its exact trigger");
  const index = renderSkillIndex([
    {
      group: { id: "g", title: "G", summary: "s", skills: [manual.name, model.name] },
      skills: [manual, model],
    },
  ]);
  expect(index).toContain("Manual only");
  expect(index).toContain("Model policy");
  expect(index).not.toContain("Every skill is manual-only");
});

test("the catalog groups every skill in the tree", async () => {
  const root = path.resolve(import.meta.dir, "..");
  const groups = await readCatalog(root);
  expect(groups.length).toBeGreaterThan(0);
  expect(groups.every((group) => group.title !== "" && group.summary !== "")).toBeTrue();
});

test("flow diagrams drawn as text are caught, trees and mermaid are not", () => {
  const drawn = ["```text", "a → b", "  → c", "```"].join("\n");
  expect(textDiagrams(drawn)).toEqual([1]);

  const mermaid = ["```mermaid", "flowchart LR", "  a --> b", "```"].join("\n");
  expect(textDiagrams(mermaid)).toEqual([]);

  const tree = ["```text", "repo/", "├── a → generated", "└── b", "```"].join("\n");
  expect(textDiagrams(tree)).toEqual([]);

  const oneLiner = ["```text", "pkill → open → capture", "```"].join("\n");
  expect(textDiagrams(oneLiner)).toEqual([]);
});

test("no documentation page draws a flow as text", async () => {
  const root = path.resolve(import.meta.dir, "..");
  const pages = await generate(root);
  for (const page of pages.filter((entry) => entry.file.endsWith(".mdx"))) {
    expect({ file: page.file, at: textDiagrams(page.content) }).toEqual({ file: page.file, at: [] });
  }
});

test("no skill overview repeats the description its title already shows", async () => {
  const root = path.resolve(import.meta.dir, "..");
  const overviews = (await generate(root)).filter((entry) =>
    entry.file.endsWith(path.join("skills", path.basename(path.dirname(entry.file)), "index.mdx")),
  );
  expect(overviews.length).toBeGreaterThan(0);

  for (const page of overviews) {
    const described = page.content.match(/^description: (".*")$/m);
    if (!described) continue;
    const summary = JSON.parse(described[1]) as string;
    const body = page.content.slice(page.content.indexOf("---", 4));
    expect({ file: page.file, repeated: body.includes(summary) }).toEqual({
      file: page.file,
      repeated: false,
    });
  }
});

test("no documentation page is plain markdown", async () => {
  expect(await strayMarkdown(path.resolve(import.meta.dir, ".."))).toEqual([]);
});

test("generates public documentation for every skill and refreshes the root catalog", async () => {
  const root = path.resolve(import.meta.dir, "..");
  const generated = await generate(root);
  const files = generated.map((entry) => entry.file);

  expect(files.some((file) => file.includes("tailrocks-rethink"))).toBe(false);
  expect(files.some((file) => file.startsWith(`skills${path.sep}`))).toBeFalse();
  expect(files).toContain(
    path.join("docs", "content", "docs", "skills", "tailrocks-root-cause", "index.mdx"),
  );
  expect(files).toContain(
    path.join("docs", "content", "docs", "skills", "tailrocks-root-cause", "definition.mdx"),
  );
  expect(files).toContain("README.md");

  const readme = generated.find((entry) => entry.file === "README.md");
  expect(readme?.content).toContain("https://skills.tailrocks.com/docs/skills/tailrocks-root-cause");

  const page = generated.find((entry) => entry.file.endsWith(path.join("tailrocks-root-cause", "index.mdx")));
  const definition = generated.find((entry) =>
    entry.file.endsWith(path.join("tailrocks-root-cause", "definition.mdx")),
  );
  // The overview stays short: the body it would otherwise inline lives one page deeper.
  expect(page?.content.length).toBeLessThan(definition?.content.length ?? 0);
  expect(page?.content).toContain("/docs/skills/tailrocks-root-cause/definition");
  expect(definition?.content).toContain("This owner is read-only.");
  expect(page?.content).toStartWith('---\ntitle: "Tailrocks: Root Cause"\n');
  expect(definition?.content).toStartWith('---\ntitle: "Tailrocks: Root Cause — Skill definition"\n');
  // The site writes invocations in the reader's own client syntax; the README cannot.
  expect(page?.content).toContain('<Invoke skill="tailrocks-root-cause"');
  expect(page?.content).not.toContain("<AgentPicker");
  // Skill bodies link to their own references; the site cannot serve those paths.
  expect(page?.content).not.toContain("](references/");
});
