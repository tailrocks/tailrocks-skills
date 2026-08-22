import { access, cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

type SkillPolicy = {
  schema: "skill-authoring/v1";
  skill_root: string;
  name_pattern: string;
  template: string;
  display_name_prefix?: string;
  invocation_registry?: string;
  catalog?: { path: string; group_id: string };
};

type InvocationClass = "MANUAL_ONLY" | "MODEL_POLICY";

type InvocationRegistry = {
  $schema: "tailrocks.skill-invocation/v1";
  owners: Array<{ skill: string; class: InvocationClass }>;
};

export type ScaffoldIO = {
  rename: typeof rename;
  writeFile: typeof writeFile;
};

const manualGuard = "Use only when the user explicitly requests this skill.";
const manualDescription = `  Use only when the user explicitly requests this skill. <Triggers only:
  the symptoms, situations, and artifact names that should activate this
  skill, plus the do-not-use boundary. Never a workflow summary.>`;
const modelDescription = `  <Exact model trigger only: the artifact, language, framework, protocol,
  or explicit intent already in scope; include the do-not-use boundary.
  Never a workflow summary.>`;

function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function title(name: string): string {
  return name
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function parseYamlRecord(source: string, label: string): Record<string, unknown> {
  try {
    const parsed = Bun.YAML.parse(source);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error(`invalid ${label} YAML`);
  }
}

async function commitSharedFiles(
  files: Array<{ file: string; source: string; next: string }>,
  transaction: string,
  io: ScaffoldIO,
): Promise<void> {
  const staged = files.map((entry) => ({
    ...entry,
    temporary: `${entry.file}.scaffold-${transaction}-${process.pid}.next`,
    restore: `${entry.file}.scaffold-${transaction}-${process.pid}.restore`,
  }));
  for (const entry of staged) {
    if ((await exists(entry.temporary)) || (await exists(entry.restore))) {
      throw new Error(`stale scaffold transaction beside ${entry.file}`);
    }
  }
  try {
    for (const entry of staged) await io.writeFile(entry.temporary, entry.next);
    const installed: typeof staged = [];
    try {
      for (const entry of staged) {
        await io.rename(entry.temporary, entry.file);
        installed.push(entry);
      }
    } catch (error) {
      for (const entry of installed.reverse()) {
        await io.writeFile(entry.restore, entry.source);
        await io.rename(entry.restore, entry.file);
      }
      throw error;
    }
  } finally {
    for (const entry of staged) {
      await rm(entry.temporary, { force: true });
      await rm(entry.restore, { force: true });
    }
  }
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

export async function scaffoldSkill(
  root: string,
  name: string,
  policyPath = ".skill-authoring.json",
  invocationClass: InvocationClass = "MANUAL_ONLY",
  sharedIO: ScaffoldIO = { rename, writeFile },
): Promise<string[]> {
  if (invocationClass !== "MANUAL_ONLY" && invocationClass !== "MODEL_POLICY") {
    throw new Error(`unsupported invocation class: ${String(invocationClass)}`);
  }
  const resolvedRoot = path.resolve(root);
  const resolvedPolicy = path.resolve(resolvedRoot, policyPath);
  if (!inside(resolvedRoot, resolvedPolicy))
    throw new Error(`policy escapes target repository: ${policyPath}`);
  const policy = JSON.parse(await readFile(resolvedPolicy, "utf8")) as SkillPolicy;
  if (policy.schema !== "skill-authoring/v1")
    throw new Error(`unsupported skill policy schema: ${String(policy.schema)}`);
  const policyKeys = Object.keys(policy).sort();
  const allowedPolicyKeys = [
    "catalog",
    "display_name_prefix",
    "invocation_registry",
    "name_pattern",
    "schema",
    "skill_root",
    "template",
  ];
  if (policyKeys.some((key) => !allowedPolicyKeys.includes(key))) {
    throw new Error("skill policy contains unsupported fields");
  }

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
  if (!(await readable(path.join(template, "SKILL.md"))))
    throw new Error(`policy template missing SKILL.md: ${policy.template}`);
  if (await readable(path.join(target, "SKILL.md")))
    throw new Error(`skill already exists: ${path.relative(resolvedRoot, target)}`);

  let catalog: { groups: Array<{ id: string; skills: string[] }> } | undefined;
  let catalogFile: string | undefined;
  let catalogSource: string | undefined;
  let catalogGroup: { id: string; skills: string[] } | undefined;
  if (policy.catalog) {
    catalogFile = path.resolve(resolvedRoot, policy.catalog.path);
    if (!inside(resolvedRoot, catalogFile)) throw new Error("catalog path escapes target repository");
    catalogSource = await readFile(catalogFile, "utf8");
    catalog = JSON.parse(catalogSource);
    catalogGroup = catalog.groups.find((candidate) => candidate.id === policy.catalog?.group_id);
    if (!catalogGroup) throw new Error(`catalog missing group: ${policy.catalog.group_id}`);
    if (catalog.groups.some((group) => group.skills.includes(name)))
      throw new Error(`catalog already contains: ${name}`);
  }

  let registry: InvocationRegistry | undefined;
  let registryFile: string | undefined;
  let registrySource: string | undefined;
  if (policy.invocation_registry) {
    registryFile = path.resolve(resolvedRoot, policy.invocation_registry);
    if (!inside(resolvedRoot, registryFile))
      throw new Error("invocation registry path escapes target repository");
    registrySource = await readFile(registryFile, "utf8");
    let parsed: InvocationRegistry;
    try {
      parsed = JSON.parse(registrySource) as InvocationRegistry;
    } catch {
      throw new Error("invalid invocation registry");
    }
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Object.keys(parsed).sort().join(",") !== "$schema,owners" ||
      parsed.$schema !== "tailrocks.skill-invocation/v1" ||
      !Array.isArray(parsed.owners)
    ) {
      throw new Error("invalid invocation registry");
    }
    const seen = new Set<string>();
    let previousSkill = "";
    for (const owner of parsed.owners) {
      if (
        typeof owner !== "object" ||
        owner === null ||
        Object.keys(owner).sort().join(",") !== "class,skill" ||
        typeof owner.skill !== "string" ||
        (owner.class !== "MANUAL_ONLY" && owner.class !== "MODEL_POLICY") ||
        seen.has(owner.skill)
      ) {
        throw new Error("invalid invocation registry");
      }
      if (previousSkill !== "" && compareCodeUnits(owner.skill, previousSkill) < 0) {
        throw new Error("invalid invocation registry");
      }
      seen.add(owner.skill);
      previousSkill = owner.skill;
    }
    if (seen.has(name)) throw new Error(`invocation registry already contains: ${name}`);
    registry = parsed;
  }

  const staging = path.join(skillRoot, `.scaffold-${name}`);
  const mutations = [`${path.relative(resolvedRoot, target)}/`];
  if (catalogFile) mutations.push(path.relative(resolvedRoot, catalogFile));
  if (registryFile) mutations.push(path.relative(resolvedRoot, registryFile));
  const createdSkillRoot = !(await exists(skillRoot));
  await mkdir(skillRoot, { recursive: true });
  await rm(staging, { recursive: true, force: true });
  let targetCreated = false;
  try {
    await cp(template, staging, { recursive: true, errorOnExist: true, force: false });
    const replacements = new Map([
      ["<skill-name>", name],
      ["<Display Name>", `${policy.display_name_prefix ?? ""}${title(name)}`],
    ]);
    for (const relative of ["SKILL.md", "agents/openai.yaml"]) {
      const file = path.join(staging, relative);
      if (!(await readable(file))) throw new Error(`policy template missing ${relative}`);
      let source = await readFile(file, "utf8");
      for (const [needle, value] of replacements) source = source.replaceAll(needle, value);
      if (relative === "SKILL.md") {
        const block = source.match(/^---\n([\s\S]*?)\n---\n?/);
        if (!block) throw new Error("template is not fail-closed MANUAL_ONLY");
        const frontmatter = parseYamlRecord(block[1], "SKILL.md frontmatter");
        const body = source.slice(block[0].length);
        if (
          typeof frontmatter.description !== "string" ||
          !frontmatter.description.startsWith(manualGuard) ||
          frontmatter["disable-model-invocation"] !== true ||
          frontmatter["user-invocable"] !== true ||
          frontmatter["allowed-tools"] !== undefined ||
          frontmatter.hooks !== undefined ||
          /!`[^`\n]+`|^\s*```!/m.test(body)
        ) {
          throw new Error("template is not fail-closed MANUAL_ONLY");
        }
        if (
          invocationClass === "MODEL_POLICY" &&
          (!source.includes(manualDescription) || !source.includes("disable-model-invocation: true\n"))
        ) {
          throw new Error("template MODEL_POLICY conversion failed");
        }
      }
      if (relative === "agents/openai.yaml") {
        const openai = parseYamlRecord(source, "agents/openai.yaml");
        if (
          typeof openai.policy !== "object" ||
          openai.policy === null ||
          Array.isArray(openai.policy) ||
          (openai.policy as Record<string, unknown>).allow_implicit_invocation !== false
        ) {
          throw new Error("template is not fail-closed MANUAL_ONLY");
        }
      }
      if (invocationClass === "MODEL_POLICY" && relative === "SKILL.md") {
        source = source
          .replace(manualDescription, modelDescription)
          .replace("disable-model-invocation: true\n", "");
        const convertedBlock = source.match(/^---\n([\s\S]*?)\n---\n?/);
        if (!convertedBlock) throw new Error("template MODEL_POLICY conversion failed");
        const converted = parseYamlRecord(convertedBlock[1], "converted SKILL.md frontmatter");
        if (
          typeof converted.description !== "string" ||
          converted.description.startsWith(manualGuard) ||
          converted["disable-model-invocation"] !== undefined ||
          converted["user-invocable"] !== true
        ) {
          throw new Error("template MODEL_POLICY conversion failed");
        }
      }
      if (invocationClass === "MODEL_POLICY" && relative === "agents/openai.yaml") {
        if (!source.includes("  allow_implicit_invocation: false\n")) {
          throw new Error("template MODEL_POLICY conversion failed");
        }
        source = source.replace("allow_implicit_invocation: false", "allow_implicit_invocation: true");
        const converted = parseYamlRecord(source, "converted agents/openai.yaml");
        if (
          typeof converted.policy !== "object" ||
          converted.policy === null ||
          Array.isArray(converted.policy) ||
          (converted.policy as Record<string, unknown>).allow_implicit_invocation !== true
        ) {
          throw new Error("template MODEL_POLICY conversion failed");
        }
      }
      await writeFile(file, source);
    }
    if (catalogGroup && catalog && catalogFile) catalogGroup.skills.push(name);
    if (registry) {
      registry.owners.push({ skill: name, class: invocationClass });
      registry.owners.sort((left, right) => compareCodeUnits(left.skill, right.skill));
    }
    await rename(staging, target);
    targetCreated = true;
    const sharedFiles: Array<{ file: string; source: string; next: string }> = [];
    if (catalog && catalogFile && catalogSource !== undefined)
      sharedFiles.push({
        file: catalogFile,
        source: catalogSource,
        next: `${JSON.stringify(catalog, null, 2)}\n`,
      });
    if (registry && registryFile && registrySource !== undefined)
      sharedFiles.push({
        file: registryFile,
        source: registrySource,
        next: `${JSON.stringify(registry, null, 2)}\n`,
      });
    await commitSharedFiles(sharedFiles, name, sharedIO);
    return mutations;
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    if (targetCreated) await rm(target, { recursive: true, force: true });
    if (createdSkillRoot) await rm(skillRoot, { recursive: true, force: true });
    throw error;
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  const policyIndex = args.indexOf("--policy");
  const invocationIndex = args.indexOf("--invocation-class");
  const root = rootIndex === -1 ? process.cwd() : args[rootIndex + 1];
  const policy = policyIndex === -1 ? ".skill-authoring.json" : args[policyIndex + 1];
  const invocationClass = invocationIndex === -1 ? "MANUAL_ONLY" : args[invocationIndex + 1];
  const consumed = new Set<number>();
  if (rootIndex !== -1) {
    consumed.add(rootIndex);
    consumed.add(rootIndex + 1);
  }
  if (policyIndex !== -1) {
    consumed.add(policyIndex);
    consumed.add(policyIndex + 1);
  }
  if (invocationIndex !== -1) {
    consumed.add(invocationIndex);
    consumed.add(invocationIndex + 1);
  }
  const name = args.find((_, index) => !consumed.has(index));
  if (!root || !policy || !name || (invocationClass !== "MANUAL_ONLY" && invocationClass !== "MODEL_POLICY"))
    throw new Error(
      "usage: scaffold-skill.ts [--root path] [--policy path] [--invocation-class MANUAL_ONLY|MODEL_POLICY] <skill-name>",
    );
  const mutations = await scaffoldSkill(root, name, policy, invocationClass);
  console.log(JSON.stringify({ status: "created", mutations }));
}
