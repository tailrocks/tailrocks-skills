import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { validate } from "./validate-skills";

const skill = "sample-skill";
const description =
  "Use only when the user explicitly requests this skill. Validate a minimal fixture.";
let root = "";

async function write(relative: string, contents: string): Promise<void> {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
}

async function writeSkill(customDescription = description): Promise<void> {
  await write(
    `skills/${skill}/SKILL.md`,
    `---
name: ${skill}
description: >-
  ${customDescription}
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Sample
`,
  );
  await write(
    `skills/${skill}/agents/openai.yaml`,
    `interface:
  display_name: Sample
  short_description: Sample fixture
  default_prompt: Use $${skill} for this fixture.
policy:
  allow_implicit_invocation: false
`,
  );
  await write(
    `skills/${skill}/evals/evals.json`,
    JSON.stringify({
      skill_name: skill,
      evals: [1, 2, 3].map((id) => ({
        id,
        prompt: `Prompt ${id}`,
        expected_output: `Output ${id}`,
        files: [],
      })),
    }),
  );
}

async function writeManifests(customDescription = "same"): Promise<void> {
  const base = { name: "tailrocks-skills", version: "1.0.0", description: customDescription };
  await write(".claude-plugin/plugin.json", JSON.stringify(base));
  await write(".codex-plugin/plugin.json", JSON.stringify(base));
  await write(".kimi-plugin/plugin.json", JSON.stringify(base));
  await write("plugin.json", JSON.stringify({ name: base.name, description: customDescription }));
  await write(
    ".claude-plugin/marketplace.json",
    JSON.stringify({
      plugins: [{ ...base, source: "./" }],
    }),
  );
  for (const catalog of ["README.md", "AGENTS.md", "CLAUDE.md"]) {
    await write(catalog, skill);
  }
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "validate-skills-"));
  await writeSkill();
  await writeManifests();
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("validate", () => {
  test("accepts a valid minimal repository", async () => {
    expect(await validate(root)).toEqual([]);
  });

  test("rejects a description without the guard", async () => {
    await writeSkill("Validate a minimal fixture.");
    expect(await validate(root)).toContain(
      `${skill}: description must start with explicit-request guard`,
    );
  });

  test("rejects an overlong description", async () => {
    await writeSkill(`${description}${"x".repeat(1100)}`);
    expect(await validate(root)).toContain(
      `${skill}: description must contain 1-1024 characters`,
    );
  });

  test("rejects a parent-directory link", async () => {
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n[escape](../outside.md)\n`,
    );
    expect(await validate(root)).toContain(
      `${skill}: reference escapes skill directory: ../outside.md`,
    );
  });

  test("rejects fewer than three eval cases", async () => {
    await write(
      `skills/${skill}/evals/evals.json`,
      JSON.stringify({
        skill_name: skill,
        evals: [1, 2].map((id) => ({
          id,
          prompt: "Prompt",
          expected_output: "Output",
          files: [],
        })),
      }),
    );
    expect(await validate(root)).toContain(
      `${skill}: evals require matching skill_name and at least 3 cases`,
    );
  });

  test("rejects an eval case missing expected_output", async () => {
    await write(
      `skills/${skill}/evals/evals.json`,
      JSON.stringify({
        skill_name: skill,
        evals: [1, 2, 3].map((id) =>
          id === 2
            ? { id, prompt: "Prompt", files: [] }
            : { id, prompt: "Prompt", expected_output: "Output", files: [] },
        ),
      }),
    );
    expect(await validate(root)).toContain(`${skill}: eval case 2 has invalid shape`);
  });

  test("rejects mismatched manifest descriptions", async () => {
    await write(
      ".kimi-plugin/plugin.json",
      JSON.stringify({ name: "tailrocks-skills", version: "1.0.0", description: "different" }),
    );
    expect(await validate(root)).toContain("plugin manifest descriptions differ");
  });
});
