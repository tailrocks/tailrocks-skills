import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseInvocationRegistry } from "./invocation-registry";

const root = path.resolve(import.meta.dir, "..");
const modelPolicy = [
  "tailrocks-agents-md",
  "tailrocks-axum-best-practices",
  "tailrocks-graphql-best-practices",
  "tailrocks-grilling",
  "tailrocks-grpc-best-practices",
  "tailrocks-macos-design",
  "tailrocks-rust-best-practices",
  "tailrocks-swift-best-practices",
  "tailrocks-tui-design",
  "tailrocks-typescript-best-practices",
  "tailrocks-web-design",
];

test("effective invocation matrix has only the confirmed migrated owners", async () => {
  const skills = Array.fromAsync(new Bun.Glob("skills/*/SKILL.md").scan({ cwd: root })).then((files) =>
    files.map((file) => file.split("/")[1]!).sort(),
  );
  const parsed = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8"));
  const registry = parseInvocationRegistry(parsed, await skills);
  expect(registry.errors).toEqual([]);
  expect(
    [...registry.classes]
      .filter(([, invocationClass]) => invocationClass === "MODEL_POLICY")
      .map(([name]) => name),
  ).toEqual(modelPolicy);
});

test("every model-policy owner has the canonical zero-authority metadata tuple", async () => {
  for (const name of modelPolicy) {
    const source = await readFile(path.join(root, "skills", name, "SKILL.md"), "utf8");
    const block = source.match(/^---\n([\s\S]*?)\n---\n?/);
    expect(block).not.toBeNull();
    const metadata = Bun.YAML.parse(block![1]) as Record<string, unknown>;
    expect(metadata.description).toBeString();
    expect(metadata.description).not.toStartWith("Use only when the user explicitly requests this skill.");
    expect(metadata["disable-model-invocation"]).toBeUndefined();
    expect(metadata["user-invocable"]).toBe(true);
    expect(metadata["allowed-tools"]).toBeUndefined();
    expect(metadata.hooks).toBeUndefined();
    expect(source.slice(block![0].length)).not.toMatch(/!`[^`\n]+`|^\s*```!/m);

    const openai = Bun.YAML.parse(
      await readFile(path.join(root, "skills", name, "agents/openai.yaml"), "utf8"),
    ) as { policy?: { allow_implicit_invocation?: unknown } };
    expect(openai.policy?.allow_implicit_invocation).toBe(true);
  }
});

test("representative transaction owner remains manual-only and absent from implicit policy", async () => {
  const name = "tailrocks-skill-create";
  const source = await readFile(path.join(root, "skills", name, "SKILL.md"), "utf8");
  const metadata = Bun.YAML.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]) as Record<string, unknown>;
  expect(metadata.description).toStartWith("Use only when the user explicitly requests this skill.");
  expect(metadata["disable-model-invocation"]).toBe(true);
  const openai = Bun.YAML.parse(
    await readFile(path.join(root, "skills", name, "agents/openai.yaml"), "utf8"),
  ) as { policy?: { allow_implicit_invocation?: unknown } };
  expect(openai.policy?.allow_implicit_invocation).toBe(false);
});

test("instruction and design policy selection preserves mutation and human authority", async () => {
  const boundaries = new Map([
    ["tailrocks-agents-md", ["never authorizes add or sync mutation", "Add and sync need"]],
    ["tailrocks-macos-design", ["never authorizes blessing, capture, or mutation", "live sign-off"]],
    [
      "tailrocks-web-design",
      ["never authorizes blessing, baseline freeze, capture, or mutation", "user decision"],
    ],
    [
      "tailrocks-tui-design",
      ["never authorizes blessing, golden freeze, capture, or mutation", "user decision"],
    ],
  ]);
  for (const [name, phrases] of boundaries) {
    const source = (await readFile(path.join(root, "skills", name, "SKILL.md"), "utf8")).replace(/\s+/g, " ");
    for (const phrase of phrases) expect(source).toContain(phrase);
    const openai = Bun.YAML.parse(
      await readFile(path.join(root, "skills", name, "agents/openai.yaml"), "utf8"),
    ) as { interface?: { default_prompt?: unknown } };
    expect(openai.interface?.default_prompt).toMatch(/Stay read-only|Do not .*mutat/);
  }
  for (const name of [
    "tailrocks-macos-visual-baseline",
    "tailrocks-macos-visual-qa",
    "tailrocks-macos-visual-regression",
    "tailrocks-web-visual-baseline",
    "tailrocks-web-visual-regression",
  ]) {
    const source = await readFile(path.join(root, "skills", name, "SKILL.md"), "utf8");
    const metadata = Bun.YAML.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]) as Record<string, unknown>;
    expect(metadata["disable-model-invocation"]).toBe(true);
  }
});

test("grilling policy is conversation-only and preserves user decision authority", async () => {
  const raw = await readFile(path.join(root, "skills/tailrocks-grilling/SKILL.md"), "utf8");
  const source = raw.replace(/\s+/g, " ");
  for (const phrase of [
    "whole frontier as one numbered list",
    "Label it `Round N`",
    "Every question must include a recommended answer",
    "Never ask a dependent question",
    "user explicitly confirms the final map",
    "Do not turn the decision map into repository changes",
  ]) {
    expect(source).toContain(phrase);
  }
  const metadata = Bun.YAML.parse(raw.match(/^---\n([\s\S]*?)\n---/)![1]) as Record<string, unknown>;
  expect(metadata.description).toMatch(/grilled, challenged, interrogated, or stress-tested/);
  const openai = Bun.YAML.parse(
    await readFile(path.join(root, "skills/tailrocks-grilling/agents/openai.yaml"), "utf8"),
  ) as { interface?: { default_prompt?: unknown } };
  expect(openai.interface?.default_prompt).toMatch(/conversation-only and read-only/);
  expect(openai.interface?.default_prompt).toMatch(/leave every decision to me/);
  expect(openai.interface?.default_prompt).toMatch(/do not execute/);
});

test("grilling has exclusive routes to durable roadmap, research, planning, and design owners", async () => {
  const source = (await readFile(path.join(root, "skills/tailrocks-grilling/SKILL.md"), "utf8")).replace(
    /\s+/g,
    " ",
  );
  for (const phrase of [
    "tailrocks-brainstorm",
    "tailrocks-finalize",
    "Only `tailrocks-finalize` grants `READY`",
    "never writes an item or changes lifecycle state",
    "tailrocks-research",
    "leaves no research artifact",
    "tailrocks-plan",
    "under `plan/`",
    "under `goal/`",
    "never authors or revises an implementation package",
    "tailrocks-macos-design",
    "tailrocks-web-design",
    "tailrocks-tui-design",
    "never designs, renders, or blesses a screen",
    "never invokes that owner or grants its authority",
  ]) {
    expect(source).toContain(phrase);
  }
});
