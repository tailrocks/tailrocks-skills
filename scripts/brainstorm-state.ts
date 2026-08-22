import { spawn } from "node:child_process";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";

export type BrainstormMode = "interactive" | "batch";

export interface FrontierNode {
  readonly id: string;
  readonly question: string;
  readonly recommendation: string;
  readonly dependsOn?: readonly string[];
  readonly answer?: string;
}

export interface FrontierAnswer {
  readonly id: string;
  readonly decision: string;
  readonly reason: string;
  readonly date: string;
}

interface TurnInput {
  readonly schema: "tailrocks.brainstorm-turn/v1";
  readonly nodes: readonly FrontierNode[];
  readonly answers?: readonly FrontierAnswer[];
}

interface DirectoryIdentity {
  readonly dev: number;
  readonly ino: number;
}

export interface BrainstormRuntime extends AtomicFileRuntime {
  readonly afterResolve?: () => Promise<void>;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statusPattern = /^- \*\*Status\*\*: (.+)$/gm;

export function parseBrainstormArguments(args: readonly string[]): {
  readonly slug: string;
  readonly mode: BrainstormMode;
} {
  if (args.length < 1 || args.length > 2 || (args.length === 2 && args[1] !== "--batch"))
    throw new Error("usage: brainstorm-state <roadmap-slug> [--batch]");
  const slug = args[0]!;
  if (!slugPattern.test(slug)) throw new Error(`invalid roadmap slug: ${slug}`);
  return { slug, mode: args[1] === "--batch" ? "batch" : "interactive" };
}

export async function verifyBrainstormEntrypoint(entrypoint: string): Promise<string> {
  if (!path.isAbsolute(entrypoint)) throw new Error("brainstorm entrypoint must be absolute");
  const resolved = path.resolve(entrypoint);
  const scriptsDirectory = path.dirname(resolved);
  const pluginDirectory = path.dirname(scriptsDirectory);
  for (const [candidate, kind] of [
    [pluginDirectory, "directory"],
    [scriptsDirectory, "directory"],
    [resolved, "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (info.isSymbolicLink() || (kind === "directory" ? !info.isDirectory() : !info.isFile()))
      throw new Error(`unsafe installed brainstorm ${kind}: ${candidate}`);
  }
  if ((await realpath(resolved)) !== resolved)
    throw new Error(`unsafe installed brainstorm entrypoint: ${resolved}`);
  return resolved;
}

function validateFrontier(nodes: readonly FrontierNode[]): Map<string, FrontierNode> {
  const byId = new Map<string, FrontierNode>();
  for (const node of nodes) {
    if (
      !/^[A-Z][A-Z0-9-]*$/.test(node.id) ||
      !node.question.trim() ||
      !node.recommendation.trim() ||
      (node.answer !== undefined && !safeAnswerText(node.answer))
    )
      throw new Error(`malformed frontier node: ${node.id || "<missing>"}`);
    if (byId.has(node.id)) throw new Error(`duplicate frontier node: ${node.id}`);
    byId.set(node.id, node);
  }
  for (const node of nodes) {
    for (const dependency of node.dependsOn ?? []) {
      if (dependency === node.id || !byId.has(dependency))
        throw new Error(`invalid dependency ${dependency} for ${node.id}`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error(`cyclic frontier dependency at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)!.dependsOn ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of byId.keys()) visit(id);
  return byId;
}

export function selectBrainstormFrontier(
  nodes: readonly FrontierNode[],
  mode: BrainstormMode,
): readonly FrontierNode[] {
  const byId = validateFrontier(nodes);
  const ready = nodes
    .filter(
      (node) =>
        node.answer === undefined &&
        (node.dependsOn ?? []).every((dependency) => byId.get(dependency)!.answer !== undefined),
    )
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return mode === "interactive" ? ready.slice(0, 1) : ready;
}

function parseOneStatus(item: string): {
  readonly status: string;
  readonly start: number;
  readonly end: number;
} {
  const statuses = [...item.matchAll(statusPattern)];
  if (statuses.length !== 1) throw new Error("item must contain exactly one Status field");
  const match = statuses[0]!;
  return { status: match[1]!.trim(), start: match.index!, end: match.index! + match[0].length };
}

function indexStatus(
  index: string,
  slug: string,
): {
  readonly status: string;
  readonly row: string;
  readonly title: string;
  readonly remaining: string;
} {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\| ${escaped} \\| ([^|\\n]+) \\| ([^|\\n]+) \\| ([^|\\n]+) \\|$`, "gm");
  const matches = [...index.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`index must contain exactly one row for ${slug}`);
  return {
    title: matches[0]![1]!,
    status: matches[0]![2]!.trim(),
    remaining: matches[0]![3]!,
    row: matches[0]![0],
  };
}

async function safeFiles(
  root: string,
  slug: string,
): Promise<{
  readonly itemFile: string;
  readonly indexFile: string;
  readonly directories: ReadonlyMap<string, DirectoryIdentity>;
}> {
  const resolvedRoot = path.resolve(root);
  const rootInfo = await lstat(resolvedRoot);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || (await realpath(resolvedRoot)) !== resolvedRoot)
    throw new Error(`unsafe repository root: ${resolvedRoot}`);
  const canonicalRoot = resolvedRoot;
  const roadmap = path.join(canonicalRoot, "roadmap");
  const itemDirectory = path.join(roadmap, slug);
  const directories = new Map<string, DirectoryIdentity>();
  for (const directory of [roadmap, itemDirectory]) {
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(directory)) !== directory)
      throw new Error(`unsafe roadmap path: ${directory}`);
    directories.set(directory, { dev: info.dev, ino: info.ino });
  }
  return {
    itemFile: path.join(itemDirectory, "README.md"),
    indexFile: path.join(roadmap, "README.md"),
    directories,
  };
}

const anchoredReadHelper = String.raw`
const fs=require("node:fs"),crypto=require("node:crypto");
const expected=JSON.parse(process.argv.at(-2)),name=process.argv.at(-1),directory=fs.statSync(".");
if(!directory.isDirectory()||directory.dev!==expected.dev||directory.ino!==expected.ino) throw new Error("roadmap directory changed");
const before=fs.lstatSync(name); if(!before.isFile()||before.isSymbolicLink()) throw new Error("unsafe roadmap file");
const body=fs.readFileSync(name),after=fs.lstatSync(name),finalDirectory=fs.statSync(".");
if(before.dev!==after.dev||before.ino!==after.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs) throw new Error("roadmap file changed while read");
if(finalDirectory.dev!==expected.dev||finalDirectory.ino!==expected.ino) throw new Error("roadmap directory changed");
process.stdout.write(JSON.stringify({body:body.toString("base64"),sha256:crypto.createHash("sha256").update(body).digest("hex")}));
`;

async function readAnchoredRegular(file: string, expected: DirectoryIdentity): Promise<string> {
  const child = spawn(
    process.execPath,
    ["-e", anchoredReadHelper, JSON.stringify(expected), path.basename(file)],
    {
      cwd: path.dirname(file),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const [code, stdout, stderr] = await Promise.all([
    new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    }),
    new Response(child.stdout!).text(),
    new Response(child.stderr!).text(),
  ]);
  if (code !== 0) throw new Error(stderr.trim() || `anchored roadmap read failed: ${file}`);
  const receipt = JSON.parse(stdout) as { body: string; sha256: string };
  const body = Buffer.from(receipt.body, "base64");
  if (new Bun.CryptoHasher("sha256").update(body).digest("hex") !== receipt.sha256)
    throw new Error(`anchored roadmap read digest mismatch: ${file}`);
  return body.toString("utf8");
}

async function readItemAndIndex(
  files: Awaited<ReturnType<typeof safeFiles>>,
  runtime: BrainstormRuntime,
): Promise<readonly [string, string]> {
  await runtime.afterResolve?.();
  return Promise.all([
    readAnchoredRegular(files.itemFile, files.directories.get(path.dirname(files.itemFile))!),
    readAnchoredRegular(files.indexFile, files.directories.get(path.dirname(files.indexFile))!),
  ]);
}

function boundRuntime(
  runtime: BrainstormRuntime,
  directories: ReadonlyMap<string, DirectoryIdentity>,
): AtomicFileRuntime {
  return {
    ...runtime,
    beforeAnchorSpawn: async (directory) => {
      await runtime.beforeAnchorSpawn?.(directory);
      const expected = directories.get(directory);
      const current = await lstat(directory);
      if (
        !expected ||
        !current.isDirectory() ||
        current.isSymbolicLink() ||
        current.dev !== expected.dev ||
        current.ino !== expected.ino
      )
        throw new Error(`roadmap directory changed before transaction: ${directory}`);
    },
  };
}

export async function beginBrainstorm(
  root: string,
  slug: string,
  runtime: BrainstormRuntime = {},
): Promise<"SHAPING"> {
  if (!slugPattern.test(slug)) throw new Error(`invalid roadmap slug: ${slug}`);
  const files = await safeFiles(root, slug);
  const { itemFile, indexFile } = files;
  const [item, index] = await readItemAndIndex(files, runtime);
  const itemStatus = parseOneStatus(item);
  const indexed = indexStatus(index, slug);
  if (itemStatus.status !== indexed.status)
    throw new Error(`status mismatch for ${slug}: item=${itemStatus.status}, index=${indexed.status}`);
  if (itemStatus.status !== "DRAFT" && itemStatus.status !== "SHAPING")
    throw new Error(`brainstorm refuses status ${itemStatus.status}`);
  if (itemStatus.status === "SHAPING") return "SHAPING";
  const nextItem = `${item.slice(0, itemStatus.start)}- **Status**: SHAPING${item.slice(itemStatus.end)}`;
  const nextIndex = index.replace(
    indexed.row,
    `| ${slug} | ${indexed.title} | SHAPING | ${indexed.remaining} |`,
  );
  await atomicWriteFiles(
    [
      { file: itemFile, expected: item, content: nextItem },
      { file: indexFile, expected: index, content: nextIndex },
    ],
    boundRuntime(runtime, files.directories),
  );
  return "SHAPING";
}

function appendDecisions(item: string, answers: readonly FrontierAnswer[]): string {
  const marker = "## Decisions\n";
  const position = item.indexOf(marker);
  if (position < 0 || item.indexOf(marker, position + marker.length) >= 0)
    throw new Error("item must contain exactly one Decisions section");
  const insertion = answers
    .map((answer) => `- ${answer.date} — **${answer.decision.trim()}**. Because ${answer.reason.trim()}.`)
    .join("\n");
  const afterHeading = position + marker.length;
  return `${item.slice(0, afterHeading)}${item.slice(afterHeading).startsWith("\n") ? "" : "\n"}${insertion}\n${item.slice(afterHeading)}`;
}

function safeAnswerText(value: string): boolean {
  return value === value.trim() && value.length > 0 && !/[\r\n\0]/.test(value);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function orderedFrontierAnswers(
  nodes: readonly FrontierNode[],
  mode: BrainstormMode,
  answers: readonly FrontierAnswer[],
): readonly FrontierAnswer[] {
  const selectedIds = selectBrainstormFrontier(nodes, mode).map((node) => node.id);
  const answersById = new Map(answers.map((answer) => [answer.id, answer]));
  if (
    answers.length === 0 ||
    answersById.size !== answers.length ||
    selectedIds.some((id) => !answersById.has(id)) ||
    answers.length !== selectedIds.length
  )
    throw new Error("answers must cover exactly the presented frontier");
  const ordered = selectedIds.map((id) => answersById.get(id)!);
  for (const answer of ordered) {
    if (!safeAnswerText(answer.decision) || !safeAnswerText(answer.reason) || !validDate(answer.date))
      throw new Error(`malformed answer for ${answer.id}`);
  }
  return ordered;
}

export async function recordBrainstormAnswers(
  root: string,
  slug: string,
  nodes: readonly FrontierNode[],
  mode: BrainstormMode,
  answers: readonly FrontierAnswer[],
  runtime: BrainstormRuntime = {},
): Promise<readonly FrontierNode[]> {
  const orderedAnswers = orderedFrontierAnswers(nodes, mode, answers);
  const files = await safeFiles(root, slug);
  const { itemFile, indexFile } = files;
  const [item, index] = await readItemAndIndex(files, runtime);
  if (parseOneStatus(item).status !== "SHAPING" || indexStatus(index, slug).status !== "SHAPING")
    throw new Error("answers require matching SHAPING item and index states");
  const nextItem = appendDecisions(item, orderedAnswers);
  await atomicWriteFiles(
    [
      { file: itemFile, expected: item, content: nextItem },
      { file: indexFile, expected: index, content: index },
    ],
    boundRuntime(runtime, files.directories),
  );
  const byAnswer = new Map(orderedAnswers.map((answer) => [answer.id, answer.decision]));
  return nodes.map((node) => (byAnswer.has(node.id) ? { ...node, answer: byAnswer.get(node.id) } : node));
}

function parseTurnInput(source: string): TurnInput | undefined {
  if (!source.trim()) return undefined;
  const value = JSON.parse(source) as Record<string, unknown>;
  const keys = Object.keys(value).sort();
  const allowed = value.answers === undefined ? ["nodes", "schema"] : ["answers", "nodes", "schema"];
  if (
    JSON.stringify(keys) !== JSON.stringify(allowed) ||
    value.schema !== "tailrocks.brainstorm-turn/v1" ||
    !Array.isArray(value.nodes) ||
    (value.answers !== undefined && !Array.isArray(value.answers))
  )
    throw new Error("invalid tailrocks.brainstorm-turn/v1 input");
  for (const raw of value.nodes) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error("invalid tailrocks.brainstorm-turn/v1 node");
    const node = raw as Record<string, unknown>;
    const allowedNodeKeys = [
      "id",
      "question",
      "recommendation",
      ...(node.dependsOn === undefined ? [] : ["dependsOn"]),
      ...(node.answer === undefined ? [] : ["answer"]),
    ].sort();
    if (
      JSON.stringify(Object.keys(node).sort()) !== JSON.stringify(allowedNodeKeys) ||
      typeof node.id !== "string" ||
      typeof node.question !== "string" ||
      typeof node.recommendation !== "string" ||
      (node.answer !== undefined && typeof node.answer !== "string") ||
      (node.dependsOn !== undefined &&
        (!Array.isArray(node.dependsOn) || node.dependsOn.some((entry) => typeof entry !== "string")))
    )
      throw new Error("invalid tailrocks.brainstorm-turn/v1 node");
  }
  for (const raw of (value.answers as unknown[] | undefined) ?? []) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error("invalid tailrocks.brainstorm-turn/v1 answer");
    const answer = raw as Record<string, unknown>;
    if (
      JSON.stringify(Object.keys(answer).sort()) !== JSON.stringify(["date", "decision", "id", "reason"]) ||
      typeof answer.id !== "string" ||
      typeof answer.decision !== "string" ||
      typeof answer.reason !== "string" ||
      typeof answer.date !== "string"
    )
      throw new Error("invalid tailrocks.brainstorm-turn/v1 answer");
  }
  return value as unknown as TurnInput;
}

async function main(): Promise<void> {
  await verifyBrainstormEntrypoint(process.argv[1]!);
  const { slug, mode } = parseBrainstormArguments(process.argv.slice(2));
  const input = parseTurnInput(await Bun.stdin.text());
  if (input) {
    selectBrainstormFrontier(input.nodes, mode);
    if (input.answers) orderedFrontierAnswers(input.nodes, mode, input.answers);
  }
  let frontier: readonly FrontierNode[] | undefined;
  if (input?.answers) {
    frontier = selectBrainstormFrontier(
      await recordBrainstormAnswers(process.cwd(), slug, input.nodes, mode, input.answers),
      mode,
    );
  } else {
    await beginBrainstorm(process.cwd(), slug);
    if (input) frontier = selectBrainstormFrontier(input.nodes, mode);
  }
  process.stdout.write(
    `${JSON.stringify({ schema: "tailrocks.brainstorm-state/v1", slug, mode, status: "SHAPING", frontier })}\n`,
  );
}

if (import.meta.main)
  main().catch((error: unknown) => {
    process.stdout.write(
      `${JSON.stringify({ schema: "tailrocks.brainstorm-state/v1", outcome: "refused", detail: error instanceof Error ? error.message : String(error) })}\n`,
    );
    process.exitCode = 1;
  });
