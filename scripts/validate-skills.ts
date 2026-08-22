import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const guard = "Use only when the user explicitly requests this skill.";
const descriptionBudget = 250;

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export function resolveEvalFixture(root: string, skillDir: string, fixture: string): string {
  return fixture.startsWith("skills/") ? path.join(root, fixture) : path.join(skillDir, fixture);
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

async function validateDurableContracts(root: string, errors: string[]): Promise<void> {
  const contracts = [
    {
      directory: "skill-evidence",
      schema: "tailrocks.skill-evidence/v1",
      fields: ["Skill", "Source SHA", "Recorded date", "Provenance"],
    },
    {
      directory: "skill-migrations",
      schema: "tailrocks.skill-migration/v1",
      fields: ["Migration", "Source SHA", "Recorded date", "Provenance", "Authority"],
    },
  ];
  for (const contract of contracts) {
    for (const file of await filesUnder(path.join(root, contract.directory))) {
      if (!file.endsWith(".md")) {
        errors.push(`${path.relative(root, file)}: durable contract must be Markdown`);
        continue;
      }
      const source = await readFile(file, "utf8");
      const label = path.relative(root, file);
      if (!source.includes(`Schema: \`${contract.schema}\``)) {
        errors.push(`${label}: missing schema ${contract.schema}`);
      }
      for (const field of contract.fields) {
        if (!new RegExp("^- " + field + ": `[^<>\\n]+`$", "m").test(source)) {
          errors.push(`${label}: missing or placeholder ${field}`);
        }
      }
      if (!/^- Source SHA: `[0-9a-f]{40}`$/m.test(source)) {
        errors.push(`${label}: Source SHA must be a 40-character lowercase commit SHA`);
      }
      if (!/^- Recorded date: `\d{4}-\d{2}-\d{2}`$/m.test(source)) {
        errors.push(`${label}: Recorded date must be YYYY-MM-DD`);
      }
    }
  }
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
  for (const match of proseWithoutFences(source).matchAll(
    /`((?:references|templates|scripts|evals)\/[^\s`]+)`/g,
  )) {
    const raw = match[1].replace(/[),.;:]+$/, "").split("#", 1)[0];
    const target = path.resolve(skillDir, raw);
    if (outside(skillDir, target)) {
      errors.push(`${directory}: reference escapes skill directory: ${raw}`);
    } else if (!(await exists(target))) {
      errors.push(`${directory}: broken reference ${raw}`);
    }
  }
  for (const match of proseWithoutFences(source).matchAll(
    /`(skills\/tailrocks-skill-audit\/references\/([^\s`]+\.md))`/g,
  )) {
    const allowed = new Set(["design-doctrine.md", "testing-doctrine.md", "house-wiring.md"]);
    const target = path.resolve(path.dirname(skillDir), "..", match[1]);
    if (!allowed.has(match[2]) || !(await exists(target))) {
      errors.push(`${directory}: invalid shared authoring doctrine path: ${match[1]}`);
    }
  }
}

// The router budget. A SKILL.md loads whole on every invocation and stays in
// context, so every line competes with every other behavior in the file;
// references cost nothing until read. This was a notice for a long time and
// three routers drifted past it unnoticed, which is what a notice buys.
const ROUTER_BUDGET = 200;

const forgeUrlPattern =
  /https?:\/\/(gist\.github\.com|github\.com|gitlab\.com|bitbucket\.org|codeberg\.org)\/[^\s)>`"'\]]*/g;
// Canonical homes of house-adopted libraries and tools, used as version and
// documentation sources. Everything else on a code forge is an external
// project reference, which shipped skill content must not carry.
const allowedForgeRepos = new Set([
  "trailofbits/dylint",
  "graphql-rust/juniper",
  "rust-lang/crates.io-index", // cargo registry endpoint in deny.toml, not a project reference
]);
const placeholderOwners = new Set(["org", "owner", "your-org", "acme"]);

function scanForgeUrls(source: string, directory: string, label: string, errors: string[]): void {
  for (const match of source.matchAll(forgeUrlPattern)) {
    const [url, host] = match;
    if (host === "gist.github.com") {
      errors.push(`${directory}:${label}: gist URL forbidden in skill content: ${url}`);
      continue;
    }
    const segments = url.split("/").slice(3);
    const owner = segments[0] ?? "";
    if (placeholderOwners.has(owner)) continue;
    if (segments.includes("releases")) continue;
    if (allowedForgeRepos.has(`${owner}/${segments[1] ?? ""}`)) continue;
    errors.push(`${directory}:${label}: external project URL forbidden in skill content: ${url}`);
  }
}

function packageManagerCommands(source: string): string[] {
  return source.split("\n").filter((line) => /(?:^|[\s$(`])(?:npm|npx|pnpm|yarn)\s/.test(line));
}

// A line may name a banned term in order to forbid it — a prohibition has to
// say what it prohibits. Anything without a negation is treated as an
// instruction to use the thing.
const negationPattern =
  /\b(?:never|not|no|non|without|forbidden|forbids?|prohibits?|refuses?|rejects?|rejected|avoid|instead\s+of|rather\s+than)\b/i;

// Design-file tools. A design reference in this house is real code on the real
// substrate — a design route the application rendered, a running prototype, a
// ratatui golden frame. A design file is never the reference, so shipped skill
// content must not send an agent to one. Bare "sketch" is an ordinary English
// verb and is deliberately not matched; only the tool and its artifacts are.
const designToolPattern =
  /\b(?:figma|penpot|zeplin|invision|lunacy|framer|adobe\s*xd)\b|\.sketch\b|\bartboards?\b|\bsketch\s+(?:file|files|document|documents|app|symbol|symbols)\b/i;

// Model route names. Provider mappings are volatile and the shared skill tree
// is source-neutral: a skill states the capability role it needs, never the
// vendor route that fills it today. Design notes under docs/design/ and the
// client capability registry are the sanctioned homes for the mapping.
//
// Only version-qualified model identifiers match. Bare client and product
// names are deliberately excluded: tailrocks-agents-md's whole subject is
// per-client instruction files, so `CLAUDE.md` and `GEMINI.md` must stay
// writable, and naming a client is not the same as pinning a model route.
const modelBrandPattern =
  /\b(?:fable\s*\d|mythos\s*\d|opus\s*\d|sonnet\s*\d|haiku\s*\d|claude-(?:opus|sonnet|haiku|fable|mythos)|gpt-\d|gemini-\d|llama\s*\d|mistral-\w)\b/i;

// The eval harness. Authoring `evals/evals.json` is part of every skill
// change; running the harness is a CI/CD concern that nothing in this
// repository has wired yet. Prose *about* the policy has to be able to name
// the command, so only a fenced block matches — a fenced command is a
// copy-paste invocation, which is the failure this gate exists to stop.
const evalRunnerPattern = /\bmise\s+run\s+evals\b|\brun-evals\.ts\b/;

function evalRunnerInvocations(source: string): string[] {
  return fencedCode(source)
    .split("\n")
    .filter((line) => evalRunnerPattern.test(line));
}

function bannedTermLines(source: string, pattern: RegExp): string[] {
  return source.split("\n").filter((line) => pattern.test(line) && !negationPattern.test(line));
}

function scanBannedTerms(source: string, directory: string, label: string, errors: string[]): void {
  for (const line of bannedTermLines(source, designToolPattern)) {
    errors.push(`${directory}:${label}: design-file tool forbidden in skill content: ${line.trim()}`);
  }
  for (const line of bannedTermLines(source, modelBrandPattern)) {
    errors.push(`${directory}:${label}: model brand name forbidden in skill content: ${line.trim()}`);
  }
  for (const line of evalRunnerInvocations(source)) {
    errors.push(`${directory}:${label}: eval harness invocation forbidden in skill content: ${line.trim()}`);
  }
}

export async function validate(root: string): Promise<string[]> {
  const errors: string[] = [];
  await validateDurableContracts(root, errors);
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
    const routerLines = source.split("\n").length;
    if (routerLines > ROUTER_BUDGET) {
      errors.push(
        `${directory}: SKILL.md is ${routerLines} lines, over the ${ROUTER_BUDGET}-line router budget — ` +
          `move depth into references/ or replace a section rather than appending one`,
      );
    }
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
    if (typeof name === "string" && !name.startsWith("tailrocks-")) {
      errors.push(`${directory}: name must start with tailrocks-`);
    }
    if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      errors.push(`${directory}: invalid skill name`);
    }
    if (typeof description !== "string" || description.length < 1 || description.length > 1024) {
      errors.push(`${directory}: description must contain 1-1024 characters`);
    } else if (!description.startsWith(guard)) {
      errors.push(`${directory}: description must start with explicit-request guard`);
    } else {
      // Descriptions load on every request in clients that ignore manual-only
      // policy, and overflow the skill listing's budget once a skill is model
      // invocable. Keep the trigger, drop the prose the router already carries.
      const body = description.slice(guard.length).trim().length;
      if (body > descriptionBudget) {
        errors.push(
          `${directory}: description is ${body} characters after the guard, budget is ${descriptionBudget}`,
        );
      }
    }
    if (metadata.license !== "Apache-2.0") errors.push(`${directory}: Apache-2.0 license metadata missing`);
    if (metadata["disable-model-invocation"] !== true)
      errors.push(`${directory}: Claude manual-only policy missing`);
    if (metadata["user-invocable"] !== true)
      errors.push(`${directory}: explicit user invocation policy missing`);

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
          typeof openai.interface?.display_name === "string" &&
          !/^Tailrocks: \S/.test(openai.interface.display_name)
        ) {
          errors.push(`${directory}: interface.display_name must start with Tailrocks: `);
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
    scanForgeUrls(source, directory, "SKILL.md", errors);
    const referencesDir = path.join(skillDir, "references");
    for (const referenceFile of await filesUnder(referencesDir)) {
      if (!referenceFile.endsWith(".md")) continue;
      const reference = await readFile(referenceFile, "utf8");
      await scanLinks(reference, referenceFile, skillDir, directory, errors);
      scanForgeUrls(
        reference,
        directory,
        path.relative(skillDir, referenceFile).split(path.sep).join("/"),
        errors,
      );
      const relative = path.relative(skillDir, referenceFile).split(path.sep).join("/");
      if (!source.includes(relative)) {
        errors.push(`${directory}: reference must be linked directly from SKILL.md: ${relative}`);
      }
      for (const line of packageManagerCommands(fencedCode(reference))) {
        errors.push(`${directory}:${relative}: forbidden package-manager command: ${line.trim()}`);
      }
      scanBannedTerms(reference, directory, relative, errors);
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
          const ids = new Set<number>();
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
              continue;
            }
            if (ids.has(item.id as number)) {
              errors.push(`${directory}: duplicate eval case id ${item.id}`);
            }
            ids.add(item.id as number);
            if (
              item.execution_mode !== undefined &&
              item.execution_mode !== "single_subject" &&
              item.execution_mode !== "workflow"
            ) {
              errors.push(
                `${directory}: eval case ${item.id} has invalid execution_mode: ${item.execution_mode}`,
              );
            }
            for (const fixture of item.files as unknown[]) {
              if (
                typeof fixture !== "string" ||
                !(await exists(resolveEvalFixture(root, skillDir, fixture)))
              ) {
                errors.push(`${directory}: eval case ${item.id} fixture not found: ${String(fixture)}`);
              }
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
    scanBannedTerms(source, directory, "SKILL.md", errors);
    for (const template of await filesUnder(path.join(skillDir, "templates"))) {
      try {
        const text = await readFile(template, "utf8");
        if (template.endsWith(".md")) await scanLinks(text, template, skillDir, directory, errors);
        scanForgeUrls(text, directory, path.relative(skillDir, template), errors);
        for (const line of packageManagerCommands(text)) {
          errors.push(
            `${directory}:${path.relative(skillDir, template)}: forbidden package-manager command: ${line.trim()}`,
          );
        }
        scanBannedTerms(text, directory, path.relative(skillDir, template), errors);
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
  const claudeKeywords = new Set<string>(claude?.keywords ?? []);
  const kimiKeywords = new Set<string>(kimi?.keywords ?? []);
  for (const keyword of claudeKeywords) {
    if (!kimiKeywords.has(keyword)) errors.push(`.kimi-plugin/plugin.json: missing keyword ${keyword}`);
  }

  for (const catalog of ["README.md", "INSTALL.md", "AGENTS.md", "CLAUDE.md"]) {
    try {
      const source = await readFile(path.join(root, catalog), "utf8");
      for (const skill of entries) if (!source.includes(skill)) errors.push(`${catalog}: missing ${skill}`);
      for (const token of source.matchAll(/\btailrocks-[a-z-]+\b/g)) {
        if (token[0] !== "tailrocks-skills" && !entries.includes(token[0])) {
          errors.push(`${catalog}: unknown skill ${token[0]}`);
        }
      }
    } catch {
      errors.push(`${catalog}: missing catalog`);
    }
  }
  try {
    const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
      groups?: { id?: unknown; title?: unknown; summary?: unknown; skills?: unknown }[];
    };
    if (!Array.isArray(catalog.groups) || catalog.groups.length === 0) {
      errors.push("catalog.json: groups must be a non-empty array");
    } else {
      const placed = new Map<string, string>();
      for (const [index, group] of catalog.groups.entries()) {
        const id = typeof group.id === "string" ? group.id : `#${index + 1}`;
        for (const key of ["id", "title", "summary"] as const) {
          if (typeof group[key] !== "string" || group[key] === "")
            errors.push(`catalog.json: group ${id} needs ${key}`);
        }
        if (!Array.isArray(group.skills) || group.skills.length === 0) {
          errors.push(`catalog.json: group ${id} must list at least one skill`);
          continue;
        }
        for (const skill of group.skills) {
          if (typeof skill !== "string" || !entries.includes(skill)) {
            errors.push(`catalog.json: group ${id} lists unknown skill ${String(skill)}`);
            continue;
          }
          const owner = placed.get(skill);
          if (owner !== undefined) errors.push(`catalog.json: ${skill} is in both ${owner} and ${id}`);
          else placed.set(skill, id);
        }
      }
      for (const skill of entries) {
        if (!placed.has(skill)) errors.push(`catalog.json: no group contains ${skill}`);
      }
    }
  } catch {
    errors.push("catalog.json: missing or invalid JSON");
  }

  const expectedTag = `v${claude?.version}`;
  for (const catalog of ["README.md", "INSTALL.md"]) {
    try {
      const source = await readFile(path.join(root, catalog), "utf8");
      for (const tag of source.matchAll(/\bv\d+\.\d+\.\d+\b/g)) {
        if (tag[0] !== expectedTag)
          errors.push(`${catalog}: release pin ${tag[0]} must equal ${expectedTag}`);
      }
    } catch {
      // Catalog presence is checked above.
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
  const entries = (await readdir(path.join(root, "skills"), { withFileTypes: true })).filter((entry) =>
    entry.isDirectory(),
  );
  console.log(`Validated ${entries.length} skills.`);
}
