import { access, cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

type SkillPolicy = {
  schema: "skill-authoring/v1";
  skill_root: string;
  name_pattern: string;
  template: string;
  display_name_prefix?: string;
  catalog?: { path: string; group_id: string };
};

function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function title(name: string): string {
  return name
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

async function readable(file: string): Promise<boolean> {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function scaffoldSkill(root: string, name: string, policyPath = ".skill-authoring.json"): Promise<string[]> {
  const resolvedRoot = path.resolve(root);
  const resolvedPolicy = path.resolve(resolvedRoot, policyPath);
  if (!inside(resolvedRoot, resolvedPolicy)) throw new Error(`policy escapes target repository: ${policyPath}`);
  const policy = JSON.parse(await readFile(resolvedPolicy, "utf8")) as SkillPolicy;
  if (policy.schema !== "skill-authoring/v1") throw new Error(`unsupported skill policy schema: ${String(policy.schema)}`);

  let namePattern: RegExp;
  if (!policy.name_pattern.startsWith("^") || !policy.name_pattern.endsWith("$")) {
    throw new Error("policy name_pattern must be anchored");
  }
  try {
    namePattern = new RegExp(policy.name_pattern);
  } catch {
    throw new Error("invalid policy name_pattern");
  }
  if (!namePattern.test(name)) throw new Error(`skill name rejected by target policy: ${name}`);

  const skillRoot = path.resolve(resolvedRoot, policy.skill_root);
  const template = path.resolve(resolvedRoot, policy.template);
  const target = path.join(skillRoot, name);
  if (!inside(resolvedRoot, skillRoot) || !inside(resolvedRoot, template) || !inside(skillRoot, target)) {
    throw new Error("policy path escapes target repository");
  }
  if (!(await readable(path.join(template, "SKILL.md")))) throw new Error(`policy template missing SKILL.md: ${policy.template}`);
  if (await readable(path.join(target, "SKILL.md"))) throw new Error(`skill already exists: ${path.relative(resolvedRoot, target)}`);

  let catalog: { groups: Array<{ id: string; skills: string[] }> } | undefined;
  let catalogFile: string | undefined;
  let catalogGroup: { id: string; skills: string[] } | undefined;
  if (policy.catalog) {
    catalogFile = path.resolve(resolvedRoot, policy.catalog.path);
    if (!inside(resolvedRoot, catalogFile)) throw new Error("catalog path escapes target repository");
    catalog = JSON.parse(await readFile(catalogFile, "utf8"));
    catalogGroup = catalog.groups.find((candidate) => candidate.id === policy.catalog?.group_id);
    if (!catalogGroup) throw new Error(`catalog missing group: ${policy.catalog.group_id}`);
    if (catalog.groups.some((group) => group.skills.includes(name))) throw new Error(`catalog already contains: ${name}`);
  }

  const staging = path.join(skillRoot, `.scaffold-${name}`);
  const mutations = [`${path.relative(resolvedRoot, target)}/`];
  if (catalogFile) mutations.push(path.relative(resolvedRoot, catalogFile));
  const createdSkillRoot = !(await exists(skillRoot));
  await mkdir(skillRoot, { recursive: true });
  await rm(staging, { recursive: true, force: true });
  try {
    await cp(template, staging, { recursive: true, errorOnExist: true, force: false });
    const replacements = new Map([
      ["<skill-name>", name],
      ["<Display Name>", `${policy.display_name_prefix ?? ""}${title(name)}`],
    ]);
    for (const relative of ["SKILL.md", "agents/openai.yaml", "evals/evals.json"]) {
      const file = path.join(staging, relative);
      if (!(await readable(file))) continue;
      let source = await readFile(file, "utf8");
      for (const [needle, value] of replacements) source = source.replaceAll(needle, value);
      await writeFile(file, source);
    }
    if (catalogGroup && catalog && catalogFile) catalogGroup.skills.push(name);
    await rename(staging, target);
    try {
      if (catalog && catalogFile) await writeFile(catalogFile, `${JSON.stringify(catalog, null, 2)}\n`);
    } catch (error) {
      await rm(target, { recursive: true, force: true });
      throw error;
    }
    return mutations;
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    if (createdSkillRoot) await rm(skillRoot, { recursive: true, force: true });
    throw error;
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  const policyIndex = args.indexOf("--policy");
  const root = rootIndex === -1 ? process.cwd() : args[rootIndex + 1];
  const policy = policyIndex === -1 ? ".skill-authoring.json" : args[policyIndex + 1];
  const consumed = new Set<number>();
  if (rootIndex !== -1) {
    consumed.add(rootIndex);
    consumed.add(rootIndex + 1);
  }
  if (policyIndex !== -1) {
    consumed.add(policyIndex);
    consumed.add(policyIndex + 1);
  }
  const name = args.find((_, index) => !consumed.has(index));
  if (!root || !policy || !name) throw new Error("usage: scaffold-skill.ts [--root path] [--policy path] <skill-name>");
  const mutations = await scaffoldSkill(root, name, policy);
  console.log(JSON.stringify({ status: "created", mutations }));
}
