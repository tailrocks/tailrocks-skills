import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { generateReferences } from "./generate-references";
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
  await writeInvocationRegistry([{ skill, class: "MANUAL_ONLY" }]);
}

async function writeInvocationRegistry(owners: { skill: string; class: string }[]): Promise<void> {
  await write(
    "invocation-registry.json",
    JSON.stringify({ $schema: "tailrocks.skill-invocation/v1", owners }),
  );
}

async function writeInvocationProfile(
  invocationClass: "MANUAL_ONLY" | "MODEL_POLICY",
  overrides: {
    description?: string;
    disableModelInvocation?: string | null;
    userInvocable?: string | null;
    codexImplicit?: string | null;
    allowedTools?: string;
  } = {},
): Promise<void> {
  const manual = invocationClass === "MANUAL_ONLY";
  const disableModelInvocation =
    overrides.disableModelInvocation === undefined
      ? manual
        ? "true"
        : null
      : overrides.disableModelInvocation;
  const userInvocable = overrides.userInvocable === undefined ? "true" : overrides.userInvocable;
  const codexImplicit = overrides.codexImplicit === undefined ? String(!manual) : overrides.codexImplicit;
  const lines = [
    "---",
    `name: ${skill}`,
    `description: ${overrides.description ?? (manual ? description : "Apply sample policy when sample files are in scope.")}`,
    ...(disableModelInvocation === null ? [] : [`disable-model-invocation: ${disableModelInvocation}`]),
    ...(overrides.allowedTools === undefined ? [] : [`allowed-tools: ${overrides.allowedTools}`]),
    "license: Apache-2.0",
    ...(userInvocable === null ? [] : [`user-invocable: ${userInvocable}`]),
    "---",
    "",
    "# Sample",
    "",
  ];
  await write(`skills/${skill}/SKILL.md`, lines.join("\n"));
  await write(
    `skills/${skill}/agents/openai.yaml`,
    `interface:
  display_name: "Tailrocks: Sample"
  short_description: "Sample fixture"
  default_prompt: "Use $${skill} for this fixture."
policy:
${codexImplicit === null ? "" : `  allow_implicit_invocation: ${codexImplicit}\n`}`,
  );
  await writeInvocationRegistry([{ skill, class: invocationClass }]);
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

  test("ordinary validation does not require or inspect the frozen legacy eval subtree", async () => {
    await write(`skills/${skill}/evals/evals.json`, "not json and deliberately ignored\n");
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
    await writeInvocationRegistry([
      { skill: unbranded, class: "MANUAL_ONLY" },
      { skill, class: "MANUAL_ONLY" },
    ]);
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
    expect(await validate(root)).toContain(
      `${skill}: MANUAL_ONLY description must start with explicit-request guard`,
    );
  });

  test("rejects the manual-only guard on a MODEL_POLICY description", async () => {
    await writeInvocationProfile("MODEL_POLICY", { description });
    expect(await validate(root)).toContain(
      `${skill}: MODEL_POLICY description must state its exact model trigger`,
    );
  });

  test("rejects missing, false, or non-boolean MANUAL_ONLY Claude policy", async () => {
    for (const disableModelInvocation of [null, "false", '"true"', "1"]) {
      await writeInvocationProfile("MANUAL_ONLY", { disableModelInvocation });
      expect(await validate(root)).toContain(`${skill}: MANUAL_ONLY Claude policy missing`);
    }
  });

  test("requires boolean explicit user invocation for both classes", async () => {
    for (const invocationClass of ["MANUAL_ONLY", "MODEL_POLICY"] as const) {
      for (const userInvocable of [null, "false", '"true"', "1"]) {
        await writeInvocationProfile(invocationClass, { userInvocable });
        expect(await validate(root)).toContain(`${skill}: explicit user invocation policy missing`);
      }
    }
  });

  test("requires exact boolean Codex policy for both classes", async () => {
    for (const invocationClass of ["MANUAL_ONLY", "MODEL_POLICY"] as const) {
      for (const codexImplicit of [
        null,
        "null",
        JSON.stringify(String(invocationClass === "MODEL_POLICY")),
      ]) {
        await writeInvocationProfile(invocationClass, { codexImplicit });
        expect(await validate(root)).toContain(
          `${skill}: ${invocationClass} crossed with Codex allow_implicit_invocation`,
        );
      }
    }
  });

  test("accepts the exact MODEL_POLICY metadata profile", async () => {
    await writeSkill("Apply sample policy when sample files are in scope.");
    await write(
      `skills/${skill}/SKILL.md`,
      `---
name: ${skill}
description: Apply sample policy when sample files are in scope.
license: Apache-2.0
user-invocable: true
---

# Sample
`,
    );
    await write(
      `skills/${skill}/agents/openai.yaml`,
      `interface:
  display_name: "Tailrocks: Sample"
  short_description: "Sample fixture"
  default_prompt: "Use $${skill} for this fixture."
policy:
  allow_implicit_invocation: true
`,
    );
    await writeInvocationRegistry([{ skill, class: "MODEL_POLICY" }]);
    expect(await validate(root)).toEqual([]);

    await write(
      `skills/${skill}/SKILL.md`,
      `---
name: ${skill}
description: Apply sample policy when sample files are in scope.
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
---

# Sample
`,
    );
    expect(await validate(root)).toEqual([]);
  });

  test("rejects non-boolean MODEL_POLICY Claude metadata", async () => {
    await writeInvocationRegistry([{ skill, class: "MODEL_POLICY" }]);
    await write(
      `skills/${skill}/agents/openai.yaml`,
      `interface:
  display_name: "Tailrocks: Sample"
  short_description: "Sample fixture"
  default_prompt: "Use $${skill} for this fixture."
policy:
  allow_implicit_invocation: true
`,
    );
    for (const value of ["null", '"false"', "1"]) {
      await write(
        `skills/${skill}/SKILL.md`,
        `---
name: ${skill}
description: Apply sample policy when sample files are in scope.
disable-model-invocation: ${value}
license: Apache-2.0
user-invocable: true
---

# Sample
`,
      );
      expect(await validate(root)).toContain(`${skill}: MODEL_POLICY crossed with Claude manual-only policy`);
    }
  });

  test("rejects duplicate, unknown, and missing invocation owners", async () => {
    await writeInvocationRegistry([
      { skill, class: "MANUAL_ONLY" },
      { skill, class: "MODEL_POLICY" },
      { skill: "tailrocks-unknown", class: "MANUAL_ONLY" },
    ]);
    const errors = await validate(root);
    expect(errors).toContain(`invocation-registry.json: duplicate owner ${skill}`);
    expect(errors).toContain("invocation-registry.json: unknown owner tailrocks-unknown");

    await writeInvocationRegistry([]);
    expect(await validate(root)).toContain(`invocation-registry.json: missing owner ${skill}`);
  });

  test("rejects a missing, malformed, or wrong-schema invocation registry", async () => {
    await rm(path.join(root, "invocation-registry.json"));
    expect(await validate(root)).toContain("invocation-registry.json: missing or invalid JSON");

    await write("invocation-registry.json", "null");
    expect(await validate(root)).toContain("invocation-registry.json: root must be an object");

    await write(
      "invocation-registry.json",
      JSON.stringify({ $schema: "tailrocks.skill-invocation/v2", owners: [] }),
    );
    expect(await validate(root)).toContain(
      "invocation-registry.json: schema must be tailrocks.skill-invocation/v1",
    );
  });

  test("rejects extra registry keys and unsorted owners", async () => {
    const other = "tailrocks-another-skill";
    await writeSkill(description, { name: other, directory: other, displayName: "Tailrocks: Another" });
    await write(
      "catalog.json",
      JSON.stringify({
        groups: [{ id: "sample", title: "Sample", summary: "Fixture group.", skills: [skill, other] }],
      }),
    );
    for (const catalog of ["README.md", "INSTALL.md", "AGENTS.md", "CLAUDE.md"]) {
      await write(catalog, `${skill}\n${other}`);
    }
    await write(
      "invocation-registry.json",
      JSON.stringify({
        $schema: "tailrocks.skill-invocation/v1",
        owners: [
          { skill, class: "MANUAL_ONLY", note: "forbidden" },
          { skill: other, class: "MANUAL_ONLY" },
        ],
        extra: true,
      }),
    );
    const errors = await validate(root);
    expect(errors).toContain("invocation-registry.json: top-level keys must be $schema and owners");
    expect(errors).toContain("invocation-registry.json: owner #1 keys must be skill and class");
    expect(errors).toContain("invocation-registry.json: owners must be sorted by skill");
  });

  test("rejects unknown invocation classes", async () => {
    await writeInvocationRegistry([{ skill, class: "DUAL" }]);
    expect(await validate(root)).toContain(`invocation-registry.json: ${skill} has invalid class DUAL`);
  });

  test("rejects Claude and Codex metadata crossed between invocation classes", async () => {
    await writeInvocationRegistry([{ skill, class: "MODEL_POLICY" }]);
    const modelErrors = await validate(root);
    expect(modelErrors).toContain(`${skill}: MODEL_POLICY crossed with Claude manual-only policy`);
    expect(modelErrors).toContain(`${skill}: MODEL_POLICY crossed with Codex allow_implicit_invocation`);

    await writeInvocationRegistry([{ skill, class: "MANUAL_ONLY" }]);
    await write(
      `skills/${skill}/agents/openai.yaml`,
      `interface:
  display_name: "Tailrocks: Sample"
  short_description: "Sample fixture"
  default_prompt: "Use $${skill} for this fixture."
policy:
  allow_implicit_invocation: true
`,
    );
    expect(await validate(root)).toContain(
      `${skill}: MANUAL_ONLY crossed with Codex allow_implicit_invocation`,
    );
  });

  test("validates stable OpenCode metadata and rejects unsupported discovery/menu claims", async () => {
    await write(
      `skills/${skill}/SKILL.md`,
      (await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()).replace(
        "license: Apache-2.0",
        'license: Apache-2.0\nmetadata:\n  owner: "tailrocks"',
      ),
    );
    expect(await validate(root)).toEqual([]);

    await write(
      `skills/${skill}/SKILL.md`,
      (await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()).replace(
        'owner: "tailrocks"',
        "owner: true",
      ),
    );
    expect(await validate(root)).toContain(`${skill}: metadata must be a string-to-string map for OpenCode`);

    for (const key of ["opencode/autoinvoke", "opencode/slash"]) {
      await writeSkill();
      await write(
        `skills/${skill}/SKILL.md`,
        (await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()).replace(
          "license: Apache-2.0",
          `license: Apache-2.0\nmetadata:\n  ${key}: "true"`,
        ),
      );
      expect(await validate(root)).toContain(
        `${skill}: unsupported OpenCode discovery/menu metadata for supported client`,
      );
    }
  });

  test("rejects accidental authority escalation in MODEL_POLICY metadata", async () => {
    await writeInvocationProfile("MODEL_POLICY", { allowedTools: "Write Bash" });
    expect(await validate(root)).toContain(
      `${skill}: MODEL_POLICY may not carry executable or pre-approved authority`,
    );

    await writeInvocationProfile("MODEL_POLICY");
    await write(
      `skills/${skill}/SKILL.md`,
      (await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()).replace(
        "license: Apache-2.0",
        "hooks:\n  Stop: []\nlicense: Apache-2.0",
      ),
    );
    expect(await validate(root)).toContain(
      `${skill}: MODEL_POLICY may not carry executable or pre-approved authority`,
    );

    await writeInvocationProfile("MODEL_POLICY");
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n!\`git push\`\n`,
    );
    expect(await validate(root)).toContain(
      `${skill}: MODEL_POLICY may not carry executable or pre-approved authority`,
    );

    await writeInvocationProfile("MODEL_POLICY");
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n\`\`\`!\ngit push\n\`\`\`\n`,
    );
    expect(await validate(root)).toContain(
      `${skill}: MODEL_POLICY may not carry executable or pre-approved authority`,
    );

    await write(
      "invocation-registry.json",
      JSON.stringify({
        $schema: "tailrocks.skill-invocation/v1",
        owners: [{ skill, class: "MODEL_POLICY", authority: "write" }],
      }),
    );
    expect(await validate(root)).toContain("invocation-registry.json: owner #1 keys must be skill and class");
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

  test("allows only exact TanStack family template and resolver sibling links", async () => {
    await rm(path.join(root, "skills", skill), { recursive: true, force: true });
    const members = [
      "tailrocks-tanstack-project-audit",
      "tailrocks-tanstack-project-migrate",
      "tailrocks-tanstack-project-remediate",
      "tailrocks-tanstack-project-setup",
    ];
    for (const member of members)
      await writeSkill(undefined, {
        name: member,
        directory: member,
        displayName: `Tailrocks: ${member}`,
      });
    await write("skills/tailrocks-tanstack-project-setup/templates/package.json", "{}\n");
    await write(
      "skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts",
      "export {};\n",
    );
    for (const catalog of ["README.md", "INSTALL.md", "AGENTS.md", "CLAUDE.md"])
      await write(catalog, members.join("\n"));
    await write(
      "catalog.json",
      JSON.stringify({
        groups: [{ id: "sample", title: "Sample", summary: "Fixture group.", skills: members }],
      }),
    );
    await writeInvocationRegistry(
      [...members].sort().map((member) => ({ skill: member, class: "MANUAL_ONLY" })),
    );

    const audit = "tailrocks-tanstack-project-audit";
    const auditFile = `skills/${audit}/SKILL.md`;
    const base = await Bun.file(path.join(root, auditFile)).text();
    const allowed = `${base}\n[templates](../tailrocks-tanstack-project-setup/templates/)\n[pin](../tailrocks-tanstack-project-setup/templates/package.json)\n[resolver](../tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts)\n`;
    await write(auditFile, allowed);
    expect(await validate(root)).toEqual([]);

    for (const forbidden of [
      "../tailrocks-tanstack-project-setup/SKILL.md",
      "../tailrocks-tanstack-project-setup/scripts/other.ts",
      "../tailrocks-tanstack-project-setup/references/other.md",
      "../tailrocks-outsider/templates/package.json",
      "../tailrocks-tanstack-project-setup/templates/../../SKILL.md",
    ]) {
      await write(auditFile, `${allowed}\n[forbidden](${forbidden})\n`);
      expect(await validate(root)).toContain(`${audit}: reference escapes skill directory: ${forbidden}`);
    }
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

  test("allows only manifest-owned packaged references to remain unlinked", async () => {
    const destination = `skills/${skill}/references/generated-policy.md`;
    await write(destination, "# Generated policy\n");
    expect(await validate(root)).toContain(
      `${skill}: reference must be linked directly from SKILL.md: references/generated-policy.md`,
    );

    await write(
      "generated-references.json",
      JSON.stringify({
        $schema: "tailrocks.generated-references/v1",
        entries: [
          {
            source: "shared/references/runtime-trust.md",
            destinations: [destination],
          },
        ],
      }),
    );
    await mkdir(path.join(root, "skill-authoring/references"), { recursive: true });
    await write("shared/references/runtime-trust.md", "# Generated policy\n");
    await generateReferences(root, "write");
    expect(await validate(root)).toEqual([]);

    await write(destination, "# Drifted policy\n");
    let errors = await validate(root);
    expect(errors).toContain("generated-references.json: invalid generated-reference manifest");
    expect(errors).toContain(
      `${skill}: reference must be linked directly from SKILL.md: references/generated-policy.md`,
    );

    await write(
      "generated-references.json",
      JSON.stringify({
        $schema: "tailrocks.generated-references/v1",
        entries: [{ source: "outside.md", destinations: [destination] }],
      }),
    );
    errors = await validate(root);
    expect(errors).toContain("generated-references.json: invalid generated-reference manifest");
    expect(errors).toContain(
      `${skill}: reference must be linked directly from SKILL.md: references/generated-policy.md`,
    );
  });

  test("rejects unknown reverse-catalog entries", async () => {
    await write("INSTALL.md", `${skill}\ntailrocks-retired-skill\n`);
    expect(await validate(root)).toContain("INSTALL.md: unknown skill tailrocks-retired-skill");
  });

  test("rejects obsolete migration-plan artifacts", async () => {
    await write("skill-migrations/rename.md", "# Migration plan\n");
    expect(await validate(root)).toContain(
      "skill-migrations/rename.md: migration-plan artifacts are forbidden; use an explicitly authorized direct migration",
    );
  });

  test("rejects stale release pins", async () => {
    await write("INSTALL.md", `${skill}\nv0.9.0\n`);
    expect(await validate(root)).toContain("INSTALL.md: release pin v0.9.0 must equal v1.0.0");
  });

  test("rejects a design-file tool named in skill content", async () => {
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\nExport the artboard from Figma and match it.\n`,
    );
    expect(await validate(root)).toContain(
      `${skill}:SKILL.md: design-file tool forbidden in skill content: Export the artboard from Figma and match it.`,
    );
  });

  test("allows a design-file tool named in order to forbid it", async () => {
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\nA Figma file is never the design reference.\n`,
    );
    expect(await validate(root)).toEqual([]);
  });

  test("does not match sketch used as an ordinary verb", async () => {
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\nA description that sketches the workflow becomes a shortcut.\n`,
    );
    expect(await validate(root)).toEqual([]);
  });

  test("rejects a model route pinned in skill content", async () => {
    await write(`skills/${skill}/references/routing.md`, "Dispatch Haiku 4.5 as the executor.\n");
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n[Routing](references/routing.md)\n`,
    );
    expect(await validate(root)).toContain(
      `${skill}:references/routing.md: model brand name forbidden in skill content: Dispatch Haiku 4.5 as the executor.`,
    );
  });

  test("allows a client name that is not a model route", async () => {
    await write(
      `skills/${skill}/references/routing.md`,
      "`CLAUDE.md` and `GEMINI.md` are symlinks to the AGENTS.md beside them.\n",
    );
    await write(
      `skills/${skill}/SKILL.md`,
      `${await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text()}\n[Routing](references/routing.md)\n`,
    );
    expect(await validate(root)).toEqual([]);
  });

  test("rejects a router over the line budget", async () => {
    const body = await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text();
    await write(`skills/${skill}/SKILL.md`, `${body}${"padding\n".repeat(210)}`);
    const errors = await validate(root);
    expect(errors.some((error) => error.includes("over the 200-line router budget"))).toBe(true);
  });

  test("allows a router at the line budget", async () => {
    const source = await Bun.file(path.join(root, `skills/${skill}/SKILL.md`)).text();
    const block = source.match(/^---\n[\s\S]*?\n---/);
    expect(block).not.toBeNull();
    const bodyLines = source.slice(block![0].length).replace(/^\n/, "").split("\n").length;
    await write(`skills/${skill}/SKILL.md`, `${source}${"padding\n".repeat(200 - bodyLines)}`);
    const errors = await validate(root);
    expect(errors.some((error) => error.includes("router budget"))).toBe(false);
  });

  test("requires Kimi keywords to include Claude keywords", async () => {
    const base = { name: "tailrocks-skills", version: "1.0.0", description: "same" };
    await write(".claude-plugin/plugin.json", JSON.stringify({ ...base, keywords: ["swift"] }));
    await write(".kimi-plugin/plugin.json", JSON.stringify({ ...base, keywords: [] }));
    expect(await validate(root)).toContain(".kimi-plugin/plugin.json: missing keyword swift");
  });
});
