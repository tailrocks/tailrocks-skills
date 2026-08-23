export type InvocationClass = "MANUAL_ONLY" | "MODEL_POLICY";

export type InvocationRegistryResult = {
  classes: Map<string, InvocationClass>;
  errors: string[];
};

export const invocationRegistrySchema = "tailrocks.skill-invocation/v1";

export function parseInvocationRegistry(
  parsed: unknown,
  skills: readonly string[],
): InvocationRegistryResult {
  const classes = new Map<string, InvocationClass>();
  const errors: string[] = [];
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { classes, errors: ["invocation-registry.json: root must be an object"] };
  }
  const registry = parsed as { $schema?: unknown; owners?: unknown };
  if (Object.keys(registry).sort().join(",") !== "$schema,owners")
    errors.push("invocation-registry.json: top-level keys must be $schema and owners");
  if (registry.$schema !== invocationRegistrySchema)
    errors.push(`invocation-registry.json: schema must be ${invocationRegistrySchema}`);
  if (!Array.isArray(registry.owners)) {
    errors.push("invocation-registry.json: owners must be an array");
    return { classes, errors };
  }

  const known = new Set(skills);
  let previousSkill = "";
  for (const [index, raw] of registry.owners.entries()) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      errors.push(`invocation-registry.json: owner #${index + 1} must be an object`);
      continue;
    }
    const owner = raw as { skill?: unknown; class?: unknown };
    if (Object.keys(owner).sort().join(",") !== "class,skill")
      errors.push(`invocation-registry.json: owner #${index + 1} keys must be skill and class`);
    if (typeof owner.skill !== "string" || owner.skill === "") {
      errors.push(`invocation-registry.json: owner #${index + 1} needs skill`);
      continue;
    }
    if (classes.has(owner.skill)) {
      errors.push(`invocation-registry.json: duplicate owner ${owner.skill}`);
      continue;
    }
    if (previousSkill !== "" && owner.skill < previousSkill)
      errors.push("invocation-registry.json: owners must be sorted by skill");
    previousSkill = owner.skill;
    if (!known.has(owner.skill)) errors.push(`invocation-registry.json: unknown owner ${owner.skill}`);
    if (owner.class !== "MANUAL_ONLY" && owner.class !== "MODEL_POLICY") {
      errors.push(`invocation-registry.json: ${owner.skill} has invalid class ${String(owner.class)}`);
      continue;
    }
    classes.set(owner.skill, owner.class);
  }
  for (const skill of skills)
    if (!classes.has(skill)) errors.push(`invocation-registry.json: missing owner ${skill}`);
  return { classes, errors };
}
