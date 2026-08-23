import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicWriteFiles } from "./atomic-file-transaction";
import {
  boundRoadmapRuntime,
  parseRoadmapIndexStatus,
  parseRoadmapItemStatus,
  readRoadmapPair,
  resolveRoadmapFiles,
  roadmapSlugPattern,
  type RoadmapStateRuntime,
} from "./roadmap-item-state";

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

export interface BrainstormRuntime extends RoadmapStateRuntime {}

const slugPattern = roadmapSlugPattern;

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

export async function beginBrainstorm(
  root: string,
  slug: string,
  runtime: BrainstormRuntime = {},
): Promise<"SHAPING"> {
  if (!slugPattern.test(slug)) throw new Error(`invalid roadmap slug: ${slug}`);
  const files = await resolveRoadmapFiles(root, slug);
  const { itemFile, indexFile } = files;
  const [item, index] = await readRoadmapPair(files, runtime);
  const itemStatus = parseRoadmapItemStatus(item);
  const indexed = parseRoadmapIndexStatus(index, slug);
  if (itemStatus.status !== indexed.status)
    throw new Error(`status mismatch for ${slug}: item=${itemStatus.status}, index=${indexed.status}`);
  if (itemStatus.status !== "DRAFT" && itemStatus.status !== "SHAPING")
    throw new Error(`brainstorm refuses status ${itemStatus.status}`);
  if (itemStatus.status === "SHAPING") return "SHAPING";
  const nextItem = `${item.slice(0, itemStatus.start)}- **Status**: SHAPING${item.slice(itemStatus.end)}`;
  const nextIndex = index.replace(
    indexed.row,
    `| [${slug}](${slug}/README.md) | ${indexed.title} | SHAPING | ${indexed.remaining} |`,
  );
  await atomicWriteFiles(
    [
      { file: itemFile, expected: item, content: nextItem },
      { file: indexFile, expected: index, content: nextIndex },
    ],
    boundRoadmapRuntime(runtime, files.directories),
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
  const files = await resolveRoadmapFiles(root, slug);
  const { itemFile, indexFile } = files;
  const [item, index] = await readRoadmapPair(files, runtime);
  if (
    parseRoadmapItemStatus(item).status !== "SHAPING" ||
    parseRoadmapIndexStatus(index, slug).status !== "SHAPING"
  )
    throw new Error("answers require matching SHAPING item and index states");
  const nextItem = appendDecisions(item, orderedAnswers);
  await atomicWriteFiles(
    [
      { file: itemFile, expected: item, content: nextItem },
      { file: indexFile, expected: index, content: index },
    ],
    boundRoadmapRuntime(runtime, files.directories),
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
