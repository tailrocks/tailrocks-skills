import { createHash } from "node:crypto";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import {
  parseRoadmapIndexStatus,
  parseRoadmapItemStatus,
  publishRoadmapStatus,
  readRoadmapPair,
  resolveRoadmapFiles,
  roadmapSlugPattern,
  type RoadmapStateRuntime,
} from "./roadmap-item-state";

export const finalizeInputSchema = "tailrocks.finalize-readiness/v1" as const;
export const finalizeReceiptSchema = "tailrocks.finalize-state/v1" as const;

export type FinalizeMode = "interactive" | "batch";

interface ChecklistEvidence {
  readonly id: string;
  readonly evidence: readonly string[];
}

interface FinalizeNode {
  readonly id: string;
  readonly question: string;
  readonly recommendation: string;
  readonly depends_on: readonly string[];
  readonly answer?: string;
  readonly human_receipt_id?: string;
}

interface HumanReceipt {
  readonly id: string;
  readonly node_id: string;
  readonly answer: string;
  readonly source: "live_user";
  readonly item_sha256: string;
}

interface DryRunReceipt {
  readonly item_sha256: string;
  readonly reviewer: "fresh_context" | "self_run_no_subagents";
  readonly screens: readonly string[];
  readonly capabilities: readonly string[];
  readonly flows: readonly string[];
  readonly must_nots: readonly string[];
  readonly questions: readonly string[];
  readonly inventions: readonly string[];
}

interface FinalizeInput {
  readonly schema: typeof finalizeInputSchema;
  readonly action: "assess" | "publish";
  readonly item_sha256: string;
  readonly index_sha256: string;
  readonly checklist: readonly ChecklistEvidence[];
  readonly nodes: readonly FinalizeNode[];
  readonly human_receipts: readonly HumanReceipt[];
  readonly dry_run?: DryRunReceipt;
}

export interface FinalizeReceipt {
  readonly schema: typeof finalizeReceiptSchema;
  readonly outcome: "ready" | "shaping" | "routed" | "refused" | "failed";
  readonly code:
    | "published"
    | "already_ready"
    | "draft_requires_brainstorm"
    | "needs_evidence"
    | "frontier_open"
    | "invalid_input"
    | "state_refused"
    | "state_changed"
    | "transaction_failed";
  readonly slug: string;
  readonly mode: FinalizeMode;
  readonly status: string;
  readonly route?: "tailrocks-brainstorm";
  readonly frontier: readonly FinalizeNode[];
  readonly checklist_complete: number;
  readonly detail: string;
}

const checklistIds = [
  "intent_destination",
  "vocabulary_unambiguous",
  "capabilities_reachable",
  "screens_complete",
  "design_references_blessed",
  "design_stage_handoff",
  "flows_complete",
  "integrations_settled",
  "must_not_confirmed",
  "quality_checkable",
  "open_questions_empty",
  "research_questions_valid",
  "deferred_complete",
  "decisions_consistent",
  "planning_dry_run",
] as const;
const digestPattern = /^[a-f0-9]{64}$/;
const maximumInputBytes = 1_000_000;
const checklistEvidenceSections: Readonly<Record<(typeof checklistIds)[number], readonly string[]>> = {
  intent_destination: ["Intent"],
  vocabulary_unambiguous: ["Vocabulary"],
  capabilities_reachable: ["Capabilities", "Screens", "Flows"],
  screens_complete: ["Screens"],
  design_references_blessed: ["Screens"],
  design_stage_handoff: ["Screens"],
  flows_complete: ["Flows"],
  integrations_settled: ["Data & integrations"],
  must_not_confirmed: ["Must not", "Decisions"],
  quality_checkable: ["Quality bar"],
  open_questions_empty: ["Open questions"],
  research_questions_valid: ["Open research questions"],
  deferred_complete: ["Deferred"],
  decisions_consistent: ["Decisions"],
  planning_dry_run: [],
};

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeLine(value: unknown, label: string, maximum = 512): string {
  if (typeof value !== "string" || value !== value.trim() || !value || Buffer.byteLength(value) > maximum)
    throw new Error(`${label} is invalid`);
  for (const character of value)
    if (character.charCodeAt(0) < 0x20 || character.charCodeAt(0) === 0x7f)
      throw new Error(`${label} is invalid`);
  return value;
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

function stringArray(value: unknown, label: string, maximum = 256): string[] {
  if (!Array.isArray(value) || value.length > maximum) throw new Error(`${label} must be a bounded array`);
  const result = value.map((entry, index) => safeLine(entry, `${label}[${index}]`));
  if (new Set(result).size !== result.length) throw new Error(`${label} must be unique`);
  return result;
}

function parseInput(raw: unknown): FinalizeInput {
  const value = object(raw, "input");
  exactKeys(
    value,
    [
      "schema",
      "action",
      "item_sha256",
      "index_sha256",
      "checklist",
      "nodes",
      "human_receipts",
      ...(value.dry_run === undefined ? [] : ["dry_run"]),
    ],
    "input",
  );
  if (value.schema !== finalizeInputSchema) throw new Error("input schema is invalid");
  if (value.action !== "assess" && value.action !== "publish") throw new Error("action is invalid");
  if (typeof value.item_sha256 !== "string" || !digestPattern.test(value.item_sha256))
    throw new Error("item_sha256 is invalid");
  if (typeof value.index_sha256 !== "string" || !digestPattern.test(value.index_sha256))
    throw new Error("index_sha256 is invalid");
  if (!Array.isArray(value.checklist) || value.checklist.length > checklistIds.length)
    throw new Error("checklist is invalid");
  const checklist = value.checklist.map((rawEntry, index) => {
    const entry = object(rawEntry, `checklist[${index}]`);
    exactKeys(entry, ["id", "evidence"], `checklist[${index}]`);
    const id = safeLine(entry.id, `checklist[${index}].id`, 64);
    const evidence = stringArray(entry.evidence, `checklist[${index}].evidence`, 32);
    if (
      evidence.length === 0 ||
      evidence.some((item) => !/^(?:section|asset|decision|dry-run):\S/.test(item))
    )
      throw new Error(`checklist evidence is invalid: ${id}`);
    return { id, evidence };
  });
  if (new Set(checklist.map((entry) => entry.id)).size !== checklist.length)
    throw new Error("checklist ids must be unique");
  if (!Array.isArray(value.nodes) || value.nodes.length > 256) throw new Error("nodes are invalid");
  const nodes = value.nodes.map((rawNode, index) => {
    const node = object(rawNode, `nodes[${index}]`);
    exactKeys(
      node,
      [
        "id",
        "question",
        "recommendation",
        "depends_on",
        ...(node.answer === undefined ? [] : ["answer", "human_receipt_id"]),
      ],
      `nodes[${index}]`,
    );
    const id = safeLine(node.id, `nodes[${index}].id`, 64);
    if (!/^[A-Z][A-Z0-9-]*$/.test(id)) throw new Error(`node id is invalid: ${id}`);
    return {
      id,
      question: safeLine(node.question, `nodes[${index}].question`),
      recommendation: safeLine(node.recommendation, `nodes[${index}].recommendation`),
      depends_on: stringArray(node.depends_on, `nodes[${index}].depends_on`, 64),
      ...(node.answer === undefined
        ? {}
        : {
            answer: safeLine(node.answer, `nodes[${index}].answer`),
            human_receipt_id: safeLine(node.human_receipt_id, `nodes[${index}].human_receipt_id`, 64),
          }),
    };
  });
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error("node ids must be unique");
  if (!Array.isArray(value.human_receipts) || value.human_receipts.length > 256)
    throw new Error("human_receipts are invalid");
  const humanReceipts = value.human_receipts.map((rawReceipt, index) => {
    const receipt = object(rawReceipt, `human_receipts[${index}]`);
    exactKeys(receipt, ["id", "node_id", "answer", "source", "item_sha256"], `human_receipts[${index}]`);
    if (receipt.source !== "live_user") throw new Error("human receipt source must be live_user");
    if (typeof receipt.item_sha256 !== "string" || !digestPattern.test(receipt.item_sha256))
      throw new Error("human receipt item digest is invalid");
    return {
      id: safeLine(receipt.id, `human_receipts[${index}].id`, 64),
      node_id: safeLine(receipt.node_id, `human_receipts[${index}].node_id`, 64),
      answer: safeLine(receipt.answer, `human_receipts[${index}].answer`),
      source: "live_user" as const,
      item_sha256: receipt.item_sha256,
    };
  });
  if (new Set(humanReceipts.map((receipt) => receipt.id)).size !== humanReceipts.length)
    throw new Error("human receipt ids must be unique");
  let dryRun: DryRunReceipt | undefined;
  if (value.dry_run !== undefined) {
    const receipt = object(value.dry_run, "dry_run");
    exactKeys(
      receipt,
      ["item_sha256", "reviewer", "screens", "capabilities", "flows", "must_nots", "questions", "inventions"],
      "dry_run",
    );
    if (typeof receipt.item_sha256 !== "string" || !digestPattern.test(receipt.item_sha256))
      throw new Error("dry_run item digest is invalid");
    if (receipt.reviewer !== "fresh_context" && receipt.reviewer !== "self_run_no_subagents")
      throw new Error("dry_run reviewer is invalid");
    dryRun = {
      item_sha256: receipt.item_sha256,
      reviewer: receipt.reviewer,
      screens: stringArray(receipt.screens, "dry_run.screens"),
      capabilities: stringArray(receipt.capabilities, "dry_run.capabilities"),
      flows: stringArray(receipt.flows, "dry_run.flows"),
      must_nots: stringArray(receipt.must_nots, "dry_run.must_nots"),
      questions: stringArray(receipt.questions, "dry_run.questions"),
      inventions: stringArray(receipt.inventions, "dry_run.inventions"),
    };
  }
  return {
    schema: finalizeInputSchema,
    action: value.action,
    item_sha256: value.item_sha256,
    index_sha256: value.index_sha256,
    checklist,
    nodes,
    human_receipts: humanReceipts,
    ...(dryRun ? { dry_run: dryRun } : {}),
  };
}

function validateNodes(
  nodes: readonly FinalizeNode[],
  receipts: readonly HumanReceipt[],
  itemDigest: string,
): void {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const receiptById = new Map(receipts.map((receipt) => [receipt.id, receipt]));
  for (const node of nodes) {
    for (const dependency of node.depends_on) {
      if (dependency === node.id || !byId.has(dependency))
        throw new Error(`invalid dependency ${dependency}`);
    }
    if (node.answer !== undefined) {
      const receipt = receiptById.get(node.human_receipt_id!);
      if (
        !receipt ||
        receipt.node_id !== node.id ||
        receipt.answer !== node.answer ||
        receipt.item_sha256 !== itemDigest
      )
        throw new Error(`node lacks exact live human receipt: ${node.id}`);
    } else if (node.human_receipt_id !== undefined) {
      throw new Error(`open node carries a human receipt: ${node.id}`);
    }
  }
  if (receipts.some((receipt) => !nodes.some((node) => node.human_receipt_id === receipt.id)))
    throw new Error("unused human receipt is forbidden");
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error(`cyclic frontier dependency at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)!.depends_on) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of byId.keys()) visit(id);
}

export function selectFinalizeFrontier(
  nodes: readonly FinalizeNode[],
  mode: FinalizeMode,
): readonly FinalizeNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  if (byId.size !== nodes.length) throw new Error("node ids must be unique");
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error(`cyclic frontier dependency at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)!.depends_on) {
      if (!byId.has(dependency) || dependency === id) throw new Error(`invalid dependency ${dependency}`);
      visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of byId.keys()) visit(id);
  const ready = nodes
    .filter(
      (node) =>
        node.answer === undefined &&
        node.depends_on.every((dependency) => byId.get(dependency)?.answer !== undefined),
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  return mode === "interactive" ? ready.slice(0, 1) : ready;
}

function section(item: string, heading: string): string {
  const marker = `## ${heading}`;
  const matches = [...item.matchAll(new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "gm"))];
  if (matches.length !== 1) throw new Error(`item must contain exactly one ${heading} section`);
  const start = matches[0]!.index! + marker.length;
  const next = item.indexOf("\n## ", start);
  return item.slice(start, next < 0 ? item.length : next).trim();
}

interface ItemInventory {
  readonly screens: readonly string[];
  readonly capabilities: readonly string[];
  readonly flows: readonly string[];
  readonly must_nots: readonly string[];
}

function bulletInventory(body: string, label: string): string[] {
  if (!body) return [];
  const entries: string[] = [];
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    const bullet = line.match(/^- (\S.*)$/);
    if (bullet) {
      entries.push(bullet[1]!.trim());
      continue;
    }
    if (entries.length > 0 && /^(?: {2,}|\t)\S/.test(line)) {
      entries[entries.length - 1] = `${entries.at(-1)} ${line.trim()}`;
      continue;
    }
    throw new Error(`${label} must contain only markdown bullet entries`);
  }
  return entries;
}

function validateMechanicalReadiness(item: string): ItemInventory {
  const headings = [
    "Intent",
    "Vocabulary",
    "Decisions",
    "Capabilities",
    "Screens",
    "Flows",
    "Data & integrations",
    "Must not",
    "Quality bar",
    "Open questions",
    "Open research questions",
    "Deferred",
    "Remaining",
  ];
  let previous = -1;
  for (const heading of headings) {
    section(item, heading);
    const position = item.indexOf(`## ${heading}`);
    if (position <= previous) throw new Error("item sections are out of order");
    previous = position;
  }
  if (section(item, "Open questions") !== "") throw new Error("Open questions must be empty");
  for (const heading of [
    "Intent",
    "Vocabulary",
    "Decisions",
    "Capabilities",
    "Flows",
    "Data & integrations",
    "Must not",
    "Quality bar",
  ]) {
    if (!section(item, heading)) throw new Error(`${heading} must be populated`);
  }
  const intent = section(item, "Intent");
  if (!/[.!?]$/.test(intent)) throw new Error("Intent must end with a destination sentence");
  const capabilities = bulletInventory(section(item, "Capabilities"), "Capabilities");
  const flows = bulletInventory(section(item, "Flows"), "Flows");
  const mustNots = bulletInventory(section(item, "Must not"), "Must not");
  if (capabilities.length === 0) throw new Error("Capabilities must contain concrete entries");
  if (flows.length === 0) throw new Error("Flows must contain concrete entries");
  if (mustNots.length === 0) throw new Error("Must not must contain confirmed entries");
  const screens = section(item, "Screens");
  const screenNames = [...screens.matchAll(/^### (\S.*)$/gm)].map((match) => match[1]!.trim());
  if (screens) {
    const blocks = screens
      .split(/^### /gm)
      .map((block) => block.trim())
      .filter(Boolean);
    if (screenNames.length !== blocks.length) throw new Error("Screens must use level-three screen headings");
    for (const block of blocks) {
      for (const field of ["Purpose", "States", "Key interactions", "Navigation", "Design"]) {
        const escaped = field.replaceAll(" ", "\\s+");
        if (!new RegExp(`^- \\*\\*${escaped}\\*\\*: \\S`, "m").test(block))
          throw new Error(`screen is missing ${field}`);
      }
      const firstField = block.search(/^- \*\*Purpose\*\*:/m);
      if (firstField <= 0 || !block.slice(0, firstField).trim().includes("\n"))
        throw new Error("screen is missing a schematic mockup");
    }
  }
  const deferred = section(item, "Deferred");
  for (const entry of bulletInventory(deferred, "Deferred"))
    if (!/\breason:\s*\S/i.test(entry) || !/\brevisit:\s*\S/i.test(entry))
      throw new Error("Deferred entries require reason and revisit trigger");
  for (const question of bulletInventory(section(item, "Open research questions"), "Open research questions"))
    if (!question.endsWith("?"))
      throw new Error("Open research questions must be precisely stated questions");
  return { screens: screenNames, capabilities, flows, must_nots: mustNots };
}

function completeChecklist(input: FinalizeInput, inventory: ItemInventory): void {
  const actual = [...input.checklist.map((entry) => entry.id)].sort();
  const expected = [...checklistIds].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error("readiness checklist is incomplete");
  for (const entry of input.checklist) {
    const id = entry.id as (typeof checklistIds)[number];
    const requiredSections = checklistEvidenceSections[id];
    if (
      !requiredSections ||
      (id === "planning_dry_run"
        ? !entry.evidence.some((evidence) => evidence.startsWith("dry-run:"))
        : !requiredSections.some((heading) => entry.evidence.includes(`section:${heading}`)))
    )
      throw new Error(`readiness evidence does not map to checklist row: ${entry.id}`);
  }
  if (!input.dry_run) throw new Error("planning dry run is missing");
  if (
    input.dry_run.item_sha256 !== input.item_sha256 ||
    input.dry_run.questions.length > 0 ||
    input.dry_run.inventions.length > 0 ||
    input.dry_run.capabilities.length === 0 ||
    JSON.stringify(input.dry_run.screens) !== JSON.stringify(inventory.screens) ||
    JSON.stringify(input.dry_run.capabilities) !== JSON.stringify(inventory.capabilities) ||
    JSON.stringify(input.dry_run.flows) !== JSON.stringify(inventory.flows) ||
    JSON.stringify(input.dry_run.must_nots) !== JSON.stringify(inventory.must_nots)
  )
    throw new Error("planning dry run does not exactly inventory the bound item");
}

function receipt(
  slug: string,
  mode: FinalizeMode,
  status: string,
  outcome: FinalizeReceipt["outcome"],
  code: FinalizeReceipt["code"],
  detail: string,
  frontier: readonly FinalizeNode[] = [],
  checklistComplete = 0,
  route?: "tailrocks-brainstorm",
): FinalizeReceipt {
  return {
    schema: finalizeReceiptSchema,
    outcome,
    code,
    slug,
    mode,
    status,
    ...(route ? { route } : {}),
    frontier,
    checklist_complete: checklistComplete,
    detail,
  };
}

export async function finalizeRoadmapState(
  root: string,
  slug: string,
  mode: FinalizeMode,
  raw?: unknown,
  runtime: RoadmapStateRuntime = {},
): Promise<FinalizeReceipt> {
  let input: FinalizeInput | undefined;
  try {
    if (raw !== undefined) input = parseInput(raw);
  } catch (error) {
    return receipt(
      slug,
      mode,
      "UNKNOWN",
      "refused",
      "invalid_input",
      error instanceof Error ? error.message : "invalid input",
    );
  }
  let files: Awaited<ReturnType<typeof resolveRoadmapFiles>>;
  let item: string;
  let index: string;
  let itemStatus: string;
  try {
    files = await resolveRoadmapFiles(root, slug);
    [item, index] = await readRoadmapPair(files, runtime);
    itemStatus = parseRoadmapItemStatus(item).status;
    const indexStatus = parseRoadmapIndexStatus(index, slug).status;
    if (itemStatus !== indexStatus)
      return receipt(slug, mode, itemStatus, "refused", "state_refused", "item and index statuses differ");
  } catch (error) {
    return receipt(
      slug,
      mode,
      "UNKNOWN",
      "refused",
      "state_refused",
      error instanceof Error ? error.message : "roadmap state is invalid",
    );
  }
  if (itemStatus === "DRAFT")
    return receipt(
      slug,
      mode,
      itemStatus,
      "routed",
      "draft_requires_brainstorm",
      "DRAFT cannot enter finalization",
      [],
      0,
      "tailrocks-brainstorm",
    );
  if (itemStatus === "READY")
    return receipt(slug, mode, itemStatus, "ready", "already_ready", "READY item is unchanged");
  if (itemStatus !== "SHAPING")
    return receipt(
      slug,
      mode,
      itemStatus,
      "refused",
      "state_refused",
      `finalize refuses status ${itemStatus}`,
    );
  if (!input)
    return receipt(
      slug,
      mode,
      itemStatus,
      "shaping",
      "needs_evidence",
      "SHAPING requires typed readiness input",
    );
  if (digest(item) !== input.item_sha256 || digest(index) !== input.index_sha256)
    return receipt(slug, mode, itemStatus, "refused", "state_changed", "item or index digest changed");
  let frontier: readonly FinalizeNode[];
  try {
    validateNodes(input.nodes, input.human_receipts, input.item_sha256);
    frontier = selectFinalizeFrontier(input.nodes, mode);
  } catch (error) {
    return receipt(
      slug,
      mode,
      itemStatus,
      "shaping",
      "needs_evidence",
      error instanceof Error ? error.message : "readiness graph is invalid",
      [],
      input.checklist.length,
    );
  }
  if (input.action === "assess" || input.nodes.some((node) => node.answer === undefined))
    return receipt(
      slug,
      mode,
      itemStatus,
      "shaping",
      "frontier_open",
      "readiness frontier remains open",
      frontier,
      input.checklist.length,
    );
  try {
    if (input.human_receipts.length === 0) throw new Error("live human confirmation is required");
    const inventory = validateMechanicalReadiness(item);
    completeChecklist(input, inventory);
  } catch (error) {
    return receipt(
      slug,
      mode,
      itemStatus,
      "shaping",
      "needs_evidence",
      error instanceof Error ? error.message : "readiness proof is incomplete",
      [],
      input.checklist.length,
    );
  }
  try {
    await publishRoadmapStatus(files, slug, item, index, "SHAPING", "READY", runtime);
    return receipt(
      slug,
      mode,
      "READY",
      "ready",
      "published",
      "complete readiness proof published READY",
      [],
      checklistIds.length,
    );
  } catch (error) {
    return receipt(
      slug,
      mode,
      "UNKNOWN",
      "failed",
      "transaction_failed",
      error instanceof Error ? error.message : "finalization failed",
    );
  }
}

export function parseFinalizeArguments(args: readonly string[]): {
  readonly skillFile: string;
  readonly slug: string;
  readonly mode: FinalizeMode;
} {
  if (
    args.length < 3 ||
    args.length > 4 ||
    args[0] !== "--skill-file" ||
    (args.length === 4 && args[3] !== "--batch")
  )
    throw new Error("usage: finalize-state --skill-file <absolute-SKILL.md> <roadmap-slug> [--batch]");
  if (!path.isAbsolute(args[1]!)) throw new Error("skill file must be absolute");
  if (!roadmapSlugPattern.test(args[2]!)) throw new Error("roadmap slug is invalid");
  return { skillFile: args[1]!, slug: args[2]!, mode: args[3] === "--batch" ? "batch" : "interactive" };
}

async function verifyEntrypoint(entrypoint: string, skillFile: string): Promise<void> {
  const resolved = path.resolve(entrypoint);
  const plugin = path.dirname(path.dirname(resolved));
  const expectedSkill = path.join(plugin, "skills", "tailrocks-finalize", "SKILL.md");
  if (path.resolve(skillFile) !== expectedSkill)
    throw new Error("loader skill does not own finalize entrypoint");
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [path.dirname(resolved), "directory"],
    [resolved, "file"],
    [expectedSkill, "file"],
    [path.join(path.dirname(resolved), "roadmap-item-state.ts"), "file"],
    [path.join(path.dirname(resolved), "atomic-file-transaction.ts"), "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("installed finalize package is unsafe");
  }
}

async function readBoundedStdin(): Promise<string | undefined> {
  const reader = Bun.stdin.stream().getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  const timer = setTimeout(() => reader.cancel("stdin deadline exceeded"), 5_000);
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > maximumInputBytes) throw new Error("stdin is too large");
      chunks.push(result.value);
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  if (bytes === 0) return undefined;
  return Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    bytes,
  ).toString("utf8");
}

if (import.meta.main) {
  let result: FinalizeReceipt;
  try {
    const args = parseFinalizeArguments(process.argv.slice(2));
    await verifyEntrypoint(process.argv[1]!, args.skillFile);
    const source = await readBoundedStdin();
    result = await finalizeRoadmapState(
      process.cwd(),
      args.slug,
      args.mode,
      source === undefined ? undefined : JSON.parse(source),
    );
  } catch (error) {
    result = receipt(
      "",
      "interactive",
      "UNKNOWN",
      "refused",
      "invalid_input",
      error instanceof Error ? error.message : "CLI refused",
    );
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(
    result.outcome === "ready" ? 0 : result.outcome === "shaping" || result.outcome === "routed" ? 2 : 1,
  );
}
