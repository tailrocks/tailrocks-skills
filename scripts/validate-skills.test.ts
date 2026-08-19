import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { validate } from "./validate-skills";

const skill = "tailrocks-sample-skill";
const description = "Use only when the user explicitly requests this skill. Validate a minimal fixture.";
let root = "";

async function write(relative: string, contents: string): Promise<void> {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
}

async function writeSkill(
  customDescription = description,
  {
    name = skill,
    directory = skill,
    displayName = "Tailrocks: Sample",
  }: { name?: string; directory?: string; displayName?: string } = {},
): Promise<void> {
  await write(
    `skills/${directory}/SKILL.md`,
    `---
name: ${name}
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
    `skills/${directory}/agents/openai.yaml`,
    `interface:
  display_name: ${JSON.stringify(displayName)}
  short_description: Sample fixture
  default_prompt: Use $${name} for this fixture.
policy:
  allow_implicit_invocation: false
`,
  );
  await write(
    `skills/${directory}/evals/evals.json`,
    JSON.stringify({
      skill_name: name,
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
  for (const catalog of ["README.md", "INSTALL.md", "AGENTS.md", "CLAUDE.md"]) {
    await write(catalog, skill);
  }
  await write(
    "catalog.json",
    JSON.stringify({
      groups: [{ id: "sample", title: "Sample", summary: "Fixture group.", skills: [skill] }],
    }),
  );
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

  test("rejects a skill name without the tailrocks prefix", async () => {
    const unbranded = "sample-skill";
    await writeSkill(description, {
      name: unbranded,
      directory: unbranded,
      displayName: "Tailrocks: Sample",
    });
    await write(
      "catalog.json",
      JSON.stringify({
        groups: [{ id: "sample", title: "Sample", summary: "Fixture group.", skills: [skill, unbranded] }],
      }),
    );
    for (const catalog of ["README.md", "INSTALL.md", "AGENTS.md", "CLAUDE.md"]) {
      await write(catalog, `${skill}\n${unbranded}`);
    }
    expect(await validate(root)).toEqual([`${unbranded}: name must start with tailrocks-`]);
  });

  test("rejects an unbranded Codex display name", async () => {
    await writeSkill(description, { displayName: "Sample" });
    expect(await validate(root)).toContain(`${skill}: interface.display_name must start with Tailrocks: `);
  });

  test("rejects a Codex display name with an empty suffix", async () => {
    await writeSkill(description, { displayName: "Tailrocks: " });
    expect(await validate(root)).toContain(`${skill}: interface.display_name must start with Tailrocks: `);
  });

  test("rejects a skill that no catalog group contains", async () => {
    await write(
      "catalog.json",
      JSON.stringify({ groups: [{ id: "sample", title: "S", summary: "s", skills: [] }] }),
    );
    const errors = await validate(root);
    expect(errors).toContain("catalog.json: group sample must list at least one skill");
    expect(errors).toContain(`catalog.json: no group contains ${skill}`);
  });

  test("rejects a description without the guard", async () => {
    await writeSkill("Validate a minimal fixture.");
    expect(await validate(root)).toContain(`${skill}: description must start with explicit-request guard`);
  });

  test("rejects a description over the budget after the guard", async () => {
    await writeSkill(`${description} ${"word ".repeat(60)}`.trim());
    expect(await validate(root)).toContain(
      `${skill}: description is 327 characters after the guard, budget is 250`,
    );
  });

  test("rejects an overlong description", async () => {
    await writeSkill(`${description}${"x".repeat(1100)}`);
    expect(await validate(root)).toContain(`${skill}: description must contain 1-1024 characters`);
  });

  test("rejects a parent-directory link", async () => {
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n[escape](../outside.md)\n`,
    );
    expect(await validate(root)).toContain(`${skill}: reference escapes skill directory: ../outside.md`);
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

  test("rejects a missing eval fixture", async () => {
    const evaluation = await Bun.file(path.join(root, `skills/${skill}/evals/evals.json`)).json();
    evaluation.evals[0].files = ["evals/fixtures/missing.txt"];
    await write(`skills/${skill}/evals/evals.json`, JSON.stringify(evaluation));
    expect(await validate(root)).toContain(
      `${skill}: eval case 1 fixture not found: evals/fixtures/missing.txt`,
    );
  });

  test("rejects a duplicate eval id", async () => {
    const evaluation = await Bun.file(path.join(root, `skills/${skill}/evals/evals.json`)).json();
    evaluation.evals[1].id = 1;
    await write(`skills/${skill}/evals/evals.json`, JSON.stringify(evaluation));
    expect(await validate(root)).toContain(`${skill}: duplicate eval case id 1`);
  });

  test("rejects mismatched manifest descriptions", async () => {
    await write(
      ".kimi-plugin/plugin.json",
      JSON.stringify({ name: "tailrocks-skills", version: "1.0.0", description: "different" }),
    );
    expect(await validate(root)).toContain("plugin manifest descriptions differ");
  });

  test("rejects broken backticked paths in references and templates", async () => {
    await write(`skills/${skill}/references/guide.md`, "See `templates/missing.md`.\n");
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n[Guide](references/guide.md)\n`,
    );
    expect(await validate(root)).toContain(`${skill}: broken reference templates/missing.md`);
  });

  test("rejects unknown reverse-catalog entries", async () => {
    await write("INSTALL.md", `${skill}\ntailrocks-retired-skill\n`);
    expect(await validate(root)).toContain("INSTALL.md: unknown skill tailrocks-retired-skill");
  });

  test("rejects stale release pins", async () => {
    await write("INSTALL.md", `${skill}\nv0.9.0\n`);
    expect(await validate(root)).toContain("INSTALL.md: release pin v0.9.0 must equal v1.0.0");
  });

  test("requires Kimi keywords to include Claude keywords", async () => {
    const base = { name: "tailrocks-skills", version: "1.0.0", description: "same" };
    await write(".claude-plugin/plugin.json", JSON.stringify({ ...base, keywords: ["swift"] }));
    await write(".kimi-plugin/plugin.json", JSON.stringify({ ...base, keywords: [] }));
    expect(await validate(root)).toContain(".kimi-plugin/plugin.json: missing keyword swift");
  });
});
