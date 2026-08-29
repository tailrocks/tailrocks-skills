import { access, lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { generateReferences, isGeneratedReferenceSource } from "./generate-references";
import { parseInvocationRegistry, type InvocationClass } from "./invocation-registry";
import { RETIRED_SKILL_NAMES } from "./retired-skill-names";

const guard = "Use only when the user explicitly requests this skill.";
const descriptionBudget = 250;
const retiredSkillNames = RETIRED_SKILL_NAMES;

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function pathContainsSymlink(root: string, target: string): Promise<boolean> {
  const relative = path.relative(root, target);
  if (!relative || outside(root, target)) return false;
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
      throw error;
    }
  }
  return false;
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

async function validateInvocationRegistry(
  root: string,
  skills: string[],
  errors: string[],
): Promise<Map<string, InvocationClass>> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8"));
  } catch {
    errors.push("invocation-registry.json: missing or invalid JSON");
    return new Map();
  }
  const result = parseInvocationRegistry(parsed, skills);
  errors.push(...result.errors);
  return result.classes;
}

async function validateDurableContracts(root: string, errors: string[]): Promise<void> {
  const contracts = [
    {
      directory: "skill-evidence",
      schema: "tailrocks.skill-evidence/v1",
      fields: ["Skill", "Source SHA", "Recorded date", "Provenance"],
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
  for (const file of await filesUnder(path.join(root, "skill-migrations"))) {
    errors.push(
      `${path.relative(root, file)}: migration-plan artifacts are forbidden; use an explicitly authorized direct migration`,
    );
  }
}

async function validateRetiredRoutes(root: string, errors: string[]): Promise<void> {
  const surfaces = new Set([
    "AGENTS.md",
    "CLAUDE.md",
    "INSTALL.md",
    "README.md",
    "catalog.json",
    "generated-references.json",
    "invocation-registry.json",
  ]);
  for (const directory of ["docs/content", "docs/design"]) {
    for (const file of await filesUnder(path.join(root, directory))) {
      const relative = path.relative(root, file);
      surfaces.add(relative);
    }
  }

  const skillsRoot = path.join(root, "skills");
  if (await exists(skillsRoot)) {
    for (const entry of await readdir(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillRoot = path.join(skillsRoot, entry.name);
      const entries = await readdir(skillRoot, { withFileTypes: true });
      for (const packageEntry of entries) {
        const relative = path.relative(root, path.join(skillRoot, packageEntry.name));
        if (packageEntry.isDirectory() && packageEntry.name === "evals") {
          errors.push(`${relative}: skill eval directories are forbidden`);
        }
        if (packageEntry.isFile() && packageEntry.name === "README.md") {
          errors.push(`${relative}: per-skill README files are forbidden; use public documentation`);
        }
      }
      if (retiredSkillNames.has(entry.name)) {
        for (const residue of entries) {
          if (residue.isDirectory() && (await filesUnder(path.join(skillRoot, residue.name))).length === 0)
            continue;
          errors.push(
            `${path.relative(root, path.join(skillRoot, residue.name))}: retired skill residue is forbidden`,
          );
        }
        continue;
      }
      if (!(await exists(path.join(skillRoot, "SKILL.md")))) continue;
      for (const packageEntry of entries) {
        if (packageEntry.name === "evals" || packageEntry.name === "README.md") continue;
        const packagePath = path.join(skillRoot, packageEntry.name);
        if (packageEntry.isDirectory()) {
          for (const file of await filesUnder(packagePath)) surfaces.add(path.relative(root, file));
        } else {
          surfaces.add(path.relative(root, packagePath));
        }
      }
    }
  }
  for (const relative of surfaces) {
    const file = path.join(root, relative);
    if (!(await exists(file))) continue;
    const source = await readFile(file, "utf8");
    for (const name of retiredSkillNames) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`${escaped}(?![A-Za-z0-9-])`).test(source))
        errors.push(`${relative}: retired skill route is forbidden: ${name}`);
    }
  }
  const docsRoot = path.join(root, "docs/content/docs/skills");
  if (!(await exists(docsRoot))) return;
  for (const entry of await readdir(docsRoot, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      retiredSkillNames.has(entry.name) &&
      (await filesUnder(path.join(docsRoot, entry.name))).length > 0
    ) {
      errors.push(`docs/content/docs/skills/${entry.name}: retired skill route is forbidden`);
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

// A SKILL.md that links into its own references/ or templates/ tree must state
// the resolution base. The Agent Skills spec resolves relative links against
// the directory containing the SKILL.md, but a client that flattens plugin
// paths resolves them against the plugin skills root instead; the exact line
// below is the router's defense, and a skill that links without it is the gap
// this gate exists to close.
const resolutionBaseLine =
  "Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.";

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
    // The spec form is `references/x.md`: a `./` or `skills/` prefix encodes a
    // resolution base the client may not share.
    if (path.basename(file) === "SKILL.md" && (raw.startsWith("./") || raw.startsWith("skills/"))) {
      errors.push(`${directory}: SKILL.md link target must not start with ./ or skills/: ${raw}`);
      continue;
    }
    const target = path.resolve(path.dirname(file), raw);
    const setupFamilies = [
      {
        members: [
          "tailrocks-rust-project-setup",
          "tailrocks-rust-project-audit",
          "tailrocks-rust-project-remediate",
        ],
        owner: "tailrocks-rust-project-setup",
        resolver: "resolve-crate-versions.ts",
      },
      {
        members: [
          "tailrocks-tanstack-project-setup",
          "tailrocks-tanstack-project-audit",
          "tailrocks-tanstack-project-migrate",
          "tailrocks-tanstack-project-remediate",
        ],
        owner: "tailrocks-tanstack-project-setup",
        resolver: "resolve-package-versions.ts",
      },
      {
        members: [
          "tailrocks-swift-project-setup",
          "tailrocks-swift-project-audit",
          "tailrocks-swift-project-remediate",
        ],
        owner: "tailrocks-swift-project-setup",
      },
    ] as const;
    let allowedSetupRoot: string | undefined;
    for (const family of setupFamilies) {
      const setupRoot = path.resolve(path.dirname(skillDir), family.owner);
      const setupTemplates = path.join(setupRoot, "templates");
      const setupResolver =
        "resolver" in family ? path.join(setupRoot, "scripts", family.resolver) : undefined;
      if (
        family.members.includes(directory as (typeof family.members)[number]) &&
        (target === setupResolver || target === setupTemplates || !outside(setupTemplates, target))
      ) {
        allowedSetupRoot = setupRoot;
        break;
      }
    }
    const unsafeSetupLink =
      allowedSetupRoot !== undefined && (await pathContainsSymlink(allowedSetupRoot, target));
    if (
      ((raw.startsWith("../") || outside(skillDir, target)) && allowedSetupRoot === undefined) ||
      unsafeSetupLink
    ) {
      errors.push(`${directory}: reference escapes skill directory: ${raw}`);
    } else if (!(await exists(target))) {
      errors.push(`${directory}: broken reference ${raw}`);
    }
  }
  for (const match of proseWithoutFences(source).matchAll(/`((?:references|templates|scripts)\/[^\s`]+)`/g)) {
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
const releaseDelayConfigPattern = /\b(?:minimumReleaseAge|stabilityDays)\b/i;
const releaseAgePattern = /\bminimum[\s-]+release[\s-]+age\b/i;
const releaseAgeRefusalPattern =
  /^(?:[-*]\s*)?(?:(?:never|do not|don't) configure (?:an?\s+)?minimum[\s-]+release[\s-]+age|(?:an?\s+)?minimum[\s-]+release[\s-]+age(?: rule)? is (?:forbidden|a gap)|no minimum[\s-]+release[\s-]+age delay is permitted)\.?$/i;

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
}

function scanReleaseDelayPolicy(source: string, directory: string, label: string, errors: string[]): void {
  for (const line of source.split("\n")) {
    if (
      releaseDelayConfigPattern.test(line) ||
      (releaseAgePattern.test(line) && !releaseAgeRefusalPattern.test(line.trim()))
    )
      errors.push(`${directory}:${label}: dependency release-delay policy forbidden: ${line.trim()}`);
  }
}

function structuredReleaseDelay(value: unknown): boolean {
  if (typeof value === "string") return releaseDelayConfigPattern.test(value);
  if (Array.isArray(value)) return value.some(structuredReleaseDelay);
  if (typeof value !== "object" || value === null) return false;
  return Object.entries(value).some(
    ([key, nested]) => releaseDelayConfigPattern.test(key) || structuredReleaseDelay(nested),
  );
}

function scanStructuredReleaseDelay(
  source: string,
  directory: string,
  label: string,
  errors: string[],
): void {
  if (!label.endsWith(".json")) return;
  try {
    if (structuredReleaseDelay(JSON.parse(source)))
      errors.push(`${directory}:${label}: dependency release-delay policy forbidden in parsed JSON`);
  } catch {
    // JSON validity belongs to the template's owning contract.
  }
}

async function generatedReferenceDestinations(root: string, errors: string[]): Promise<Set<string>> {
  const file = path.join(root, "generated-references.json");
  if (!(await exists(file))) return new Set();
  try {
    await generateReferences(root, "check");
    const manifest = JSON.parse(await readFile(file, "utf8")) as {
      $schema?: unknown;
      entries?: unknown;
    };
    if (
      typeof manifest !== "object" ||
      manifest === null ||
      Array.isArray(manifest) ||
      Object.keys(manifest).sort().join(",") !== "$schema,entries" ||
      manifest.$schema !== "tailrocks.generated-references/v1" ||
      !Array.isArray(manifest.entries) ||
      manifest.entries.length === 0
    )
      throw new Error();
    const destinations: string[] = [];
    for (const entry of manifest.entries) {
      if (
        typeof entry !== "object" ||
        entry === null ||
        Array.isArray(entry) ||
        !["destinations,source", "destinations,slice,source"].includes(Object.keys(entry).sort().join(",")) ||
        typeof (entry as { source?: unknown }).source !== "string" ||
        !isGeneratedReferenceSource((entry as { source: string }).source) ||
        !Array.isArray((entry as { destinations?: unknown }).destinations) ||
        (entry as { destinations: unknown[] }).destinations.some(
          (destination) =>
            typeof destination !== "string" ||
            !/^skills\/tailrocks-[a-z0-9]+(?:-[a-z0-9]+)*\/references\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(
              destination,
            ),
        )
      )
        throw new Error();
      if (
        "slice" in entry &&
        (typeof entry.slice !== "object" ||
          entry.slice === null ||
          Array.isArray(entry.slice) ||
          Object.keys(entry.slice).sort().join(",") !== "end,start" ||
          typeof (entry.slice as { start?: unknown }).start !== "string" ||
          typeof (entry.slice as { end?: unknown }).end !== "string")
      )
        throw new Error();
      destinations.push(...(entry as { destinations: string[] }).destinations);
    }
    if (new Set(destinations).size !== destinations.length) throw new Error();
    return new Set(destinations);
  } catch {
    errors.push("generated-references.json: invalid generated-reference manifest");
    return new Set();
  }
}

export async function validate(root: string): Promise<string[]> {
  const errors: string[] = [];
  await validateDurableContracts(root, errors);
  await validateRetiredRoutes(root, errors);
  const generatedReferences = await generatedReferenceDestinations(root, errors);
  const skillsRoot = path.join(root, "skills");
  if (!(await exists(skillsRoot))) return ["missing skills directory"];
  const directories = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const entries: string[] = [];
  for (const directory of directories) {
    if (await exists(path.join(skillsRoot, directory, "SKILL.md"))) entries.push(directory);
  }
  for (const directory of entries) {
    if (retiredSkillNames.has(directory)) errors.push(`${directory}: retired skill name is forbidden`);
  }
  const invocationClasses = await validateInvocationRegistry(root, entries, errors);

  for (const directory of entries) {
    const skillDir = path.join(skillsRoot, directory);
    const skillFile = path.join(skillDir, "SKILL.md");
    const source = await readFile(skillFile, "utf8");
    const block = source.match(/^---\n([\s\S]*?)\n---/);
    if (!block) {
      errors.push(`${directory}: invalid frontmatter`);
      continue;
    }
    const routerBody = source.slice(block[0].length).replace(/^\n/, "");
    const countedBody = routerBody.endsWith("\n") ? routerBody.slice(0, -1) : routerBody;
    const routerLines = countedBody === "" ? 0 : countedBody.split("\n").length;
    if (routerLines > ROUTER_BUDGET) {
      errors.push(
        `${directory}: SKILL.md body is ${routerLines} lines, over the ${ROUTER_BUDGET}-line router budget — ` +
          `move depth into references/ or replace a section rather than appending one`,
      );
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
    const invocationClass = invocationClasses.get(directory);
    if (name !== directory) errors.push(`${directory}: name must match directory`);
    if (typeof name === "string" && !name.startsWith("tailrocks-")) {
      errors.push(`${directory}: name must start with tailrocks-`);
    }
    if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      errors.push(`${directory}: invalid skill name`);
    }
    if (typeof description !== "string" || description.length < 1 || description.length > 1024) {
      errors.push(`${directory}: description must contain 1-1024 characters`);
    } else if (invocationClass === "MANUAL_ONLY" && !description.startsWith(guard)) {
      errors.push(`${directory}: MANUAL_ONLY description must start with explicit-request guard`);
    } else if (invocationClass === "MODEL_POLICY" && description.startsWith(guard)) {
      errors.push(`${directory}: MODEL_POLICY description must state its exact model trigger`);
    } else {
      // Descriptions load on every request in clients that ignore manual-only
      // policy, and overflow the skill listing's budget once a skill is model
      // invocable. Keep the trigger, drop the prose the router already carries.
      const body =
        invocationClass === "MANUAL_ONLY"
          ? description.slice(guard.length).trim().length
          : description.length;
      if (body > descriptionBudget) {
        errors.push(
          invocationClass === "MANUAL_ONLY"
            ? `${directory}: description is ${body} characters after the guard, budget is ${descriptionBudget}`
            : `${directory}: description is ${body} characters, budget is ${descriptionBudget}`,
        );
      }
    }
    if (metadata.license !== "Apache-2.0") errors.push(`${directory}: Apache-2.0 license metadata missing`);
    if (invocationClass === "MANUAL_ONLY" && metadata["disable-model-invocation"] !== true) {
      errors.push(`${directory}: MANUAL_ONLY Claude policy missing`);
    }
    const disableModelInvocation = metadata["disable-model-invocation"];
    if (
      invocationClass === "MODEL_POLICY" &&
      disableModelInvocation !== undefined &&
      disableModelInvocation !== false
    ) {
      errors.push(`${directory}: MODEL_POLICY crossed with Claude manual-only policy`);
    }
    if (metadata["user-invocable"] !== true)
      errors.push(`${directory}: explicit user invocation policy missing`);
    if (
      invocationClass === "MODEL_POLICY" &&
      (metadata["allowed-tools"] !== undefined ||
        metadata.hooks !== undefined ||
        /!`[^`\n]+`|^\s*```!/m.test(routerBody))
    ) {
      errors.push(`${directory}: MODEL_POLICY may not carry executable or pre-approved authority`);
    }

    const portableMetadata = metadata.metadata;
    if (portableMetadata !== undefined) {
      if (
        typeof portableMetadata !== "object" ||
        portableMetadata === null ||
        Array.isArray(portableMetadata) ||
        Object.values(portableMetadata).some((value) => typeof value !== "string")
      ) {
        errors.push(`${directory}: metadata must be a string-to-string map for OpenCode`);
      } else if ("opencode/autoinvoke" in portableMetadata || "opencode/slash" in portableMetadata) {
        errors.push(`${directory}: unsupported OpenCode discovery/menu metadata for supported client`);
      }
    }

    const openaiFile = path.join(skillDir, "agents", "openai.yaml");
    if (!(await exists(openaiFile))) {
      errors.push(`${directory}: missing agents/openai.yaml`);
    } else {
      try {
        const openai = Bun.YAML.parse(await readFile(openaiFile, "utf8")) as {
          interface?: Record<string, unknown>;
          policy?: Record<string, unknown>;
        };
        const expectedImplicit = invocationClass === "MODEL_POLICY";
        if (invocationClass !== undefined && openai.policy?.allow_implicit_invocation !== expectedImplicit) {
          errors.push(`${directory}: ${invocationClass} crossed with Codex allow_implicit_invocation`);
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
    if (
      /\]\((?:references|templates)\//.test(proseWithoutFences(routerBody)) &&
      !source.split("\n").some((line) => line.trim() === resolutionBaseLine)
    ) {
      errors.push(
        `${directory}: SKILL.md links into references/ or templates/ without the resolution-base line`,
      );
    }
    scanForgeUrls(source, directory, "SKILL.md", errors);
    scanReleaseDelayPolicy(source, directory, "SKILL.md", errors);
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
      if (!source.includes(relative) && !generatedReferences.has(`skills/${directory}/${relative}`)) {
        errors.push(`${directory}: reference must be linked directly from SKILL.md: ${relative}`);
      }
      for (const line of packageManagerCommands(fencedCode(reference))) {
        errors.push(`${directory}:${relative}: forbidden package-manager command: ${line.trim()}`);
      }
      scanBannedTerms(reference, directory, relative, errors);
      scanReleaseDelayPolicy(reference, directory, relative, errors);
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
        scanReleaseDelayPolicy(text, directory, path.relative(skillDir, template), errors);
        scanStructuredReleaseDelay(text, directory, path.relative(skillDir, template), errors);
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
  try {
    if (process.argv.length !== 2) throw new Error("validate-skills takes no arguments");
    const root = path.resolve(import.meta.dir, "..");
    const errors = await validate(root);
    const directories = (await readdir(path.join(root, "skills"), { withFileTypes: true })).filter((entry) =>
      entry.isDirectory(),
    );
    let skillCount = 0;
    for (const entry of directories) {
      if (await exists(path.join(root, "skills", entry.name, "SKILL.md"))) skillCount += 1;
    }
    console.log(
      JSON.stringify({
        schema: "tailrocks.validate-skills/v1",
        outcome: errors.length === 0 ? "success" : "failed",
        code: errors.length === 0 ? "valid" : "invalid",
        skills: skillCount,
        errors,
        mutations: [],
        detail: errors.length === 0 ? `validated ${skillCount} skills` : `${errors.length} validation errors`,
      }),
    );
    if (errors.length > 0) process.exit(1);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: "tailrocks.validate-skills/v1",
        outcome: "refused",
        code: "invalid_arguments",
        errors: [],
        mutations: [],
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(2);
  }
}
