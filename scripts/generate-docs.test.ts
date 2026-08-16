import { expect, test } from "bun:test";
import path from "node:path";

import {
  absoluteLinks,
  escapeMdx,
  generate,
  groupSkills,
  mapProse,
  readCatalog,
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

test("no documentation page is plain markdown", async () => {
  expect(await strayMarkdown(path.resolve(import.meta.dir, ".."))).toEqual([]);
});

test("generates a README and a documentation page for every skill", async () => {
  const root = path.resolve(import.meta.dir, "..");
  const generated = await generate(root);
  const files = generated.map((entry) => entry.file);

  expect(files).toContain(path.join("skills", "tailrocks-rethink", "README.md"));
  expect(files).toContain(path.join("docs", "content", "docs", "skills", "tailrocks-rethink.mdx"));
  expect(files).toContain("README.md");

  const readme = generated.find((entry) => entry.file === "README.md");
  expect(readme?.content).toContain("skills/tailrocks-rethink/README.md");

  const page = generated.find((entry) => entry.file.endsWith("tailrocks-rethink.mdx"));
  expect(page?.content).toStartWith("---\ntitle: Rethink\n");
  // The site writes invocations in the reader's own client syntax; the README cannot.
  expect(page?.content).toContain('<Invoke skill="tailrocks-rethink"');
  expect(page?.content).toContain("<AgentPicker />");
  expect(readme?.content).not.toContain("<Invoke");
  // Skill bodies link to their own references; the site cannot serve those paths.
  expect(page?.content).not.toContain("](references/");
});
