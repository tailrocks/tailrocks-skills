import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseInvocationRegistry } from "./invocation-registry";

const root = path.resolve(import.meta.dir, "..");
const modelPolicy = [
  "tailrocks-axum-best-practices",
  "tailrocks-graphql-best-practices",
  "tailrocks-grpc-best-practices",
  "tailrocks-rust-best-practices",
  "tailrocks-swift-best-practices",
  "tailrocks-typescript-best-practices",
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
