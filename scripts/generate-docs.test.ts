import { expect, test } from "bun:test";
import path from "node:path";
import { absoluteLinks, escapeMdx, generate, mapProse, replaceRootList, summarize } from "./generate-docs";

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
  expect(absoluteLinks("[a](references/x.md)", "https://host/base")).toBe("[a](https://host/base/references/x.md)");
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
  // Skill bodies link to their own references; the site cannot serve those paths.
  expect(page?.content).not.toContain("](references/");
});
