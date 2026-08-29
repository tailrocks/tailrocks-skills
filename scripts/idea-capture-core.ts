import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { atomicRecoveryArtifacts, atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";
import { runBoundedCommand } from "./bounded-command";
import {
  createPrInputSchema,
  createPullRequest,
  gateProofSchema,
  type CreatePrCommandRequest,
  type CreatePrCommandResult,
  type CreatePrReceipt,
  type CreatePrRuntime,
} from "./create-pr";
import { resolveExecutable } from "./resolve-executable";
import { roadmapSlugPattern } from "./roadmap-item-state";

export const ideaCaptureInputSchema = "tailrocks.idea-capture-input/v1" as const;
export const ideaCaptureReceiptSchema = "tailrocks.idea-capture/v1" as const;

const sectionNames = [
  "vocabulary",
  "decisions",
  "capabilities",
  "screens",
  "flows",
  "data_integrations",
  "references",
  "research",
  "must_not",
  "quality_bar",
  "open_questions",
  "open_research_questions",
  "deferred",
] as const;
type SectionName = (typeof sectionNames)[number];

interface IdeaInput {
  readonly schema: typeof ideaCaptureInputSchema;
  readonly repository: string;
  readonly actor: string;
  readonly head_owner: string;
  readonly remote_name: string;
  readonly remote_url: string;
  readonly base_branch: string;
  readonly base_sha: string;
  readonly title: string;
  readonly created: string;
  readonly intent: string;
  readonly sections: Readonly<Record<SectionName, readonly string[]>>;
  readonly index_sha256: string | null;
  readonly additional_trailers: readonly string[];
}

export interface IdeaCaptureReceipt {
  readonly schema: typeof ideaCaptureReceiptSchema;
  readonly outcome: "captured" | "refused" | "recovery_required";
  readonly code:
    | "captured"
    | "invalid_input"
    | "unsafe_repository"
    | "state_collision"
    | "state_changed"
    | "git_failed"
    | "publication_failed";
  readonly slug: string;
  readonly branch: string;
  readonly commit: string;
  readonly pull_request: string;
  readonly files: readonly string[];
  readonly recovery_artifacts: readonly string[];
  readonly external_actions: CreatePrReceipt["external_actions"];
  readonly detail: string;
}

export interface IdeaCaptureRuntime {
  readonly runner?: (request: CreatePrCommandRequest) => Promise<CreatePrCommandResult>;
  readonly remoteRunner?: (request: CreatePrCommandRequest) => Promise<CreatePrCommandResult>;
  readonly gateRunner?: CreatePrRuntime["gateRunner"];
  readonly gitExecutable?: string;
  readonly ghExecutable?: string;
  readonly atomic?: AtomicFileRuntime;
  readonly afterPreflight?: () => Promise<void>;
  readonly afterDirectoryCreate?: (directory: string) => Promise<void>;
}

const digestPattern = /^[a-f0-9]{64}$/;
const shaPattern = /^[a-f0-9]{40}$/;
const repositoryPattern =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$/;
const indexHeader =
  "# Roadmap\n\n| Slug | Title | Status | Remaining |\n|------|-------|--------|-----------|\n";
function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index]))
    throw new Error(`${label} has unknown or missing fields`);
}

function safeLine(value: unknown, label: string, maximum = 512): string {
  if (typeof value !== "string" || value !== value.trim() || !value || Buffer.byteLength(value) > maximum)
    throw new Error(`${label} is invalid`);
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) throw new Error(`${label} contains control characters`);
  }
  if (/^(?:#|\||- \*\*(?:Status|Slug|Created|Plan)\*\*:)/.test(value))
    throw new Error(`${label} contains structural Markdown`);
  return value;
}

function safeRef(value: unknown, label: string): string {
  const result = safeLine(value, label, 240);
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(result) || result.includes("..") || result.includes("@{"))
    throw new Error(`${label} is invalid`);
  return result;
}

function validDate(value: unknown): string {
  const date = safeLine(value, "created", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date)
    throw new Error("created is invalid");
  return date;
}

function parseInput(raw: unknown): IdeaInput {
  const value = object(raw, "input");
  exactKeys(
    value,
    [
      "schema",
      "repository",
      "actor",
      "head_owner",
      "remote_name",
      "remote_url",
      "base_branch",
      "base_sha",
      "title",
      "created",
      "intent",
      "sections",
      "index_sha256",
      "additional_trailers",
    ],
    "input",
  );
  if (value.schema !== ideaCaptureInputSchema) throw new Error("input schema is invalid");
  const repository = safeLine(value.repository, "repository", 140);
  if (!repositoryPattern.test(repository)) throw new Error("repository is invalid");
  const actor = safeLine(value.actor, "actor", 39);
  const headOwner = safeLine(value.head_owner, "head_owner", 39);
  const remoteName = safeLine(value.remote_name, "remote_name", 64);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(remoteName)) throw new Error("remote_name is invalid");
  const remoteUrl = safeLine(value.remote_url, "remote_url", 300);
  const expectedUrl = `https://github.com/${headOwner}/${repository.split("/")[1]!}.git`;
  if (remoteUrl !== expectedUrl) throw new Error("remote_url is not the canonical head-owner URL");
  const baseBranch = safeRef(value.base_branch, "base_branch");
  if (typeof value.base_sha !== "string" || !shaPattern.test(value.base_sha))
    throw new Error("base_sha is invalid");
  const title = safeLine(value.title, "title", 160);
  if (/[|[\]()`]/.test(title)) throw new Error("title contains index markup");
  const intent = safeLine(value.intent, "intent", 32_000);
  const sectionsValue = object(value.sections, "sections");
  exactKeys(sectionsValue, sectionNames, "sections");
  const sections = Object.fromEntries(
    sectionNames.map((name) => {
      const entries = sectionsValue[name];
      if (!Array.isArray(entries) || entries.length > 256) throw new Error(`sections.${name} is invalid`);
      return [name, entries.map((entry, index) => safeLine(entry, `sections.${name}[${index}]`, 4_096))];
    }),
  ) as unknown as Readonly<Record<SectionName, readonly string[]>>;
  if (
    value.index_sha256 !== null &&
    (typeof value.index_sha256 !== "string" || !digestPattern.test(value.index_sha256))
  )
    throw new Error("index_sha256 is invalid");
  if (!Array.isArray(value.additional_trailers) || value.additional_trailers.length > 16)
    throw new Error("additional_trailers is invalid");
  const trailers = value.additional_trailers.map((entry, index) => {
    const trailer = safeLine(entry, `additional_trailers[${index}]`, 256);
    if (!/^[A-Za-z][A-Za-z0-9-]*: \S.+$/.test(trailer) || trailer.startsWith("Tailrocks-Skill:"))
      throw new Error("additional trailer is invalid");
    return trailer;
  });
  if (new Set(trailers.map((trailer) => trailer.split(":", 1)[0]!.toLowerCase())).size !== trailers.length)
    throw new Error("additional trailer keys must be unique");
  return {
    schema: ideaCaptureInputSchema,
    repository,
    actor,
    head_owner: headOwner,
    remote_name: remoteName,
    remote_url: remoteUrl,
    base_branch: baseBranch,
    base_sha: value.base_sha,
    title,
    created: validDate(value.created),
    intent,
    sections,
    index_sha256: value.index_sha256 as string | null,
    additional_trailers: trailers,
  };
}

function bullets(entries: readonly string[]): string {
  return entries.length === 0 ? "" : `${entries.map((entry) => `- ${entry}`).join("\n")}\n`;
}

function renderItem(slug: string, input: IdeaInput): string {
  const section = (heading: string, name: SectionName): string =>
    `## ${heading}\n\n${bullets(input.sections[name])}`;
  return `# ${input.title}\n\n- **Status**: DRAFT\n- **Slug**: ${slug}\n- **Created**: ${input.created}\n- **Plan**: — (\`plan/\` once planned) · **Verified**: — (\`verification/\` once run)\n\n## Intent\n\n${input.intent}\n\n${section("Vocabulary", "vocabulary")}\n${section("Decisions", "decisions")}\n${section("Capabilities", "capabilities")}\n${section("Screens", "screens")}\n${section("Flows", "flows")}\n${section("Data & integrations", "data_integrations")}\n${section("References", "references")}\n${section("Research", "research")}\n${section("Must not", "must_not")}\n${section("Quality bar", "quality_bar")}\n${section("Open questions", "open_questions")}\n${section("Open research questions", "open_research_questions")}\n${section("Deferred", "deferred")}\n## Remaining\n\n## Run\n\n— (\`goal/\` once planned)\n`;
}

function renderIndex(existing: string | null, slug: string, title: string): string {
  const row = `| [${slug}](${slug}/README.md) | ${title} | DRAFT | — |\n`;
  if (existing === null) return `${indexHeader}${row}`;
  if (!existing.startsWith(indexHeader) || !existing.endsWith("\n"))
    throw new Error("roadmap index shape is invalid");
  const rows = existing.slice(indexHeader.length).split("\n").filter(Boolean);
  const rowPattern =
    /^\| \[([a-z0-9]+(?:-[a-z0-9]+)*)\]\(\1\/README\.md\) \| [^|\n]+ \| (?:DRAFT|SHAPING|READY|PLANNED|IN EXECUTION|DONE|PARKED \([^|\n]+\)) \| [^|\n]+ \|$/;
  if (rows.some((entry) => !rowPattern.test(entry)))
    throw new Error("roadmap index contains a malformed row");
  if (rows.some((entry) => entry.startsWith(`| [${slug}](${slug}/README.md) |`)))
    throw new Error("roadmap index already contains slug");
  return `${existing}${row}`;
}

async function safeExecutable(file: string): Promise<void> {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink() || (await realpath(file)) !== file)
    throw new Error(`unsafe executable: ${file}`);
}

const defaultLocalRunner = ({ command, cwd, stdin }: CreatePrCommandRequest) =>
  runBoundedCommand({
    command,
    cwd,
    stdin,
    timeoutMilliseconds: 120_000,
    maximumOutputBytes: 4_000_000,
    env: { GIT_TERMINAL_PROMPT: "0" },
  });

const defaultRemoteRunner = ({ command, cwd, stdin }: CreatePrCommandRequest) =>
  runBoundedCommand({
    command,
    cwd,
    stdin,
    timeoutMilliseconds: 120_000,
    maximumOutputBytes: 4_000_000,
    env: { GIT_TERMINAL_PROMPT: "0", GH_PROMPT_DISABLED: "1" },
  });

function succeeded(result: CreatePrCommandResult): boolean {
  return result.code === 0 && !result.timedOut && !result.saturated;
}

async function safeRead(file: string): Promise<string | null> {
  try {
    const before = await lstat(file);
    if (!before.isFile() || before.isSymbolicLink() || (await realpath(file)) !== file)
      throw new Error(`unsafe file: ${file}`);
    const body = await readFile(file, "utf8");
    const after = await lstat(file);
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs
    )
      throw new Error(`file changed while read: ${file}`);
    return body;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function directoryIdentity(directory: string): Promise<{ dev: number; ino: number }> {
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(directory)) !== directory)
    throw new Error(`unsafe directory: ${directory}`);
  return { dev: info.dev, ino: info.ino };
}

async function removeOwnedDirectory(
  directory: string,
  expected: { dev: number; ino: number },
): Promise<void> {
  try {
    const current = await lstat(directory);
    if (
      current.isSymbolicLink() ||
      !current.isDirectory() ||
      current.dev !== expected.dev ||
      current.ino !== expected.ino
    )
      return;
    await rmdir(directory);
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code !== "ENOENT" &&
      (error as NodeJS.ErrnoException).code !== "ENOTEMPTY"
    )
      throw error;
  }
}

async function rollbackEmptyBranch(
  root: string,
  git: string,
  baseBranch: string,
  baseSha: string,
  branch: string,
  runner: NonNullable<IdeaCaptureRuntime["runner"]>,
): Promise<boolean> {
  try {
    if ((await runText(runner, git, root, ["rev-parse", "HEAD"])) !== baseSha) return false;
    if ((await runText(runner, git, root, ["status", "--porcelain=v1", "--untracked-files=all"])) !== "")
      return false;
    await runText(runner, git, root, ["switch", baseBranch]);
    await runText(runner, git, root, ["branch", "-D", branch]);
    return true;
  } catch {
    return false;
  }
}

function baseReceipt(slug: string, code: IdeaCaptureReceipt["code"], detail: string): IdeaCaptureReceipt {
  return {
    schema: ideaCaptureReceiptSchema,
    outcome: "refused",
    code,
    slug,
    branch: slug ? `roadmap/${slug}` : "",
    commit: "",
    pull_request: "",
    files: [],
    recovery_artifacts: [],
    external_actions: [],
    detail,
  };
}

function publicationRecovery(
  publication: CreatePrReceipt,
  input: IdeaInput,
  branch: string,
  commit: string,
): string[] {
  const artifacts = [`local:refs/heads/${branch}@${commit}`];
  const latestRemoteRef = publication.external_actions
    .filter((action) => action.kind === "remote_ref")
    .at(-1);
  if (latestRemoteRef) {
    if (latestRemoteRef.outcome === "success" && latestRemoteRef.proof === commit)
      artifacts.push(`remote:${input.remote_url}#refs/heads/${branch}@${commit}`);
    else if (!(latestRemoteRef.outcome === "success" && latestRemoteRef.proof === "absent"))
      artifacts.push(`remote:${input.remote_url}#refs/heads/${branch}@unproven`);
  } else if (
    publication.external_actions.some((action) => action.kind === "push" && action.outcome !== "failed")
  ) {
    artifacts.push(`remote:${input.remote_url}#refs/heads/${branch}@unproven`);
  }
  for (const action of publication.external_actions) {
    if (action.kind === "create" && action.outcome !== "failed")
      artifacts.push(
        action.outcome === "success" && action.proof
          ? `pull_request:${action.proof}`
          : `pull_request:${input.repository}:${input.head_owner}:${branch}:unproven`,
      );
  }
  return [...new Set(artifacts)].sort();
}

async function runText(
  runner: NonNullable<IdeaCaptureRuntime["runner"]>,
  executable: string,
  root: string,
  args: readonly string[],
): Promise<string> {
  const result = await runner({ command: [executable, ...args], cwd: root });
  if (!succeeded(result)) throw new Error(`command failed: ${args[0]}`);
  return result.stdout.trim();
}

async function preflightRemote(
  input: IdeaInput,
  branch: string,
  root: string,
  git: string,
  gh: string,
  runner: NonNullable<IdeaCaptureRuntime["remoteRunner"]>,
): Promise<void> {
  const actor = await runner({ command: [gh, "api", "user", "--jq", ".login"], cwd: root });
  if (!succeeded(actor) || actor.stdout.trim() !== input.actor)
    throw new Error("authenticated actor mismatch");
  const base = await runner({
    command: [
      gh,
      "api",
      `repos/${input.repository}/git/ref/heads/${encodeURIComponent(input.base_branch)}`,
      "--jq",
      "{ref:.ref,sha:.object.sha,type:.object.type}",
    ],
    cwd: root,
  });
  let baseValue: Record<string, unknown> = {};
  try {
    baseValue = object(JSON.parse(base.stdout), "base receipt");
  } catch {}
  if (
    !succeeded(base) ||
    baseValue.ref !== `refs/heads/${input.base_branch}` ||
    baseValue.sha !== input.base_sha ||
    baseValue.type !== "commit"
  )
    throw new Error("remote base mismatch");
  const remote = await runner({
    command: [git, "ls-remote", "--heads", input.remote_url, `refs/heads/${branch}`],
    cwd: root,
  });
  if (!succeeded(remote) || remote.stdout.trim() !== "")
    throw new Error("remote branch collision or absence unproven");
  const pulls = await runner({
    command: [
      gh,
      "api",
      `repos/${input.repository}/pulls`,
      "--method",
      "GET",
      "-f",
      "state=open",
      "-f",
      `head=${input.head_owner}:${branch}`,
      "-f",
      "per_page=100",
      "--paginate",
      "--slurp",
    ],
    cwd: root,
  });
  let parsed: unknown;
  try {
    parsed = JSON.parse(pulls.stdout);
  } catch {
    parsed = null;
  }
  if (
    !succeeded(pulls) ||
    !Array.isArray(parsed) ||
    parsed.flatMap((page) => (Array.isArray(page) ? page : [page])).length !== 0
  )
    throw new Error("open pull-request absence unproven");
}

export async function captureIdea(
  rootInput: string,
  slug: string,
  raw: unknown,
  runtime: IdeaCaptureRuntime = {},
): Promise<IdeaCaptureReceipt> {
  let input: IdeaInput;
  try {
    if (!roadmapSlugPattern.test(slug)) throw new Error("slug is invalid");
    input = parseInput(raw);
  } catch (error) {
    return baseReceipt(slug, "invalid_input", error instanceof Error ? error.message : "invalid input");
  }
  const branch = `roadmap/${slug}`;
  let root: string;
  let git: string;
  let gh: string;
  const runner = runtime.runner ?? defaultLocalRunner;
  const remoteRunner = runtime.remoteRunner ?? defaultRemoteRunner;
  try {
    root = path.resolve(rootInput);
    await directoryIdentity(root);
    git = runtime.gitExecutable ?? (await resolveExecutable("git"));
    gh = runtime.ghExecutable ?? (await resolveExecutable("gh"));
    await Promise.all([safeExecutable(git), safeExecutable(gh)]);
    if ((await runText(runner, git, root, ["rev-parse", "--show-toplevel"])) !== root)
      throw new Error("root is not exact Git top level");
    if ((await runText(runner, git, root, ["symbolic-ref", "--short", "HEAD"])) !== input.base_branch)
      throw new Error("capture must start on exact base branch");
    if ((await runText(runner, git, root, ["rev-parse", "HEAD"])) !== input.base_sha)
      throw new Error("base SHA changed");
    if ((await runText(runner, git, root, ["status", "--porcelain=v1", "--untracked-files=all"])) !== "")
      throw new Error("working tree is dirty");
    const remoteUrl = await runText(runner, git, root, ["remote", "get-url", input.remote_name]);
    if (remoteUrl !== input.remote_url) throw new Error("remote URL mismatch");
    const localBranch = await runner({
      command: [git, "show-ref", "--verify", "--quiet", `refs/heads/${branch}`],
      cwd: root,
    });
    if (localBranch.code !== 1 || localBranch.timedOut || localBranch.saturated)
      throw new Error("local branch collision or absence unproven");
    await preflightRemote(input, branch, root, git, gh, remoteRunner);
    await runtime.afterPreflight?.();
  } catch (error) {
    return baseReceipt(
      slug,
      "unsafe_repository",
      error instanceof Error ? error.message : "preflight failed",
    );
  }

  const roadmap = path.join(root, "roadmap");
  const itemDirectory = path.join(roadmap, slug);
  const indexFile = path.join(roadmap, "README.md");
  const itemFile = path.join(itemDirectory, "README.md");
  let createdRoadmap: { dev: number; ino: number } | undefined;
  let createdItem: { dev: number; ino: number } | undefined;
  let existingRoadmap: { dev: number; ino: number } | undefined;
  let branchCreated = false;
  let index: string | null;
  try {
    try {
      existingRoadmap = await directoryIdentity(roadmap);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    index = await safeRead(indexFile);
    if (index === null && input.index_sha256 !== null) throw new Error("roadmap index disappeared");
    if (index !== null && (input.index_sha256 === null || digest(index) !== input.index_sha256))
      throw new Error("roadmap index changed");
    if (index === null && existingRoadmap && (await readdir(roadmap)).length !== 0)
      throw new Error("cannot reconstruct a missing nonempty roadmap index");
    try {
      await lstat(itemDirectory);
      throw new Error("item directory already exists");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const nextIndex = renderIndex(index, slug, input.title);
    const item = renderItem(slug, input);
    const switched = await runner({ command: [git, "switch", "-c", branch, input.base_sha], cwd: root });
    if (!succeeded(switched)) throw new Error("failed to create item branch");
    branchCreated = true;
    if (existingRoadmap) {
      const currentRoadmap = await directoryIdentity(roadmap);
      if (currentRoadmap.dev !== existingRoadmap.dev || currentRoadmap.ino !== existingRoadmap.ino)
        throw new Error("roadmap directory changed before publication");
    } else {
      await mkdir(roadmap, { mode: 0o755 });
      createdRoadmap = await directoryIdentity(roadmap);
      await runtime.afterDirectoryCreate?.(roadmap);
      const currentRoadmap = await directoryIdentity(roadmap);
      if (currentRoadmap.dev !== createdRoadmap.dev || currentRoadmap.ino !== createdRoadmap.ino)
        throw new Error("roadmap directory changed after creation");
    }
    await mkdir(itemDirectory, { mode: 0o755 });
    createdItem = await directoryIdentity(itemDirectory);
    await runtime.afterDirectoryCreate?.(itemDirectory);
    const currentItem = await directoryIdentity(itemDirectory);
    if (currentItem.dev !== createdItem.dev || currentItem.ino !== createdItem.ino)
      throw new Error("item directory changed after creation");
    await atomicWriteFiles(
      [
        { file: itemFile, expected: null, content: item, mode: 0o644 },
        { file: indexFile, expected: index, content: nextIndex, mode: 0o644 },
      ],
      runtime.atomic,
    );
  } catch (error) {
    if (createdItem) await removeOwnedDirectory(itemDirectory, createdItem).catch(() => undefined);
    if (createdRoadmap) await removeOwnedDirectory(roadmap, createdRoadmap).catch(() => undefined);
    const recovery = [...atomicRecoveryArtifacts(error)];
    const branchRolledBack =
      !branchCreated ||
      (await rollbackEmptyBranch(root, git, input.base_branch, input.base_sha, branch, runner));
    if (!branchRolledBack) recovery.push(`refs/heads/${branch}`);
    return {
      ...baseReceipt(
        slug,
        error instanceof Error && error.message.includes("changed") ? "state_changed" : "state_collision",
        error instanceof Error ? error.message : "capture refused",
      ),
      outcome: branchRolledBack ? "refused" : "recovery_required",
      recovery_artifacts: [...new Set(recovery)].sort(),
    };
  }

  const files = [`roadmap/${slug}/README.md`, "roadmap/README.md"].sort();
  let commit = "";
  try {
    await runText(runner, git, root, ["add", "--", ...files]);
    const staged = (await runText(runner, git, root, ["diff", "--cached", "--name-only", "-z"]))
      .split("\0")
      .filter(Boolean)
      .sort();
    if (JSON.stringify(staged) !== JSON.stringify(files))
      throw new Error("staged set differs from capture files");
    const commitArgs = [
      "commit",
      "-m",
      `docs(roadmap): ${input.title}`,
      "-m",
      ["Tailrocks-Skill: tailrocks-idea", ...input.additional_trailers].join("\n"),
    ];
    await runText(runner, git, root, commitArgs);
    commit = await runText(runner, git, root, ["rev-parse", "HEAD"]);
    if (!shaPattern.test(commit)) throw new Error("commit identity is invalid");
    const message = await runText(runner, git, root, ["log", "-1", "--format=%B"]);
    if ((message.match(/^Tailrocks-Skill: tailrocks-idea$/gm) ?? []).length !== 1)
      throw new Error("commit attribution is invalid");
    if ((await runText(runner, git, root, ["status", "--porcelain=v1", "--untracked-files=all"])) !== "")
      throw new Error("capture commit left a dirty tree");
    const temporary = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-idea-pr-")));
    const body = `## Roadmap item\n\n- Slug: \`${slug}\`\n- Status: \`DRAFT\`\n- Next: \`tailrocks-brainstorm ${slug}\`\n`;
    const bodyFile = path.join(temporary, "body.md");
    await writeFile(bodyFile, body, { mode: 0o600 });
    const requiredTrailers = [
      "Tailrocks-Skill",
      ...input.additional_trailers.map((trailer) => trailer.split(":", 1)[0]!),
    ];
    let publication;
    try {
      publication = await createPullRequest(
        {
          schema: createPrInputSchema,
          repo_root: root,
          repository: input.repository,
          actor: input.actor,
          head_owner: input.head_owner,
          remote_name: input.remote_name,
          remote_url: input.remote_url,
          base_branch: input.base_branch,
          base_sha: input.base_sha,
          head_branch: branch,
          head_sha: commit,
          title: `docs(roadmap): ${input.title}`,
          body_file: bodyFile,
          body_sha256: digest(body),
          draft: true,
          required_trailers: requiredTrailers,
          gates: [
            {
              id: "capture-files",
              command: [git, "diff-tree", "--check", input.base_sha, commit],
              proof_command: [
                process.execPath,
                "-e",
                `process.stdout.write(JSON.stringify({schema:${JSON.stringify(gateProofSchema)},units:2}))`,
              ],
            },
          ],
        },
        {
          localRunner: runner,
          remoteRunner,
          ...(runtime.gateRunner ? { gateRunner: runtime.gateRunner } : {}),
          gitExecutable: git,
          ghExecutable: gh,
        },
      );
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
    if (publication.outcome !== "success")
      return {
        ...baseReceipt(slug, "publication_failed", publication.detail),
        outcome: "recovery_required",
        branch,
        commit,
        files,
        pull_request: publication.url,
        recovery_artifacts: publicationRecovery(publication, input, branch, commit),
        external_actions: publication.external_actions,
      };
    return {
      schema: ideaCaptureReceiptSchema,
      outcome: "captured",
      code: "captured",
      slug,
      branch,
      commit,
      pull_request: publication.url,
      files,
      recovery_artifacts: [],
      external_actions: publication.external_actions,
      detail: "DRAFT item, branch, commit, push, and draft PR verified",
    };
  } catch (error) {
    return {
      ...baseReceipt(slug, "git_failed", error instanceof Error ? error.message : "Git transaction failed"),
      outcome: "recovery_required",
      branch,
      commit,
      files,
      recovery_artifacts: [
        commit ? `local:refs/heads/${branch}@${commit}` : `local:refs/heads/${branch}:uncommitted`,
      ],
    };
  }
}

export function parseIdeaCaptureArguments(args: readonly string[]): { skillFile: string; slug: string } {
  if (
    args.length !== 3 ||
    args[0] !== "--skill-file" ||
    !path.isAbsolute(args[1]!) ||
    !roadmapSlugPattern.test(args[2]!)
  )
    throw new Error("usage: idea-capture --skill-file <absolute-SKILL.md> <roadmap-slug>");
  return { skillFile: args[1]!, slug: args[2]! };
}
