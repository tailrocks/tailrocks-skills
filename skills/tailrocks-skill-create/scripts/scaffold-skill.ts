import { randomUUID } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  atomicRecoveryArtifacts,
  atomicWriteFiles,
  type AtomicFileRuntime,
} from "../../../scripts/atomic-file-transaction";

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

export type ScaffoldIO = AtomicFileRuntime;

const manualGuard = "Use only when the user explicitly requests this skill.";
const manualDescription = `  Use only when the user explicitly requests this skill. <Triggers only:
  the symptoms, situations, and artifact names that should activate this
  skill, plus the do-not-use boundary. Never a workflow summary.>`;
const modelDescription = `  <Exact model trigger only: the artifact, language, framework, protocol,
  or explicit intent already in scope; include the do-not-use boundary.
  Never a workflow summary.>`;
const receiptSchema = "tailrocks.skill-scaffold/v1";
const retiredSkillNames = new Set([
  "tailrocks-skill-evaluate",
  "tailrocks-skill-migrate",
  "tailrocks-skill-migration-plan",
]);

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
  io: ScaffoldIO,
): Promise<void> {
  await atomicWriteFiles(
    files.map((entry) => ({ file: entry.file, expected: entry.source, content: entry.next })),
    io,
  );
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
  sharedIO: ScaffoldIO = {},
): Promise<string[]> {
  if (invocationClass !== "MANUAL_ONLY" && invocationClass !== "MODEL_POLICY") {
    throw new Error(`unsupported invocation class: ${String(invocationClass)}`);
  }
  if (retiredSkillNames.has(name)) throw new Error(`retired skill name is forbidden: ${name}`);
  const resolvedRoot = await realpath(path.resolve(root));
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
  if (await exists(target)) throw new Error(`skill already exists: ${path.relative(resolvedRoot, target)}`);

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

  const staging = path.join(skillRoot, `.scaffold-${name}-${randomUUID()}`);
  const mutations = [`${path.relative(resolvedRoot, target)}/`];
  if (catalogFile) mutations.push(path.relative(resolvedRoot, catalogFile));
  if (registryFile) mutations.push(path.relative(resolvedRoot, registryFile));
  const createdSkillRoot = !(await exists(skillRoot));
  await mkdir(skillRoot, { recursive: true });
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
    await mkdir(target, { mode: 0o755 });
    targetCreated = true;
    for (const entry of await readdir(staging))
      await cp(path.join(staging, entry), path.join(target, entry), {
        recursive: true,
        errorOnExist: true,
        force: false,
      });
    await rm(staging, { recursive: true });
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
    await commitSharedFiles(sharedFiles, sharedIO);
    return mutations;
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    if (targetCreated) {
      const recovery = `${target}.scaffold-recovery-${randomUUID()}`;
      try {
        await rename(target, recovery);
        error = new AggregateError([error], `scaffold failed; recovery retained at ${recovery}`);
      } catch (recoveryError) {
        error = new AggregateError(
          [error, recoveryError],
          `scaffold failed; target recovery remains at ${target}`,
        );
      }
    }
    if (createdSkillRoot) await rmdir(skillRoot).catch(() => undefined);
    throw error;
  }
}

export function parseScaffoldArguments(args: readonly string[]): {
  root: string;
  policy: string;
  invocationClass: InvocationClass;
  name: string;
} {
  let root = process.cwd();
  let policy = ".skill-authoring.json";
  let invocationClass: string = "MANUAL_ONLY";
  let name: string | undefined;
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index]!;
    if (value.startsWith("--")) {
      if (
        !(["--root", "--policy", "--invocation-class"] as const).includes(value as never) ||
        seen.has(value)
      )
        throw new Error("unknown or duplicate scaffold option");
      const next = args[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`missing value for ${value}`);
      seen.add(value);
      if (value === "--root") root = next;
      else if (value === "--policy") policy = next;
      else invocationClass = next;
      index += 1;
    } else if (name === undefined) name = value;
    else throw new Error("multiple skill names are not allowed");
  }
  if (!name || (invocationClass !== "MANUAL_ONLY" && invocationClass !== "MODEL_POLICY"))
    throw new Error(
      "usage: scaffold-skill.ts [--root path] [--policy path] [--invocation-class MANUAL_ONLY|MODEL_POLICY] <skill-name>",
    );
  return { root, policy, invocationClass, name };
}

if (import.meta.main) {
  let parsed: ReturnType<typeof parseScaffoldArguments>;
  try {
    parsed = parseScaffoldArguments(process.argv.slice(2));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const namedRecovery = [...detail.matchAll(/\S+\.scaffold-recovery-[^\s]+/g)].map((match) => match[0]);
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: "refused",
        code: "invalid_arguments",
        mutations: [],
        recovery_artifacts: [],
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(2);
  }
  try {
    const mutations = await scaffoldSkill(parsed.root, parsed.name, parsed.policy, parsed.invocationClass);
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: "success",
        code: "created",
        mutations,
        recovery_artifacts: [],
        detail: "skill scaffold created",
      }),
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const namedRecovery = [...detail.matchAll(/\S+\.scaffold-recovery-[^\s]+/g)].map((match) => match[0]);
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        outcome: "failed",
        code: "scaffold_failed",
        mutations: [],
        recovery_artifacts: [...atomicRecoveryArtifacts(error), ...namedRecovery],
        detail,
      }),
    );
    process.exit(1);
  }
}
