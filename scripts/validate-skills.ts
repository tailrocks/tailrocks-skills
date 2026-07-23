import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const skillsRoot = path.join(root, "skills");
const errors: string[] = [];

const entries = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function field(frontmatter: string, name: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^(["'])(.*)\1$/, "$2");
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

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

  const name = field(block[1], "name");
  const description = field(block[1], "description");
  if (name !== directory) errors.push(`${directory}: name must match directory`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? "")) errors.push(`${directory}: invalid skill name`);
  if (!description || description.length > 1024) errors.push(`${directory}: description must contain 1-1024 characters`);
  if (field(block[1], "license") !== "Apache-2.0") errors.push(`${directory}: Apache-2.0 license metadata missing`);
  if (field(block[1], "disable-model-invocation") !== "true") errors.push(`${directory}: Claude manual-only policy missing`);
  if (field(block[1], "user-invocable") !== "true") errors.push(`${directory}: explicit user invocation policy missing`);

  const openaiFile = path.join(skillDir, "agents", "openai.yaml");
  if (!(await exists(openaiFile))) {
    errors.push(`${directory}: missing agents/openai.yaml`);
  } else {
    const openai = await readFile(openaiFile, "utf8");
    if (!/^policy:\n\s+allow_implicit_invocation:\s+false$/m.test(openai)) errors.push(`${directory}: Codex manual-only policy missing`);
    if (!openai.includes(`$${directory}`)) errors.push(`${directory}: default_prompt does not name the skill`);
  }

  for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split("#", 1)[0];
    if (!target || /^(?:https?:|#)/.test(target)) continue;
    if (!(await exists(path.resolve(skillDir, target)))) errors.push(`${directory}: broken reference ${target}`);
  }

  const referencesDir = path.join(skillDir, "references");
  if (await exists(referencesDir)) {
    for (const reference of await readdir(referencesDir)) {
      if (reference.endsWith(".md") && !source.includes(`references/${reference}`)) {
        errors.push(`${directory}: reference must be linked directly from SKILL.md: ${reference}`);
      }
    }
  }

  const evalFile = path.join(skillDir, "evals", "evals.json");
  if (!(await exists(evalFile))) {
    errors.push(`${directory}: missing evals/evals.json`);
  } else {
    try {
      const evaluation = JSON.parse(await readFile(evalFile, "utf8"));
      if (evaluation.skill_name !== directory || !Array.isArray(evaluation.evals) || evaluation.evals.length < 3) {
        errors.push(`${directory}: evals require matching skill_name and at least 3 cases`);
      }
    } catch {
      errors.push(`${directory}: invalid evals/evals.json`);
    }
  }

  for (const [index, line] of source.split("\n").entries()) {
    if (/^\s*(?:npm|npx|pnpm|yarn)(?:\s|$)/.test(line)) errors.push(`${directory}:${index + 1}: forbidden package-manager command`);
  }
}

for (const manifest of [
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".codex-plugin/plugin.json",
  ".kimi-plugin/plugin.json",
  "plugin.json",
]) {
  try {
    JSON.parse(await readFile(path.join(root, manifest), "utf8"));
  } catch {
    errors.push(`${manifest}: invalid JSON`);
  }
}

const claudeManifest = JSON.parse(await readFile(path.join(root, ".claude-plugin/plugin.json"), "utf8"));
const codexManifest = JSON.parse(await readFile(path.join(root, ".codex-plugin/plugin.json"), "utf8"));
const kimiManifest = JSON.parse(await readFile(path.join(root, ".kimi-plugin/plugin.json"), "utf8"));
const antigravityManifest = JSON.parse(await readFile(path.join(root, "plugin.json"), "utf8"));
const marketplace = JSON.parse(await readFile(path.join(root, ".claude-plugin/marketplace.json"), "utf8"));
const marketplaceEntry = marketplace.plugins?.find((plugin: { name?: string }) => plugin.name === "tailrocks-skills");
if (!marketplaceEntry || marketplaceEntry.source !== "./") errors.push("marketplace.json must self-list tailrocks-skills with source \"./\"");
if (new Set([claudeManifest.version, codexManifest.version, kimiManifest.version, marketplaceEntry?.version]).size !== 1) {
  errors.push("plugin manifest and marketplace versions differ");
}
for (const [file, manifest] of [
  [".claude-plugin/plugin.json", claudeManifest],
  [".codex-plugin/plugin.json", codexManifest],
  [".kimi-plugin/plugin.json", kimiManifest],
  ["plugin.json", antigravityManifest],
] as const) {
  if (manifest.name !== "tailrocks-skills") errors.push(`${file}: name must be tailrocks-skills`);
}

for (const catalog of ["README.md", "AGENTS.md"]) {
  const source = await readFile(path.join(root, catalog), "utf8");
  for (const skill of entries) if (!source.includes(skill)) errors.push(`${catalog}: missing ${skill}`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

console.log(`Validated ${entries.length} skills.`);
