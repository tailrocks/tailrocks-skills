import { expect, test } from "bun:test";

import { discoverDocumentation, type DocumentationTreeEntry } from "./documentation-discovery";
import { evaluateDocumentation, type CommitState } from "./merge-preflight";

function entry(
  revision: "base" | "head",
  pathname: string,
  mode = "100644",
  type: "blob" | "commit" = "blob",
): DocumentationTreeEntry {
  return { revision, path: pathname, mode, type };
}

test("discovers docs tree rules navigation generators and command sources deterministically", () => {
  const discovery = discoverDocumentation([
    entry("head", "docs/content/guide.mdx"),
    entry("base", "README.md"),
    entry("head", "docs/AGENTS.md"),
    entry("head", "docs/sidebars.ts"),
    entry("head", "docusaurus.config.ts"),
    entry("head", "docs.config.ts"),
    entry("head", "sidebars.ts"),
    entry("head", "docs/image.png"),
    entry("head", "package.json"),
    entry("head", "AGENTS.md"),
    entry("head", "README.md"),
  ]);
  expect(discovery.entries_scanned).toBe(11);
  expect(discovery.documentation_paths).toEqual([
    "README.md",
    "docs.config.ts",
    "docs/AGENTS.md",
    "docs/content/guide.mdx",
    "docs/image.png",
    "docs/sidebars.ts",
    "docusaurus.config.ts",
    "sidebars.ts",
  ]);
  expect(discovery.surfaces).toEqual([
    {
      kind: "readme_set",
      root: ".",
      states: ["base", "head"],
      content: ["README.md"],
      rules: ["AGENTS.md"],
      navigation: [],
      generator_markers: [],
      command_sources: ["package.json"],
    },
    {
      kind: "site_project",
      root: ".",
      states: ["head"],
      content: ["docs/AGENTS.md", "docs/content/guide.mdx"],
      rules: ["AGENTS.md", "docs/AGENTS.md"],
      navigation: ["docs/sidebars.ts", "sidebars.ts"],
      generator_markers: ["docs.config.ts", "docusaurus.config.ts"],
      command_sources: ["package.json"],
    },
    {
      kind: "docs_tree",
      root: "docs",
      states: ["head"],
      content: ["docs/AGENTS.md", "docs/content/guide.mdx"],
      rules: ["AGENTS.md", "docs/AGENTS.md"],
      navigation: ["docs/sidebars.ts"],
      generator_markers: [],
      command_sources: ["package.json"],
    },
  ]);
});

test("finds nested README API alternate content and base-deleted surfaces", () => {
  const discovery = discoverDocumentation([
    entry("head", "packages/core/README.mdx"),
    entry("head", "packages/core/openapi.yaml"),
    entry("base", "documentation/removed.md"),
    entry("head", "site/docs.config.ts"),
    entry("head", "site/content/reference.mdx"),
    entry("head", "site/mise.toml"),
    entry("head", "site/AGENTS.md"),
    entry("head", "site/content/meta.json"),
    entry("head", "site/content/example.json"),
    entry("head", "site/sidebars.ts"),
    entry("head", "packages/core/schema.graphql"),
    entry("head", "manual/guide.md"),
  ]);
  expect(discovery.documentation_paths).toEqual([
    "documentation/removed.md",
    "packages/core/README.mdx",
    "packages/core/openapi.yaml",
    "packages/core/schema.graphql",
    "site/AGENTS.md",
    "site/content/example.json",
    "site/content/meta.json",
    "site/content/reference.mdx",
    "site/docs.config.ts",
    "site/mise.toml",
    "site/sidebars.ts",
  ]);
  expect(discovery.surfaces.find((surface) => surface.root === "documentation")?.states).toEqual(["base"]);
  expect(discovery.surfaces.find((surface) => surface.kind === "site_project")).toMatchObject({
    root: "site",
    rules: ["site/AGENTS.md"],
    command_sources: ["site/mise.toml"],
    navigation: ["site/content/meta.json", "site/sidebars.ts"],
  });
  expect(discovery.unmatched_candidates).toEqual(["manual/guide.md"]);
});

test("rejects unsafe duplicate symlink submodule and saturated inventories", () => {
  expect(() =>
    discoverDocumentation([
      entry("head", "docs/AGENTS.md"),
      entry("head", "docs/CLAUDE.md", "120000"),
      entry("head", "docs/GEMINI.md", "120000"),
    ]),
  ).not.toThrow();
  expect(() => discoverDocumentation([entry("head", "docs/link.md", "120000")])).toThrow("unsafe tree modes");
  expect(() => discoverDocumentation([entry("head", "docs", "160000", "commit")])).toThrow(
    "unsafe tree modes",
  );
  expect(() =>
    discoverDocumentation([
      entry("head", "site/docs.config.ts"),
      entry("head", "site/content/link.png", "120000"),
    ]),
  ).toThrow("unsafe tree modes");
  expect(() =>
    discoverDocumentation([
      entry("head", "site/docs.config.ts"),
      entry("head", "site/content/vendor", "160000", "commit"),
    ]),
  ).toThrow("unsafe tree modes");
  expect(() => discoverDocumentation([entry("head", "../README.md")])).toThrow("unsafe");
  expect(() => discoverDocumentation([entry("head", "README.md"), entry("head", "README.md")])).toThrow(
    "duplicated",
  );
  expect(() =>
    discoverDocumentation(Array.from({ length: 20_001 }, (_, index) => entry("head", `src/${index}.ts`))),
  ).toThrow("saturated");
});

function commit(character: string, paths: string[], parents: string[] = [], message = "change"): CommitState {
  return { sha: character.repeat(40), paths, parents, message };
}

test("discovered paths share one final-order oracle and unknown paths remain doc-worthy", () => {
  const source = commit("1", ["src/app.ts"]);
  const nestedDocs = commit(
    "2",
    ["packages/core/README.md"],
    [source.sha],
    "docs: truth\n\nTailrocks-Skill: tailrocks-document\n",
  );
  const discovered = new Set(
    discoverDocumentation([entry("head", "packages/core/README.md")]).documentation_paths,
  );
  expect(evaluateDocumentation([source, nestedDocs], nestedDocs.sha, discovered)).toMatchObject({
    headCovered: true,
    trailerCommit: nestedDocs.sha,
  });
  const unknown = commit("3", ["mystery/output.bin"], [nestedDocs.sha]);
  expect(evaluateDocumentation([source, nestedDocs, unknown], unknown.sha, discovered).headCovered).toBe(
    false,
  );
  expect(() => evaluateDocumentation([], "f".repeat(40), discovered)).toThrow("terminate at HEAD");
  expect(() => evaluateDocumentation([source], "f".repeat(40), discovered)).toThrow("terminate at HEAD");
});
