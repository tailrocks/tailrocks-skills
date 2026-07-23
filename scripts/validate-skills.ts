import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const guard = "Use only when the user explicitly requests this skill.";

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function filesUnder(directory: string): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const output: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesUnder(file)));
    else output.push(file);
  }
  return output;
}

function outside(base: string, target: string): boolean {
  const relative = path.relative(base, target);
  return relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
}

function proseWithoutFences(source: string): string {
  let fenced = false;
  return source
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return "";
      }
      return fenced ? "" : line;
    })
    .join("\n");
}

function fencedCode(source: string): string {
  let fenced = false;
  return source
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return "";
      }
      return fenced ? line : "";
    })
    .join("\n");
}

async function scanLinks(
  source: string,
  file: string,
  skillDir: string,
  directory: string,
  errors: string[],
): Promise<void> {
  for (const match of proseWithoutFences(source).matchAll(/\]\(([^)]+)\)/g)) {
    const raw = match[1].split("#", 1)[0];
    if (!raw || /^(?:https?:|mailto:)/.test(raw)) continue;
    const target = path.resolve(path.dirname(file), raw);
    if (raw.startsWith("../") || outside(skillDir, target)) {
      errors.push(`${directory}: reference escapes skill directory: ${raw}`);
    } else if (!(await exists(target))) {
      errors.push(`${directory}: broken reference ${raw}`);
    }
  }
}

function packageManagerCommands(source: string): string[] {
  return source
    .split("\n")
    .filter((line) => /(?:^|[\s$(`])(?:npm|npx|pnpm|yarn)\s/.test(line));
}

export async function validate(root: string): Promise<string[]> {
  const errors: string[] = [];
  const skillsRoot = path.join(root, "skills");
  if (!(await exists(skillsRoot))) return ["missing skills directory"];
  const entries = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const directory of entries) {
    const skillDir = path.join(skillsRoot, directory);
    const skillFile = path.join(skillDir, "SKILL.md");
    if (!(await exists(skillFile))) {
      errors.push(`${directory}: missing SKILL.md`);
      continue;
    }

    const source = await readFile(skillFile, "utf8");
    if (source.split("\n").length > 500) errors.push(`${directory}: SKILL.md exceeds 500 lines`);
    const block = source.match(/^---\n([\s\S]*?)\n---/);
    if (!block) {
      errors.push(`${directory}: invalid frontmatter`);
      continue;
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = Bun.YAML.parse(block[1]) as Record<string, unknown>;
    } catch {
      errors.push(`${directory}: invalid frontmatter YAML`);
      continue;
    }
    const name = metadata.name;
    const description = metadata.description;
    if (name !== directory) errors.push(`${directory}: name must match directory`);
    if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      errors.push(`${directory}: invalid skill name`);
    }
    if (typeof description !== "string" || description.length < 1 || description.length > 1024) {
      errors.push(`${directory}: description must contain 1-1024 characters`);
    } else if (!description.startsWith(guard)) {
      errors.push(`${directory}: description must start with explicit-request guard`);
    }
    if (metadata.license !== "Apache-2.0") errors.push(`${directory}: Apache-2.0 license metadata missing`);
    if (metadata["disable-model-invocation"] !== true) errors.push(`${directory}: Claude manual-only policy missing`);
    if (metadata["user-invocable"] !== true) errors.push(`${directory}: explicit user invocation policy missing`);

    const openaiFile = path.join(skillDir, "agents", "openai.yaml");
    if (!(await exists(openaiFile))) {
      errors.push(`${directory}: missing agents/openai.yaml`);
    } else {
      try {
        const openai = Bun.YAML.parse(await readFile(openaiFile, "utf8")) as {
          interface?: Record<string, unknown>;
          policy?: Record<string, unknown>;
        };
        if (openai.policy?.allow_implicit_invocation !== false) {
          errors.push(`${directory}: Codex manual-only policy missing`);
        }
        for (const key of ["display_name", "short_description", "default_prompt"]) {
          if (typeof openai.interface?.[key] !== "string" || openai.interface[key] === "") {
            errors.push(`${directory}: agents/openai.yaml missing interface.${key}`);
          }
        }
        if (
          typeof openai.interface?.default_prompt === "string" &&
          !openai.interface.default_prompt.includes(`$${directory}`)
        ) {
          errors.push(`${directory}: default_prompt does not name the skill`);
        }
      } catch {
        errors.push(`${directory}: invalid agents/openai.yaml`);
      }
    }

    await scanLinks(source, skillFile, skillDir, directory, errors);
    const referencesDir = path.join(skillDir, "references");
    for (const referenceFile of await filesUnder(referencesDir)) {
      if (!referenceFile.endsWith(".md")) continue;
      const reference = await readFile(referenceFile, "utf8");
      await scanLinks(reference, referenceFile, skillDir, directory, errors);
      const relative = path.relative(skillDir, referenceFile).split(path.sep).join("/");
      if (!source.includes(relative)) {
        errors.push(`${directory}: reference must be linked directly from SKILL.md: ${relative}`);
      }
      for (const line of packageManagerCommands(fencedCode(reference))) {
        errors.push(`${directory}:${relative}: forbidden package-manager command: ${line.trim()}`);
      }
    }

    const evalFile = path.join(skillDir, "evals", "evals.json");
    if (!(await exists(evalFile))) {
      errors.push(`${directory}: missing evals/evals.json`);
    } else {
      try {
        const evaluation = JSON.parse(await readFile(evalFile, "utf8")) as {
          skill_name?: unknown;
          evals?: unknown;
        };
        if (
          evaluation.skill_name !== directory ||
          !Array.isArray(evaluation.evals) ||
          evaluation.evals.length < 3
        ) {
          errors.push(`${directory}: evals require matching skill_name and at least 3 cases`);
        } else {
          for (const [index, value] of evaluation.evals.entries()) {
            const item = value as Record<string, unknown>;
            if (
              typeof item.id !== "number" ||
              typeof item.prompt !== "string" ||
              item.prompt.length === 0 ||
              typeof item.expected_output !== "string" ||
              item.expected_output.length === 0 ||
              !Array.isArray(item.files)
            ) {
              errors.push(`${directory}: eval case ${index + 1} has invalid shape`);
            }
          }
        }
      } catch {
        errors.push(`${directory}: invalid evals/evals.json`);
      }
    }

    for (const line of packageManagerCommands(fencedCode(source))) {
      errors.push(`${directory}:SKILL.md: forbidden package-manager command: ${line.trim()}`);
    }
    for (const template of await filesUnder(path.join(skillDir, "templates"))) {
      try {
        const text = await readFile(template, "utf8");
        for (const line of packageManagerCommands(text)) {
          errors.push(
            `${directory}:${path.relative(skillDir, template)}: forbidden package-manager command: ${line.trim()}`,
          );
        }
      } catch {
        // Binary templates contain no commands this text gate can inspect.
      }
    }
  }

  const manifestFiles = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".codex-plugin/plugin.json",
    ".kimi-plugin/plugin.json",
    "plugin.json",
  ];
  const manifests = new Map<string, Record<string, any>>();
  for (const manifest of manifestFiles) {
    try {
      manifests.set(manifest, JSON.parse(await readFile(path.join(root, manifest), "utf8")));
    } catch {
      errors.push(`${manifest}: invalid JSON`);
    }
  }
  const claude = manifests.get(".claude-plugin/plugin.json");
  const codex = manifests.get(".codex-plugin/plugin.json");
  const kimi = manifests.get(".kimi-plugin/plugin.json");
  const antigravity = manifests.get("plugin.json");
  const marketplace = manifests.get(".claude-plugin/marketplace.json");
  const marketplaceEntry = marketplace?.plugins?.find(
    (plugin: { name?: string }) => plugin.name === "tailrocks-skills",
  );
  if (!marketplaceEntry || marketplaceEntry.source !== "./") {
    errors.push('marketplace.json must self-list tailrocks-skills with source "./"');
  }
  if (new Set([claude?.version, codex?.version, kimi?.version, marketplaceEntry?.version]).size !== 1) {
    errors.push("plugin manifest and marketplace versions differ");
  }
  for (const [file, manifest] of [
    [".claude-plugin/plugin.json", claude],
    [".codex-plugin/plugin.json", codex],
    [".kimi-plugin/plugin.json", kimi],
    ["plugin.json", antigravity],
  ] as const) {
    if (manifest?.name !== "tailrocks-skills") errors.push(`${file}: name must be tailrocks-skills`);
  }
  const descriptions = [
    claude?.description,
    codex?.description,
    kimi?.description,
    antigravity?.description,
    marketplaceEntry?.description,
  ];
  if (new Set(descriptions).size !== 1) errors.push("plugin manifest descriptions differ");

  for (const catalog of ["README.md", "AGENTS.md", "CLAUDE.md"]) {
    try {
      const source = await readFile(path.join(root, catalog), "utf8");
      for (const skill of entries) if (!source.includes(skill)) errors.push(`${catalog}: missing ${skill}`);
    } catch {
      errors.push(`${catalog}: missing catalog`);
    }
  }
  return errors;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "..");
  const errors = await validate(root);
  if (errors.length > 0) {
    for (const error of errors) console.error(`error: ${error}`);
    process.exit(1);
  }
  const entries = (await readdir(path.join(root, "skills"), { withFileTypes: true })).filter(
    (entry) => entry.isDirectory(),
  );
  console.log(`Validated ${entries.length} skills.`);
}
