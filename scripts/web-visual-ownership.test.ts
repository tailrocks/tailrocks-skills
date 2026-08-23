import { expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const read = (relative: string): Promise<string> => readFile(path.join(root, relative), "utf8");

test("web visual selectors and authority have exclusive owners", async () => {
  const baseline = await read("skills/tailrocks-web-visual-baseline/SKILL.md");
  const regression = await read("skills/tailrocks-web-visual-regression/SKILL.md");
  expect(baseline).toContain('argument-hint: "baseline <feature or screens>"');
  expect(baseline).toContain("do not install it from this skill");
  expect(baseline).toContain("legacy `harness` or `freeze`");
  expect(regression).toContain('argument-hint: "regress <feature or screens>"');
  expect(regression).toContain("never mutates");
  expect(regression).not.toContain("--update-snapshots");
});

test("both owners are manual-only and the combined owner is retired", async () => {
  const registry = JSON.parse(await read("invocation-registry.json")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  for (const name of ["tailrocks-web-visual-baseline", "tailrocks-web-visual-regression"]) {
    expect(registry.owners).toContainEqual({ skill: name, class: "MANUAL_ONLY" });
    expect(await read(`skills/${name}/SKILL.md`)).toContain("disable-model-invocation: true");
    expect(await read(`skills/${name}/agents/openai.yaml`)).toContain("allow_implicit_invocation: false");
  }
  await expect(access(path.join(root, "skills/tailrocks-web-visual-qa/SKILL.md"))).rejects.toThrow();
  await expect(
    access(path.join(root, "docs/content/docs/skills/tailrocks-web-visual-qa/index.mdx")),
  ).rejects.toThrow();
});

test("shared web visual contracts generate to exact consumers", async () => {
  const manifest = JSON.parse(await read("generated-references.json")) as {
    entries: Array<{ source: string; destinations: string[] }>;
  };
  const entries = new Map(manifest.entries.map(({ source, destinations }) => [source, destinations]));
  expect(entries.get("scripts/web-visual-qa/README.md")).toEqual([
    "skills/tailrocks-web-visual-baseline/references/harness-contract.md",
    "skills/tailrocks-web-visual-regression/references/harness-contract.md",
  ]);
  expect(entries.get("skills/tailrocks-web-visual-baseline/references/screenshot-baselines.md")).toEqual([
    "skills/tailrocks-web-visual-regression/references/screenshot-baselines.md",
  ]);
  expect(entries.get("shared/references/design-pipeline.md")).toContain(
    "skills/tailrocks-web-visual-baseline/references/design-pipeline.md",
  );
  expect(entries.get("shared/references/design-pipeline.md")).not.toContain(
    "skills/tailrocks-web-visual-regression/references/design-pipeline.md",
  );
});

test("published routes expose baseline and regression without the combined route", async () => {
  for (const relative of [
    "AGENTS.md",
    "INSTALL.md",
    "README.md",
    "catalog.json",
    "invocation-registry.json",
    "docs/content/docs/choosing.mdx",
    "docs/content/docs/delivery/index.mdx",
    "docs/content/docs/delivery/tanstack-feature.mdx",
    "docs/content/docs/skills/index.mdx",
    "docs/content/docs/skills/meta.json",
  ]) {
    const source = await read(relative);
    expect(source).toContain("tailrocks-web-visual-baseline");
    expect(source).not.toContain("tailrocks-web-visual-qa");
  }
});

test("supervisor exposes exact baseline and regress operations", async () => {
  const capture = await read("scripts/web-visual-qa/capture.ts");
  expect(capture).toContain('operation === "baseline" || operation === "regress"');
  expect(capture).toContain("usage: bun capture.ts baseline|regress --root PATH [--port N]");
  const harness = await read("scripts/web-visual-qa/README.md");
  expect(harness).toContain('capture.ts" baseline --root');
  expect(harness).toContain('capture.ts" regress --root');
  expect(harness).not.toContain("capture.ts --root");
});
