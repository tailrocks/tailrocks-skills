import { describe, expect, test } from "bun:test";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  parseScaffoldArguments,
  scaffoldSkill,
} from "../skills/tailrocks-skill-create/scripts/scaffold-skill";
import { runBoundedCommand } from "./bounded-command";

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "tailrocks-scaffold-"));
  const source = path.resolve("skills/tailrocks-skill-create/templates/skill");
  const target = path.join(root, ".skill-template");
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
  await Bun.write(
    path.join(root, "catalog.json"),
    JSON.stringify({ groups: [{ id: "skill-authoring", skills: ["tailrocks-skill-create"] }] }),
  );
  await Bun.write(
    path.join(root, "invocation-registry.json"),
    JSON.stringify({
      $schema: "tailrocks.skill-invocation/v1",
      owners: [{ skill: "tailrocks-skill-create", class: "MANUAL_ONLY" }],
    }),
  );
  await Bun.write(
    path.join(root, ".skill-authoring.json"),
    JSON.stringify({
      schema: "skill-authoring/v1",
      skill_root: ".agent-skills",
      name_pattern: "^[a-z][a-z0-9-]+$",
      template: ".skill-template",
      display_name_prefix: "Acme: ",
      invocation_registry: "invocation-registry.json",
      catalog: { path: "catalog.json", group_id: "skill-authoring" },
    }),
  );
  return root;
}

describe("scaffoldSkill", () => {
  test("rejects retired public skill names before mutation", async () => {
    const root = await fixture();
    try {
      for (const name of [
        "tailrocks-audit",
        "tailrocks-checkout-pr",
        "tailrocks-contribute",
        "tailrocks-rethink",
        "tailrocks-skill-migrate",
        "tailrocks-web-visual-qa",
      ]) {
        await expect(scaffoldSkill(root, name)).rejects.toThrow("retired skill name is forbidden");
      }
      expect(await readdir(path.join(root, ".agent-skills")).catch(() => [])).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("CLI parser and entrypoint reject unmatched argument state", async () => {
    expect(() => parseScaffoldArguments(["one", "two"])).toThrow();
    expect(() => parseScaffoldArguments(["--root", "/tmp", "--root", "/tmp", "one"])).toThrow();
    const script = "../skills/tailrocks-skill-create/scripts/scaffold-skill.ts";
    const result = await runBoundedCommand({ command: ["bun", script, "one", "two"], cwd: import.meta.dir });
    expect(result.code).toBe(2);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      outcome: "refused",
      code: "invalid_arguments",
      mutations: [],
    });
    const root = await mkdtemp(path.join(tmpdir(), "tailrocks-scaffold-cli-"));
    const failed = await runBoundedCommand({
      command: ["bun", script, "--root", path.join(root, "missing"), "deploy-check"],
      cwd: import.meta.dir,
    });
    expect(failed.code).toBe(1);
    expect(failed.stderr).toBe("");
    expect(JSON.parse(failed.stdout)).toMatchObject({
      outcome: "failed",
      code: "scaffold_failed",
      mutations: [],
      recovery_artifacts: [],
    });
  });
  test("copies exact skeleton and reports allowlisted writes", async () => {
    const root = await fixture();
    expect(await scaffoldSkill(root, "deploy-check")).toEqual([
      ".agent-skills/deploy-check/",
      "catalog.json",
      "invocation-registry.json",
    ]);
    const skillSource = await readFile(path.join(root, ".agent-skills/deploy-check/SKILL.md"), "utf8");
    expect(skillSource).toContain("name: deploy-check");
    expect(skillSource).toContain("Use only when the user explicitly requests this skill.");
    expect(skillSource).toContain("disable-model-invocation: true");
    expect(
      await readFile(path.join(root, ".agent-skills/deploy-check/agents/openai.yaml"), "utf8"),
    ).toContain("allow_implicit_invocation: false");
    expect(JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")).owners).toEqual([
      { skill: "deploy-check", class: "MANUAL_ONLY" },
      { skill: "tailrocks-skill-create", class: "MANUAL_ONLY" },
    ]);
  });

  test("requires an explicit MODEL_POLICY request and writes the exact profile", async () => {
    const root = await fixture();
    await scaffoldSkill(root, "policy-check", ".skill-authoring.json", "MODEL_POLICY");
    const skillSource = await readFile(path.join(root, ".agent-skills/policy-check/SKILL.md"), "utf8");
    expect(skillSource).toContain("<Exact model trigger only:");
    expect(skillSource).not.toContain("Use only when the user explicitly requests this skill.");
    expect(skillSource).not.toContain("disable-model-invocation");
    expect(skillSource).not.toMatch(/allowed-tools:|hooks:|!`|^\s*```!/m);
    expect(
      await readFile(path.join(root, ".agent-skills/policy-check/agents/openai.yaml"), "utf8"),
    ).toContain("allow_implicit_invocation: true");
    expect(
      JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")).owners,
    ).toContainEqual({ skill: "policy-check", class: "MODEL_POLICY" });
  });

  test("rejects unsafe or incomplete base templates for both profiles without mutation", async () => {
    for (const mutation of [
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          (await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")).replace(
            "license: Apache-2.0",
            "allowed-tools: Write Bash\nlicense: Apache-2.0",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          (await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")).replace(
            "Use only when the user explicitly requests this skill. ",
            "",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          (await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")).replace(
            "disable-model-invocation: true",
            "disable-model-invocation: false",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          (await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")).replace(
            "disable-model-invocation: true",
            "disable-model-invocation: true\ndisable-model-invocation: false",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          (await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")).replace(
            "user-invocable: true",
            "user-invocable: false",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          (await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")).replace(
            "license: Apache-2.0",
            "hooks:\n  Stop: []\nlicense: Apache-2.0",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          `${await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")}\n!\`git push\`\n`,
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/SKILL.md"),
          `${await readFile(path.join(root, ".skill-template/SKILL.md"), "utf8")}\n\`\`\`!\ngit push\n\`\`\`\n`,
        ),
      async (root: string) => rm(path.join(root, ".skill-template/agents/openai.yaml")),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/agents/openai.yaml"),
          (await readFile(path.join(root, ".skill-template/agents/openai.yaml"), "utf8")).replace(
            "allow_implicit_invocation: false",
            "allow_implicit_invocation: true",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/agents/openai.yaml"),
          (await readFile(path.join(root, ".skill-template/agents/openai.yaml"), "utf8")).replace(
            "allow_implicit_invocation: false",
            "allow_implicit_invocation: false\n  allow_implicit_invocation: true",
          ),
        ),
      async (root: string) =>
        Bun.write(
          path.join(root, ".skill-template/agents/openai.yaml"),
          (await readFile(path.join(root, ".skill-template/agents/openai.yaml"), "utf8")).replace(
            "allow_implicit_invocation: false",
            "allow_implicit_invocation: true\n# allow_implicit_invocation: false",
          ),
        ),
    ]) {
      for (const invocationClass of ["MANUAL_ONLY", "MODEL_POLICY"] as const) {
        const root = await fixture();
        const catalogBefore = await readFile(path.join(root, "catalog.json"), "utf8");
        const registryBefore = await readFile(path.join(root, "invocation-registry.json"), "utf8");
        await mutation(root);
        await expect(
          scaffoldSkill(root, "policy-check", ".skill-authoring.json", invocationClass),
        ).rejects.toThrow();
        expect(await readFile(path.join(root, "catalog.json"), "utf8")).toBe(catalogBefore);
        expect(await readFile(path.join(root, "invocation-registry.json"), "utf8")).toBe(registryBefore);
        expect(await Bun.file(path.join(root, ".agent-skills/policy-check/SKILL.md")).exists()).toBeFalse();
      }
    }
  });

  test("shared-file CAS preserves a concurrent replacement and restores owned writes", async () => {
    const root = await fixture();
    const catalogFile = path.join(root, "catalog.json");
    const registryFile = path.join(root, "invocation-registry.json");
    const catalogBefore = await readFile(catalogFile, "utf8");
    await expect(
      scaffoldSkill(root, "deploy-check", ".skill-authoring.json", "MANUAL_ONLY", {
        afterPublish: async (_file, index) => {
          if (index === 0) await writeFile(registryFile, "concurrent registry\n");
        },
      }),
    ).rejects.toThrow("scaffold failed; recovery retained");
    expect(await readFile(catalogFile, "utf8")).toBe(catalogBefore);
    expect(await readFile(registryFile, "utf8")).toBe("concurrent registry\n");
    expect(await Bun.file(path.join(root, ".agent-skills/deploy-check/SKILL.md")).exists()).toBeFalse();
    expect(
      (await readdir(path.join(root, ".agent-skills"))).some((entry) =>
        entry.startsWith("deploy-check.scaffold-recovery-"),
      ),
    ).toBe(true);
    expect((await readdir(root)).filter((entry) => entry.includes(".scaffold-deploy-check-"))).toEqual([]);
  });

  test("refuses MODEL_POLICY when safe YAML is not exactly convertible", async () => {
    for (const [relative, from, to] of [
      ["SKILL.md", "disable-model-invocation: true", "disable-model-invocation: true # base"],
      ["agents/openai.yaml", "allow_implicit_invocation: false", "allow_implicit_invocation: false # base"],
    ]) {
      const root = await fixture();
      const templateFile = path.join(root, ".skill-template", relative);
      await Bun.write(templateFile, (await readFile(templateFile, "utf8")).replace(from, to));
      const catalogBefore = await readFile(path.join(root, "catalog.json"), "utf8");
      const registryBefore = await readFile(path.join(root, "invocation-registry.json"), "utf8");
      await expect(
        scaffoldSkill(root, "policy-check", ".skill-authoring.json", "MODEL_POLICY"),
      ).rejects.toThrow("conversion failed");
      expect(await readFile(path.join(root, "catalog.json"), "utf8")).toBe(catalogBefore);
      expect(await readFile(path.join(root, "invocation-registry.json"), "utf8")).toBe(registryBefore);
      expect(await Bun.file(path.join(root, ".agent-skills/policy-check/SKILL.md")).exists()).toBeFalse();
    }
  });

  test("rejects policy defaults and unknown invocation classes before mutation", async () => {
    const root = await fixture();
    const policyFile = path.join(root, ".skill-authoring.json");
    const policy = JSON.parse(await readFile(policyFile, "utf8"));
    policy.invocation_class = "MODEL_POLICY";
    await Bun.write(policyFile, JSON.stringify(policy));
    await expect(scaffoldSkill(root, "policy-check")).rejects.toThrow(
      "skill policy contains unsupported fields",
    );
    expect(await Bun.file(path.join(root, ".agent-skills/policy-check/SKILL.md")).exists()).toBeFalse();

    await Bun.write(policyFile, JSON.stringify({ ...policy, invocation_class: undefined }));
    await expect(
      scaffoldSkill(root, "policy-check", ".skill-authoring.json", "DUAL" as "MODEL_POLICY"),
    ).rejects.toThrow("unsupported invocation class");
    expect(await Bun.file(path.join(root, ".agent-skills/policy-check/SKILL.md")).exists()).toBeFalse();
  });

  test("collision refuses without catalog mutation", async () => {
    const root = await fixture();
    await scaffoldSkill(root, "deploy-check");
    const before = await readFile(path.join(root, "catalog.json"), "utf8");
    const registryBefore = await readFile(path.join(root, "invocation-registry.json"), "utf8");
    await expect(scaffoldSkill(root, "deploy-check")).rejects.toThrow("skill already exists");
    expect(await readFile(path.join(root, "catalog.json"), "utf8")).toBe(before);
    expect(await readFile(path.join(root, "invocation-registry.json"), "utf8")).toBe(registryBefore);
  });

  test("rejects malformed, escaped, or duplicate registries without mutation", async () => {
    for (const registry of [
      "not-json",
      JSON.stringify({ $schema: "tailrocks.skill-invocation/v2", owners: [] }),
      JSON.stringify({
        $schema: "tailrocks.skill-invocation/v1",
        owners: [
          { skill: "tailrocks-skill-create", class: "MANUAL_ONLY" },
          { skill: "tailrocks-skill-create", class: "MANUAL_ONLY" },
        ],
      }),
    ]) {
      const root = await fixture();
      const catalogBefore = await readFile(path.join(root, "catalog.json"), "utf8");
      await Bun.write(path.join(root, "invocation-registry.json"), registry);
      await expect(scaffoldSkill(root, "deploy-check")).rejects.toThrow("invalid invocation registry");
      expect(await readFile(path.join(root, "catalog.json"), "utf8")).toBe(catalogBefore);
      expect(await Bun.file(path.join(root, ".agent-skills/deploy-check/SKILL.md")).exists()).toBeFalse();
    }

    const root = await fixture();
    const policyFile = path.join(root, ".skill-authoring.json");
    const policy = JSON.parse(await readFile(policyFile, "utf8"));
    policy.invocation_registry = "../outside.json";
    await Bun.write(policyFile, JSON.stringify(policy));
    await expect(scaffoldSkill(root, "deploy-check")).rejects.toThrow(
      "invocation registry path escapes target repository",
    );
    expect(await Bun.file(path.join(root, ".agent-skills/deploy-check/SKILL.md")).exists()).toBeFalse();

    const duplicateRoot = await fixture();
    await Bun.write(
      path.join(duplicateRoot, "invocation-registry.json"),
      JSON.stringify({
        $schema: "tailrocks.skill-invocation/v1",
        owners: [
          { skill: "deploy-check", class: "MANUAL_ONLY" },
          { skill: "tailrocks-skill-create", class: "MANUAL_ONLY" },
        ],
      }),
    );
    await expect(scaffoldSkill(duplicateRoot, "deploy-check")).rejects.toThrow(
      "invocation registry already contains: deploy-check",
    );
    expect(
      await Bun.file(path.join(duplicateRoot, ".agent-skills/deploy-check/SKILL.md")).exists(),
    ).toBeFalse();
  });
});
