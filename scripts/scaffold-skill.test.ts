import { describe, expect, test } from "bun:test";
import { cp, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { scaffoldSkill } from "../skills/tailrocks-skill-create/scripts/scaffold-skill";

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
    path.join(root, ".skill-authoring.json"),
    JSON.stringify({
      schema: "skill-authoring/v1",
      skill_root: ".agent-skills",
      name_pattern: "^[a-z][a-z0-9-]+$",
      template: ".skill-template",
      display_name_prefix: "Acme: ",
      catalog: { path: "catalog.json", group_id: "skill-authoring" },
    }),
  );
  return root;
}

describe("scaffoldSkill", () => {
  test("copies exact skeleton and reports allowlisted writes", async () => {
    const root = await fixture();
    expect(await scaffoldSkill(root, "deploy-check")).toEqual([
      ".agent-skills/deploy-check/",
      "catalog.json",
    ]);
    expect(await readFile(path.join(root, ".agent-skills/deploy-check/SKILL.md"), "utf8")).toContain(
      "name: deploy-check",
    );
    expect(
      await readFile(path.join(root, ".agent-skills/deploy-check/agents/openai.yaml"), "utf8"),
    ).toContain('display_name: "Acme: Deploy Check"');
  });

  test("collision refuses without catalog mutation", async () => {
    const root = await fixture();
    await scaffoldSkill(root, "deploy-check");
    const before = await readFile(path.join(root, "catalog.json"), "utf8");
    await expect(scaffoldSkill(root, "deploy-check")).rejects.toThrow("skill already exists");
    expect(await readFile(path.join(root, "catalog.json"), "utf8")).toBe(before);
  });
});
